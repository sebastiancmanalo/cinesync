import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: watchlistData, error } = await supabase
      .from('watchlists')
      .select(
        `
        id,
        name,
        description,
        owner_id,
        created_at,
        watchlist_items (
          id,
          movie_id,
          title,
          overview,
          poster_path,
          backdrop_path,
          release_date,
          runtime,
          vote_average,
          genres,
          added_at,
          added_by,
          media_type,
          profiles (
            id,
            full_name,
            avatar_url
          )
        ),
        watchlist_members (
          role,
          profiles (
            id,
            full_name,
            avatar_url
          )
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching watchlist:', error)
      return NextResponse.json(
        { error: 'Failed to fetch watchlist data.' },
        { status: 500 }
      )
    }

    if (!watchlistData) {
      return NextResponse.json(
        { error: 'Watchlist not found.' },
        { status: 404 }
      )
    }

    // The RLS policies should handle authorization, but as a safeguard:
    const isOwner = watchlistData.owner_id === user.id
    const isMember = watchlistData.watchlist_members.some(
      (member: any) => member.profiles.id === user.id
    )

    if (!isOwner && !isMember) {
      return NextResponse.json(
        { error: 'You don\'t have permission to view this watchlist.' },
        { status: 403 }
      )
    }

    return NextResponse.json(watchlistData)
  } catch (error) {
    console.error('Error in watchlist API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const { id } = params;
    const body = await request.json();
    const { name, description } = body;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Check ownership
    const { data: watchlist, error } = await supabase
      .from('watchlists')
      .select('owner_id')
      .eq('id', id)
      .single();
    if (error || !watchlist) {
      return NextResponse.json({ error: 'Watchlist not found.' }, { status: 404 });
    }
    if (watchlist.owner_id !== user.id) {
      return NextResponse.json({ error: 'Only the owner can edit this watchlist.' }, { status: 403 });
    }
    const { error: updateError } = await supabase
      .from('watchlists')
      .update({ name, description })
      .eq('id', id);
    if (updateError) {
      return NextResponse.json({ error: 'Failed to update watchlist.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Watchlist updated.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update watchlist.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const { id } = params;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Check ownership
    const { data: watchlist, error } = await supabase
      .from('watchlists')
      .select('owner_id')
      .eq('id', id)
      .single();
    if (error || !watchlist) {
      return NextResponse.json({ error: 'Watchlist not found.' }, { status: 404 });
    }
    if (watchlist.owner_id !== user.id) {
      return NextResponse.json({ error: 'Only the owner can delete this watchlist.' }, { status: 403 });
    }
    // Delete all members and items (cascades if FK is set, otherwise manual)
    await supabase.from('watchlist_members').delete().eq('watchlist_id', id);
    await supabase.from('watchlist_items').delete().eq('watchlist_id', id);
    const { error: deleteError } = await supabase.from('watchlists').delete().eq('id', id);
    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete watchlist.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Watchlist deleted.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete watchlist.' }, { status: 500 });
  }
} 