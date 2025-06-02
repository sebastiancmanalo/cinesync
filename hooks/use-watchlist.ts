"use client"

import { useState, useEffect } from "react"
import { db, type Watchlist, type WatchlistItem } from "@/lib/database"
import { useAuth } from "@/hooks/use-auth"

export function useWatchlist(watchlistId: string) {
  const [watchlist, setWatchlist] = useState<Watchlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchWatchlist = async () => {
    if (!watchlistId) return

    try {
      setLoading(true)
      const data = await db.getWatchlist(watchlistId)
      setWatchlist(data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch watchlist")
      console.error("Error fetching watchlist:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWatchlist()
  }, [watchlistId])

  const addItem = async (item: {
    title: string
    year?: number
    runtime_minutes?: number
    poster_url?: string
    description?: string
    rating?: number
    type?: "movie" | "tv"
    streaming_platforms?: string[]
    external_id?: string
  }) => {
    try {
      const newItem = await db.addWatchlistItem({
        ...item,
        watchlist_id: watchlistId,
      })
      if (newItem && watchlist) {
        setWatchlist({
          ...watchlist,
          items: [...(watchlist.items || []), newItem],
        })
        return newItem
      }
      throw new Error("Failed to add item")
    } catch (err) {
      setError("Failed to add item")
      throw err
    }
  }

  const updateItem = async (itemId: string, updates: Partial<WatchlistItem>) => {
    try {
      const updatedItem = await db.updateWatchlistItem(itemId, updates)
      if (updatedItem && watchlist) {
        setWatchlist({
          ...watchlist,
          items: watchlist.items?.map((item) => (item.id === itemId ? updatedItem : item)) || [],
        })
        return updatedItem
      }
      throw new Error("Failed to update item")
    } catch (err) {
      setError("Failed to update item")
      throw err
    }
  }

  const deleteItem = async (itemId: string) => {
    try {
      const success = await db.deleteWatchlistItem(itemId)
      if (success && watchlist) {
        setWatchlist({
          ...watchlist,
          items: watchlist.items?.filter((item) => item.id !== itemId) || [],
        })
        return true
      }
      throw new Error("Failed to delete item")
    } catch (err) {
      setError("Failed to delete item")
      throw err
    }
  }

  const voteOnItem = async (itemId: string, voteType: "up" | "down") => {
    try {
      const success = await db.voteOnItem(itemId, voteType)
      if (success) {
        // Refresh the watchlist to get updated vote counts
        await fetchWatchlist()
        return true
      }
      throw new Error("Failed to vote")
    } catch (err) {
      setError("Failed to vote")
      throw err
    }
  }

  const removeVote = async (itemId: string) => {
    try {
      const success = await db.removeVote(itemId)
      if (success) {
        // Refresh the watchlist to get updated vote counts
        await fetchWatchlist()
        return true
      }
      throw new Error("Failed to remove vote")
    } catch (err) {
      setError("Failed to remove vote")
      throw err
    }
  }

  const refreshWatchlist = () => {
    fetchWatchlist()
  }

  return {
    watchlist,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    voteOnItem,
    removeVote,
    refreshWatchlist,
  }
}
