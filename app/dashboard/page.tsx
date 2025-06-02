"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Play, Plus, Search, Clock, Users, Star, Calendar, MoreHorizontal, Filter, LogOut } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/hooks/use-auth"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock data
const watchlists = [
  {
    id: 1,
    name: "Movie Night with Sarah",
    members: [
      { name: "You", avatar: "/placeholder-user.jpg" },
      { name: "Sarah", avatar: "/placeholder-user.jpg" },
    ],
    totalTime: "12h 45m",
    itemCount: 8,
    lastUpdated: "2 hours ago",
  },
  {
    id: 2,
    name: "Family Favorites",
    members: [
      { name: "You", avatar: "/placeholder-user.jpg" },
      { name: "Mom", avatar: "/placeholder-user.jpg" },
      { name: "Dad", avatar: "/placeholder-user.jpg" },
      { name: "Alex", avatar: "/placeholder-user.jpg" },
    ],
    totalTime: "24h 30m",
    itemCount: 15,
    lastUpdated: "1 day ago",
  },
  {
    id: 3,
    name: "Weekend Binge",
    members: [
      { name: "You", avatar: "/placeholder-user.jpg" },
      { name: "Mike", avatar: "/placeholder-user.jpg" },
      { name: "Jenny", avatar: "/placeholder-user.jpg" },
    ],
    totalTime: "8h 15m",
    itemCount: 5,
    lastUpdated: "3 days ago",
  },
]

const recentActivity = [
  { user: "Sarah", action: "added", item: "The Bear (Season 3)", time: "2 hours ago" },
  { user: "You", action: "marked as watched", item: "Dune: Part Two", time: "1 day ago" },
  { user: "Mike", action: "voted up", item: "Succession", time: "2 days ago" },
  { user: "Mom", action: "added", item: "The Crown", time: "3 days ago" },
]

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { user, signOut } = useAuth()

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
                    placeholder="Search watchlists or movies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New List
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

        {/* Rest of the dashboard content remains the same */}
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
                        <p className="text-2xl font-bold">3</p>
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
                        <p className="text-2xl font-bold">45h 30m</p>
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
                        <p className="text-2xl font-bold">28</p>
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

                <div className="space-y-4">
                  {watchlists.map((list) => (
                    <Card key={list.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{list.name}</h3>
                              <Badge variant="secondary">{list.itemCount} items</Badge>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {list.totalTime}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {list.members.length} members
                              </div>
                              <span>Updated {list.lastUpdated}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {list.members.slice(0, 4).map((member, index) => (
                                <Avatar key={index} className="w-6 h-6">
                                  <AvatarImage src={member.avatar || "/placeholder.svg"} />
                                  <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              ))}
                              {list.members.length > 4 && (
                                <span className="text-xs text-gray-500">+{list.members.length - 4} more</span>
                              )}
                            </div>
                          </div>

                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                  <Button className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New List
                  </Button>
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

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>What's happening in your lists</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">{activity.user.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-medium">{activity.user}</span> {activity.action}{" "}
                            <span className="font-medium">{activity.item}</span>
                          </p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Time Suggestion */}
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-900">Tonight's Suggestion</CardTitle>
                  <CardDescription className="text-purple-700">Based on your 2 hour window</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="font-medium text-purple-900">The Menu (1h 47m)</div>
                    <p className="text-sm text-purple-700">
                      Perfect for your available time slot. Highly rated by your group!
                    </p>
                    <Button size="sm" className="w-full">
                      Start Watching
                    </Button>
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
