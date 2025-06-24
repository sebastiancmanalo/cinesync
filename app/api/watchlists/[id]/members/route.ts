import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const serviceSupabase = createServiceClient();
  const { id: watchlistId } = await params;
  const { email, role } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find the user by email using the database function
  const { data: userToAdd, error: userError } = await supabase
    .rpc('get_user_by_email', { user_email: email })
    .single();

  if (userError || !userToAdd) {
    return NextResponse.json({ error: "User with that email not found." }, { status: 404 });
  }
  
  const userIdToAdd = (userToAdd as { id: string }).id;

  if (userIdToAdd === currentUser.id) {
    return NextResponse.json({ error: "You cannot add yourself to the watchlist." }, { status: 400 });
  }

  // First, check if the current user is the owner of the watchlist
  const { data: watchlist, error: ownerError } = await supabase
    .from("watchlists")
    .select("owner_id")
    .eq("id", watchlistId)
    .single();

  if (ownerError || !watchlist) {
    return NextResponse.json(
      { error: "Watchlist not found." },
      { status: 404 }
    );
  }

  if (watchlist.owner_id !== currentUser.id) {
    return NextResponse.json(
      { error: "Only the watchlist owner can add members." },
      { status: 403 }
    );
  }

  // Insert the new member
  const allowedRoles = ["viewer", "editor"];
  const memberRole = allowedRoles.includes(role) ? role : "viewer";
  const { error: insertError } = await supabase
    .from("watchlist_members")
    .insert({
      watchlist_id: watchlistId,
      user_id: userIdToAdd,
      role: memberRole,
    });

  if (insertError) {
    console.error("Error adding member to watchlist:", insertError);
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "User is already a member of this watchlist." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to add member to watchlist." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Member added successfully." },
    { status: 200 }
  );
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id: watchlistId } = params;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Remove self from watchlist_members
  const { error } = await supabase
    .from('watchlist_members')
    .delete()
    .eq('watchlist_id', watchlistId)
    .eq('user_id', user.id);
  if (error) {
    return NextResponse.json({ error: 'Failed to leave watchlist.' }, { status: 500 });
  }
  return NextResponse.json({ message: 'Left watchlist.' });
} 