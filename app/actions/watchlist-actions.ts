"use server"

import { createClient } from "@/lib/supabase/server"
import { getMovieDetailsServer, getTVDetailsServer } from "@/lib/tmdb-server"
import { calculateWatchTime } from "@/lib/tmdb"
import { revalidatePath } from "next/cache"

export async function createWatchlist(formData: {
  name: string
  description?: string
  isPublic: boolean
}) {
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

    // Create the watchlist
    const { data: watchlist, error: watchlistError } = await supabase
      .from("watchlists")
      .insert({
        name: formData.name,
        description: formData.description || null,
        is_public: formData.isPublic,
        owner_id: user.id,
      })
      .select("id")
      .single()

    if (watchlistError) {
      console.error("Watchlist creation error:", watchlistError)
      throw new Error(`Failed to create watchlist: ${watchlistError.message}`)
    }

    // Add the creator as a member with owner role
    const { error: memberError } = await supabase.from("watchlist_members").insert({
      watchlist_id: watchlist.id,
      user_id: user.id,
      role: "owner",
    })

    if (memberError) {
      console.error("Member creation error:", memberError)
      // Try to clean up the watchlist if member creation fails
      await supabase.from("watchlists").delete().eq("id", watchlist.id)
      throw new Error(`Failed to set up watchlist membership: ${memberError.message}`)
    }

    // Revalidate relevant pages
    revalidatePath("/dashboard")
    revalidatePath(`/watchlist/${watchlist.id}`)

    return { success: true, watchlistId: watchlist.id }
  } catch (error: any) {
    console.error("Error creating watchlist:", error)
    return { success: false, error: error.message || "Failed to create watchlist" }
  }
}

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
    revalidatePath("/dashboard")

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

export async function addVote(itemId: string, voteType: "up" | "down") {
  const supabase = await createClient()

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error("Authentication required")
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from("votes")
      .select("id, vote_type")
      .eq("watchlist_item_id", itemId)
      .eq("user_id", user.id)
      .single()

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote if clicking same type
        await supabase.from("votes").delete().eq("id", existingVote.id)
      } else {
        // Update vote type
        await supabase.from("votes").update({ vote_type: voteType }).eq("id", existingVote.id)
      }
    } else {
      // Create new vote
      await supabase.from("votes").insert({
        watchlist_item_id: itemId,
        user_id: user.id,
        vote_type: voteType,
      })
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error voting:", error)
    return { success: false, error: error.message || "Failed to vote" }
  }
}

export async function addComment(itemId: string, content: string) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error("Authentication required")
    }

    const { error: insertError } = await supabase.from("comments").insert({
      watchlist_item_id: itemId,
      user_id: user.id,
      content: content.trim(),
    })

    if (insertError) {
      throw insertError
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error adding comment:", error)
    return { success: false, error: error.message || "Failed to add comment" }
  }
}

// Send a watchlist invitation
export async function sendWatchlistInvitation({
  watchlistId,
  invitedByUserId,
  invitedUserEmail,
}: {
  watchlistId: string;
  invitedByUserId: string;
  invitedUserEmail: string;
}) {
  const supabase = await createClient()

  try {
    // Check for existing invitation
    const { data: existing, error: existingError } = await supabase
      .from("watchlist_invitations")
      .select("*")
      .eq("watchlist_id", watchlistId)
      .eq("invited_user_email", invitedUserEmail)
      .eq("status", "pending")
      .maybeSingle();

    if (existing) {
      return { success: false, error: "Invitation already sent." };
    }

    // Create new invitation
    const { error } = await supabase.from("watchlist_invitations").insert([
      {
        watchlist_id: watchlistId,
        invited_by_user_id: invitedByUserId,
        invited_user_email: invitedUserEmail,
        status: "pending",
      },
    ]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error sending watchlist invitation:", error)
    return { success: false, error: error.message || "Failed to send watchlist invitation" }
  }
}

// Fetch pending invitations for a user
export async function fetchPendingInvitations(userId: string, userEmail: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("watchlist_invitations")
      .select("*, watchlist:watchlists(*), invited_by:users!invited_by_user_id(*)")
      .or(`invited_user_id.eq.${userId},invited_user_email.eq.${userEmail}`)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message, invitations: [] };
    }

    return { success: true, invitations: data };
  } catch (error: any) {
    console.error("Error fetching pending invitations:", error)
    return { success: false, error: error.message || "Failed to fetch pending invitations", invitations: [] }
  }
}
