export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
  id: string
          full_name: string | null
          avatar_url: string | null
  created_at: string
  updated_at: string
}
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      watchlists: {
        Row: {
  id: string
  name: string
          description: string | null
          owner_id: string
  is_public: boolean
  created_at: string
  updated_at: string
}
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      watchlist_members: {
        Row: {
  id: string
  watchlist_id: string
  user_id: string
          role: string
  created_at: string
}
        Insert: {
          id?: string
          watchlist_id: string
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          watchlist_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      watchlist_items: {
        Row: {
  id: string
  watchlist_id: string
          movie_id: number
          title: string
          overview: string | null
          poster_path: string | null
          backdrop_path: string | null
          release_date: string | null
          runtime: number | null
          vote_average: number | null
          genres: any | null
          added_by: string | null
          added_at: string
          watched: boolean
          watched_at: string | null
        }
        Insert: {
          id?: string
          watchlist_id: string
          movie_id: number
  title: string
          overview?: string | null
          poster_path?: string | null
          backdrop_path?: string | null
          release_date?: string | null
          runtime?: number | null
          vote_average?: number | null
          genres?: any | null
          added_by?: string | null
          added_at?: string
          watched?: boolean
          watched_at?: string | null
        }
        Update: {
          id?: string
          watchlist_id?: string
          movie_id?: number
          title?: string
          overview?: string | null
          poster_path?: string | null
          backdrop_path?: string | null
          release_date?: string | null
          runtime?: number | null
          vote_average?: number | null
          genres?: any | null
          added_by?: string | null
          added_at?: string
          watched?: boolean
          watched_at?: string | null
        }
      }
      reviews: {
        Row: {
  id: string
  watchlist_item_id: string
  user_id: string
          rating: number
          comment: string | null
  created_at: string
  updated_at: string
}
        Insert: {
          id?: string
  watchlist_item_id: string
  user_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
}
        Update: {
          id?: string
          watchlist_item_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
}
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      watch_status: 'unwatched' | 'watched'
    }
  }
}

// Convenience types for common queries
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Watchlist = Database['public']['Tables']['watchlists']['Row']
export type WatchlistMember = Database['public']['Tables']['watchlist_members']['Row']
export type WatchlistItem = Database['public']['Tables']['watchlist_items']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']

// Extended types for frontend use
export interface WatchlistWithItems extends Watchlist {
  items: WatchlistItem[]
  members: WatchlistMember[]
}

export interface WatchlistItemWithReviews extends WatchlistItem {
  reviews: Review[]
  added_by_profile?: Profile
}

export interface ReviewWithUser extends Review {
  user_profile?: Profile
}

// Legacy types for backward compatibility (deprecated)
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface MovieDetails {
  id: number
  title: string
  overview: string
  poster_path?: string
  release_date: string
  runtime: number
  vote_average: number
  genres: Array<{ id: number; name: string }>
}
