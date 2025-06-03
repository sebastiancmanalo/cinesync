"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Trash2, LogOut, Download } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [showDeleteAll, setShowDeleteAll] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportData, setExportData] = useState<string | null>(null)

  const handleDeleteAccount = async () => {
    // Optionally: delete user from Supabase auth and all related data
    // For now, just sign out and redirect
    setShowDeleteAccount(false)
    await signOut()
    router.push("/login")
  }

  const handleDeleteAllWatchlists = async () => {
    setShowDeleteAll(false)
    // Delete all watchlists owned by the user
    await supabase.from("watchlists").delete().eq("owner_id", user?.id)
    router.refresh()
  }

  const handleExport = async () => {
    setExporting(true)
    // Export all watchlists and items for the user
    const { data: watchlists } = await supabase
      .from("watchlists")
      .select("*, watchlist_items(*)")
      .eq("owner_id", user?.id)
    setExportData(JSON.stringify(watchlists, null, 2))
    setExporting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="bg-white/95">
          <CardHeader>
            <CardTitle className="text-gray-900">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Button
                variant="destructive"
                className="w-full flex items-center gap-2"
                onClick={() => setShowDeleteAccount(true)}
              >
                <LogOut className="w-4 h-4" /> Delete Account
              </Button>
            </div>
            <div>
              <Button
                variant="destructive"
                className="w-full flex items-center gap-2"
                onClick={() => setShowDeleteAll(true)}
              >
                <Trash2 className="w-4 h-4" /> Delete All Watchlists
              </Button>
            </div>
            <div>
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={handleExport}
                disabled={exporting}
              >
                <Download className="w-4 h-4" /> Export My Watchlists
              </Button>
              {exportData && (
                <div className="mt-2">
                  <a
                    href={`data:application/json,${encodeURIComponent(exportData)}`}
                    download="watchlists.json"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Download watchlists.json
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount}>
        <DialogContent className="bg-white/95">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete your account? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteAccount(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete All Watchlists Dialog */}
      <Dialog open={showDeleteAll} onOpenChange={setShowDeleteAll}>
        <DialogContent className="bg-white/95">
          <DialogHeader>
            <DialogTitle>Delete All Watchlists</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete all your watchlists? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteAll(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAllWatchlists}>
              Delete All Watchlists
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 