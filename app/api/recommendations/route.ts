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

    // 1. Watchlists where user is owner
    const { data: owned, error: ownedError } = await supabase
      .from("watchlists")
      .select("id")
      .eq("owner_id", userId)
    if (ownedError) throw ownedError

    // 2. Watchlists where user is a member
    const { data: memberRows, error: memberError } = await supabase
      .from("watchlist_members")
      .select("watchlist_id")
      .eq("user_id", userId)
    if (memberError) throw memberError

    const memberIds = memberRows?.map(row => row.watchlist_id) || []
    const ownedIds = owned?.map(row => row.id) || []
    const allWatchlistIds = Array.from(new Set([...ownedIds, ...memberIds]))

    if (allWatchlistIds.length === 0) {
      return NextResponse.json({ recommendations: [] })
    }

    // 3. Get all items for those watchlists
    const { data: items, error: itemsError } = await supabase
      .from("watchlist_items")
      .select("movie_id, status")
      .in("watchlist_id", allWatchlistIds)
    if (itemsError) throw itemsError

    // Only consider unwatched items
    const movieIds = (items || [])
      .filter((item) => item.status !== "watched")
      .map((item) => item.movie_id)
      .filter(Boolean)

    if (movieIds.length === 0) {
      return NextResponse.json({ recommendations: [] })
    }

    // Get movie details from TMDB
    const movieDetails = await Promise.all(
      movieIds.map(async (movieId) => {
        try {
          const response = await fetch(
            `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`
          )
          const data = await response.json()
          return data
        } catch (error) {
          return null
        }
      })
    ).then(results => results.filter(Boolean))

    if (movieDetails.length === 0) {
      return NextResponse.json({ recommendations: [] })
    }

    // Create a prompt for OpenAI
    const prompt = `Based on these movies that the user has in their watchlists: ${movieDetails
      .map((movie) => movie.title)
      .join(", ")}, recommend 3 similar movies that the user might enjoy. For each movie, provide a one-sentence explanation of why they would like it based on their viewing history. Focus on recommending movies that are similar in genre, style, or theme to the ones they've already chosen to watch.`

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
        try {
          const response = await fetch(
            `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
              rec.title
            )}`
          )
          const data = await response.json()
          const movie = data.results[0]
          if (!movie) {
            return null
          }
          return {
            id: movie.id,
            title: movie.title,
            overview: movie.overview,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            reason: rec.reason,
          }
        } catch (error) {
          return null
        }
      }) || []
    ).then(results => results.filter(Boolean))

    return NextResponse.json({ recommendations: recommendedMovies })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    )
  }
} 