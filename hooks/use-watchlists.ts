"use client"

import { useState, useEffect } from "react"
import { db, type Watchlist } from "@/lib/database"
import { useAuth } from "@/hooks/use-auth"

export function useWatchlists() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchWatchlists = async () => {
    if (!user) {
      setWatchlists([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await db.getUserWatchlists(user.id)
      setWatchlists(data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch watchlists")
      console.error("Error fetching watchlists:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWatchlists()
  }, [user])

  const createWatchlist = async (watchlist: { name: string; description?: string }) => {
    try {
      const newWatchlist = await db.createWatchlist(watchlist)
      if (newWatchlist) {
        setWatchlists((prev) => [newWatchlist, ...prev])
        return newWatchlist
      }
      throw new Error("Failed to create watchlist")
    } catch (err) {
      setError("Failed to create watchlist")
      throw err
    }
  }

  const refreshWatchlists = () => {
    fetchWatchlists()
  }

  return {
    watchlists,
    loading,
    error,
    createWatchlist,
    refreshWatchlists,
  }
}
