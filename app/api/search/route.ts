import { type NextRequest, NextResponse } from "next/server"
import { searchMoviesAndTVServer } from "@/lib/tmdb-server"

// Mock data for when TMDB API is not available
const mockSearchResults = [
  {
    id: 1,
    title: "The Shawshank Redemption",
    overview:
      "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    poster_path: "/placeholder.svg?height=300&width=200",
    release_date: "1994-09-23",
    media_type: "movie" as const,
  },
  {
    id: 2,
    name: "Breaking Bad",
    overview:
      "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.",
    poster_path: "/placeholder.svg?height=300&width=200",
    first_air_date: "2008-01-20",
    media_type: "tv" as const,
  },
  {
    id: 3,
    title: "Inception",
    overview:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.",
    poster_path: "/placeholder.svg?height=300&width=200",
    release_date: "2010-07-16",
    media_type: "movie" as const,
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    const results = await searchMoviesAndTVServer(query)

    // If no results from TMDB (possibly due to missing API key), return mock data
    if (results.length === 0) {
      const filteredMockResults = mockSearchResults.filter((item) =>
        (item.title || item.name)?.toLowerCase().includes(query.toLowerCase()),
      )
      return NextResponse.json(filteredMockResults)
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Search error:", error)

    // Fallback to mock data on error
    const filteredMockResults = mockSearchResults.filter((item) =>
      (item.title || item.name)?.toLowerCase().includes(query.toLowerCase()),
    )
    return NextResponse.json(filteredMockResults)
  }
}
