import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Using user ID:', user.id)

    // Fetch owned watchlists
    const { data: owned, error: ownedError } = await supabase
      .from('watchlists')
      .select('*, watchlist_items(count), watchlist_members(count)')
      .eq('owner_id', user.id)

    if (ownedError) throw ownedError

    // For each owned watchlist, get the true member count using the function
    const ownedWithTrueCount = await Promise.all((owned || []).map(async (list: any) => {
      const { data: memberCountData, error: memberCountError } = await supabase
        .rpc('get_watchlist_member_count', { p_watchlist_id: list.id, p_user_id: user.id })
      return {
        id: list.id,
        name: list.name,
        description: list.description || '',
        owner_id: list.owner_id,
        item_count: list.watchlist_items[0]?.count || 0,
        member_count: memberCountData ?? (list.watchlist_members[0]?.count || 0),
      }
    }))

    // Fetch IDs of watchlists shared with the user
    const { data: sharedRelations, error: sharedError } = await supabase
      .from('watchlist_members')
      .select('watchlist_id')
      .eq('user_id', user.id)
      .neq('role', 'owner') // User is a member but not the owner

    if (sharedError) throw sharedError

    const sharedWatchlistIds = sharedRelations.map(r => r.watchlist_id)

    // Fetch the full details of the shared watchlists
    let shared: any[] = []
    if (sharedWatchlistIds.length > 0) {
      const { data: sharedData, error: sharedDataError } = await supabase
        .from('watchlists')
        .select('*, watchlist_items(count), watchlist_members(count)')
        .in('id', sharedWatchlistIds)
      if (sharedDataError) throw sharedDataError
      shared = sharedData
    }

    // For each shared watchlist, get the true member count using the function
    const sharedWithTrueCount = await Promise.all((shared || []).map(async (list: any) => {
      const { data: memberCountData, error: memberCountError } = await supabase
        .rpc('get_watchlist_member_count', { p_watchlist_id: list.id, p_user_id: user.id })
      return {
        id: list.id,
        name: list.name,
        description: list.description || '',
        owner_id: list.owner_id,
        item_count: list.watchlist_items[0]?.count || 0,
        member_count: memberCountData ?? (list.watchlist_members[0]?.count || 0),
      }
    }))

    // Fetch movies from owned watchlists
    const { data: ownedWatchlistsWithItems, error: ownedItemsError } = await supabase
      .from('watchlists')
      .select(`
        id,
        name,
        watchlist_items (
          id,
          movie_id,
          title,
          overview,
          poster_path,
          release_date,
          runtime,
          vote_average,
          genres,
          media_type
        )
      `)
      .eq('owner_id', user.id)

    if (ownedItemsError) throw ownedItemsError

    // Fetch movies from shared watchlists (where user is a member, not owner)
    let sharedWatchlistsWithItems: any[] = []
    if (sharedWatchlistIds.length > 0) {
      const { data: sharedItems, error: sharedItemsError } = await supabase
        .from('watchlists')
        .select(`
          id,
          name,
          watchlist_items (
            id,
            movie_id,
            title,
            overview,
            poster_path,
            release_date,
            runtime,
            vote_average,
            genres,
            media_type
          )
        `)
        .in('id', sharedWatchlistIds)

      if (sharedItemsError) throw sharedItemsError
      sharedWatchlistsWithItems = sharedItems || []
    }

    // Combine all items from both owned and shared watchlists
    const allItems = [
      ...(ownedWatchlistsWithItems || []).flatMap((w: any) => w.watchlist_items || []),
      ...sharedWatchlistsWithItems.flatMap((w: any) => w.watchlist_items || [])
    ]

    // Fetch all reviews for these items by the current user
    const itemIds = allItems.map((item: any) => item.id)
    let userReviews: any[] = []
    if (itemIds.length > 0) {
      const { data: reviews, error: reviewsError } = await supabase
        .from('watchlist_item_reviews')
        .select('watchlist_item_id, watched')
        .in('watchlist_item_id', itemIds)
        .eq('user_id', user.id)
      if (reviewsError) throw reviewsError
      userReviews = reviews
    }

    // Build a set of watched item IDs
    const watchedItemIds = new Set(
      userReviews.filter(r => r.watched === true).map(r => r.watchlist_item_id)
    )

    // Filter for items the user has NOT watched
    const unwatchedItems = allItems.filter(item => !watchedItemIds.has(item.id))

    // Shuffle and pick up to 5 random unwatched items
    function shuffle(array: any[]) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
      }
      return array
    }
    const randomUnwatched = shuffle([...unwatchedItems]).slice(0, 5)
    const recommendations = randomUnwatched.map(item => ({
      id: item.movie_id,
      title: item.title,
      overview: item.overview,
      poster_path: item.poster_path,
      release_date: item.release_date,
      runtime: item.runtime,
      vote_average: item.vote_average,
      genres: item.genres || [],
      reason: 'Not watched yet!'
    }))

    const response = {
      recommendations,
      owned: ownedWithTrueCount,
      shared: sharedWithTrueCount,
    }

    console.log('Final response:', response)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
} 