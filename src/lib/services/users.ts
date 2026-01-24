import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types/database.types'

const supabase = createClient()

export async function getProfileByUsername(username: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  return { data, error }
}

export async function getProfileById(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  return { data, error }
}

export async function updateProfile(id: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

export async function getFollowersCount(userId: string) {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId)

  return { count: count || 0, error }
}

export async function getFollowingCount(userId: string) {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId)

  return { count: count || 0, error }
}

export async function getFollowers(userId: string, limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('follows')
    .select('follower:follower_id(id, username, display_name, avatar_url)')
    .eq('following_id', userId)
    .range(offset, offset + limit - 1)

  return { data, error }
}

export async function getFollowing(userId: string, limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('follows')
    .select('following:following_id(id, username, display_name, avatar_url)')
    .eq('follower_id', userId)
    .range(offset, offset + limit - 1)

  return { data, error }
}

export async function isFollowing(followerId: string, followingId: string) {
  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single()

  return { isFollowing: !!data && !error, error }
}

export async function followUser(followerId: string, followingId: string) {
  const { data, error } = await supabase
    .from('follows')
    .insert({ follower_id: followerId, following_id: followingId })
    .select()
    .single()

  return { data, error }
}

export async function unfollowUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId)

  return { error }
}

export async function searchUsers(query: string, limit = 10) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(limit)

  return { data, error }
}

export async function getUserMiniaturesCount(userId: string) {
  const { count, error } = await supabase
    .from('miniatures')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return { count: count || 0, error }
}

export async function getUserBadges(userId: string) {
  const { data, error } = await supabase
    .from('user_badges')
    .select('badge:badge_id(id, name, description, icon_url), awarded_at')
    .eq('user_id', userId)

  return { data, error }
}
