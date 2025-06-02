import { type NextRequest, NextResponse } from "next/server"
import { getMovieDetailsServer, getTVDetailsServer } from "@/lib/tmdb-server"

// Mock data for when TMDB API is not available
const mockMovieDetails = {
  id: 1,
  title: "Sample Movie",
  overview: "This is a sample movie for demonstration purposes.",
  poster_path: "/placeholder.svg?height=300&width=200",
  release_date: "2024-01-01",
  runtime: 120,
  genres: [{ id: 1, name: "Drama" }],
}

const mockTVDetails = {
  id: 1,
  name: "Sample TV Show",
  overview: "This is a sample TV show for demonstration purposes.",
  poster_path: "/placeholder.svg?height=300&width=200",
  first_air_date: "2024-01-01",
  number_of_episodes: 10,
  number_of_seasons: 1,
  episode_run_time: [45],
  genres: [{ id: 1, name: "Drama" }],
}

export async function GET(request: NextRequest, { params }: { params: { type: string; id: string } }) {
  const { type, id } = params

  if (!["movie", "tv"].includes(type)) {
    return NextResponse.json({ error: "Invalid media type" }, { status: 400 })
  }

  try {
    const mediaId = Number.parseInt(id)
    if (isNaN(mediaId)) {
      return NextResponse.json({ error: "Invalid media ID" }, { status: 400 })
    }

    const details = type === "movie" ? await getMovieDetailsServer(mediaId) : await getTVDetailsServer(mediaId)

    if (!details) {
      // Return mock data if TMDB API is not available
      const mockDetails = type === "movie" ? { ...mockMovieDetails, id: mediaId } : { ...mockTVDetails, id: mediaId }
      return NextResponse.json(mockDetails)
    }

    return NextResponse.json(details)
  } catch (error) {
    console.error("Media details error:", error)

    // Fallback to mock data
    const mediaId = Number.parseInt(id)
    const mockDetails = type === "movie" ? { ...mockMovieDetails, id: mediaId } : { ...mockTVDetails, id: mediaId }
    return NextResponse.json(mockDetails)
  }
}
