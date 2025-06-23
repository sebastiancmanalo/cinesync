import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Search query is required" },
      { status: 400 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .ilike("full_name", `%${query}%`)
    .neq("id", user.id) // Exclude the current user from search results
    .limit(10);

  if (error) {
    console.error("Error searching for users:", error);
    return NextResponse.json(
      { error: "Failed to search for users" },
      { status: 500 }
    );
  }

  return NextResponse.json(profiles);
} 