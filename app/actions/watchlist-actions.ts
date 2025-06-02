"use server"

import { createClient } from "@/lib/supabase/server"
import { getMovieDetailsServer, getTVDetailsServer } from "@/lib/tmdb-server"
import { calculateWatchTime } from "@/lib/tmdb"
import { revalidatePath } from "next/cache"

export async function addMediaToWatchlist(watchlistId: string, tmdbId: number, mediaType: "movie" | "tv") {
  const supabase = await createClient()

  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error("Authentication required")
    }

    // Verify user has access to this watchlist
    const { data: membership, error: membershipError } = await supabase
      .from("watchlist_members")
      .select("role")
      .eq("watchlist_id", watchlistId)
      .eq("user_id", user.id)
      .single()

    if (membershipError || !membership) {
      throw new Error("Access denied to this watchlist")
    }

    // Check if user can add items (owner or editor)
    if (!["owner", "editor"].includes(membership.role)) {
      throw new Error("Insufficient permissions to add items")
    }

    // Fetch media details from TMDB
    const mediaDetails = mediaType === "movie" ? await getMovieDetailsServer(tmdbId) : await getTVDetailsServer(tmdbId)

    // Fallback data if TMDB API is not available
    const fallbackData = {
      title: mediaType === "movie" ? "Unknown Movie" : undefined,
      name: mediaType === "tv" ? "Unknown TV Show" : undefined,
      overview: "No description available",
      poster_path: null,
      release_date: mediaType === "movie" ? "2024-01-01" : undefined,
      first_air_date: mediaType === "tv" ? "2024-01-01" : undefined,
      runtime: mediaType === "movie" ? 120 : undefined,
      number_of_episodes: mediaType === "tv" ? 10 : undefined,
      episode_run_time: mediaType === "tv" ? [45] : undefined,
    }

    const finalMediaDetails = mediaDetails || fallbackData

    // Calculate estimated watch time
    let estimatedWatchTime = 0
    if (mediaType === "movie") {
      estimatedWatchTime = finalMediaDetails.runtime || 120
    } else {
      estimatedWatchTime = calculateWatchTime(
        "tv",
        undefined,
        finalMediaDetails.episode_run_time,
        finalMediaDetails.number_of_episodes,
      )
    }

    // Check if item already exists in watchlist
    const { data: existingItem } = await supabase
      .from("watchlist_items")
      .select("id")
      .eq("watchlist_id", watchlistId)
      .eq("tmdb_id", tmdbId)
      .eq("media_type", mediaType)
      .single()

    if (existingItem) {
      throw new Error("This item is already in the watchlist")
    }

    // Add item to watchlist
    const { data: newItem, error: insertError } = await supabase
      .from("watchlist_items")
      .insert({
        watchlist_id: watchlistId,
        tmdb_id: tmdbId,
        media_type: mediaType,
        title: mediaType === "movie" ? finalMediaDetails.title : finalMediaDetails.name,
        overview: finalMediaDetails.overview,
        poster_path: finalMediaDetails.poster_path,
        release_date: mediaType === "movie" ? finalMediaDetails.release_date : finalMediaDetails.first_air_date,
        estimated_watch_time: estimatedWatchTime,
        added_by: user.id,
        status: "to_watch",
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Revalidate the watchlist page
    revalidatePath(`/watchlist/${watchlistId}`)

    return { success: true, item: newItem }
  } catch (error: any) {
    console.error("Error adding media to watchlist:", error)
    return { success: false, error: error.message || "Failed to add item to watchlist" }
  }
}

export async function updateWatchlistItemStatus(itemId: string, status: "to_watch" | "watching" | "watched") {
  const supabase = await createClient()

  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error("Authentication required")
    }

    // Update the item status
    const { error: updateError } = await supabase
      .from("watchlist_items")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", itemId)

    if (updateError) {
      throw updateError
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error updating item status:", error)
    return { success: false, error: error.message || "Failed to update item status" }
  }
}
