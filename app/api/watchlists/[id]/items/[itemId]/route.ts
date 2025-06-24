import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
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

    const body = await request.json()
    const { review_text, review_rating, watched, watched_at } = body

    if (review_rating !== undefined && (review_rating < 0.5 || review_rating > 5 || review_rating % 0.5 !== 0)) {
      return NextResponse.json({ error: 'Rating must be between 0.5 and 5 in 0.5 increments' }, { status: 400 })
    }

    // Upsert the review for this user and item
    const { data: upserted, error: upsertError } = await supabase
      .from('watchlist_item_reviews')
      .upsert({
        watchlist_item_id: itemId,
        user_id: user.id,
        review_text,
        review_rating,
        watched,
        watched_at,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'watchlist_item_id,user_id' })
      .select()
      .single()

    if (upsertError) {
      return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
    }

    return NextResponse.json(upserted)
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

    // Check if user is a member and has editor/owner role
    const { data: membership, error: membershipError } = await supabase
      .from('watchlist_members')
      .select('role')
      .eq('watchlist_id', id)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    if (!['owner', 'editor'].includes(membership.role)) {
      return NextResponse.json({ error: 'Only editors or owners can delete movies' }, { status: 403 })
    }

    // Delete the item
    const { error: deleteError } = await supabase
      .from('watchlist_items')
      .delete()
      .eq('id', itemId)
      .eq('watchlist_id', id)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete movie' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 