import { createClient } from "@/lib/supabase/client"
import { createClient as createServerClient } from "@/lib/supabase/server"

export type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type Watchlist = {
  id: string
  name: string
  description: string | null
  owner_id: string
  created_at: string
  updated_at: string
  owner?: Profile
  members?: WatchlistMember[]
  items?: WatchlistItem[]
  member_count?: number
  total_runtime?: number
}

export type WatchlistMember = {
  id: string
  watchlist_id: string
  user_id: string
  role: "owner" | "editor" | "viewer"
  joined_at: string
  profile?: Profile
}

export type WatchlistItem = {
  id: string
  watchlist_id: string
  title: string
  year: number | null
  runtime_minutes: number | null
  poster_url: string | null
  description: string | null
  rating: number | null
  type: "movie" | "tv" | null
  status: "to-watch" | "in-progress" | "watched"
  progress: number
  added_by: string | null
  streaming_platforms: string[] | null
  external_id: string | null
  created_at: string
  updated_at: string
  added_by_profile?: Profile
  votes?: ItemVote[]
  vote_score?: number
}

export type ItemVote = {
  id: string
  item_id: string
  user_id: string
  vote_type: "up" | "down"
  created_at: string
}

// Client-side database functions
export const db = {
  // Profile functions
  async getProfile(userId: string): Promise<Profile | null> {
    const supabase = createClient()
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error fetching profile:", error)
      return null
    }
    return data
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    const supabase = createClient()
    const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single()

    if (error) {
      console.error("Error updating profile:", error)
      return null
    }
    return data
  },

  // Watchlist functions
  async getUserWatchlists(userId: string): Promise<Watchlist[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("watchlists")
      .select(`
        *,
        owner:profiles!watchlists_owner_id_fkey(*),
        members:watchlist_members(
          *,
          profile:profiles(*)
        ),
        items:watchlist_items(*)
      `)
      .or(`owner_id.eq.${userId},id.in.(${await getUserWatchlistIds(userId)})`)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching watchlists:", error)
      return []
    }

    // Calculate additional fields
    return data.map((watchlist) => ({
      ...watchlist,
      member_count: watchlist.members?.length || 0,
      total_runtime: watchlist.items?.reduce((total, item) => total + (item.runtime_minutes || 0), 0) || 0,
    }))
  },

  async createWatchlist(watchlist: { name: string; description?: string }): Promise<Watchlist | null> {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
      .from("watchlists")
      .insert({
        name: watchlist.name,
        description: watchlist.description,
        owner_id: user.id,
      })
      .select(`
        *,
        owner:profiles!watchlists_owner_id_fkey(*),
        members:watchlist_members(
          *,
          profile:profiles(*)
        )
      `)
      .single()

    if (error) {
      console.error("Error creating watchlist:", error)
      return null
    }

    // Add owner as a member
    await supabase.from("watchlist_members").insert({
      watchlist_id: data.id,
      user_id: user.id,
      role: "owner",
    })

    return data
  },

  async getWatchlist(watchlistId: string): Promise<Watchlist | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("watchlists")
      .select(`
        *,
        owner:profiles!watchlists_owner_id_fkey(*),
        members:watchlist_members(
          *,
          profile:profiles(*)
        ),
        items:watchlist_items(
          *,
          added_by_profile:profiles!watchlist_items_added_by_fkey(*),
          votes:item_votes(*)
        )
      `)
      .eq("id", watchlistId)
      .single()

    if (error) {
      console.error("Error fetching watchlist:", error)
      return null
    }

    // Calculate vote scores for items
    const itemsWithVotes =
      data.items?.map((item) => ({
        ...item,
        vote_score:
          (item.votes?.filter((v) => v.vote_type === "up").length || 0) -
          (item.votes?.filter((v) => v.vote_type === "down").length || 0),
      })) || []

    return {
      ...data,
      items: itemsWithVotes,
      member_count: data.members?.length || 0,
      total_runtime: itemsWithVotes.reduce((total, item) => total + (item.runtime_minutes || 0), 0),
    }
  },

  // Watchlist item functions
  async addWatchlistItem(item: {
    watchlist_id: string
    title: string
    year?: number
    runtime_minutes?: number
    poster_url?: string
    description?: string
    rating?: number
    type?: "movie" | "tv"
    streaming_platforms?: string[]
    external_id?: string
  }): Promise<WatchlistItem | null> {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
      .from("watchlist_items")
      .insert({
        ...item,
        added_by: user.id,
      })
      .select(`
        *,
        added_by_profile:profiles!watchlist_items_added_by_fkey(*)
      `)
      .single()

    if (error) {
      console.error("Error adding watchlist item:", error)
      return null
    }

    return data
  },

  async updateWatchlistItem(itemId: string, updates: Partial<WatchlistItem>): Promise<WatchlistItem | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("watchlist_items")
      .update(updates)
      .eq("id", itemId)
      .select(`
        *,
        added_by_profile:profiles!watchlist_items_added_by_fkey(*)
      `)
      .single()

    if (error) {
      console.error("Error updating watchlist item:", error)
      return null
    }

    return data
  },

  async deleteWatchlistItem(itemId: string): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase.from("watchlist_items").delete().eq("id", itemId)

    if (error) {
      console.error("Error deleting watchlist item:", error)
      return false
    }

    return true
  },

  // Voting functions
  async voteOnItem(itemId: string, voteType: "up" | "down"): Promise<boolean> {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    // First, remove any existing vote
    await supabase.from("item_votes").delete().eq("item_id", itemId).eq("user_id", user.id)

    // Then add the new vote
    const { error } = await supabase.from("item_votes").insert({
      item_id: itemId,
      user_id: user.id,
      vote_type: voteType,
    })

    if (error) {
      console.error("Error voting on item:", error)
      return false
    }

    return true
  },

  async removeVote(itemId: string): Promise<boolean> {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    const { error } = await supabase.from("item_votes").delete().eq("item_id", itemId).eq("user_id", user.id)

    if (error) {
      console.error("Error removing vote:", error)
      return false
    }

    return true
  },

  // Member functions
  async addWatchlistMember(
    watchlistId: string,
    userId: string,
    role: "editor" | "viewer" = "viewer",
  ): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase.from("watchlist_members").insert({
      watchlist_id: watchlistId,
      user_id: userId,
      role: role,
    })

    if (error) {
      console.error("Error adding watchlist member:", error)
      return false
    }

    return true
  },

  async removeWatchlistMember(watchlistId: string, userId: string): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
      .from("watchlist_members")
      .delete()
      .eq("watchlist_id", watchlistId)
      .eq("user_id", userId)

    if (error) {
      console.error("Error removing watchlist member:", error)
      return false
    }

    return true
  },
}

// Helper function to get user's watchlist IDs
async function getUserWatchlistIds(userId: string): Promise<string> {
  const supabase = createClient()
  const { data } = await supabase.from("watchlist_members").select("watchlist_id").eq("user_id", userId)

  return data?.map((m) => m.watchlist_id).join(",") || ""
}

// Server-side database functions
export const serverDb = {
  async getProfile(userId: string): Promise<Profile | null> {
    const supabase = await createServerClient()
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error fetching profile:", error)
      return null
    }
    return data
  },

  async getUserWatchlists(userId: string): Promise<Watchlist[]> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from("watchlists")
      .select(`
        *,
        owner:profiles!watchlists_owner_id_fkey(*),
        members:watchlist_members(
          *,
          profile:profiles(*)
        ),
        items:watchlist_items(*)
      `)
      .or(`owner_id.eq.${userId},id.in.(${await getServerUserWatchlistIds(userId)})`)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching watchlists:", error)
      return []
    }

    return data.map((watchlist) => ({
      ...watchlist,
      member_count: watchlist.members?.length || 0,
      total_runtime: watchlist.items?.reduce((total, item) => total + (item.runtime_minutes || 0), 0) || 0,
    }))
  },
}

async function getServerUserWatchlistIds(userId: string): Promise<string> {
  const supabase = await createServerClient()
  const { data } = await supabase.from("watchlist_members").select("watchlist_id").eq("user_id", userId)

  return data?.map((m) => m.watchlist_id).join(",") || ""
}
