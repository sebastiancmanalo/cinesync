"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Film, LogOut, Trash2 } from "lucide-react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/protected-route"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: user?.user_metadata?.full_name || "",
    avatar_url: user?.user_metadata?.avatar_url || "",
  })
  const [ownedWatchlists, setOwnedWatchlists] = useState<any[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchOwnedWatchlists = async () => {
      if (!user?.id) return
      const { data, error } = await supabase
        .from("watchlists")
        .select("id, name, description")
        .eq("owner_id", user.id)
      if (!error) setOwnedWatchlists(data || [])
    }
    fetchOwnedWatchlists()
  }, [user?.id])

  const handleDeleteWatchlist = async (watchlistId: string) => {
    if (!confirm("Are you sure you want to delete this watchlist? This action cannot be undone.")) return
    setDeletingId(watchlistId)
    const { error } = await supabase.from("watchlists").delete().eq("id", watchlistId)
    if (!error) {
      setOwnedWatchlists(ownedWatchlists.filter(w => w.id !== watchlistId))
    }
    setDeletingId(null)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          avatar_url: formData.avatar_url,
        },
      })

      if (error) throw error

      setSuccess("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2">
                  <Film className="w-8 h-8 text-yellow-400" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
                    WatchTogether
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/95 text-black">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold">Settings</CardTitle>
                <CardDescription>Manage your account settings and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Profile Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Profile</h3>
                    
                    <div className="flex items-center gap-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={formData.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>
                          {formData.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Label htmlFor="avatar_url">Avatar URL</Label>
                        <Input
                          id="avatar_url"
                          value={formData.avatar_url}
                          onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                          placeholder="Enter avatar URL"
                          className="bg-white text-black"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Enter your full name"
                        className="bg-white text-black"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  {/* Owned Watchlists Section */}
                  <div className="mt-10">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Your Watchlists</h3>
                    {ownedWatchlists.length === 0 ? (
                      <p className="text-gray-500">You don't own any watchlists yet.</p>
                    ) : (
                      <ul className="space-y-3">
                        {ownedWatchlists.map((w) => (
                          <li key={w.id} className="flex items-center justify-between bg-gray-50 rounded p-3">
                            <div>
                              <div className="font-semibold text-gray-900">{w.name}</div>
                              {w.description && <div className="text-sm text-gray-600">{w.description}</div>}
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={deletingId === w.id}
                              onClick={() => handleDeleteWatchlist(w.id)}
                              className="ml-4"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              {deletingId === w.id ? "Deleting..." : "Delete"}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-600">{success}</p>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard")}
                      className="bg-white/95 text-gray-900 hover:bg-gray-100"
                    >
                      Back to Dashboard
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-gradient-to-r from-pink-500 to-yellow-400 hover:from-pink-600 hover:to-yellow-500 text-black">
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>

                {/* Sign Out Button */}
                <div className="mt-10 flex justify-end">
                  <Button variant="outline" onClick={signOut} className="bg-white/95 text-gray-900 hover:bg-gray-100">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 