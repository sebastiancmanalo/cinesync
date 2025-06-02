export interface User {
  id: string
  email: string
  full_name?: string
  username?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Watchlist {
  id: string
  name: string
  description?: string
  is_public: boolean
  owner_id: string
  created_at: string
  updated_at: string
}

export interface WatchlistMember {
  id: string
  watchlist_id: string
  user_id: string
  role: "owner" | "editor" | "viewer"
  created_at: string
}

export interface WatchlistItem {
  id: string
  watchlist_id: string
  tmdb_id: number
  media_type: "movie" | "tv"
  title: string
  overview?: string
  poster_path?: string
  release_date?: string
  estimated_watch_time: number
  status: "to_watch" | "watching" | "watched"
  added_by: string
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  watchlist_item_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface Vote {
  id: string
  watchlist_item_id: string
  user_id: string
  vote_type: "up" | "down"
  created_at: string
  updated_at: string
}

export interface ItemVote {
  id: string
  item_id: string
  user_id: string
  vote_type: string
  created_at: string
}

export interface ItemComment {
  id: string
  item_id: string
  user_id: string
  comment: string
  created_at: string
  updated_at: string
}
