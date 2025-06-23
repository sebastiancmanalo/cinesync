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

    const response = {
      recommendations: [], // Placeholder for now
      owned: ownedWithTrueCount,
      shared: (shared || []).map((list: any) => ({
        id: list.id,
        name: list.name,
        description: list.description || '',
        owner_id: list.owner_id,
        item_count: list.watchlist_items[0]?.count || 0,
        member_count: list.watchlist_members[0]?.count || 0,
      })),
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