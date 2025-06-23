"use client"

import { useEffect, useState, ChangeEvent, FormEvent } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Film, LogOut, Trash2, User, Mail, Camera, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/protected-route"
import { useRouter } from "next/navigation"

interface Watchlist {
  id: string;
  name: string;
  description: string | null;
}

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
  const [ownedWatchlists, setOwnedWatchlists] = useState<Watchlist[]>([])
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
      setOwnedWatchlists(ownedWatchlists.filter((w: Watchlist) => w.id !== watchlistId))
    }
    setDeletingId(null)
  }

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (!user) throw new Error("User not found")
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          avatar_url: formData.avatar_url,
        },
      })
      if (authError) throw authError

      // Also update the profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          avatar_url: formData.avatar_url,
        })
        .eq("id", user.id)

      if (profileError) throw profileError

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
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="bg-gradient-to-b from-black/80 to-transparent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2">
                  <Film className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  <span className="text-2xl sm:text-4xl font-logo tracking-wider">
                    CineSync
                  </span>
                </Link>
              </div>
              <Button 
                asChild 
                variant="ghost" 
                className="hover:bg-primary/20 hover:text-primary"
              >
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-background/50 backdrop-blur-sm border border-border/20 shadow-lg">
              <CardHeader className="pb-6">
                <CardTitle className="text-3xl sm:text-4xl font-heading text-primary">Settings</CardTitle>
                <CardDescription className="text-lg font-sans text-muted-foreground">
                  Manage your account settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  {/* Profile Section */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-heading text-primary flex items-center gap-3">
                      <User className="w-6 h-6" />
                      Profile
                    </h3>
                    
                    <div className="flex items-center gap-6">
                      <Avatar className="w-24 h-24 border-2 border-primary/20">
                        <AvatarImage src={formData.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl font-heading">
                          {formData.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Label htmlFor="avatar_url" className="text-sm font-sans text-muted-foreground mb-2 block">
                          <Camera className="w-4 h-4 inline mr-2" />
                          Avatar URL
                        </Label>
                        <Input
                          id="avatar_url"
                          value={formData.avatar_url}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, avatar_url: e.target.value })}
                          placeholder="Enter avatar URL"
                          className="bg-background/50 border-border/20 text-foreground placeholder:text-muted-foreground/50"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="full_name" className="text-sm font-sans text-muted-foreground mb-2 block">
                        <User className="w-4 h-4 inline mr-2" />
                        Full Name
                      </Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Enter your full name"
                        className="bg-background/50 border-border/20 text-foreground placeholder:text-muted-foreground/50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-sans text-muted-foreground mb-2 block">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-muted/20 border-border/20 text-muted-foreground"
                      />
                    </div>
                  </div>

                  {/* Owned Watchlists Section */}
                  <div className="mt-12">
                    <h3 className="text-2xl font-heading text-primary mb-4 flex items-center gap-3">
                      <Film className="w-6 h-6" />
                      Your Watchlists
                    </h3>
                    {ownedWatchlists.length === 0 ? (
                      <div className="text-center py-8 px-6 border-2 border-border/20 rounded-lg bg-background/30">
                        <Film className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-sans text-muted-foreground">You don't own any watchlists yet.</p>
                        <p className="text-sm text-muted-foreground/70 mt-2">Create your first watchlist to get started!</p>
                      </div>
                    ) : (
                      <ul className="space-y-4">
                        {ownedWatchlists.map((w: Watchlist) => (
                          <li key={w.id} className="flex items-center justify-between bg-background/30 border border-border/20 rounded-lg p-4">
                            <div>
                              <div className="font-heading text-lg text-primary">{w.name}</div>
                              {w.description && <div className="text-sm font-sans text-muted-foreground mt-1">{w.description}</div>}
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={deletingId === w.id}
                              onClick={() => handleDeleteWatchlist(w.id)}
                              className="ml-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {deletingId === w.id ? "Deleting..." : "Delete"}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-sm font-sans text-red-400">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-sm font-sans text-green-400">{success}</p>
                    </div>
                  )}

                  <div className="flex justify-between pt-6">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => router.push("/dashboard")}
                      className="hover:bg-primary/20 hover:text-primary"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Dashboard
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading} 
                      className="bg-gradient-to-r from-pink-500 to-yellow-400 hover:from-pink-600 hover:to-yellow-500 text-black font-medium"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>

                {/* Sign Out Button */}
                <div className="mt-12 flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={signOut} 
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                  >
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