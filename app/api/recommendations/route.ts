import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"
import { TMDB_API_KEY } from "@/lib/constants"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const TMDB_BASE_URL = "https://api.themoviedb.org/3"

interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string
  vote_average: number
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Fetch user's watchlists and their movies
    const { data: watchlists, error: watchlistsError } = await supabase
      .from("watchlists")
      .select(`
        id,
        name,
        watchlist_items (
          movie_id
        )
      `)
      .eq("user_id", userId)

    if (watchlistsError) {
      throw watchlistsError
    }

    // Extract all movie IDs from watchlists
    const movieIds = watchlists
      .flatMap((watchlist) => watchlist.watchlist_items)
      .map((movie) => movie.movie_id)

    if (movieIds.length === 0) {
      return NextResponse.json({ recommendations: [] })
    }

    // Get movie details from TMDB
    const movieDetails = await Promise.all(
      movieIds.map(async (movieId) => {
        const response = await fetch(
          `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`
        )
        return response.json()
      })
    )

    // Create a prompt for OpenAI
    const prompt = `Based on these movies: ${movieDetails
      .map((movie) => movie.title)
      .join(", ")}, recommend 3 similar movies that the user might enjoy. For each movie, provide a one-sentence explanation of why they would like it based on their viewing history.`

    // Get recommendations from OpenAI
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    })

    const recommendations = completion.choices[0].message.content
      ?.split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const [title, reason] = line.split(" - ")
        return { title: title.replace(/^\d+\.\s*/, ""), reason }
      })

    // Get movie details from TMDB for recommended movies
    const recommendedMovies = await Promise.all(
      recommendations?.map(async (rec) => {
        const response = await fetch(
          `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
            rec.title
          )}`
        )
        const data = await response.json()
        const movie = data.results[0]
        return {
          id: movie.id,
          title: movie.title,
          overview: movie.overview,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
          reason: rec.reason,
        }
      }) || []
    )

    return NextResponse.json({ recommendations: recommendedMovies })
  } catch (error) {
    console.error("Error fetching recommendations:", error)
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    )
  }
} 