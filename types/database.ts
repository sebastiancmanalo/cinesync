export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Watchlist {
  id: string
  name: string
  description: string
  owner_id: string
}

export interface WatchlistMember {
  id: number
  watchlist_id: string
  user_id: string
}

export interface WatchlistItem {
  id: number
  watchlist_id: string
  movie_id: number
  title: string
  poster_path: string | null
  is_watched: boolean
  created_at: string
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

export interface WatchlistWithItems extends Watchlist {
  items: WatchlistItem[]
}

export interface WatchlistWithMembers extends Watchlist {
  members: (WatchlistMember & { user: User })[]
}

export type UserRole = 'owner' | 'editor' | 'viewer'

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

export interface WatchlistInvitation {
  id: string
  watchlist_id: string
  invited_user_email: string
  invited_by_user_id: string
  status: "pending" | "accepted" | "rejected"
  created_at: string
  updated_at: string
}
