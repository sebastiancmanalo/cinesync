import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description } = body

    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the profile ID for the current user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()
    
    if (profileError || !profile) {
       return NextResponse.json(
        { error: 'Profile not found for current user' },
        { status: 404 }
      )
    }

    // Create the watchlist
    const { data: watchlist, error: watchlistError } = await supabase
      .from('watchlists')
      .insert({
        name,
        description: description || null,
        owner_id: profile.id
      })
      .select()
      .single()

    if (watchlistError) {
      console.error('Error creating watchlist:', watchlistError)
      return NextResponse.json(
        { error: 'Failed to create watchlist' },
        { status: 500 }
      )
    }

    // Add the owner as a member
    const { error: memberError } = await supabase
      .from('watchlist_members')
      .insert({
        watchlist_id: watchlist.id,
        user_id: profile.id,
        role: 'owner'
      })

    if (memberError) {
      console.error('Error adding member:', memberError)
      // Don't fail the request if adding member fails
    }

    return NextResponse.json(watchlist, { status: 201 })
  } catch (error) {
    console.error('Error in watchlist creation:', error)
    return NextResponse.json(
      { error: 'Failed to create watchlist' },
      { status: 500 }
    )
  }
} 