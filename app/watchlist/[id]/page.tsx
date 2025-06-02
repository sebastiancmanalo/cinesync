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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MovieSearch } from "@/components/movie-search"
import { updateWatchlistItemStatus } from "@/app/actions/watchlist-actions"

// Mock data for a specific watchlist
const watchlistData = {
  id: 1,
  name: "Movie Night with Sarah",
  description: "Our weekly movie night selections",
  members: [
    { name: "You", avatar: "/placeholder-user.jpg", role: "owner" },
    { name: "Sarah", avatar: "/placeholder-user.jpg", role: "editor" },
  ],
  totalTime: "12h 45m",
  itemCount: 8,
  watchedCount: 3,
}

const watchlistItems = [
  {
    id: 1,
    title: "Dune: Part Two",
    year: 2024,
    runtime: "2h 46m",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 8.5,
    votes: { up: 2, down: 0 },
    status: "watched",
    addedBy: "You",
    streamingOn: ["HBO Max", "Apple TV"],
    description:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
  },
  {
    id: 2,
    title: "The Bear",
    year: 2024,
    runtime: "4h 30m",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 9.2,
    votes: { up: 2, down: 0 },
    status: "in-progress",
    progress: 60,
    addedBy: "Sarah",
    streamingOn: ["Hulu", "Disney+"],
    description:
      "Season 3 - Carmen 'Carmy' Berzatto, a young chef from the fine dining world, returns to Chicago to run his deceased brother's sandwich shop.",
  },
  {
    id: 3,
    title: "Oppenheimer",
    year: 2023,
    runtime: "3h 0m",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 8.8,
    votes: { up: 1, down: 1 },
    status: "to-watch",
    addedBy: "You",
    streamingOn: ["Amazon Prime", "Apple TV"],
    description:
      "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
  },
  {
    id: 4,
    title: "Everything Everywhere All at Once",
    year: 2022,
    runtime: "2h 19m",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 9.1,
    votes: { up: 2, down: 0 },
    status: "to-watch",
    addedBy: "Sarah",
    streamingOn: ["Netflix", "Hulu"],
    description:
      "An aging Chinese immigrant is swept up in an insane adventure, where she alone can save what's important to her by connecting with the lives she could have led in other universes.",
  },
]

export default function WatchlistPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const { user, signOut } = useAuth()

  const filteredItems = watchlistItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === "all" || item.status === filter
    return matchesSearch && matchesFilter
  })

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
                <MovieSearch watchlistId={watchlistData.id} />
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

        {/* Rest of the component remains the same */}
        <div className="container mx-auto px-4 py-8">
          {/* Watchlist Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{watchlistData.name}</h1>
                <p className="text-gray-600 mb-4">{watchlistData.description}</p>

                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {watchlistData.totalTime} total
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {watchlistData.members.length} members
                  </div>
                  <div>
                    {watchlistData.watchedCount} of {watchlistData.itemCount} watched
                  </div>
                </div>
              </div>

              <Button variant="outline">
                <MoreHorizontal className="w-4 h-4 mr-2" />
                Manage List
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-gray-600">
                  {Math.round((watchlistData.watchedCount / watchlistData.itemCount) * 100)}%
                </span>
              </div>
              <Progress value={(watchlistData.watchedCount / watchlistData.itemCount) * 100} className="h-2" />
            </div>

            {/* Members */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Members:</span>
              <div className="flex items-center gap-2">
                {watchlistData.members.map((member, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{member.name}</span>
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
                        src={item.poster || "/placeholder.svg"}
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
                            {item.title} ({item.year})
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {item.runtime}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              {item.rating}
                            </div>
                            <span>Added by {item.addedBy}</span>
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

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                      {/* Progress bar for in-progress items */}
                      {item.status === "in-progress" && item.progress && (
                        <div className="mb-3">
                          <Progress value={item.progress} className="h-1" />
                        </div>
                      )}

                      {/* Streaming platforms */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gray-500">Available on:</span>
                        {item.streamingOn.map((platform) => (
                          <Badge key={platform} variant="outline" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            {item.votes.up}
                          </Button>
                          <Button size="sm" variant="outline">
                            <ThumbsDown className="w-4 h-4 mr-1" />
                            {item.votes.down}
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.status === "to-watch" && (
                            <Button
                              size="sm"
                              onClick={async () => {
                                await updateWatchlistItemStatus(item.id, "watching")
                                // Refresh the page or update state
                              }}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Start Watching
                            </Button>
                          )}
                          {item.status === "in-progress" && (
                            <Button size="sm">
                              <Play className="w-4 h-4 mr-1" />
                              Continue
                            </Button>
                          )}
                          {item.status === "watched" && (
                            <Button size="sm" variant="outline">
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
              <p className="text-gray-500 mb-4">No items found matching your criteria.</p>
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
