"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, Clock, Users, Star, Calendar, MoreHorizontal, Filter, LogOut, Film, Trash2 } from "lucide-react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/protected-route"
import type { Watchlist, WatchlistItem, WatchlistMember } from "@/types/database"

interface WatchlistWithDetails extends Watchlist {
  watchlist_items: WatchlistItem[]
  watchlist_members: WatchlistMember[]
}

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [watchlists, setWatchlists] = useState<WatchlistWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const { user, signOut } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchWatchlists()
    }
  }, [user])

  const fetchWatchlists = async () => {
    try {
      const { data, error } = await supabase
        .from("watchlists")
        .select(`
          *,
          watchlist_members!inner(role),
          watchlist_items(*)
        `)
        .eq("watchlist_members.user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setWatchlists(data || [])
    } catch (error) {
      console.error("Error fetching watchlists:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalTime = (items: WatchlistItem[]) => {
    return items?.reduce((total, item) => total + (item.estimated_watch_time || 0), 0) || 0
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const filteredWatchlists = watchlists.filter(
    (list) =>
      list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDeleteWatchlist = async (watchlistId: string) => {
    try {
      const { error } = await supabase
        .from("watchlists")
        .delete()
        .eq("id", watchlistId)

      if (error) throw error

      // Update local state after successful deletion
      setWatchlists(watchlists.filter(list => list.id !== watchlistId))
    } catch (error) {
      console.error("Error deleting watchlist:", error)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-4 text-slate-400">Loading your watchlists...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Film className="w-8 h-8 text-yellow-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
                  WatchTogether
                </span>
              </Link>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search watchlists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 bg-white text-gray-900"
                  />
                </div>
                <Link href="/lists/new">
                  <Button className="bg-gradient-to-r from-pink-500 to-yellow-400 hover:from-pink-600 hover:to-yellow-500 text-black font-medium">
                    <Plus className="w-4 h-4 mr-2" />
                    New List
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer">
                      <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-white/80">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{watchlists.length}</p>
                        <p className="text-sm text-gray-600">Active Lists</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <Users className="w-6 h-6 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatTime(
                            watchlists.reduce(
                              (total, list) => total + calculateTotalTime(list.watchlist_items || []),
                              0,
                            ),
                          )}
                        </p>
                        <p className="text-sm text-gray-600">Total Watch Time</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <Star className="w-6 h-6 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {watchlists.reduce((total, list) => total + (list.watchlist_items?.length || 0), 0)}
                        </p>
                        <p className="text-sm text-gray-600">Items to Watch</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Watchlists */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Your Watchlists</h2>
                </div>

                {filteredWatchlists.length === 0 ? (
                  <Card className="bg-white/80 p-12 text-center">
                    <Film className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {searchQuery ? "No watchlists found" : "No watchlists yet"}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchQuery
                        ? "Try adjusting your search terms"
                        : "Create your first watchlist to start tracking movies and shows with friends"}
                    </p>
                    {!searchQuery && (
                      <Link href="/lists/new">
                        <Button className="bg-gradient-to-r from-pink-500 to-yellow-400 hover:from-pink-600 hover:to-yellow-500 text-black font-medium">
                          <Plus className="h-5 w-5 mr-2" />
                          Create Your First List
                        </Button>
                      </Link>
                    )}
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredWatchlists.map((list) => {
                      const totalItems = list.watchlist_items?.length || 0
                      const totalTime = calculateTotalTime(list.watchlist_items || [])
                      const watchedItems = list.watchlist_items?.filter((item) => item.status === "watched").length || 0

                      return (
                        <Card key={list.id} className="hover:shadow-md transition-shadow cursor-pointer bg-white/80">
                          <Link href={`/watchlist/${list.id}`}>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{list.name}</h3>
                                    <Badge variant="secondary" className="text-yellow-700 bg-yellow-50 border border-yellow-200">{totalItems} items</Badge>
                                    {list.is_public && <Badge variant="outline" className="text-pink-600 border-pink-200 bg-pink-50">Public</Badge>}
                                  </div>

                                  {list.description && <p className="text-sm text-gray-600 mb-3">{list.description}</p>}

                                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {formatTime(totalTime)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Users className="w-4 h-4" />
                                      {list.watchlist_members?.length || 0} members
                                    </div>
                                    <span>
                                      {watchedItems}/{totalItems} watched
                                    </span>
                                  </div>

                                  {totalItems > 0 && (
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-gradient-to-r from-pink-500 to-yellow-400 h-2 rounded-full transition-all"
                                        style={{ width: `${(watchedItems / totalItems) * 100}%` }}
                                      />
                                    </div>
                                  )}
                                </div>

                                <Button variant="ghost" size="icon" className="relative">
                                  <MoreHorizontal className="w-4 h-4" />
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="absolute inset-0" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                        onClick={(e) => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          if (confirm("Are you sure you want to delete this watchlist?")) {
                                            handleDeleteWatchlist(list.id)
                                          }
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Watchlist
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </Button>
                              </div>
                            </CardContent>
                          </Link>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Welcome Message */}
              <Card className="bg-white/80">
                <CardHeader>
                  <CardTitle className="text-yellow-700">
                    Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0]}!
                  </CardTitle>
                  <CardDescription className="text-pink-600">Ready for your next movie night?</CardDescription>
                </CardHeader>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/80">
                <CardHeader>
                  <CardTitle className="text-gray-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/lists/new">
                    <Button className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New List
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="w-4 h-4 mr-2" />
                    Browse Movies
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Watch Time
                  </Button>
                </CardContent>
              </Card>

              {/* Time Suggestion */}
              <Card className="bg-white/80">
                <CardHeader>
                  <CardTitle className="text-gray-900">Tonight's Suggestion</CardTitle>
                  <CardDescription className="text-gray-600">Based on your 2 hour window</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="font-medium text-gray-900">Ready to discover something new?</div>
                    <p className="text-sm text-gray-600">
                      Add some movies to your watchlists to get personalized recommendations!
                    </p>
                    <Link href="/lists/new">
                      <Button size="sm" className="w-full bg-gradient-to-r from-yellow-400 to-pink-500 hover:from-yellow-500 hover:to-pink-600 text-white">
                        Create Your First List
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
