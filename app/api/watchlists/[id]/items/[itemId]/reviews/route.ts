import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await context.params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a member of the watchlist
    const { data: membership, error: membershipError } = await supabase
      .from('watchlist_members')
      .select('*')
      .eq('watchlist_id', id)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch all reviews for this item, including user info
    const { data: reviews, error: reviewsError } = await supabase
      .from('watchlist_item_reviews')
      .select('id, review_text, review_rating, watched, watched_at, created_at, updated_at, user_id, profiles: user_id (full_name, avatar_url)')
      .eq('watchlist_item_id', itemId)
      .order('updated_at', { ascending: false })

    if (reviewsError) {
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }

    // Flatten avatar_url and full_name from profiles
    const reviewsWithProfile = (reviews || []).map((r: any) => ({
      ...r,
      avatar_url: r.profiles?.avatar_url ?? null,
      full_name: r.profiles?.full_name ?? null,
      profiles: undefined,
    }))

    return NextResponse.json(reviewsWithProfile)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await context.params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a member of the watchlist
    const { data: membership, error: membershipError } = await supabase
      .from('watchlist_members')
      .select('*')
      .eq('watchlist_id', id)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Delete the review for this user and item
    const { error: deleteError } = await supabase
      .from('watchlist_item_reviews')
      .delete()
      .eq('watchlist_item_id', itemId)
      .eq('user_id', user.id)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 