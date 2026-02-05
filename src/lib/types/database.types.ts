export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      article_comments: {
        Row: {
          article_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          article_id: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          article_id?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string
          category: Database["public"]["Enums"]["article_category"]
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          featured: boolean
          id: string
          published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          author_id: string
          category?: Database["public"]["Enums"]["article_category"]
          content: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          author_id?: string
          category?: Database["public"]["Enums"]["article_category"]
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          created_at: string
          description: string | null
          icon_url: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          listing_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_applications: {
        Row: {
          created_at: string | null
          creator_type: Database["public"]["Enums"]["creator_type"]
          id: string
          motivation: string
          portfolio_links: string[] | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          social_links: Json | null
          status: Database["public"]["Enums"]["creator_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          creator_type: Database["public"]["Enums"]["creator_type"]
          id?: string
          motivation: string
          portfolio_links?: string[] | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_links?: Json | null
          status?: Database["public"]["Enums"]["creator_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          creator_type?: Database["public"]["Enums"]["creator_type"]
          id?: string
          motivation?: string
          portfolio_links?: string[] | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_links?: Json | null
          status?: Database["public"]["Enums"]["creator_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          event_id: string
          id: string
          notes: string | null
          registered_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          notes?: string | null
          registered_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          notes?: string | null
          registered_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string
          city: string
          contact_email: string | null
          contact_phone: string | null
          country: string
          cover_image: string | null
          created_at: string | null
          current_participants: number | null
          description: string | null
          end_date: string | null
          entry_fee: number | null
          event_type: Database["public"]["Enums"]["event_type"]
          external_url: string | null
          format: string | null
          game_system: string | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          latitude: number
          longitude: number
          max_participants: number | null
          name: string
          organizer_id: string
          postal_code: string | null
          prizes: string | null
          province: string | null
          registration_deadline: string | null
          slug: string
          start_date: string
          status: Database["public"]["Enums"]["event_status"]
          store_id: string | null
          tags: string[] | null
          updated_at: string | null
          venue_name: string | null
        }
        Insert: {
          address: string
          city: string
          contact_email?: string | null
          contact_phone?: string | null
          country?: string
          cover_image?: string | null
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          entry_fee?: number | null
          event_type?: Database["public"]["Enums"]["event_type"]
          external_url?: string | null
          format?: string | null
          game_system?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          latitude: number
          longitude: number
          max_participants?: number | null
          name: string
          organizer_id: string
          postal_code?: string | null
          prizes?: string | null
          province?: string | null
          registration_deadline?: string | null
          slug: string
          start_date: string
          status?: Database["public"]["Enums"]["event_status"]
          store_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          venue_name?: string | null
        }
        Update: {
          address?: string
          city?: string
          contact_email?: string | null
          contact_phone?: string | null
          country?: string
          cover_image?: string | null
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          entry_fee?: number | null
          event_type?: Database["public"]["Enums"]["event_type"]
          external_url?: string | null
          format?: string | null
          game_system?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          latitude?: number
          longitude?: number
          max_participants?: number | null
          name?: string
          organizer_id?: string
          postal_code?: string | null
          prizes?: string | null
          province?: string | null
          registration_deadline?: string | null
          slug?: string
          start_date?: string
          status?: Database["public"]["Enums"]["event_status"]
          store_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      faction_wiki_pages: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: Json
          created_at: string | null
          excerpt: string | null
          faction_id: string
          gallery_images: string[] | null
          hero_image: string | null
          id: string
          published_at: string | null
          slug: string
          status: string | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content: Json
          created_at?: string | null
          excerpt?: string | null
          faction_id: string
          gallery_images?: string[] | null
          hero_image?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: Json
          created_at?: string | null
          excerpt?: string | null
          faction_id?: string
          gallery_images?: string[] | null
          hero_image?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "faction_wiki_pages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faction_wiki_pages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faction_wiki_pages_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "wiki_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_favorites: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          category: Database["public"]["Enums"]["listing_category"]
          condition: Database["public"]["Enums"]["listing_condition"]
          created_at: string
          currency: string
          description: string
          faction_id: string | null
          favorites_count: number
          id: string
          images: string[]
          latitude: number | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          location: string | null
          longitude: number | null
          price: number
          seller_id: string
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          category?: Database["public"]["Enums"]["listing_category"]
          condition: Database["public"]["Enums"]["listing_condition"]
          created_at?: string
          currency?: string
          description: string
          faction_id?: string | null
          favorites_count?: number
          id?: string
          images?: string[]
          latitude?: number | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          location?: string | null
          longitude?: number | null
          price: number
          seller_id: string
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["listing_category"]
          condition?: Database["public"]["Enums"]["listing_condition"]
          created_at?: string
          currency?: string
          description?: string
          faction_id?: string | null
          favorites_count?: number
          id?: string
          images?: string[]
          latitude?: number | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          location?: string | null
          longitude?: number | null
          price?: number
          seller_id?: string
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "listings_faction_id_fkey"
            columns: ["faction_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
        ]
      }
      miniature_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          miniature_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          miniature_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          miniature_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "miniature_comments_miniature_id_fkey"
            columns: ["miniature_id"]
            isOneToOne: false
            referencedRelation: "miniatures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "miniature_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "miniature_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
        ]
      }
      miniature_likes: {
        Row: {
          created_at: string
          id: string
          miniature_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          miniature_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          miniature_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "miniature_likes_miniature_id_fkey"
            columns: ["miniature_id"]
            isOneToOne: false
            referencedRelation: "miniatures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "miniature_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "miniature_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "miniature_tags_miniature_id_fkey"
            columns: ["miniature_id"]
            isOneToOne: false
            referencedRelation: "miniatures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "miniature_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      miniatures: {
        Row: {
          comments_count: number
          created_at: string
          description: string | null
          embedding: string | null
          faction_id: string | null
          id: string
          images: string[]
          likes_count: number
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          comments_count?: number
          created_at?: string
          description?: string | null
          embedding?: string | null
          faction_id?: string | null
          id?: string
          images?: string[]
          likes_count?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          comments_count?: number
          created_at?: string
          description?: string | null
          embedding?: string | null
          faction_id?: string | null
          id?: string
          images?: string[]
          likes_count?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "miniatures_faction_id_fkey"
            columns: ["faction_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "miniatures_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "miniatures_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json | null
          id: string
          read: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          read?: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accepts_commissions: boolean | null
          avatar_url: string | null
          bio: string | null
          commission_info: string | null
          created_at: string
          creator_application_date: string | null
          creator_bio: string | null
          creator_rejection_reason: string | null
          creator_services: string[] | null
          creator_status: Database["public"]["Enums"]["creator_status"] | null
          creator_type: Database["public"]["Enums"]["creator_type"] | null
          creator_verified_at: string | null
          display_name: string | null
          favorite_factions: string[] | null
          id: string
          instagram: string | null
          is_admin: boolean | null
          is_banned: boolean | null
          is_store_owner: boolean
          is_verified: boolean | null
          location: string | null
          pinned_miniatures: string[] | null
          portfolio_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          twitter: string | null
          updated_at: string
          username: string
          website: string | null
          wiki_role: 'scribe' | 'lexicanum' | null
          youtube: string | null
        }
        Insert: {
          accepts_commissions?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          commission_info?: string | null
          created_at?: string
          creator_application_date?: string | null
          creator_bio?: string | null
          creator_rejection_reason?: string | null
          creator_services?: string[] | null
          creator_status?: Database["public"]["Enums"]["creator_status"] | null
          creator_type?: Database["public"]["Enums"]["creator_type"] | null
          creator_verified_at?: string | null
          display_name?: string | null
          favorite_factions?: string[] | null
          id: string
          instagram?: string | null
          is_admin?: boolean | null
          is_banned?: boolean | null
          is_store_owner?: boolean
          is_verified?: boolean | null
          location?: string | null
          pinned_miniatures?: string[] | null
          portfolio_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          twitter?: string | null
          updated_at?: string
          username: string
          website?: string | null
          wiki_role?: 'scribe' | 'lexicanum' | null
          youtube?: string | null
        }
        Update: {
          accepts_commissions?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          commission_info?: string | null
          created_at?: string
          creator_application_date?: string | null
          creator_bio?: string | null
          creator_rejection_reason?: string | null
          creator_services?: string[] | null
          creator_status?: Database["public"]["Enums"]["creator_status"] | null
          creator_type?: Database["public"]["Enums"]["creator_type"] | null
          creator_verified_at?: string | null
          display_name?: string | null
          favorite_factions?: string[] | null
          id?: string
          instagram?: string | null
          is_admin?: boolean | null
          is_banned?: boolean | null
          is_store_owner?: boolean
          is_verified?: boolean | null
          location?: string | null
          pinned_miniatures?: string[] | null
          portfolio_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          twitter?: string | null
          updated_at?: string
          username?: string
          website?: string | null
          wiki_role?: 'scribe' | 'lexicanum' | null
          youtube?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          content_id: string
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_user_id: string | null
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          content_id: string
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_user_id?: string | null
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          content_id?: string
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_user_id?: string | null
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_reviews: {
        Row: {
          content: string | null
          created_at: string
          id: string
          listing_id: string | null
          rating: number
          reviewer_id: string
          seller_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          listing_id?: string | null
          rating: number
          reviewer_id: string
          seller_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          listing_id?: string | null
          rating?: number
          reviewer_id?: string
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_reviews_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_reviews_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
        ]
      }
      store_reviews: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          rating: number
          reviewer_id: string
          store_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          rating: number
          reviewer_id: string
          store_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          reviewer_id?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_reviews_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string
          avg_rating: number | null
          city: string
          country: string
          created_at: string | null
          description: string | null
          email: string | null
          facebook: string | null
          id: string
          images: string[] | null
          instagram: string | null
          latitude: number
          longitude: number
          name: string
          opening_hours: Json | null
          phone: string | null
          postal_code: string | null
          province: string | null
          rejection_reason: string | null
          review_count: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          services: string[] | null
          slug: string
          status: Database["public"]["Enums"]["store_status"]
          store_type: Database["public"]["Enums"]["store_type"]
          submitted_by: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address: string
          avg_rating?: number | null
          city: string
          country?: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          facebook?: string | null
          id?: string
          images?: string[] | null
          instagram?: string | null
          latitude: number
          longitude: number
          name: string
          opening_hours?: Json | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          rejection_reason?: string | null
          review_count?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          services?: string[] | null
          slug: string
          status?: Database["public"]["Enums"]["store_status"]
          store_type?: Database["public"]["Enums"]["store_type"]
          submitted_by: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          avg_rating?: number | null
          city?: string
          country?: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          facebook?: string | null
          id?: string
          images?: string[] | null
          instagram?: string | null
          latitude?: number
          longitude?: number
          name?: string
          opening_hours?: Json | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          rejection_reason?: string | null
          review_count?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          services?: string[] | null
          slug?: string
          status?: Database["public"]["Enums"]["store_status"]
          store_type?: Database["public"]["Enums"]["store_type"]
          submitted_by?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          category: Database["public"]["Enums"]["tag_category"]
          created_at: string
          icon_url: string | null
          id: string
          name: string
          primary_color: string | null
          secondary_color: string | null
          slug: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["tag_category"]
          created_at?: string
          icon_url?: string | null
          id?: string
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          slug: string
        }
        Update: {
          category?: Database["public"]["Enums"]["tag_category"]
          created_at?: string
          icon_url?: string | null
          id?: string
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          awarded_at: string
          badge_id: string
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_id: string
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      wiki_contributions: {
        Row: {
          content: Json
          contributor_id: string
          created_at: string | null
          faction_id: string | null
          id: string
          page_id: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          reviewer_notes: string | null
          status: string | null
          suggested_title: string | null
        }
        Insert: {
          content: Json
          contributor_id: string
          created_at?: string | null
          faction_id?: string | null
          id?: string
          page_id?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          status?: string | null
          suggested_title?: string | null
        }
        Update: {
          content?: Json
          contributor_id?: string
          created_at?: string | null
          faction_id?: string | null
          id?: string
          page_id?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          status?: string | null
          suggested_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wiki_contributions_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_contributions_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_contributions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "faction_wiki_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_contributions_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_contributions_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_revisions: {
        Row: {
          author_id: string | null
          change_summary: string | null
          content: Json
          created_at: string | null
          id: string
          page_id: string
        }
        Insert: {
          author_id?: string | null
          change_summary?: string | null
          content: Json
          created_at?: string | null
          id?: string
          page_id: string
        }
        Update: {
          author_id?: string | null
          change_summary?: string | null
          content?: Json
          created_at?: string | null
          id?: string
          page_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_revisions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_revisions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_revisions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "faction_wiki_pages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_creators: {
        Row: {
          accepts_commissions: boolean | null
          avatar_url: string | null
          bio: string | null
          creator_bio: string | null
          creator_services: string[] | null
          creator_type: Database["public"]["Enums"]["creator_type"] | null
          creator_verified_at: string | null
          display_name: string | null
          favorite_factions: string[] | null
          followers_count: number | null
          id: string | null
          instagram: string | null
          miniatures_count: number | null
          pinned_miniatures: string[] | null
          portfolio_url: string | null
          twitter: string | null
          username: string | null
          website: string | null
          youtube: string | null
        }
        Insert: {
          accepts_commissions?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          creator_bio?: string | null
          creator_services?: string[] | null
          creator_type?: Database["public"]["Enums"]["creator_type"] | null
          creator_verified_at?: string | null
          display_name?: string | null
          favorite_factions?: string[] | null
          followers_count?: never
          id?: string | null
          instagram?: string | null
          miniatures_count?: never
          pinned_miniatures?: string[] | null
          portfolio_url?: string | null
          twitter?: string | null
          username?: string | null
          website?: string | null
          youtube?: string | null
        }
        Update: {
          accepts_commissions?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          creator_bio?: string | null
          creator_services?: string[] | null
          creator_type?: Database["public"]["Enums"]["creator_type"] | null
          creator_verified_at?: string | null
          display_name?: string | null
          favorite_factions?: string[] | null
          followers_count?: never
          id?: string | null
          instagram?: string | null
          miniatures_count?: never
          pinned_miniatures?: string[] | null
          portfolio_url?: string | null
          twitter?: string | null
          username?: string | null
          website?: string | null
          youtube?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      apply_for_creator: {
        Args: {
          p_creator_type: Database["public"]["Enums"]["creator_type"]
          p_motivation: string
          p_portfolio_links?: string[]
          p_social_links?: Json
          user_uuid: string
        }
        Returns: Json
      }
      check_creator_eligibility: { Args: { user_uuid: string }; Returns: Json }
      create_conversation_with_participants: {
        Args: { p_listing_id: string; p_user_a: string; p_user_b: string }
        Returns: string
      }
      find_similar_miniatures: {
        Args: { match_count?: number; miniature_id: string }
        Returns: {
          description: string
          id: string
          similarity: number
          thumbnail_url: string
          title: string
        }[]
      }
      generate_username_from_email: { Args: { email: string }; Returns: string }
      get_user_permissions: { Args: { user_uuid: string }; Returns: Json }
      has_dashboard_access: { Args: { user_uuid: string }; Returns: boolean }
      increment_listing_views: {
        Args: { listing_id: string }
        Returns: undefined
      }
      increment_view_count: {
        Args: { p_miniature_id: string }
        Returns: undefined
      }
      increment_wiki_page_views: {
        Args: { page_uuid: string }
        Returns: undefined
      }
      is_admin: { Args: { user_uuid: string }; Returns: boolean }
      is_conversation_participant: {
        Args: { conv_id: string }
        Returns: boolean
      }
      is_moderator_or_above: { Args: { user_uuid: string }; Returns: boolean }
      review_creator_application: {
        Args: {
          application_uuid: string
          p_approved: boolean
          p_rejection_reason?: string
          reviewer_uuid: string
        }
        Returns: Json
      }
      search_miniatures_by_embedding: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          description: string
          id: string
          similarity: number
          thumbnail_url: string
          title: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      article_category:
        | "warhammer_40k"
        | "age_of_sigmar"
        | "painting"
        | "tournaments"
        | "news"
      content_type: "miniature" | "listing" | "comment" | "message" | "profile"
      creator_status: "none" | "pending" | "approved" | "rejected"
      creator_type: "painter" | "youtuber" | "artist" | "blogger" | "instructor"
      event_status: "draft" | "upcoming" | "ongoing" | "completed" | "cancelled"
      event_type:
        | "tournament"
        | "painting_workshop"
        | "casual_play"
        | "campaign"
        | "release_event"
        | "meetup"
        | "other"
      listing_category:
        | "miniatures"
        | "novels"
        | "codex"
        | "paints"
        | "tools"
        | "terrain"
        | "accessories"
        | "other"
      listing_condition: "nib" | "nos" | "assembled" | "painted" | "pro_painted"
      listing_status: "active" | "reserved" | "sold" | "inactive"
      listing_type: "sale" | "trade" | "both"
      notification_type:
        | "like"
        | "comment"
        | "follow"
        | "message"
        | "mention"
        | "system"
      report_status: "pending" | "reviewed" | "resolved" | "dismissed"
      store_status: "pending" | "approved" | "rejected" | "closed"
      store_type:
        | "specialist"
        | "comics_games"
        | "general_hobby"
        | "online_only"
      tag_category: "faction" | "technique" | "game_system" | "other"
      user_role: "user" | "moderator" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      article_category: [
        "warhammer_40k",
        "age_of_sigmar",
        "painting",
        "tournaments",
        "news",
      ],
      content_type: ["miniature", "listing", "comment", "message", "profile"],
      creator_status: ["none", "pending", "approved", "rejected"],
      creator_type: ["painter", "youtuber", "artist", "blogger", "instructor"],
      event_status: ["draft", "upcoming", "ongoing", "completed", "cancelled"],
      event_type: [
        "tournament",
        "painting_workshop",
        "casual_play",
        "campaign",
        "release_event",
        "meetup",
        "other",
      ],
      listing_category: [
        "miniatures",
        "novels",
        "codex",
        "paints",
        "tools",
        "terrain",
        "accessories",
        "other",
      ],
      listing_condition: ["nib", "nos", "assembled", "painted", "pro_painted"],
      listing_status: ["active", "reserved", "sold", "inactive"],
      listing_type: ["sale", "trade", "both"],
      notification_type: [
        "like",
        "comment",
        "follow",
        "message",
        "mention",
        "system",
      ],
      report_status: ["pending", "reviewed", "resolved", "dismissed"],
      store_status: ["pending", "approved", "rejected", "closed"],
      store_type: [
        "specialist",
        "comics_games",
        "general_hobby",
        "online_only",
      ],
      tag_category: ["faction", "technique", "game_system", "other"],
      user_role: ["user", "moderator", "admin"],
    },
  },
} as const

// =============================================================================
// CUSTOM TYPE ALIASES
// =============================================================================

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Miniature = Database['public']['Tables']['miniatures']['Row']
export type Listing = Database['public']['Tables']['listings']['Row']
export type ListingCategory = Database['public']['Enums']['listing_category']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type UserRole = Database['public']['Enums']['user_role']
export type CreatorStatus = Database['public']['Enums']['creator_status']
export type CreatorType = Database['public']['Enums']['creator_type']
export type EventType = Database['public']['Enums']['event_type']
export type StoreType = Database['public']['Enums']['store_type']
export type Store = Database['public']['Tables']['stores']['Row']

// Event with organizer info and store relation
export type EventWithOrganizer = Database['public']['Tables']['events']['Row'] & {
  organizer?: Pick<Profile, 'username' | 'display_name' | 'avatar_url'> | null
  store?: Pick<Store, 'id' | 'name' | 'slug'> | null
  is_official?: boolean // Derived from store_id presence or explicit field
}

// Public creator view
export type PublicCreator = Database['public']['Views']['public_creators']['Row']
