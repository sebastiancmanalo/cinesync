"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Film, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/protected-route'

export default function NewWatchlistPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/watchlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || ''
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create watchlist')
      }

      const watchlist = await response.json()
      router.push(`/watchlist/${watchlist.id}`)
    } catch (error) {
      console.error('Error creating watchlist:', error)
      setError(error instanceof Error ? error.message : 'Failed to create watchlist')
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
                  <Film className="w-8 h-8 text-primary" />
                  <span className="text-4xl font-logo tracking-wider">
                    CineSync
                  </span>
                </Link>
              </div>
              <Button asChild variant="ghost" className="hover:bg-primary/20 hover:text-primary">
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-secondary/20 border-2 border-border/20">
              <CardHeader>
                <CardTitle className="text-3xl font-heading text-primary">Create New Watchlist</CardTitle>
                <CardDescription className="text-lg font-sans">
                  Start a new watchlist to organize your favorite movies and TV shows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-lg font-semibold">Watchlist Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter watchlist name"
                      required
                      className="bg-background border-2 border-border/20 focus:border-primary text-foreground text-lg py-3"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-lg font-semibold">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your watchlist..."
                      rows={4}
                      className="bg-background border-2 border-border/20 focus:border-primary text-foreground text-lg"
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/20 border-2 border-red-500/30 rounded-lg">
                      <p className="text-red-200 font-semibold">{error}</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/dashboard')}
                      className="bg-secondary/20 border-2 border-border/20 hover:bg-secondary/40 text-foreground font-semibold px-8 py-3"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading || !formData.name.trim()} 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-3 text-lg"
                    >
                      {loading ? 'Creating...' : 'Create Watchlist'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
