'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Film, CheckCircle, Circle, Trash2, Settings, Star, Users2, ListVideo, User, Calendar, Eye, MessageCircle, ChevronDown, ChevronUp, MoreVertical, Plus, X, Share2, Edit3, Copy } from 'lucide-react'
import Link from 'next/link'

interface Review {
  id: string
  user_id: string
  user_name: string
  rating: number
  comment: string
  created_at: string
}

interface WatchlistItem {
  id: number
  movie_id: number
  title: string
  overview: string
  poster_path?: string
  backdrop_path?: string
  vote_average: number
  added_at: string
  added_by: {
    id: string
    name: string
    email: string
  }
  watched: boolean
  watched_at: string | null
  watched_by: {
    id: string
    name: string
    email: string
  } | null
  reviews: Review[]
}

interface WatchlistMember {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  role: 'owner' | 'member'
}

interface Watchlist {
  id: string
  name: string
  description: string
  owner_id: string
  created_at: string
  items: WatchlistItem[]
  members: WatchlistMember[]
}

interface WatchlistContentProps {
  watchlistId: string
}

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onRemove: () => void
  onEdit?: () => void
  itemType: 'movie' | 'review'
  itemName: string
}

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/"

const ContextMenu = ({ x, y, onClose, onRemove, onEdit, itemType, itemName }: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg shadow-xl p-1 min-w-[160px] animate-in fade-in-0 zoom-in-95 duration-100"
      style={{
        left: Math.min(x, window.innerWidth - 180),
        top: Math.min(y, window.innerHeight - 80),
      }}
    >
      {onEdit && (
        <button
          onClick={onEdit}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-md transition-colors duration-150"
        >
          <Edit3 className="w-4 h-4" />
          Edit {itemType === 'movie' ? 'Movie' : 'Review'}
        </button>
      )}
      <button
        onClick={onRemove}
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors duration-150"
      >
        <Trash2 className="w-4 h-4" />
        Remove {itemType === 'movie' ? 'Movie' : 'Review'}
      </button>
    </div>
  )
}

export function WatchlistContent({ watchlistId }: WatchlistContentProps) {
  const router = useRouter()
  const [watchlist, setWatchlist] = useState<Watchlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set())
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    itemType: 'movie' | 'review'
    itemId: number | string
    itemName: string
  } | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  
  // Add movie state
  const [showAddMovie, setShowAddMovie] = useState(false)
  const [newMovieTitle, setNewMovieTitle] = useState('')
  const [addingMovie, setAddingMovie] = useState(false)
  
  // Add review state
  const [showAddReview, setShowAddReview] = useState<number | null>(null)
  const [newReviewRating, setNewReviewRating] = useState(5)
  const [newReviewComment, setNewReviewComment] = useState('')
  const [addingReview, setAddingReview] = useState(false)

  // Edit review state
  const [editingReview, setEditingReview] = useState<{
    itemId: number
    reviewId: string
    rating: number
    comment: string
  } | null>(null)

  // Sharing state
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareEmail, setShareEmail] = useState('')
  const [sharing, setSharing] = useState(false)
  const [shareLink, setShareLink] = useState('')

  useEffect(() => {
    let isMounted = true

    async function fetchWatchlist() {
      if (!watchlistId) {
        if (isMounted) {
          setError('Invalid watchlist ID')
          setLoading(false)
        }
        return
      }

      try {
        const response = await fetch(`/api/watchlists/${watchlistId}`)
        if (!isMounted) return // Don't update state if component unmounted
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Watchlist not found')
          } else {
            throw new Error(`Failed to fetch watchlist: ${response.status}`)
          }
        } else {
          const data = await response.json()
          setWatchlist(data)
        }
      } catch (err) {
        console.error('Error fetching watchlist:', err)
        if (isMounted) {
          setError('Failed to load watchlist')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchWatchlist()

    return () => {
      isMounted = false
    }
  }, [watchlistId])

  const handleToggleWatched = async (itemId: number) => {
    if (watchlist) {
      setWatchlist({
        ...watchlist,
        items: watchlist.items.map(item =>
          item.id === itemId ? { 
            ...item, 
            watched: !item.watched,
            watched_at: !item.watched ? new Date().toISOString() : null,
            watched_by: !item.watched ? { id: 'user-123', name: 'John Doe', email: 'john@example.com' } : null
          } : item
        )
      })
    }
  }

  const handleDeleteWatchlist = async () => {
    if (!confirm('Are you sure you want to delete this watchlist? This action cannot be undone.')) {
      return
    }
    
    if (isNavigating) {
      return // Prevent multiple navigation calls
    }
    
    try {
      setIsNavigating(true)
      // In a real app, this would call an API to delete the watchlist
      console.log('Deleting watchlist:', watchlistId)
      
      // Only navigate after successful deletion
      router.push('/dashboard')
    } catch (error) {
      console.error('Error deleting watchlist:', error)
      setIsNavigating(false) // Reset navigation state if deletion fails
    }
  }

  const toggleReviews = (itemId: number) => {
    const newExpanded = new Set(expandedReviews)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedReviews(newExpanded)
  }

  const handleContextMenu = (event: React.MouseEvent, itemType: 'movie' | 'review', itemId: number | string, itemName: string) => {
    event.preventDefault()
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      itemType,
      itemId,
      itemName
    })
  }

  const handleRemoveItem = () => {
    if (!contextMenu || !watchlist) return

    if (contextMenu.itemType === 'movie') {
      const itemId = contextMenu.itemId as number
      if (confirm(`Are you sure you want to remove "${contextMenu.itemName}" from this watchlist?`)) {
        setWatchlist({
          ...watchlist,
          items: watchlist.items.filter(item => item.id !== itemId)
        })
      }
    } else if (contextMenu.itemType === 'review') {
      const reviewId = contextMenu.itemId as string
      if (confirm(`Are you sure you want to remove this review?`)) {
        setWatchlist({
          ...watchlist,
          items: watchlist.items.map(item => ({
            ...item,
            reviews: item.reviews.filter(review => review.id !== reviewId)
          }))
        })
      }
    }
    setContextMenu(null)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const handleAddMovie = async () => {
    if (!newMovieTitle.trim() || !watchlist) return
    
    setAddingMovie(true)
    try {
      // Mock movie data - in real app, this would search TMDB API
      const mockMovie: WatchlistItem = {
        id: Date.now(), // Temporary ID
        movie_id: Math.floor(Math.random() * 1000000),
        title: newMovieTitle,
        overview: "A great movie that was just added to the watchlist.",
        poster_path: undefined,
        backdrop_path: undefined,
        vote_average: 7.5,
        added_at: new Date().toISOString(),
        added_by: {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com'
        },
        watched: false,
        watched_at: null,
        watched_by: null,
        reviews: []
      }
      
      setWatchlist({
        ...watchlist,
        items: [...watchlist.items, mockMovie]
      })
      
      setNewMovieTitle('')
      setShowAddMovie(false)
    } catch (error) {
      console.error('Error adding movie:', error)
    } finally {
      setAddingMovie(false)
    }
  }

  const handleAddReview = async (itemId: number) => {
    if (!newReviewComment.trim() || !watchlist) return
    
    setAddingReview(true)
    try {
      const mockReview: Review = {
        id: `review-${Date.now()}`,
        user_id: 'user-123',
        user_name: 'John Doe',
        rating: newReviewRating,
        comment: newReviewComment,
        created_at: new Date().toISOString()
      }
      
      setWatchlist({
        ...watchlist,
        items: watchlist.items.map(item =>
          item.id === itemId
            ? { ...item, reviews: [...item.reviews, mockReview] }
            : item
        )
      })
      
      setNewReviewRating(5)
      setNewReviewComment('')
      setShowAddReview(null)
    } catch (error) {
      console.error('Error adding review:', error)
    } finally {
      setAddingReview(false)
    }
  }

  const handleEditReview = (itemId: number, reviewId: string, currentRating: number, currentComment: string) => {
    setEditingReview({
      itemId,
      reviewId,
      rating: currentRating,
      comment: currentComment
    })
  }

  const handleSaveEditReview = async () => {
    if (!editingReview || !watchlist) return
    
    setAddingReview(true)
    try {
      setWatchlist({
        ...watchlist,
        items: watchlist.items.map(item =>
          item.id === editingReview.itemId
            ? {
                ...item,
                reviews: item.reviews.map(review =>
                  review.id === editingReview.reviewId
                    ? {
                        ...review,
                        rating: editingReview.rating,
                        comment: editingReview.comment
                      }
                    : review
                )
              }
            : item
        )
      })
      
      setEditingReview(null)
    } catch (error) {
      console.error('Error updating review:', error)
    } finally {
      setAddingReview(false)
    }
  }

  const handleShareWatchlist = async () => {
    if (!shareEmail.trim() || !watchlist) return
    
    setSharing(true)
    try {
      // Mock sharing - in real app, this would send an email invitation
      console.log(`Sharing watchlist "${watchlist.name}" with ${shareEmail}`)
      
      // Generate share link
      const link = `${window.location.origin}/watchlist/${watchlistId}`
      setShareLink(link)
      
      setShareEmail('')
      // Don't close modal immediately to show the link
    } catch (error) {
      console.error('Error sharing watchlist:', error)
    } finally {
      setSharing(false)
    }
  }

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading watchlist...</p>
        </div>
      </div>
    )
  }

  if (error || !watchlist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading text-foreground mb-4">Watchlist not found</h1>
          <p className="text-muted-foreground mb-4">{error || 'This watchlist does not exist or you do not have access to it.'}</p>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  const watchedItems = watchlist.items.filter(item => item.watched).length
  const totalItems = watchlist.items.length

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onRemove={handleRemoveItem}
          onEdit={contextMenu.itemType === 'review' ? () => {
            if (!watchlist) return
            const item = watchlist.items.find(i => i.id === Number(contextMenu.itemId))
            const review = item?.reviews.find(r => r.id === contextMenu.itemId)
            if (item && review) {
              handleEditReview(item.id, review.id, review.rating, review.comment)
            }
            setContextMenu(null)
          } : undefined}
          itemType={contextMenu.itemType}
          itemName={contextMenu.itemName}
        />
      )}

      {/* Header */}
      <header className="bg-gradient-to-b from-black/80 to-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary">
                <Link href="/dashboard">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <Link href="/" className="flex items-center gap-2">
                <Film className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                <span className="text-2xl sm:text-4xl font-logo tracking-wider">
                  CineSync
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowShareModal(true)}
                className="hover:bg-primary/20 hover:text-primary"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button asChild variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary">
                <Link href="/settings">
                  <Settings className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        {/* Watchlist Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-5xl font-heading text-primary mb-4">
                {watchlist.name}
              </h1>
              {watchlist.description && (
                <p className="text-lg sm:text-xl font-sans text-muted-foreground mb-6">{watchlist.description}</p>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-base sm:text-lg font-sans">
                <div className="flex items-center gap-2 text-primary">
                  <ListVideo className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{watchedItems} of {totalItems} watched</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{watchlist.members.length} members</span>
                </div>
                <div className="text-muted-foreground">
                  Created {new Date(watchlist.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Button
                onClick={() => setShowAddMovie(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Movie
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteWatchlist}
                className="bg-red-500/20 border-red-500/30 text-red-200 hover:bg-red-500/30 hover:text-red-100"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete List
              </Button>
            </div>
          </div>

          {/* Share Modal */}
          {showShareModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-background border-2 border-border/20 rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-heading text-primary">Share Watchlist</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowShareModal(false)
                      setShareLink('')
                    }}
                    className="hover:bg-secondary/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                {!shareLink ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        placeholder="Enter email address..."
                        className="bg-secondary/20 border-border/20"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleShareWatchlist()
                          }
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleShareWatchlist}
                        disabled={!shareEmail.trim() || sharing}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        {sharing ? 'Sharing...' : 'Send Invitation'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowShareModal(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-secondary/20 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-2">Share this link:</p>
                      <div className="flex items-center gap-2">
                        <Input
                          value={shareLink}
                          readOnly
                          className="bg-background/50 border-border/20 text-sm"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={copyShareLink}
                          className="hover:bg-secondary/40"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setShowShareModal(false)
                        setShareLink('')
                      }}
                      className="w-full"
                    >
                      Done
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add Movie Modal */}
          {showAddMovie && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-background border-2 border-border/20 rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-heading text-primary">Add Movie</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowAddMovie(false)}
                    className="hover:bg-secondary/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Movie Title
                    </label>
                    <Input
                      value={newMovieTitle}
                      onChange={(e) => setNewMovieTitle(e.target.value)}
                      placeholder="Enter movie title..."
                      className="bg-secondary/20 border-border/20"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddMovie()
                        }
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddMovie}
                      disabled={!newMovieTitle.trim() || addingMovie}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {addingMovie ? 'Adding...' : 'Add Movie'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddMovie(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Members Section */}
          <div className="bg-secondary/20 border-2 border-border/20 rounded-lg p-4 sm:p-6 mb-8">
            <h3 className="text-lg sm:text-xl font-heading text-primary mb-4">Shared with</h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {watchlist.members.map((member) => (
                <div key={member.id} className="flex items-center gap-2 bg-background/50 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-border/20">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <span className="font-sans text-xs sm:text-sm">
                    {member.full_name}
                    {member.role === 'owner' && (
                      <Badge variant="outline" className="ml-1 sm:ml-2 text-xs border-primary/30 text-primary">
                        Owner
                      </Badge>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Watchlist Items */}
        <div className="space-y-6 sm:space-y-8">
          {watchlist.items.length > 0 ? (
            watchlist.items.map((item) => (
              <Card 
                key={item.id} 
                className="bg-secondary/20 border-2 border-border/20 hover:border-primary/30 transition-all duration-300 group"
                onContextMenu={(e) => handleContextMenu(e, 'movie', item.id, item.title)}
              >
                <CardContent className="p-4 sm:p-8">
                  <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
                    {/* Poster */}
                    <div className="flex-shrink-0 flex justify-center lg:justify-start relative">
                      <img
                        src={
                          item.poster_path 
                            ? `${TMDB_IMAGE_BASE_URL}w300${item.poster_path}` 
                            : '/placeholder.svg'
                        }
                        alt={item.title}
                        className="w-24 h-36 sm:w-32 sm:h-48 object-cover rounded-lg shadow-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder.svg'
                        }}
                      />
                      {/* Mobile context menu trigger */}
                      <button
                        className="lg:hidden absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          const rect = e.currentTarget.getBoundingClientRect()
                          handleContextMenu(e as any, 'movie', item.id, item.title)
                        }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl sm:text-2xl font-heading text-primary mb-2">
                            {item.title}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-base sm:text-lg font-sans mb-4">
                            <div className="flex items-center gap-1 text-yellow-400">
                              <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="font-bold">{item.vote_average.toFixed(1)}</span>
                            </div>
                            <Badge variant="outline" className="text-foreground border-border/20 w-fit">
                              Movie
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleWatched(item.id)}
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${
                            item.watched 
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                              : 'bg-secondary/20 text-muted-foreground hover:bg-secondary/40'
                          }`}
                        >
                          {item.watched ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" /> : <Circle className="w-5 h-5 sm:w-6 sm:h-6" />}
                        </Button>
                      </div>
                      
                      <p className="text-muted-foreground font-sans leading-relaxed mb-6 text-sm sm:text-base">
                        {item.overview}
                      </p>
                      
                      {/* Movie Details */}
                      <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm font-sans mb-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Added by <span className="text-foreground font-semibold">{item.added_by.name}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Added {new Date(item.added_at).toLocaleDateString()}</span>
                        </div>
                        {item.watched && item.watched_at && item.watched_by && (
                          <>
                            <div className="flex items-center gap-2 text-green-400">
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>Watched by <span className="font-semibold">{item.watched_by.name}</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-green-400">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>Watched {new Date(item.watched_at).toLocaleDateString()}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Reviews Section */}
                      <div className="border-t border-border/20 pt-4 sm:pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <Button
                            variant="ghost"
                            onClick={() => toggleReviews(item.id)}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground p-0 h-auto"
                          >
                            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-sm sm:text-base">
                              {item.reviews.length} review{item.reviews.length !== 1 ? 's' : ''}
                            </span>
                            {expandedReviews.has(item.id) ? (
                              <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                            ) : (
                              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAddReview(showAddReview === item.id ? null : item.id)}
                            className="text-primary hover:text-primary/80"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Review
                          </Button>
                        </div>
                        
                        {/* Add Review Form */}
                        {showAddReview === item.id && (
                          <div className="bg-background/30 rounded-lg p-4 border border-border/10 mb-4">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                  Rating
                                </label>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      onClick={() => setNewReviewRating(star)}
                                      className="text-2xl hover:scale-110 transition-transform"
                                    >
                                      <Star
                                        className={`w-6 h-6 ${
                                          star <= newReviewRating
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                  Comment
                                </label>
                                <Textarea
                                  value={newReviewComment}
                                  onChange={(e) => setNewReviewComment(e.target.value)}
                                  placeholder="Share your thoughts about this movie..."
                                  className="bg-secondary/20 border-border/20 min-h-[80px]"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleAddReview(item.id)}
                                  disabled={!newReviewComment.trim() || addingReview}
                                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                                >
                                  {addingReview ? 'Adding...' : 'Add Review'}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setShowAddReview(null)}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {expandedReviews.has(item.id) && (
                          <div className="space-y-4">
                            {item.reviews.length > 0 ? (
                              item.reviews.map((review) => (
                                <div 
                                  key={review.id} 
                                  className="bg-background/30 rounded-lg p-3 sm:p-4 border border-border/10 relative group"
                                  onContextMenu={(e) => handleContextMenu(e, 'review', review.id, review.comment)}
                                >
                                  {/* Edit Review Form */}
                                  {editingReview?.reviewId === review.id ? (
                                    <div className="space-y-4">
                                      <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                          Rating
                                        </label>
                                        <div className="flex gap-1">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                              key={star}
                                              onClick={() => setEditingReview(prev => prev ? {...prev, rating: star} : null)}
                                              className="text-2xl hover:scale-110 transition-transform"
                                            >
                                              <Star
                                                className={`w-6 h-6 ${
                                                  star <= editingReview.rating
                                                    ? 'text-yellow-400 fill-current'
                                                    : 'text-gray-300'
                                                }`}
                                              />
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                          Comment
                                        </label>
                                        <Textarea
                                          value={editingReview.comment}
                                          onChange={(e) => setEditingReview(prev => prev ? {...prev, comment: e.target.value} : null)}
                                          className="bg-secondary/20 border-border/20 min-h-[80px]"
                                        />
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={handleSaveEditReview}
                                          disabled={!editingReview.comment.trim() || addingReview}
                                          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                                        >
                                          {addingReview ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => setEditingReview(null)}
                                          className="flex-1"
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <User className="w-4 h-4 text-muted-foreground" />
                                          <span className="font-semibold text-sm sm:text-base">{review.user_name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          {renderStars(review.rating)}
                                        </div>
                                      </div>
                                      <p className="text-muted-foreground text-sm sm:text-base mb-2">{review.comment}</p>
                                      <div className="text-xs text-muted-foreground">
                                        {new Date(review.created_at).toLocaleDateString()}
                                      </div>
                                      {/* Mobile context menu trigger for reviews */}
                                      <button
                                        className="lg:hidden absolute top-2 right-2 w-6 h-6 bg-black/30 hover:bg-black/50 rounded flex items-center justify-center text-white transition-colors opacity-0 group-hover:opacity-100"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          const rect = e.currentTarget.getBoundingClientRect()
                                          handleContextMenu(e as any, 'review', review.id, review.comment)
                                        }}
                                      >
                                        <MoreVertical className="w-3 h-3" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No reviews yet. Be the first to share your thoughts!</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-16 px-6 bg-secondary/20 rounded-lg border-2 border-dashed border-border/20">
              <h3 className="text-xl sm:text-2xl font-heading text-primary mb-4">This watchlist is empty</h3>
              <p className="text-muted-foreground font-sans mb-6">Start adding movies to your watchlist to see them here.</p>
              <Button 
                onClick={() => setShowAddMovie(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Movies
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 