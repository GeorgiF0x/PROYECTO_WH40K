import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export interface ConversationPreview {
  id: string
  listing_id: string | null
  listing_title: string | null
  listing_image: string | null
  other_user: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  last_message: {
    content: string
    sender_id: string
    created_at: string
  } | null
  last_read_at: string | null
  updated_at: string
}

export interface MessageWithSender {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  sender: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  }
}

export async function getOrCreateConversation(
  listingId: string,
  buyerId: string,
  sellerId: string
): Promise<{ conversationId: string; error: Error | null }> {
  // Find existing conversation for this listing between these two users
  const { data: existingParticipants, error: searchError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', buyerId)

  if (searchError) {
    return { conversationId: '', error: searchError }
  }

  if (existingParticipants && existingParticipants.length > 0) {
    const conversationIds = existingParticipants.map((p) => p.conversation_id)

    // Check which of these conversations belong to this listing and include the seller
    const { data: matchingConversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listingId)
      .in('id', conversationIds)

    if (matchingConversations && matchingConversations.length > 0) {
      // Verify the seller is also a participant
      for (const conv of matchingConversations) {
        const { data: sellerParticipant } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('conversation_id', conv.id)
          .eq('user_id', sellerId)
          .maybeSingle()

        if (sellerParticipant) {
          return { conversationId: conv.id, error: null }
        }
      }
    }
  }

  // Create new conversation with both participants atomically via RPC
  const { data: newConversationId, error: rpcError } = await supabase
    .rpc('create_conversation_with_participants', {
      p_listing_id: listingId,
      p_user_a: buyerId,
      p_user_b: sellerId,
    })

  if (rpcError || !newConversationId) {
    return { conversationId: '', error: rpcError || new Error('Failed to create conversation') }
  }

  return { conversationId: newConversationId as string, error: null }
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string
) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
    })
    .select()
    .single()

  // Update conversation's updated_at
  if (!error) {
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)
  }

  return { data, error }
}

export async function getConversations(userId: string): Promise<{
  data: ConversationPreview[]
  error: Error | null
}> {
  // 1. Get all conversation IDs where the user is a participant
  const { data: participations, error: partError } = await supabase
    .from('conversation_participants')
    .select('conversation_id, last_read_at')
    .eq('user_id', userId)

  if (partError || !participations) {
    return { data: [], error: partError }
  }

  if (participations.length === 0) {
    return { data: [], error: null }
  }

  const conversationIds = participations.map((p) => p.conversation_id)
  const lastReadMap = new Map(
    participations.map((p) => [p.conversation_id, p.last_read_at])
  )

  // 2. Fetch conversations, other participants, and last messages IN PARALLEL
  const [convResult, otherUsersResult, ...messageResults] = await Promise.all([
    // Conversations with listing info (1 query)
    supabase
      .from('conversations')
      .select(`
        id,
        listing_id,
        updated_at,
        listings:listing_id (
          title,
          images
        )
      `)
      .in('id', conversationIds)
      .order('updated_at', { ascending: false }),

    // ALL other participants in one batch query (1 query instead of N)
    supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        profiles:user_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .in('conversation_id', conversationIds)
      .neq('user_id', userId),

    // Last message per conversation (N queries, but all in parallel)
    ...conversationIds.map((convId) =>
      supabase
        .from('messages')
        .select('content, sender_id, created_at')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: false })
        .limit(1)
    ),
  ])

  if (convResult.error || !convResult.data) {
    return { data: [], error: convResult.error }
  }

  // 3. Build lookup maps
  const otherUserMap = new Map<string, ConversationPreview['other_user']>()
  if (otherUsersResult.data) {
    for (const row of otherUsersResult.data) {
      const profile = row.profiles as unknown as ConversationPreview['other_user'] | null
      if (profile) {
        otherUserMap.set(row.conversation_id, profile)
      }
    }
  }

  const lastMessageMap = new Map<string, ConversationPreview['last_message']>()
  conversationIds.forEach((convId, i) => {
    const result = messageResults[i]
    if (result?.data?.[0]) {
      lastMessageMap.set(convId, result.data[0])
    }
  })

  // 4. Assemble previews
  const previews: ConversationPreview[] = []

  for (const conv of convResult.data) {
    const otherUser = otherUserMap.get(conv.id)
    if (!otherUser) continue

    const listing = conv.listings as unknown as { title: string; images: string[] } | null

    previews.push({
      id: conv.id,
      listing_id: conv.listing_id,
      listing_title: listing?.title || null,
      listing_image: listing?.images?.[0] || null,
      other_user: otherUser,
      last_message: lastMessageMap.get(conv.id) || null,
      last_read_at: lastReadMap.get(conv.id) || null,
      updated_at: conv.updated_at,
    })
  }

  return { data: previews, error: null }
}

export async function getMessages(
  conversationId: string,
  limit = 50,
  offset = 0
): Promise<{ data: MessageWithSender[]; error: Error | null }> {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      id,
      conversation_id,
      sender_id,
      content,
      created_at,
      sender:sender_id (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1)

  return {
    data: (data || []) as unknown as MessageWithSender[],
    error,
  }
}

export async function markConversationRead(
  conversationId: string,
  userId: string
) {
  const { error } = await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)

  return { error }
}

export async function getUnreadConversationsCount(userId: string): Promise<{
  count: number
  error: Error | null
}> {
  // Get all participations
  const { data: participations, error: partError } = await supabase
    .from('conversation_participants')
    .select('conversation_id, last_read_at')
    .eq('user_id', userId)

  if (partError || !participations || participations.length === 0) {
    return { count: 0, error: partError }
  }

  // Check all conversations in parallel instead of sequential loop
  const results = await Promise.all(
    participations.map((p) => {
      let query = supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', p.conversation_id)
        .neq('sender_id', userId)

      if (p.last_read_at) {
        query = query.gt('created_at', p.last_read_at)
      }

      return query
    })
  )

  const unreadCount = results.filter((r) => r.count && r.count > 0).length

  return { count: unreadCount, error: null }
}

export async function getConversationMetadata(conversationId: string, currentUserId: string) {
  // Get conversation with listing info
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select(`
      id,
      listing_id,
      listings:listing_id (
        id,
        title,
        images
      )
    `)
    .eq('id', conversationId)
    .single()

  if (convError || !conversation) {
    return { data: null, error: convError }
  }

  // Get other participant
  const { data: otherParticipants, error: partError } = await supabase
    .from('conversation_participants')
    .select(`
      profiles:user_id (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('conversation_id', conversationId)
    .neq('user_id', currentUserId)
    .limit(1)

  if (partError) {
    return { data: null, error: partError }
  }

  const otherUser = otherParticipants?.[0]?.profiles as unknown as {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null

  const listing = conversation.listings as unknown as {
    id: string
    title: string
    images: string[]
  } | null

  return {
    data: {
      conversation,
      otherUser,
      listing,
    },
    error: null,
  }
}

export async function isConversationParticipant(conversationId: string, userId: string) {
  const { data, error } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
    .maybeSingle()

  return { isParticipant: !!data && !error, error }
}
