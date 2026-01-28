export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          website: string | null
          instagram: string | null
          twitter: string | null
          youtube: string | null
          favorite_factions: string[] | null
          created_at: string
          updated_at: string
          // Role fields
          role: UserRole
          is_store_owner: boolean
          // Creator fields
          creator_status: CreatorStatus
          creator_type: CreatorType | null
          creator_verified_at: string | null
          creator_bio: string | null
          creator_services: string[] | null
          accepts_commissions: boolean
          commission_info: string | null
          portfolio_url: string | null
          pinned_miniatures: string[] | null
          creator_application_date: string | null
          creator_rejection_reason: string | null
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          instagram?: string | null
          twitter?: string | null
          youtube?: string | null
          favorite_factions?: string[] | null
          created_at?: string
          updated_at?: string
          // Role fields
          role?: UserRole
          is_store_owner?: boolean
          // Creator fields
          creator_status?: CreatorStatus
          creator_type?: CreatorType | null
          creator_verified_at?: string | null
          creator_bio?: string | null
          creator_services?: string[] | null
          accepts_commissions?: boolean
          commission_info?: string | null
          portfolio_url?: string | null
          pinned_miniatures?: string[] | null
          creator_application_date?: string | null
          creator_rejection_reason?: string | null
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          instagram?: string | null
          twitter?: string | null
          youtube?: string | null
          favorite_factions?: string[] | null
          created_at?: string
          updated_at?: string
          // Role fields
          role?: UserRole
          is_store_owner?: boolean
          // Creator fields
          creator_status?: CreatorStatus
          creator_type?: CreatorType | null
          creator_verified_at?: string | null
          creator_bio?: string | null
          creator_services?: string[] | null
          accepts_commissions?: boolean
          commission_info?: string | null
          portfolio_url?: string | null
          pinned_miniatures?: string[] | null
          creator_application_date?: string | null
          creator_rejection_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'follows_follower_id_fkey'
            columns: ['follower_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'follows_following_id_fkey'
            columns: ['following_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string | null
          icon_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          awarded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          awarded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          awarded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_badges_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_badges_badge_id_fkey'
            columns: ['badge_id']
            referencedRelation: 'badges'
            referencedColumns: ['id']
          }
        ]
      }
      miniatures: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          images: string[]
          thumbnail_url: string | null
          faction_id: string | null
          embedding: string | null
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          images?: string[]
          thumbnail_url?: string | null
          faction_id?: string | null
          embedding?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          images?: string[]
          thumbnail_url?: string | null
          faction_id?: string | null
          embedding?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'miniatures_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      miniature_likes: {
        Row: {
          id: string
          miniature_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          miniature_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          miniature_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'miniature_likes_miniature_id_fkey'
            columns: ['miniature_id']
            referencedRelation: 'miniatures'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'miniature_likes_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      miniature_comments: {
        Row: {
          id: string
          miniature_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          miniature_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          miniature_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'miniature_comments_miniature_id_fkey'
            columns: ['miniature_id']
            referencedRelation: 'miniatures'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'miniature_comments_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          category: 'faction' | 'technique' | 'game_system' | 'other'
          primary_color: string | null
          secondary_color: string | null
          icon_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          category?: 'faction' | 'technique' | 'game_system' | 'other'
          primary_color?: string | null
          secondary_color?: string | null
          icon_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          category?: 'faction' | 'technique' | 'game_system' | 'other'
          primary_color?: string | null
          secondary_color?: string | null
          icon_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      miniature_tags: {
        Row: {
          miniature_id: string
          tag_id: string
        }
        Insert: {
          miniature_id: string
          tag_id: string
        }
        Update: {
          miniature_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'miniature_tags_miniature_id_fkey'
            columns: ['miniature_id']
            referencedRelation: 'miniatures'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'miniature_tags_tag_id_fkey'
            columns: ['tag_id']
            referencedRelation: 'tags'
            referencedColumns: ['id']
          }
        ]
      }
      articles: {
        Row: {
          id: string
          author_id: string
          title: string
          slug: string
          excerpt: string | null
          content: string
          cover_image: string | null
          category: 'warhammer_40k' | 'age_of_sigmar' | 'painting' | 'tournaments' | 'news'
          published: boolean
          featured: boolean
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          slug: string
          excerpt?: string | null
          content: string
          cover_image?: string | null
          category?: 'warhammer_40k' | 'age_of_sigmar' | 'painting' | 'tournaments' | 'news'
          published?: boolean
          featured?: boolean
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          cover_image?: string | null
          category?: 'warhammer_40k' | 'age_of_sigmar' | 'painting' | 'tournaments' | 'news'
          published?: boolean
          featured?: boolean
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'articles_author_id_fkey'
            columns: ['author_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      article_comments: {
        Row: {
          id: string
          article_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          article_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          article_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'article_comments_article_id_fkey'
            columns: ['article_id']
            referencedRelation: 'articles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'article_comments_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      listings: {
        Row: {
          id: string
          seller_id: string
          title: string
          description: string
          price: number
          currency: string
          condition: 'nib' | 'nos' | 'assembled' | 'painted' | 'pro_painted'
          listing_type: 'sale' | 'trade' | 'both'
          status: 'active' | 'reserved' | 'sold' | 'inactive'
          category: ListingCategory
          images: string[]
          location: string | null
          latitude: number | null
          longitude: number | null
          faction_id: string | null
          views_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          title: string
          description: string
          price: number
          currency?: string
          condition: 'nib' | 'nos' | 'assembled' | 'painted' | 'pro_painted'
          listing_type?: 'sale' | 'trade' | 'both'
          status?: 'active' | 'reserved' | 'sold' | 'inactive'
          category?: ListingCategory
          images?: string[]
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          faction_id?: string | null
          views_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          title?: string
          description?: string
          price?: number
          currency?: string
          condition?: 'nib' | 'nos' | 'assembled' | 'painted' | 'pro_painted'
          listing_type?: 'sale' | 'trade' | 'both'
          status?: 'active' | 'reserved' | 'sold' | 'inactive'
          category?: ListingCategory
          images?: string[]
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          faction_id?: string | null
          views_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'listings_seller_id_fkey'
            columns: ['seller_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      listing_favorites: {
        Row: {
          id: string
          listing_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'listing_favorites_listing_id_fkey'
            columns: ['listing_id']
            referencedRelation: 'listings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'listing_favorites_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      seller_reviews: {
        Row: {
          id: string
          seller_id: string
          reviewer_id: string
          listing_id: string | null
          rating: number
          content: string | null
          created_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          reviewer_id: string
          listing_id?: string | null
          rating: number
          content?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          reviewer_id?: string
          listing_id?: string | null
          rating?: number
          content?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'seller_reviews_seller_id_fkey'
            columns: ['seller_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'seller_reviews_reviewer_id_fkey'
            columns: ['reviewer_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'seller_reviews_listing_id_fkey'
            columns: ['listing_id']
            referencedRelation: 'listings'
            referencedColumns: ['id']
          }
        ]
      }
      conversations: {
        Row: {
          id: string
          listing_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          listing_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'conversations_listing_id_fkey'
            columns: ['listing_id']
            referencedRelation: 'listings'
            referencedColumns: ['id']
          }
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          user_id: string
          joined_at: string
          last_read_at: string | null
        }
        Insert: {
          conversation_id: string
          user_id: string
          joined_at?: string
          last_read_at?: string | null
        }
        Update: {
          conversation_id?: string
          user_id?: string
          joined_at?: string
          last_read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'conversation_participants_conversation_id_fkey'
            columns: ['conversation_id']
            referencedRelation: 'conversations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'conversation_participants_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'messages_conversation_id_fkey'
            columns: ['conversation_id']
            referencedRelation: 'conversations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'messages_sender_id_fkey'
            columns: ['sender_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'like' | 'comment' | 'follow' | 'message' | 'mention' | 'system'
          title: string
          body: string | null
          data: Json | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'like' | 'comment' | 'follow' | 'message' | 'mention' | 'system'
          title: string
          body?: string | null
          data?: Json | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'like' | 'comment' | 'follow' | 'message' | 'mention' | 'system'
          title?: string
          body?: string | null
          data?: Json | null
          read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      stores: {
        Row: {
          id: string
          submitted_by: string
          name: string
          slug: string
          description: string | null
          store_type: StoreType
          status: StoreStatus
          phone: string | null
          email: string | null
          website: string | null
          instagram: string | null
          facebook: string | null
          address: string
          city: string
          province: string | null
          postal_code: string | null
          country: string
          latitude: number
          longitude: number
          images: string[]
          services: string[]
          opening_hours: Json
          avg_rating: number
          review_count: number
          reviewed_by: string | null
          reviewed_at: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          submitted_by: string
          name: string
          slug: string
          description?: string | null
          store_type?: StoreType
          status?: StoreStatus
          phone?: string | null
          email?: string | null
          website?: string | null
          instagram?: string | null
          facebook?: string | null
          address: string
          city: string
          province?: string | null
          postal_code?: string | null
          country?: string
          latitude: number
          longitude: number
          images?: string[]
          services?: string[]
          opening_hours?: Json
          avg_rating?: number
          review_count?: number
          reviewed_by?: string | null
          reviewed_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          submitted_by?: string
          name?: string
          slug?: string
          description?: string | null
          store_type?: StoreType
          status?: StoreStatus
          phone?: string | null
          email?: string | null
          website?: string | null
          instagram?: string | null
          facebook?: string | null
          address?: string
          city?: string
          province?: string | null
          postal_code?: string | null
          country?: string
          latitude?: number
          longitude?: number
          images?: string[]
          services?: string[]
          opening_hours?: Json
          avg_rating?: number
          review_count?: number
          reviewed_by?: string | null
          reviewed_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'stores_submitted_by_fkey'
            columns: ['submitted_by']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      store_reviews: {
        Row: {
          id: string
          store_id: string
          reviewer_id: string
          rating: number
          content: string | null
          created_at: string
        }
        Insert: {
          id?: string
          store_id: string
          reviewer_id: string
          rating: number
          content?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          reviewer_id?: string
          rating?: number
          content?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'store_reviews_store_id_fkey'
            columns: ['store_id']
            referencedRelation: 'stores'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'store_reviews_reviewer_id_fkey'
            columns: ['reviewer_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      creator_applications: {
        Row: {
          id: string
          user_id: string
          creator_type: CreatorType
          motivation: string
          portfolio_links: string[] | null
          social_links: Json | null
          status: CreatorStatus
          reviewed_by: string | null
          reviewed_at: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          creator_type: CreatorType
          motivation: string
          portfolio_links?: string[] | null
          social_links?: Json | null
          status?: CreatorStatus
          reviewed_by?: string | null
          reviewed_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          creator_type?: CreatorType
          motivation?: string
          portfolio_links?: string[] | null
          social_links?: Json | null
          status?: CreatorStatus
          reviewed_by?: string | null
          reviewed_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'creator_applications_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'creator_applications_reviewed_by_fkey'
            columns: ['reviewed_by']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_user_id: string | null
          content_type: 'miniature' | 'listing' | 'comment' | 'message' | 'profile'
          content_id: string
          reason: string
          description: string | null
          status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          created_at: string
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_user_id?: string | null
          content_type: 'miniature' | 'listing' | 'comment' | 'message' | 'profile'
          content_id: string
          reason: string
          description?: string | null
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          created_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_user_id?: string | null
          content_type?: 'miniature' | 'listing' | 'comment' | 'message' | 'profile'
          content_id?: string
          reason?: string
          description?: string | null
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          created_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'reports_reporter_id_fkey'
            columns: ['reporter_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reports_reported_user_id_fkey'
            columns: ['reported_user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reports_resolved_by_fkey'
            columns: ['resolved_by']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      events: {
        Row: {
          id: string
          organizer_id: string
          store_id: string | null
          name: string
          slug: string
          description: string | null
          event_type: 'tournament' | 'painting_workshop' | 'casual_play' | 'campaign' | 'release_event' | 'meetup' | 'other'
          status: 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          start_date: string
          end_date: string | null
          registration_deadline: string | null
          venue_name: string | null
          address: string
          city: string
          province: string | null
          postal_code: string | null
          country: string
          latitude: number
          longitude: number
          game_system: string | null
          format: string | null
          max_participants: number | null
          current_participants: number
          entry_fee: number | null
          prizes: string | null
          cover_image: string | null
          images: string[]
          contact_email: string | null
          contact_phone: string | null
          external_url: string | null
          is_featured: boolean
          is_official: boolean
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organizer_id: string
          store_id?: string | null
          name: string
          slug: string
          description?: string | null
          event_type: 'tournament' | 'painting_workshop' | 'casual_play' | 'campaign' | 'release_event' | 'meetup' | 'other'
          status?: 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          start_date: string
          end_date?: string | null
          registration_deadline?: string | null
          venue_name?: string | null
          address: string
          city: string
          province?: string | null
          postal_code?: string | null
          country?: string
          latitude: number
          longitude: number
          game_system?: string | null
          format?: string | null
          max_participants?: number | null
          current_participants?: number
          entry_fee?: number | null
          prizes?: string | null
          cover_image?: string | null
          images?: string[]
          contact_email?: string | null
          contact_phone?: string | null
          external_url?: string | null
          is_featured?: boolean
          is_official?: boolean
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organizer_id?: string
          store_id?: string | null
          name?: string
          slug?: string
          description?: string | null
          event_type?: 'tournament' | 'painting_workshop' | 'casual_play' | 'campaign' | 'release_event' | 'meetup' | 'other'
          status?: 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          start_date?: string
          end_date?: string | null
          registration_deadline?: string | null
          venue_name?: string | null
          address?: string
          city?: string
          province?: string | null
          postal_code?: string | null
          country?: string
          latitude?: number
          longitude?: number
          game_system?: string | null
          format?: string | null
          max_participants?: number | null
          current_participants?: number
          entry_fee?: number | null
          prizes?: string | null
          cover_image?: string | null
          images?: string[]
          contact_email?: string | null
          contact_phone?: string | null
          external_url?: string | null
          is_featured?: boolean
          is_official?: boolean
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'events_organizer_id_fkey'
            columns: ['organizer_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'events_store_id_fkey'
            columns: ['store_id']
            referencedRelation: 'stores'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_miniatures_by_embedding: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          title: string
          description: string | null
          thumbnail_url: string | null
          similarity: number
        }[]
      }
      find_similar_miniatures: {
        Args: {
          miniature_id: string
          match_count?: number
        }
        Returns: {
          id: string
          title: string
          description: string | null
          thumbnail_url: string | null
          similarity: number
        }[]
      }
      increment_view_count: {
        Args: {
          p_miniature_id: string
        }
        Returns: undefined
      }
      create_conversation_with_participants: {
        Args: {
          p_listing_id: string
          p_user_a: string
          p_user_b: string
        }
        Returns: string
      }
      is_conversation_participant: {
        Args: {
          conv_id: string
        }
        Returns: boolean
      }
      check_creator_eligibility: {
        Args: {
          user_uuid: string
        }
        Returns: Json
      }
      apply_for_creator: {
        Args: {
          user_uuid: string
          p_creator_type: CreatorType
          p_motivation: string
          p_portfolio_links?: string[] | null
          p_social_links?: Json | null
        }
        Returns: Json
      }
      review_creator_application: {
        Args: {
          application_uuid: string
          reviewer_uuid: string
          p_approved: boolean
          p_rejection_reason?: string | null
        }
        Returns: Json
      }
    }
    Enums: {
      article_category: 'warhammer_40k' | 'age_of_sigmar' | 'painting' | 'tournaments' | 'news'
      listing_category: ListingCategory
      listing_condition: 'nib' | 'nos' | 'assembled' | 'painted' | 'pro_painted'
      listing_status: 'active' | 'reserved' | 'sold' | 'inactive'
      listing_type: 'sale' | 'trade' | 'both'
      notification_type: 'like' | 'comment' | 'follow' | 'message' | 'mention' | 'system'
      report_status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
      store_type: StoreType
      store_status: StoreStatus
      tag_category: 'faction' | 'technique' | 'game_system' | 'other'
      creator_type: CreatorType
      creator_status: CreatorStatus
      user_role: UserRole
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Store enums
export type StoreType = 'specialist' | 'comics_games' | 'general_hobby' | 'online_only'
export type StoreStatus = 'pending' | 'approved' | 'rejected' | 'closed'

// Creator enums
export type CreatorType = 'painter' | 'youtuber' | 'artist' | 'blogger' | 'instructor'
export type CreatorStatus = 'none' | 'pending' | 'approved' | 'rejected'

// User role enum (hierarchical: admin > moderator > user)
export type UserRole = 'user' | 'moderator' | 'admin'

// Event enums
export type EventType = 'tournament' | 'painting_workshop' | 'casual_play' | 'campaign' | 'release_event' | 'meetup' | 'other'
export type EventStatus = 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

// Listing category enum
export type ListingCategory =
  | 'miniatures'
  | 'novels'
  | 'codex'
  | 'paints'
  | 'tools'
  | 'terrain'
  | 'accessories'
  | 'other'

// Event type
export interface Event {
  id: string
  organizer_id: string
  store_id: string | null
  name: string
  slug: string
  description: string | null
  event_type: EventType
  status: EventStatus
  start_date: string
  end_date: string | null
  registration_deadline: string | null
  venue_name: string | null
  address: string
  city: string
  province: string | null
  postal_code: string | null
  country: string
  latitude: number
  longitude: number
  game_system: string | null
  format: string | null
  max_participants: number | null
  current_participants: number
  entry_fee: number | null
  prizes: string | null
  cover_image: string | null
  images: string[]
  contact_email: string | null
  contact_phone: string | null
  external_url: string | null
  is_featured: boolean
  is_official: boolean
  tags: string[]
  created_at: string
  updated_at: string
}

// Event with organizer profile info
export interface EventWithOrganizer extends Event {
  organizer: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
    creator_status: string | null
  } | null
  store: {
    id: string
    name: string
    slug: string
  } | null
}

export interface EventRegistration {
  id: string
  event_id: string
  user_id: string
  status: 'registered' | 'waitlist' | 'cancelled' | 'attended'
  notes: string | null
  registered_at: string
}

// Commonly used types
export type Profile = Tables<'profiles'>
export type Miniature = Tables<'miniatures'>
export type Listing = Tables<'listings'>
export type Article = Tables<'articles'>
export type Message = Tables<'messages'>
export type Notification = Tables<'notifications'>
export type Store = Tables<'stores'>
export type StoreReview = Tables<'store_reviews'>
export type CreatorApplication = Tables<'creator_applications'>

// Creator profile type (for public view)
export interface PublicCreator {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  creator_type: CreatorType
  creator_bio: string | null
  creator_services: string[] | null
  accepts_commissions: boolean
  portfolio_url: string | null
  pinned_miniatures: string[] | null
  creator_verified_at: string | null
  favorite_factions: string[] | null
  miniatures_count: number
  followers_count: number
  instagram: string | null
  twitter: string | null
  youtube: string | null
  website: string | null
}
