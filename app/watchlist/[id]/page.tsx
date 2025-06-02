"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  Play,
  Search,
  Clock,
  Users,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Calendar,
  CheckCircle,
  Circle,
  ArrowLeft,
  LogOut,
  MessageCircle,
  Send,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ProtectedRoute } from "@/components/protected-route"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MovieSearch } from "@/components/movie-search"
import { updateWatchlistItemStatus } from "@/app/actions/watchlist-actions"
import type { Watchlist, WatchlistItem, WatchlistMember, User, Vote, Comment } from "@/types/database"

interface WatchlistWithDetails extends Watchlist {
  watchlist_items: (WatchlistItem & {
    votes: Vote[]
    comments: Comment[]
    added_by_user: User
  })[]
  watchlist_members: (WatchlistMember & {
    user: User
  })[]
}

export default function WatchlistPage() {
  const params = useParams()
  const watchlistId = params.id as string
  const [watchlist, setWatchlist] = useState<WatchlistWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({})
  const { user, signOut } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (watchlistId && user) {
      fetchWatchlist()
    }
  }, [watchlistId, user])

  const fetchWatchlist = async () => {
    try {
      const { data, error } = await supabase
        .from("watchlists")
        .select(`
          *,
          watchlist_items (
            *,
            votes (*),
            comments (*),
            added_by_user:users!watchlist_items_added_by_fkey (*)
          ),
          watchlist_members (
            *,
            user:users (*)
          )
        `)
        .eq("id", watchlistId)
        .single()

      if (error) throw error
      setWatchlist(data)
    } catch (error) {
      console.error("Error fetching watchlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (itemId: string, voteType: "up" | "down") => {
    try {
      // Check if user already voted
      const existingVote = watchlist?.watchlist_items
        .find((item) => item.id === itemId)
        ?.votes.find((vote) => vote.user_id === user?.id)

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
          user_id: user?.id,
          vote_type: voteType,
        })
      }

      // Refresh data
      fetchWatchlist()
    } catch (error) {
      console.error("Error voting:", error)
    }
  }

  const handleAddComment = async (itemId: string) => {
    const comment = newComment[itemId]?.trim()
    if (!comment) return

    try {
      await supabase.from("comments").insert({
        watchlist_item_id: itemId,
        user_id: user?.id,
        content: comment,
      })

      setNewComment((prev) => ({ ...prev, [itemId]: "" }))
      fetchWatchlist()
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getVoteCounts = (votes: Vote[]) => {
    const upVotes = votes.filter((v) => v.vote_type === "up").length
    const downVotes = votes.filter((v) => v.vote_type === "down").length
    return { upVotes, downVotes }
  }

  const getUserVote = (votes: Vote[]) => {
    return votes.find((v) => v.user_id === user?.id)?.vote_type
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-4 text-slate-400">Loading watchlist...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!watchlist) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Watchlist not found</h1>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const filteredItems = watchlist.watchlist_items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === "all" || item.status === filter
    return matchesSearch && matchesFilter
  })

  const totalItems = watchlist.watchlist_items.length
  const watchedItems = watchlist.watchlist_items.filter((item) => item.status === "watched").length
  const totalTime = watchlist.watchlist_items.reduce((total, item) => total + item.estimated_watch_time, 0)

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
                <MovieSearch watchlistId={watchlistId} />
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
          {/* Watchlist Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{watchlist.name}</h1>
                {watchlist.description && <p className="text-gray-600 mb-4">{watchlist.description}</p>}

                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(totalTime)} total
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {watchlist.watchlist_members.length} members
                  </div>
                  <div>
                    {watchedItems} of {totalItems} watched
                  </div>
                </div>
              </div>

              <Button variant="outline">
                <MoreHorizontal className="w-4 h-4 mr-2" />
                Manage List
              </Button>
            </div>

            {/* Progress Bar */}
            {totalItems > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-600">{Math.round((watchedItems / totalItems) * 100)}%</span>
                </div>
                <Progress value={(watchedItems / totalItems) * 100} className="h-2" />
              </div>
            )}

            {/* Members */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Members:</span>
              <div className="flex items-center gap-2">
                {watchlist.watchlist_members.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={member.user.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {member.user.full_name?.charAt(0) || member.user.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{member.user.full_name || member.user.email}</span>
                    <Badge variant="secondary" className="text-xs">
                      {member.role}
                    </Badge>
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
              {["all", "to_watch", "watching", "watched"].map((filterOption) => (
                <Button
                  key={filterOption}
                  variant={filter === filterOption ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(filterOption)}
                >
                  {filterOption.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </Button>
              ))}
            </div>
          </div>

          {/* Watchlist Items */}
          <div className="space-y-6">
            {filteredItems.map((item) => {
              const { upVotes, downVotes } = getVoteCounts(item.votes)
              const userVote = getUserVote(item.votes)

              return (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Poster */}
                      <div className="flex-shrink-0">
                        <Image
                          src={
                            item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : "/placeholder.svg"
                          }
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
                              {item.title} ({item.release_date ? new Date(item.release_date).getFullYear() : "N/A"})
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatTime(item.estimated_watch_time)}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {item.media_type === "movie" ? "Movie" : "TV Show"}
                              </Badge>
                              <span>Added by {item.added_by_user?.full_name || item.added_by_user?.email}</span>
                            </div>
                          </div>

                          {/* Status Icon */}
                          <div className="flex items-center gap-2">
                            {item.status === "watched" && <CheckCircle className="w-5 h-5 text-green-500" />}
                            {item.status === "watching" && <Circle className="w-5 h-5 text-blue-500" />}
                            {item.status === "to_watch" && <Circle className="w-5 h-5 text-gray-400" />}
                          </div>
                        </div>

                        {item.overview && <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.overview}</p>}

                        {/* Voting */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant={userVote === "up" ? "default" : "outline"}
                              onClick={() => handleVote(item.id, "up")}
                            >
                              <ThumbsUp className="w-4 h-4 mr-1" />
                              {upVotes}
                            </Button>
                            <Button
                              size="sm"
                              variant={userVote === "down" ? "default" : "outline"}
                              onClick={() => handleVote(item.id, "down")}
                            >
                              <ThumbsDown className="w-4 h-4 mr-1" />
                              {downVotes}
                            </Button>
                          </div>

                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-500">{item.comments.length} comments</span>
                          </div>
                        </div>

                        {/* Comments */}
                        {item.comments.length > 0 && (
                          <div className="mb-4 space-y-2">
                            {item.comments.slice(0, 2).map((comment) => (
                              <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium">User</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{comment.content}</p>
                              </div>
                            ))}
                            {item.comments.length > 2 && (
                              <p className="text-sm text-gray-500">+{item.comments.length - 2} more comments</p>
                            )}
                          </div>
                        )}

                        {/* Add Comment */}
                        <div className="flex gap-2 mb-4">
                          <Textarea
                            placeholder="Add a comment..."
                            value={newComment[item.id] || ""}
                            onChange={(e) => setNewComment((prev) => ({ ...prev, [item.id]: e.target.value }))}
                            className="flex-1 min-h-[60px]"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddComment(item.id)}
                            disabled={!newComment[item.id]?.trim()}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {item.status === "to_watch" && (
                              <Button
                                size="sm"
                                onClick={async () => {
                                  await updateWatchlistItemStatus(item.id, "watching")
                                  fetchWatchlist()
                                }}
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Start Watching
                              </Button>
                            )}
                            {item.status === "watching" && (
                              <Button
                                size="sm"
                                onClick={async () => {
                                  await updateWatchlistItemStatus(item.id, "watched")
                                  fetchWatchlist()
                                }}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Mark as Watched
                              </Button>
                            )}
                            {item.status === "watched" && (
                              <Button size="sm" variant="outline">
                                <Calendar className="w-4 h-4 mr-1" />
                                Rewatch
                              </Button>
                            )}
                          </div>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No items found matching your criteria.</p>
              <MovieSearch watchlistId={watchlistId} />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
