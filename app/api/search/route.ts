import { type NextRequest, NextResponse } from "next/server"
import { searchMoviesAndTV } from "@/lib/tmdb"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    const results = await searchMoviesAndTV(query)
    return NextResponse.json(results)
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Failed to search" }, { status: 500 })
  }
}
