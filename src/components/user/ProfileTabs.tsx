'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Image as ImageIcon, Heart, Award, MessageCircle } from 'lucide-react'
import type { Miniature, Profile } from '@/lib/types/database.types'

type Tab = 'miniatures' | 'likes' | 'badges'

interface MiniatureWithStats {
  id: string
  title: string
  description: string | null
  images: string[]
  thumbnail_url: string | null
  user_id: string
  created_at: string
  profiles?: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'> | null
  likes_count?: number
  comments_count?: number
}

interface ProfileTabsProps {
  userId: string
  isOwnProfile?: boolean
}

export function ProfileTabs({ userId, isOwnProfile = false }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('miniatures')
  const [miniatures, setMiniatures] = useState<MiniatureWithStats[]>([])
  const [likedMiniatures, setLikedMiniatures] = useState<MiniatureWithStats[]>([])
  const [badges, setBadges] = useState<{ id: string; name: string; description: string | null; icon_url: string | null; awarded_at: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    if (activeTab === 'miniatures') {
      fetchMiniatures()
    } else if (activeTab === 'likes') {
      fetchLikedMiniatures()
    } else if (activeTab === 'badges') {
      fetchBadges()
    }
  }, [activeTab, userId])

  const fetchMiniatures = async () => {
    setIsLoading(true)

    const { data, error } = await supabase
      .from('miniatures')
      .select(`
        *,
        profiles(id, username, display_name, avatar_url),
        miniature_likes(count),
        miniature_comments(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      const withStats = data.map((m: Record<string, unknown>) => ({
        ...m,
        likes_count: (m.miniature_likes as { count: number }[])?.[0]?.count || 0,
        comments_count: (m.miniature_comments as { count: number }[])?.[0]?.count || 0,
      })) as MiniatureWithStats[]
      setMiniatures(withStats)
    }

    setIsLoading(false)
  }

  const fetchLikedMiniatures = async () => {
    setIsLoading(true)

    const { data, error } = await supabase
      .from('miniature_likes')
      .select(`
        miniature:miniatures(
          *,
          profiles(id, username, display_name, avatar_url),
          miniature_likes(count),
          miniature_comments(count)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      const miniatures = data
        .map((item) => item.miniature)
        .filter((m) => m !== null)
        .map((m) => {
          const mini = m as MiniatureWithStats & {
            miniature_likes?: { count: number }[]
            miniature_comments?: { count: number }[]
          }
          return {
            ...mini,
            likes_count: mini.miniature_likes?.[0]?.count || 0,
            comments_count: mini.miniature_comments?.[0]?.count || 0,
          }
        })
      setLikedMiniatures(miniatures)
    }

    setIsLoading(false)
  }

  const fetchBadges = async () => {
    setIsLoading(true)

    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        awarded_at,
        badge:badges(id, name, description, icon_url)
      `)
      .eq('user_id', userId)
      .order('awarded_at', { ascending: false })

    if (!error && data) {
      const badgeList = data
        .map((item) => ({
          ...(item.badge as { id: string; name: string; description: string | null; icon_url: string | null }),
          awarded_at: item.awarded_at,
        }))
        .filter((b) => b.id)
      setBadges(badgeList)
    }

    setIsLoading(false)
  }

  const tabs = [
    { id: 'miniatures' as Tab, label: 'Miniaturas', icon: ImageIcon },
    { id: 'likes' as Tab, label: 'Likes', icon: Heart },
    { id: 'badges' as Tab, label: 'Insignias', icon: Award },
  ]

  const currentItems = activeTab === 'miniatures' ? miniatures : activeTab === 'likes' ? likedMiniatures : []

  return (
    <div className="mt-8">
      {/* Tabs Navigation */}
      <div className="flex gap-1 border-b border-bone/10">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-6 py-3 font-body text-sm transition-colors ${
              activeTab === tab.id
                ? 'text-imperial-gold'
                : 'text-bone/60 hover:text-bone'
            }`}
            whileHover={{ backgroundColor: 'rgba(201, 162, 39, 0.05)' }}
            whileTap={{ scale: 0.98 }}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-imperial-gold"
                layoutId="activeTab"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="py-8"
        >
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square bg-void-light rounded-xl animate-pulse" />
              ))}
            </div>
          ) : activeTab === 'badges' ? (
            // Badges Grid
            badges.length === 0 ? (
              <EmptyState
                icon={Award}
                title="Sin insignias"
                description={isOwnProfile ? 'Aun no has conseguido ninguna insignia' : 'Este usuario aun no tiene insignias'}
              />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-void-light rounded-xl border border-bone/10 text-center"
                  >
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-imperial-gold/20 flex items-center justify-center">
                      {badge.icon_url ? (
                        <Image src={badge.icon_url} alt={badge.name} width={40} height={40} />
                      ) : (
                        <Award className="w-8 h-8 text-imperial-gold" />
                      )}
                    </div>
                    <h4 className="font-display font-bold text-bone mb-1">{badge.name}</h4>
                    {badge.description && (
                      <p className="text-xs text-bone/60 font-body">{badge.description}</p>
                    )}
                    <p className="text-xs text-bone/40 mt-2">
                      {new Date(badge.awarded_at).toLocaleDateString('es-ES')}
                    </p>
                  </motion.div>
                ))}
              </div>
            )
          ) : currentItems.length === 0 ? (
            <EmptyState
              icon={activeTab === 'miniatures' ? ImageIcon : Heart}
              title={activeTab === 'miniatures' ? 'Sin miniaturas' : 'Sin likes'}
              description={
                activeTab === 'miniatures'
                  ? isOwnProfile
                    ? 'Todavia no has compartido ninguna miniatura'
                    : 'Este usuario aun no ha compartido miniaturas'
                  : isOwnProfile
                  ? 'Aun no has dado like a ninguna miniatura'
                  : 'Este usuario aun no ha dado likes'
              }
            />
          ) : (
            // Miniatures Grid
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentItems.map((miniature, index) => (
                <MiniatureGridItem
                  key={miniature.id}
                  miniature={miniature}
                  index={index}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function EmptyState({ icon: Icon, title, description }: { icon: typeof ImageIcon; title: string; description: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bone/10 flex items-center justify-center">
        <Icon className="w-8 h-8 text-bone/40" />
      </div>
      <h3 className="text-lg font-display font-medium text-bone mb-2">{title}</h3>
      <p className="text-bone/60 font-body">{description}</p>
    </div>
  )
}

function MiniatureGridItem({ miniature, index }: { miniature: MiniatureWithStats; index: number }) {
  const [isHovered, setIsHovered] = useState(false)

  const thumbnailUrl = miniature.thumbnail_url || miniature.images?.[0] || '/placeholder-miniature.jpg'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/galeria/${miniature.id}`}>
        <motion.div
          className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={{ scale: 1.02 }}
        >
          <Image
            src={thumbnailUrl}
            alt={miniature.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 25vw"
          />

          {/* Hover Overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Info on Hover */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 p-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.2 }}
          >
            <h4 className="font-display font-bold text-bone text-sm truncate">
              {miniature.title}
            </h4>
            <div className="flex items-center gap-3 mt-1 text-xs text-bone/60">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {miniature.likes_count || 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {miniature.comments_count || 0}
              </span>
            </div>
          </motion.div>

          {/* Border glow on hover */}
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-imperial-gold pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>
      </Link>
    </motion.div>
  )
}
