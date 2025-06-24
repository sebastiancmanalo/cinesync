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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { PlusCircle, Users2, ArrowLeft, Film, MinusCircle, Pencil, LogOut } from "lucide-react";
import Link from "next/link";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
  added_by?: string;
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

const DATE_INPUT_MODE_KEY = 'cineSyncDateInputMode';

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
  const [deleteMovieId, setDeleteMovieId] = useState<string | null>(null);
  const [deleteReviewItemId, setDeleteReviewItemId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [watched, setWatched] = useState(false);
  const [watchedAt, setWatchedAt] = useState<Date>(new Date());
  const [dateInputMode, setDateInputMode] = useState<'calendar' | 'text'>(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(DATE_INPUT_MODE_KEY);
      if (stored === 'calendar' || stored === 'text') return stored;
    }
    return 'calendar';
  });
  const [dateInputText, setDateInputText] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState(watchlist.name);
  const [editDescription, setEditDescription] = useState(watchlist.description || "");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [deletingWatchlist, setDeletingWatchlist] = useState(false);
  const [leavingWatchlist, setLeavingWatchlist] = useState(false);
  const [removeUsersDialogOpen, setRemoveUsersDialogOpen] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [confirmDeleteReviewOpen, setConfirmDeleteReviewOpen] = useState(false);
  const [confirmDeleteMovieOpen, setConfirmDeleteMovieOpen] = useState(false);

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
    const reviewDate = myReview?.watched_at ? new Date(myReview.watched_at) : new Date();
    setWatchedAt(reviewDate);
    setDateInputText(format(reviewDate, 'yyyy-MM-dd'));
  };

  const handleReviewSubmit = async () => {
    if (!reviewTarget) return;
    console.log('Starting review submission...');
    console.log('Review target:', reviewTarget);
    console.log('Review text:', reviewText);
    console.log('Review rating:', reviewRating);
    console.log('Watched:', watched);
    console.log('Watched at:', watchedAt);
    
    setSubmittingReview(true);
    try {
      const requestBody = { review_text: reviewText, review_rating: reviewRating, watched, watched_at: watched ? watchedAt.toISOString() : null };
      console.log('Request body:', requestBody);
      
      const response = await fetch(`/api/watchlists/${watchlist.id}/items/${reviewTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error response:', errorData);
        throw new Error(errorData.error || "Failed to update review.");
      }
      
      const responseData = await response.json();
      console.log('Success response:', responseData);
      
      setReviewDialogOpen(false);
      setReviewTarget(null);
      fetchReviews(reviewTarget.id);
      toast({ title: "Review saved!" });
    } catch (error) {
      console.error('Review submission error:', error);
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

  const handleDeleteMovie = async (itemId: string) => {
    setDeleteMovieId(itemId);
    setConfirmDeleteMovieOpen(true);
  };

  const confirmDeleteMovie = async () => {
    if (!deleteMovieId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/watchlists/${watchlist.id}/items/${deleteMovieId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to delete movie");
      toast({ title: "Movie deleted" });
      setDeleteMovieId(null);
      setConfirmDeleteMovieOpen(false);
      refreshWatchlist();
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteReview = (itemId: string) => {
    setDeleteReviewItemId(itemId);
    setConfirmDeleteReviewOpen(true);
  };

  const confirmDeleteReview = async () => {
    if (!deleteReviewItemId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/watchlists/${watchlist.id}/items/${deleteReviewItemId}/reviews`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to delete review");
      toast({ title: "Review deleted" });
      setDeleteReviewItemId(null);
      setConfirmDeleteReviewOpen(false);
      fetchReviews(deleteReviewItemId);
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  // Sort members by privilege: owner > editor > viewer
  const memberRoleOrder = { owner: 0, editor: 1, viewer: 2 };
  const sortedMembers = (watchlist.watchlist_members ?? []).slice().sort((a, b) => {
    const aOrder = memberRoleOrder[a.role as keyof typeof memberRoleOrder] ?? 2;
    const bOrder = memberRoleOrder[b.role as keyof typeof memberRoleOrder] ?? 2;
    return aOrder - bOrder;
  });

  const handleDateTextChange = (text: string) => {
    setDateInputText(text);
    // Try to parse the date as user types
    const parsedDate = new Date(text);
    if (!isNaN(parsedDate.getTime())) {
      setWatchedAt(parsedDate);
    }
  };

  const handleDateTextBlur = () => {
    const parsedDate = new Date(dateInputText);
    if (!isNaN(parsedDate.getTime())) {
      setWatchedAt(parsedDate);
      setDateInputText(format(parsedDate, 'yyyy-MM-dd'));
    } else {
      // Reset to current date if invalid
      setDateInputText(format(watchedAt, 'yyyy-MM-dd'));
    }
  };

  // Persist date input mode preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DATE_INPUT_MODE_KEY, dateInputMode);
    }
  }, [dateInputMode]);

  // Handler: Edit name/description
  const handleEditSave = async () => {
    try {
      const res = await fetch(`/api/watchlists/${watchlist.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDescription }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update watchlist");
      toast({ title: "Watchlist updated" });
      setEditDialogOpen(false);
      refreshWatchlist();
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    }
  };

  // Handler: Delete watchlist
  const handleDeleteWatchlist = async () => {
    setDeletingWatchlist(true);
    try {
      const res = await fetch(`/api/watchlists/${watchlist.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to delete watchlist");
      toast({ title: "Watchlist deleted" });
      router.push("/dashboard");
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setDeletingWatchlist(false);
      setConfirmDeleteOpen(false);
    }
  };

  // Handler: Leave watchlist
  const handleLeaveWatchlist = async () => {
    setLeavingWatchlist(true);
    try {
      const res = await fetch(`/api/watchlists/${watchlist.id}/members`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to leave watchlist");
      toast({ title: "Left watchlist" });
      router.push("/dashboard");
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLeavingWatchlist(false);
      setConfirmLeaveOpen(false);
    }
  };

  // Handler: Remove user
  const handleRemoveUser = async (userId: string) => {
    setRemovingUserId(userId);
    try {
      const res = await fetch(`/api/watchlists/${watchlist.id}/members/${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to remove user");
      toast({ title: "User removed" });
      refreshWatchlist();
      setRemovingUserId(null);
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
      setRemovingUserId(null);
    }
  };

    return (
    <div className="bg-background min-h-screen text-foreground font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-gradient-to-b from-black/80 to-transparent z-50 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary">
                <Link href="/dashboard">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <Link href="/dashboard" className="flex items-center gap-2">
                <Film className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                <span className="text-2xl sm:text-4xl font-logo tracking-wider">
                  CineSync
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsSearchOpen(true)} variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary">
                <PlusCircle className="w-5 h-5" />
                <span className="sr-only">Add Movie</span>
              </Button>
              {/* Pencil/Edit or Leave Icon Dropdown */}
              {isOwner ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary">
                      <Pencil className="w-5 h-5" />
                      <span className="sr-only">Watchlist Actions</span>
              </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="font-sans">
                    <DropdownMenuItem className="font-sans" onClick={() => setEditDialogOpen(true)}>Edit name & description</DropdownMenuItem>
                    <DropdownMenuItem className="font-sans" onClick={() => setRemoveUsersDialogOpen(true)}>Remove users</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 font-sans" onClick={() => setConfirmDeleteOpen(true)}>Delete watchlist</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary">
                      <LogOut className="w-5 h-5" />
                      <span className="sr-only">Leave Watchlist</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="font-sans">
                    <DropdownMenuItem className="text-red-600 font-sans" onClick={() => setConfirmLeaveOpen(true)}>Leave watchlist</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
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
              <div className="flex flex-row gap-8 justify-start">
                {sortedMembers.length > 0 ? (
                  sortedMembers.map((member) => (
                    member.profiles ? (
                      <div key={member.profiles.id} className="flex flex-col items-center min-w-[90px]">
                        <Avatar className="w-14 h-14 mb-1">
                          <AvatarImage src={member.profiles.avatar_url} />
                          <AvatarFallback>{member.profiles.full_name?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-heading font-bold text-xl text-foreground mb-1 text-center">{member.profiles.full_name}</span>
                        {member.role === 'owner' ? (
                          <span className="mt-2 rounded-full px-4 py-1 text-lg font-semibold bg-yellow-400 text-black">owner</span>
                        ) : (
                          <span className="mt-2 rounded-full px-4 py-1 text-lg font-semibold bg-neutral-800/90 text-white">{member.role}</span>
                        )}
                </div>
                    ) : null
                  ))
                ) : null}
                </div>
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
                            <div className="text-xs font-medium text-foreground text-center mb-1">{item.overview}</div>
                          )}
                          <div className="flex items-center justify-center gap-2 mt-1">
                            <Button size="sm" variant="ghost" className="text-muted-foreground px-2 py-1 h-7" onClick={() => toggleReviews(item.id)}>
                              {openReviews[item.id] ? 'Hide Reviews' : 'Show Reviews'}
                  </Button>
                            <Button size="sm" variant="ghost" className="text-muted-foreground px-2 py-1 h-7" onClick={() => handleReviewDialogOpen(item)}>
                              {myReview ? 'Edit Review' : 'Add Review'}
                    </Button>
                            {(isOwner || (isEditor && item.added_by === user?.id)) && (
                              <Button size="sm" variant="ghost" className="text-red-500 px-2 py-1 h-7" onClick={() => handleDeleteMovie(item.id)} title="Delete Movie">
                                <MinusCircle className="w-4 h-4" />
                                <span className="sr-only">Delete Movie</span>
                    </Button>
                            )}
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
                                  {[1,2,3,4,5].map(star => {
                                    const full = (review.review_rating ?? 0) >= star;
                                    const half = (review.review_rating ?? 0) >= star - 0.5 && (review.review_rating ?? 0) < star;
                                    return full ? (
                                      <span key={star} className="text-yellow-400 text-base">★</span>
                                    ) : half ? (
                                      <svg key={star} width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline', verticalAlign: 'middle' }}>
                                        <defs>
                                          <linearGradient id={`half-star-display-${star}`} x1="0" y1="0" x2="100%" y2="0">
                                            <stop offset="50%" stopColor="#facc15" />
                                            <stop offset="50%" stopColor="#d1d5db" />
                                          </linearGradient>
                                        </defs>
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill={`url(#half-star-display-${star})`} />
                                      </svg>
                                    ) : (
                                      <span key={star} className="text-gray-600 text-base">★</span>
                                    );
                                  })}
                                  {typeof review.review_rating === 'number' && review.review_rating > 0 && (
                                    <span className="ml-1 text-xs text-foreground font-semibold">({review.review_rating.toFixed(1)})</span>
                                  )}
                            </div>
                                {/* Review text smaller, centered */}
                                {review.review_text && (
                                  <div className="text-xs font-medium text-foreground text-center mb-1">{review.review_text}</div>
                                )}
                                {review.user_id === user?.id && (
                                  <Button size="sm" variant="ghost" className="text-red-500 px-2 py-1 h-7 ml-auto" onClick={() => handleDeleteReview(item.id)} title="Delete Review">
                                    <MinusCircle className="w-4 h-4" />
                                    <span className="sr-only">Delete Review</span>
                        </Button>
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
          <DialogContent className="font-sans">
            <DialogHeader>
              <DialogTitle className="font-heading">{reviewTarget?.title ? `Your Review: ${reviewTarget.title}` : "Add Review"}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 font-sans">
              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map(star => {
                  const full = reviewRating >= star;
                  const half = reviewRating >= star - 0.5 && reviewRating < star;
                  return (
                                    <button
                                      key={star}
                      type="button"
                      className={full || half ? "text-yellow-400 text-2xl" : "text-gray-300 text-2xl"}
                      style={{ position: 'relative', width: 32, height: 32, padding: 0, background: 'none', border: 'none', cursor: 'pointer' }}
                      aria-label={`Set rating to ${star}`}
                    >
                      <span
                        style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', zIndex: 2 }}
                        onClick={e => { e.stopPropagation(); setReviewRating(star - 0.5); }}
                        aria-label={`Set rating to ${star - 0.5}`}
                      />
                      <span
                        style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', zIndex: 2 }}
                        onClick={e => { e.stopPropagation(); setReviewRating(star); }}
                        aria-label={`Set rating to ${star}`}
                      />
                      {full ? (
                        <span>★</span>
                      ) : half ? (
                        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline', verticalAlign: 'middle' }}>
                          <defs>
                            <linearGradient id={`half-star-${star}`} x1="0" y1="0" x2="100%" y2="0">
                              <stop offset="50%" stopColor="#facc15" />
                              <stop offset="50%" stopColor="#d1d5db" />
                            </linearGradient>
                          </defs>
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill={`url(#half-star-${star})`} />
                        </svg>
                      ) : (
                        <span>★</span>
                      )}
                                    </button>
                  );
                })}
                                </div>
                                <Textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Write your review..."
                rows={4}
                className="font-sans"
              />
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 font-sans w-full">
                <input type="checkbox" checked={watched} onChange={e => setWatched(e.target.checked)} id="watched" className="accent-primary w-5 h-5 mr-2" />
                <label htmlFor="watched" className="font-heading text-lg font-bold whitespace-nowrap mb-1 sm:mb-0">Mark as watched</label>
                {watched && (
                  <div className="relative w-full sm:w-auto">
                    <div className="flex flex-row gap-2 items-center">
                      {dateInputMode === 'calendar' && (
                        <Popover>
                          <PopoverTrigger asChild>
                                <Button
                              variant="outline"
                              className="ml-0 sm:ml-2 justify-start text-left font-normal bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/60 hover:ring-2 hover:ring-primary/40 transition-all font-sans"
                              style={{ minWidth: 160, maxWidth: 220 }}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {watchedAt ? format(watchedAt, "PPP") : "Pick a date"}
                                </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-background font-sans">
                            <Calendar
                              mode="single"
                              selected={watchedAt}
                              onSelect={(date) => date && setWatchedAt(date)}
                              initialFocus
                              captionLayout="dropdown-buttons"
                              fromYear={1900}
                              toYear={new Date().getFullYear() + 10}
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                      {dateInputMode === 'text' && (
                        <Input
                          type="text"
                          value={dateInputText}
                          onChange={e => handleDateTextChange(e.target.value)}
                          onBlur={handleDateTextBlur}
                          placeholder="YYYY-MM-DD"
                          className="font-sans bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/60 hover:ring-2 hover:ring-primary/40 transition-all"
                          style={{ minWidth: 160, maxWidth: 220 }}
                        />
                      )}
                                <Button
                                  variant="outline"
                        size="sm"
                        onClick={() => setDateInputMode(mode => mode === 'calendar' ? 'text' : 'calendar')}
                        className="px-2 py-1 text-xs font-sans"
                                >
                        {dateInputMode === 'calendar' ? 'Text' : 'Calendar'}
                                </Button>
                            </div>
                          </div>
                        )}
                                        </div>
                                      </div>
            <DialogFooter>
              <Button onClick={handleReviewSubmit} disabled={submittingReview || reviewRating < 0.5} className="font-sans">
                {submittingReview ? "Saving..." : "Save Review"}
                                        </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="font-sans">
            <DialogHeader>
              <DialogTitle>Edit Watchlist</DialogTitle>
            </DialogHeader>
            <Input className="font-sans" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Name" />
            <Textarea className="font-sans" value={editDescription} onChange={e => setEditDescription(e.target.value)} placeholder="Description" />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEditSave} disabled={editName.trim() === ''}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Delete Confirmation Dialog */}
        <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
          <DialogContent className="font-sans">
            <DialogHeader>
              <DialogTitle>Delete Watchlist?</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this watchlist? This cannot be undone.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteWatchlist} disabled={deletingWatchlist}>
                {deletingWatchlist ? 'Deleting...' : 'Delete'}
                                        </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Leave Confirmation Dialog */}
        <Dialog open={confirmLeaveOpen} onOpenChange={setConfirmLeaveOpen}>
          <DialogContent className="font-sans">
            <DialogHeader>
              <DialogTitle>Leave Watchlist?</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to leave this watchlist?</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmLeaveOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleLeaveWatchlist} disabled={leavingWatchlist}>
                {leavingWatchlist ? 'Leaving...' : 'Leave'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Remove Users Dialog (owner only) */}
        <Dialog open={removeUsersDialogOpen} onOpenChange={setRemoveUsersDialogOpen}>
          <DialogContent className="font-sans">
            <DialogHeader>
              <DialogTitle>Remove Users</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              {watchlist.watchlist_members.filter(m => m.profiles && m.profiles.id !== user?.id).length === 0 ? (
                <div className="text-center text-muted-foreground">No other members to remove.</div>
              ) : (
                watchlist.watchlist_members.filter(m => m.profiles && m.profiles.id !== user?.id).map(member => (
                  <div key={member.profiles.id} className="flex items-center gap-3 justify-between border-b border-border pb-2">
                                        <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.profiles.avatar_url} />
                        <AvatarFallback>{member.profiles.full_name?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-heading font-bold text-base text-foreground">{member.profiles.full_name}</span>
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-neutral-800/90 text-white">{member.role}</span>
                                        </div>
                    <Button size="sm" variant="destructive" className="font-sans" onClick={() => handleRemoveUser(member.profiles.id)} disabled={removingUserId === member.profiles.id}>
                      {removingUserId === member.profiles.id ? 'Removing...' : 'Remove'}
                    </Button>
                                </div>
                              ))
                            )}
                          </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRemoveUsersDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Delete Review Confirmation Dialog */}
        <Dialog open={confirmDeleteReviewOpen} onOpenChange={setConfirmDeleteReviewOpen}>
          <DialogContent className="font-sans">
            <DialogHeader>
              <DialogTitle className="font-heading">Delete Review?</DialogTitle>
            </DialogHeader>
            <div className="text-foreground">Are you sure you want to delete your review? This cannot be undone.</div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDeleteReviewOpen(false)} disabled={deleting}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDeleteReview} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Delete Movie Confirmation Dialog */}
        <Dialog open={confirmDeleteMovieOpen} onOpenChange={setConfirmDeleteMovieOpen}>
          <DialogContent className="font-sans">
            <DialogHeader>
              <DialogTitle className="font-heading">Delete Movie?</DialogTitle>
            </DialogHeader>
            <div className="text-foreground">Are you sure you want to delete this movie from the watchlist? This cannot be undone.</div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDeleteMovieOpen(false)} disabled={deleting}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDeleteMovie} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
            </div>
  );
} 