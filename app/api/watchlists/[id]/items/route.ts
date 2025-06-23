import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      movie_id, 
      title, 
      overview, 
      poster_path, 
      vote_average, 
      media_type = 'movie' 
    } = body

    if (!movie_id || !title) {
      return NextResponse.json(
        { error: 'Movie ID and title are required' },
        { status: 400 }
      )
    }

    // Check if user has access to this watchlist
    const { data: watchlist, error: watchlistError } = await supabase
      .from('watchlists')
      .select('*')
      .eq('id', id)
      .single()

    if (watchlistError || !watchlist) {
      return NextResponse.json(
        { error: 'Watchlist not found' },
        { status: 404 }
      )
    }

    // Check if user is owner or member
    if (watchlist.owner_id !== user.id) {
      const { data: membership, error: membershipError } = await supabase
        .from('watchlist_members')
        .select('*')
        .eq('watchlist_id', id)
        .eq('user_id', user.id)
        .single()

      if (membershipError || !membership) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }
    }

    // Check if movie already exists in watchlist
    const { data: existingItem, error: existingError } = await supabase
      .from('watchlist_items')
      .select('*')
      .eq('watchlist_id', id)
      .eq('movie_id', movie_id)
      .single()

    if (existingItem) {
      return NextResponse.json(
        { error: 'Movie already exists in this watchlist' },
        { status: 409 }
      )
    }

    // Add movie to watchlist
    const { data: newItem, error: insertError } = await supabase
      .from('watchlist_items')
      .insert({
        watchlist_id: id,
        movie_id,
        media_id: String(movie_id),
        title,
        overview: overview || '',
        poster_path: poster_path || null,
        backdrop_path: null,
        release_date: null,
        runtime: null,
        vote_average: vote_average || 0,
        genres: null,
        added_by: user.id,
        media_type
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting movie:', insertError)
      return NextResponse.json(
        { error: 'Failed to add movie to watchlist' },
        { status: 500 }
      )
    }

    return NextResponse.json(newItem)
  } catch (error) {
    console.error('Error in POST /api/watchlists/[id]/items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 