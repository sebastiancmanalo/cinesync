"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Film } from "lucide-react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/protected-route"

interface Invitation {
  id: string
  watchlist_id: string
  invited_by_user_id: string
  invited_user_email: string
  status: "pending" | "accepted" | "rejected"
  created_at: string
  watchlist: {
    name: string
    description: string | null
  }
  invited_by_user: {
    full_name: string | null
    email: string
    avatar_url: string | null
  }
}

export default function InvitationPage() {
  const params = useParams()
  const router = useRouter()
  const invitationId = params.id as string
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (invitationId) {
      fetchInvitation()
    }
  }, [invitationId])

  const fetchInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from("watchlist_invitations")
        .select(`
          *,
          watchlist:watchlists (
            name,
            description
          ),
          invited_by_user:users!watchlist_invitations_invited_by_user_id_fkey (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq("id", invitationId)
        .single()

      if (error) throw error

      if (!data) {
        setError("Invitation not found")
        return
      }

      // Check if invitation is for current user
      if (user && data.invited_user_email !== user.email) {
        setError("This invitation is not for you")
        return
      }

      setInvitation(data)
    } catch (error) {
      console.error("Error fetching invitation:", error)
      setError("Failed to load invitation")
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async () => {
    if (!user || !invitation) return

    try {
      // Start a transaction
      const { error: updateError } = await supabase
        .from("watchlist_invitations")
        .update({ status: "accepted" })
        .eq("id", invitationId)

      if (updateError) throw updateError

      // Add user to watchlist members
      const { error: memberError } = await supabase
        .from("watchlist_members")
        .insert({
          watchlist_id: invitation.watchlist_id,
          user_id: user.id,
          role: "viewer" // Default role for invited members
        })

      if (memberError) throw memberError

      // Redirect to the watchlist
      router.push(`/watchlist/${invitation.watchlist_id}`)
    } catch (error) {
      console.error("Error accepting invitation:", error)
      setError("Failed to accept invitation")
    }
  }

  const handleRejectInvitation = async () => {
    if (!user || !invitation) return

    try {
      const { error } = await supabase
        .from("watchlist_invitations")
        .update({ status: "rejected" })
        .eq("id", invitationId)

      if (error) throw error

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error rejecting invitation:", error)
      setError("Failed to reject invitation")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invitation Not Found</h1>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <Film className="w-8 h-8 text-yellow-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
                  WatchTogether
                </span>
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto bg-white/95">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent mb-2">
                  Watchlist Invitation
                </h1>
                <p className="text-gray-600">
                  You've been invited to join a watchlist
                </p>
              </div>

              <div className="space-y-6">
                {/* Watchlist Info */}
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {invitation.watchlist.name}
                  </h2>
                  {invitation.watchlist.description && (
                    <p className="text-gray-600">{invitation.watchlist.description}</p>
                  )}
                </div>

                {/* Inviter Info */}
                <div className="flex items-center justify-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={invitation.invited_by_user.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      {invitation.invited_by_user.full_name?.charAt(0) || invitation.invited_by_user.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Invited by{" "}
                      <span className="font-medium text-gray-900">
                        {invitation.invited_by_user.full_name || invitation.invited_by_user.email}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(invitation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={handleRejectInvitation}
                    className="bg-white/95 text-gray-900"
                  >
                    Decline
                  </Button>
                  <Button
                    onClick={handleAcceptInvitation}
                    className="bg-gradient-to-r from-pink-500 to-yellow-400 hover:from-pink-600 hover:to-yellow-500 text-black"
                  >
                    Accept Invitation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
} 