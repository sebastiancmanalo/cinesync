import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, { params }: { params: { id: string; userId: string } }) {
  const supabase = await createClient();
  const { id: watchlistId, userId } = params;
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
    .eq('id', watchlistId)
    .single();
  if (error || !watchlist) {
    return NextResponse.json({ error: 'Watchlist not found.' }, { status: 404 });
  }
  if (watchlist.owner_id !== user.id) {
    return NextResponse.json({ error: 'Only the owner can remove users.' }, { status: 403 });
  }
  // Remove the user
  const { error: removeError } = await supabase
    .from('watchlist_members')
    .delete()
    .eq('watchlist_id', watchlistId)
    .eq('user_id', userId);
  if (removeError) {
    return NextResponse.json({ error: 'Failed to remove user.' }, { status: 500 });
  }
  return NextResponse.json({ message: 'User removed.' });
} 