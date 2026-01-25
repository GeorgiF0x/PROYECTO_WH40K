'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Modal, Spinner } from '@/components/ui'
import { UserCard } from './UserCard'
import { FollowButton } from './FollowButton'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import type { Profile } from '@/lib/types/database.types'
import { Users } from 'lucide-react'

interface UserListModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  userId: string
  type: 'followers' | 'following'
}

type UserWithProfile = Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'bio'>

export function UserListModal({ isOpen, onClose, title, userId, type }: UserListModalProps) {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserWithProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
    }
  }, [isOpen, userId, type])

  const fetchUsers = async () => {
    setIsLoading(true)
    const supabase = createClient()

    if (type === 'followers') {
      // Get users who follow this user
      const { data, error } = await supabase
        .from('follows')
        .select(`
          follower:profiles!follows_follower_id_fkey(
            id,
            username,
            display_name,
            avatar_url,
            bio
          )
        `)
        .eq('following_id', userId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        const followers = data
          .map((f) => f.follower)
          .filter((f): f is UserWithProfile => f !== null)
        setUsers(followers)
      }
    } else {
      // Get users this user follows
      const { data, error } = await supabase
        .from('follows')
        .select(`
          following:profiles!follows_following_id_fkey(
            id,
            username,
            display_name,
            avatar_url,
            bio
          )
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        const following = data
          .map((f) => f.following)
          .filter((f): f is UserWithProfile => f !== null)
        setUsers(following)
      }
    }

    setIsLoading(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bone/10 flex items-center justify-center">
              <Users className="w-8 h-8 text-bone/40" />
            </div>
            <p className="text-bone/60">
              {type === 'followers' ? 'No tiene seguidores todavia' : 'No sigue a nadie todavia'}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {users.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 bg-void rounded-lg border border-bone/10 hover:border-imperial-gold/30 transition-colors"
              >
                <UserCard user={user} className="flex-1 border-0 p-0 bg-transparent" />
                {currentUser && currentUser.id !== user.id && (
                  <FollowButton userId={user.id} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </Modal>
  )
}
