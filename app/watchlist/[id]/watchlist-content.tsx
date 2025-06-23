"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MovieSearch } from "@/components/movie-search";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { InviteUserDialog } from "@/components/invite-user-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import type { TMDBSearchResult } from "@/lib/tmdb";
import { getMediaTitle } from "@/lib/tmdb";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Users2 } from "lucide-react";

// Type definitions matching the API response
interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
}

interface WatchlistItem {
  id: string;
  movie_id: number;
  title: string;
  overview: string;
  poster_path: string;
  media_type: "movie" | "tv";
  profiles: Profile;
  watched: boolean;
  watched_at?: string;
  review_text?: string;
  review_rating?: number;
}

interface WatchlistMember {
  role: "owner" | "member" | "editor";
  profiles: Profile;
}

interface Watchlist {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at?: string;
  watchlist_items: WatchlistItem[];
  watchlist_members: WatchlistMember[];
}

interface WatchlistContentProps {
  initialWatchlist: Watchlist;
}

export function WatchlistContent({ initialWatchlist: watchlist }: WatchlistContentProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<WatchlistItem | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewsByItem, setReviewsByItem] = useState<Record<string, any[]>>({});
  const [loadingReviews, setLoadingReviews] = useState<Record<string, boolean>>({});
  const [openReviews, setOpenReviews] = useState<Record<string, boolean>>({});

  const isOwner = user?.id === watchlist.owner_id;
  const isEditor = watchlist.watchlist_members.some(
    (member) => member.profiles && member.profiles.id === user?.id && ["owner", "editor"].includes(member.role)
  );

  const refreshWatchlist = () => {
    router.refresh();
  };

  const handleMovieSelected = async (movie: TMDBSearchResult) => {
      try {
      const response = await fetch(`/api/watchlists/${watchlist.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movie_id: movie.id,
          title: getMediaTitle(movie),
          overview: movie.overview,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
          media_type: movie.media_type,
        }),
      });
        
        if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to add movie.");
      }

      toast({
        title: "Success",
        description: `"${getMediaTitle(movie)}" has been added to the watchlist.`,
      });

      refreshWatchlist();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const fetchReviews = async (itemId: string) => {
    setLoadingReviews((prev) => ({ ...prev, [itemId]: true }));
    try {
      const res = await fetch(`/api/watchlists/${watchlist.id}/items/${itemId}/reviews`);
      const data = await res.json();
      setReviewsByItem((prev) => ({ ...prev, [itemId]: data }));
    } catch {
      setReviewsByItem((prev) => ({ ...prev, [itemId]: [] }));
    } finally {
      setLoadingReviews((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  useEffect(() => {
    if (watchlist.watchlist_items) {
      watchlist.watchlist_items.forEach((item) => {
        fetchReviews(item.id);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchlist.watchlist_items?.length]);

  const getCurrentUserReview = (itemId: string) => {
    const reviews = reviewsByItem[itemId] || [];
    return reviews.find((r) => r.user_id === user?.id) || null;
  };

  const handleReviewDialogOpen = (item: WatchlistItem) => {
    const myReview = getCurrentUserReview(item.id);
    setReviewTarget(item);
    setReviewText(myReview?.review_text || "");
    setReviewRating(myReview?.review_rating || 0);
    setReviewDialogOpen(true);
    setWatched(myReview?.watched || false);
    setWatchedAt(myReview?.watched_at ? myReview.watched_at.slice(0, 10) : "");
  };

  const [watched, setWatched] = useState(false);
  const [watchedAt, setWatchedAt] = useState("");

  const handleReviewSubmit = async () => {
    if (!reviewTarget) return;
    setSubmittingReview(true);
    try {
      const response = await fetch(`/api/watchlists/${watchlist.id}/items/${reviewTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_text: reviewText, review_rating: reviewRating, watched, watched_at: watched ? watchedAt : null }),
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to update review.");
      }
      setReviewDialogOpen(false);
      setReviewTarget(null);
      fetchReviews(reviewTarget.id);
      toast({ title: "Review saved!" });
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    } finally {
      setSubmittingReview(false);
    }
  };

  const toggleReviews = (itemId: string) => setOpenReviews(prev => ({ ...prev, [itemId]: !prev[itemId] }));

  const sortedItems = [...watchlist.watchlist_items].sort((a, b) => {
    const aWatched = !!getCurrentUserReview(a.id)?.watched;
    const bWatched = !!getCurrentUserReview(b.id)?.watched;
    if (aWatched === bWatched) return 0;
    return aWatched ? 1 : -1;
  });

    return (
    <div className="bg-background min-h-screen text-foreground font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-gradient-to-b from-black/80 to-transparent z-50 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-4xl font-logo tracking-wider text-primary">CineSync</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button onClick={() => setIsSearchOpen(true)} variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary">
                <PlusCircle className="w-5 h-5" />
                <span className="sr-only">Add Movie</span>
              </Button>
              {(isOwner || isEditor) && (
                <Button variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary" onClick={() => setIsShareOpen(true)}>
                  <Users2 className="w-5 h-5" />
                  <span className="sr-only">Share</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-5xl font-heading font-bold mb-2">{watchlist.name}</h1>
          <p className="text-muted-foreground text-lg mb-2">{watchlist.description || "No description."}</p>
          {watchlist.created_at && (
            <p className="text-xs text-muted-foreground mb-4">Created {new Date(watchlist.created_at).toLocaleDateString()}</p>
          )}
                </div>
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {watchlist.watchlist_members && watchlist.watchlist_members.length > 0 ? (
                watchlist.watchlist_members.map((member) => (
                  member.profiles ? (
                    <div key={member.profiles.id} className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={member.profiles.avatar_url} />
                        <AvatarFallback>
                          {member.profiles.full_name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    <div>
                        <p className="font-semibold">{member.profiles.full_name}</p>
                        <Badge variant={member.role === 'owner' ? "default" : "secondary"}>
                          {member.role}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div key={Math.random()} className="flex items-center space-x-3 opacity-60 italic text-xs text-muted-foreground">Unknown member</div>
                  )
                ))
              ) : (
                <div className="text-xs text-muted-foreground">No members found.</div>
              )}
            </CardContent>
          </Card>
              </div>
        <Card>
          <CardHeader>
            <CardTitle>Movies</CardTitle>
          </CardHeader>
          <CardContent>
            {watchlist.watchlist_items && watchlist.watchlist_items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedItems.map((item) => {
                  const myReview = getCurrentUserReview(item.id);
                  const watched = !!myReview?.watched;
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col w-full rounded-xl border border-border bg-card shadow-sm mb-4 overflow-hidden relative"
                    >
                      {/* Checkmark if watched */}
                      {watched && (
                        <div className="absolute top-2 right-2 z-10 bg-green-500 text-white rounded-full p-1 shadow">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                      )}
                      {/* Movie poster at the top, full image, takes most of the height */}
                      <div className="flex flex-col items-center justify-center p-2 pb-0 mt-2">
                        {item.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                            alt={item.title}
                            className="w-auto h-64 max-h-[340px] object-contain rounded-lg mx-auto"
                          />
                        ) : (
                          <div className="w-36 md:w-48 h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">No Image</div>
                        )}
                        {/* Title and added by, just below poster */}
                        <div className="w-full mt-2">
                          <div className="font-bold text-base text-center mb-0.5">{item.title}</div>
                          {item.profiles && (
                            <div className="text-xs text-muted-foreground text-center mb-1">Added by {item.profiles.full_name || 'Unknown'}</div>
                          )}
                        </div>
                      </div>
                      {/* Description and actions, minimal padding */}
                      <div className="flex flex-col flex-1 justify-center px-3 pt-2 pb-1 h-full">
                        <div className="flex flex-col flex-1 justify-center">
                          {item.overview && (
                            <div className="text-xs text-gray-500 text-center mb-1">{item.overview}</div>
                          )}
                          <div className="flex items-center justify-center gap-2 mt-1">
                            <Button size="sm" variant="ghost" className="text-muted-foreground px-2 py-1 h-7" onClick={() => toggleReviews(item.id)}>
                              {openReviews[item.id] ? 'Hide Reviews' : 'Show Reviews'}
                            </Button>
                            <Button size="sm" variant="ghost" className="text-muted-foreground px-2 py-1 h-7" onClick={() => handleReviewDialogOpen(item)}>
                              {myReview ? 'Edit Review' : 'Add Review'}
                            </Button>
                          </div>
                        </div>
                      </div>
                      {/* Reviews at the bottom, full width, minimal padding */}
                      {openReviews[item.id] && (
                        <div className="flex flex-col px-2 pb-2 gap-2 bg-background w-full">
                          {Array.isArray(reviewsByItem[item.id]) && reviewsByItem[item.id].length > 0 ? (
                            reviewsByItem[item.id].map((review) => (
                              <div
                                key={review.user_id}
                                className={`flex flex-col w-full rounded-lg p-2 border border-secondary bg-secondary/10 text-foreground mb-1 ${review.user_id === user?.id ? 'ring-2 ring-yellow-400' : ''}`}
                              >
                                {/* Full name centered at the top */}
                                <div className="w-full text-center font-semibold text-xs mb-0.5">{review.full_name}</div>
                                {/* Avatar and watched date centered below name */}
                                <div className="flex items-center justify-center gap-2 w-full mb-1">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={review.avatar_url} />
                                    <AvatarFallback>{review.full_name?.charAt(0).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  {review.watched && review.watched_at && (
                                    <span className="text-[10px] rounded bg-green-100 text-green-700 px-1 py-0.5">Watched {new Date(review.watched_at).toLocaleDateString()}</span>
                                  )}
                                </div>
                                {/* Stars and rating centered */}
                                <div className="flex items-center justify-center gap-1 mb-0.5">
                                  {[1,2,3,4,5].map(star => (
                                    <span key={star} className={star <= (review.review_rating ?? 0) ? "text-yellow-400 text-base" : "text-gray-600 text-base"}>★</span>
                                  ))}
                                  {typeof review.review_rating === 'number' && review.review_rating > 0 && (
                                    <span className="ml-1 text-xs text-foreground font-semibold">({review.review_rating.toFixed(1)})</span>
                                  )}
                                </div>
                                {/* Review text smaller, centered */}
                                {review.review_text && (
                                  <div className="text-xs font-medium text-foreground text-center mb-1">{review.review_text}</div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-gray-500 italic">No reviews yet</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                    </div>
            ) : (
              <div className="text-center py-8">
                <p>No movies in this watchlist yet.</p>
                <Button size="sm" className="mt-4" onClick={() => setIsSearchOpen(true)}>Add your first movie</Button>
                  </div>
            )}
                </CardContent>
              </Card>
        <MovieSearch
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          watchlistId={watchlist.id}
          onSelect={handleMovieSelected}
        />
        {(isOwner || isEditor) && (
          <InviteUserDialog
            open={isShareOpen}
            onOpenChange={setIsShareOpen}
            watchlistId={watchlist.id}
            onMemberAdded={refreshWatchlist}
          />
        )}
        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{reviewTarget?.title ? `Your Review: ${reviewTarget.title}` : "Add Review"}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map(star => (
                  <button
                    key={star}
                    type="button"
                    className={star <= reviewRating ? "text-yellow-400 text-2xl" : "text-gray-300 text-2xl"}
                    onClick={() => setReviewRating(star)}
                    aria-label={`Set rating to ${star}`}
                  >
                    ★
                  </button>
                ))}
            </div>
              <Textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Write your review..."
                rows={4}
              />
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={watched} onChange={e => setWatched(e.target.checked)} id="watched" />
                <label htmlFor="watched">Mark as watched</label>
                {watched && (
                  <Input type="date" value={watchedAt} onChange={e => setWatchedAt(e.target.value)} className="ml-2" />
          )}
        </div>
      </div>
            <DialogFooter>
              <Button onClick={handleReviewSubmit} disabled={submittingReview || reviewRating < 1}>
                {submittingReview ? "Saving..." : "Save Review"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
} 