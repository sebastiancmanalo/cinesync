"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Play,
  Plus,
  Search,
  Clock,
  Users,
  Star,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Calendar,
  CheckCircle,
  Circle,
  ArrowLeft,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/hooks/use-auth"
import { useWatchlist } from "@/hooks/use-watchlist"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function WatchlistPage({ params }: { params: { id: string } }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const { user, signOut } = useAuth()
  const { watchlist, loading, error, updateItem, voteOnItem, removeVote } = useWatchlist(params.id)

  const filteredItems =
    watchlist?.items?.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = filter === "all" || item.status === filter
      return matchesSearch && matchesFilter
    }) || []

  const formatTime = (minutes: number | null) => {
    if (!minutes) return "Unknown"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const handleStatusChange = async (itemId: string, newStatus: "to-watch" | "in-progress" | "watched") => {
    try {
      await updateItem(itemId, { status: newStatus })
    } catch (error) {
      console.error("Failed to update item status:", error)
    }
  }

  const handleVote = async (itemId: string, voteType: "up" | "down") => {
    try {
      await voteOnItem(itemId, voteType)
    } catch (error) {
      console.error("Failed to vote:", error)
    }
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

  if (!watchlist) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Watchlist not found</h1>
            <p className="text-gray-600 mb-4">
              The watchlist you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const watchedCount = watchlist.items?.filter((item) => item.status === "watched").length || 0
  const totalCount = watchlist.items?.length || 0

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/" className="flex items-center gap-2">
                  <Play className="w-8 h-8 text-purple-600" />
                  <span className="text-2xl font-bold text-gray-900">WatchTogether</span>
                </Link>
              </div>

              <div className="flex items-center gap-4">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Movie/Show
                </Button>
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
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Watchlist Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{watchlist.name}</h1>
                {watchlist.description && <p className="text-gray-600 mb-4">{watchlist.description}</p>}

                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(watchlist.total_runtime || 0)} total
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {watchlist.member_count || 0} members
                  </div>
                  <div>
                    {watchedCount} of {totalCount} watched
                  </div>
                </div>
              </div>

              <Button variant="outline">
                <MoreHorizontal className="w-4 h-4 mr-2" />
                Manage List
              </Button>
            </div>

            {/* Progress Bar */}
            {totalCount > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-600">{Math.round((watchedCount / totalCount) * 100)}%</span>
                </div>
                <Progress value={(watchedCount / totalCount) * 100} className="h-2" />
              </div>
            )}

            {/* Members */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Members:</span>
              <div className="flex items-center gap-2">
                {watchlist.members?.map((member, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={member.profile?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">{member.profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{member.profile?.full_name || "Unknown"}</span>
                    {member.role === "owner" && (
                      <Badge variant="secondary" className="text-xs">
                        Owner
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search movies and shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              {["all", "to-watch", "in-progress", "watched"].map((filterOption) => (
                <Button
                  key={filterOption}
                  variant={filter === filterOption ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(filterOption)}
                >
                  {filterOption.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </Button>
              ))}
            </div>
          </div>

          {/* Watchlist Items */}
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Poster */}
                    <div className="flex-shrink-0">
                      <Image
                        src={item.poster_url || "/placeholder.svg?height=120&width=80"}
                        alt={item.title}
                        width={80}
                        height={120}
                        className="rounded-lg object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {item.title} {item.year && `(${item.year})`}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTime(item.runtime_minutes)}
                            </div>
                            {item.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500" />
                                {item.rating}
                              </div>
                            )}
                            <span>Added by {item.added_by_profile?.full_name || "Unknown"}</span>
                          </div>
                        </div>

                        {/* Status Icon */}
                        <div className="flex items-center gap-2">
                          {item.status === "watched" && <CheckCircle className="w-5 h-5 text-green-500" />}
                          {item.status === "in-progress" && (
                            <div className="flex items-center gap-2">
                              <Circle className="w-5 h-5 text-blue-500" />
                              <span className="text-sm text-blue-600">{item.progress}%</span>
                            </div>
                          )}
                          {item.status === "to-watch" && <Circle className="w-5 h-5 text-gray-400" />}
                        </div>
                      </div>

                      {item.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                      )}

                      {/* Progress bar for in-progress items */}
                      {item.status === "in-progress" && item.progress > 0 && (
                        <div className="mb-3">
                          <Progress value={item.progress} className="h-1" />
                        </div>
                      )}

                      {/* Streaming platforms */}
                      {item.streaming_platforms && item.streaming_platforms.length > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs text-gray-500">Available on:</span>
                          {item.streaming_platforms.map((platform) => (
                            <Badge key={platform} variant="outline" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleVote(item.id, "up")}>
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            {item.votes?.filter((v) => v.vote_type === "up").length || 0}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleVote(item.id, "down")}>
                            <ThumbsDown className="w-4 h-4 mr-1" />
                            {item.votes?.filter((v) => v.vote_type === "down").length || 0}
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.status === "to-watch" && (
                            <Button size="sm" onClick={() => handleStatusChange(item.id, "in-progress")}>
                              <Play className="w-4 h-4 mr-1" />
                              Start Watching
                            </Button>
                          )}
                          {item.status === "in-progress" && (
                            <Button size="sm" onClick={() => handleStatusChange(item.id, "watched")}>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Mark Watched
                            </Button>
                          )}
                          {item.status === "watched" && (
                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(item.id, "to-watch")}>
                              <Calendar className="w-4 h-4 mr-1" />
                              Rewatch
                            </Button>
                          )}
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {searchQuery || filter !== "all"
                  ? "No items found matching your criteria."
                  : "This watchlist is empty."}
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Movie or Show
              </Button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
