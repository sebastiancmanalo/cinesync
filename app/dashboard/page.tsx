"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Play, Search, Clock, Users, Star, Calendar, MoreHorizontal, Filter, LogOut, Plus } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/hooks/use-auth"
import { useWatchlists } from "@/hooks/use-watchlists"
import { CreateWatchlistDialog } from "@/components/create-watchlist-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { user, signOut } = useAuth()
  const { watchlists, loading, error } = useWatchlists()

  const filteredWatchlists = watchlists.filter((watchlist) =>
    watchlist.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalItems = watchlists.reduce((total, list) => total + (list.items?.length || 0), 0)
  const totalWatchTime = watchlists.reduce((total, list) => total + (list.total_runtime || 0), 0)
  const watchedItems = watchlists.reduce(
    (total, list) => total + (list.items?.filter((item) => item.status === "watched").length || 0),
    0,
  )

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
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
                <Play className="w-8 h-8 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">WatchTogether</span>
              </Link>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search watchlists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <CreateWatchlistDialog />
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
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{watchlists.length}</p>
                        <p className="text-sm text-gray-600">Active Lists</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Clock className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{formatTime(totalWatchTime)}</p>
                        <p className="text-sm text-gray-600">Total Watch Time</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Star className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{totalItems - watchedItems}</p>
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
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {filteredWatchlists.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <p className="text-gray-500 mb-4">
                        {searchQuery
                          ? "No watchlists found matching your search."
                          : "You don't have any watchlists yet."}
                      </p>
                      {!searchQuery && (
                        <CreateWatchlistDialog>
                          <Button>Create Your First Watchlist</Button>
                        </CreateWatchlistDialog>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredWatchlists.map((list) => (
                      <Link key={list.id} href={`/watchlist/${list.id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900">{list.name}</h3>
                                  <Badge variant="secondary">{list.items?.length || 0} items</Badge>
                                </div>

                                <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {formatTime(list.total_runtime || 0)}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {list.member_count || 0} members
                                  </div>
                                  <span>Updated {new Date(list.updated_at).toLocaleDateString()}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {list.members?.slice(0, 4).map((member, index) => (
                                    <Avatar key={index} className="w-6 h-6">
                                      <AvatarImage src={member.profile?.avatar_url || "/placeholder.svg"} />
                                      <AvatarFallback className="text-xs">
                                        {member.profile?.full_name?.charAt(0) || "U"}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                  {(list.member_count || 0) > 4 && (
                                    <span className="text-xs text-gray-500">+{(list.member_count || 0) - 4} more</span>
                                  )}
                                </div>
                              </div>

                              <Button variant="ghost" size="icon" onClick={(e) => e.preventDefault()}>
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Welcome Message */}
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-900">
                    Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0]}!
                  </CardTitle>
                  <CardDescription className="text-purple-700">Ready for your next movie night?</CardDescription>
                </CardHeader>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CreateWatchlistDialog>
                    <Button className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New List
                    </Button>
                  </CreateWatchlistDialog>
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

              {/* Stats Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Items</span>
                    <span className="font-medium">{totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Watched</span>
                    <span className="font-medium">{watchedItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">To Watch</span>
                    <span className="font-medium">{totalItems - watchedItems}</span>
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
