import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { TMDB_API_KEY } from "@/lib/constants"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
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
    console.log("START recommendations API");
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      console.log("No userId provided");
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // 1. Watchlists where user is owner
    const { data: owned, error: ownedError } = await supabase
      .from("watchlists")
      .select("id")
      .eq("owner_id", userId)
    if (ownedError) {
      console.error("Error fetching owned watchlists:", ownedError)
      throw ownedError
    }
    console.log("Fetched owned watchlists", owned?.length)

    // 2. Watchlists where user is a member
    const { data: memberRows, error: memberError } = await supabase
      .from("watchlist_members")
      .select("watchlist_id")
      .eq("user_id", userId)
    if (memberError) {
      console.error("Error fetching member watchlists:", memberError)
      throw memberError
    }
    console.log("Fetched member watchlists", memberRows?.length)

    const memberIds = memberRows?.map(row => row.watchlist_id) || []
    const ownedIds = owned?.map(row => row.id) || []
    const allWatchlistIds = Array.from(new Set([...ownedIds, ...memberIds]))
    console.log("Merged all watchlist IDs:", allWatchlistIds)

    if (allWatchlistIds.length === 0) {
      console.log("No visible watchlists for user")
      return NextResponse.json({ recommendations: [] })
    }

    // 3. Get all items for those watchlists
    const { data: items, error: itemsError } = await supabase
      .from("watchlist_items")
      .select("tmdb_id, status")
      .in("watchlist_id", allWatchlistIds)
    if (itemsError) {
      console.error("Error fetching watchlist items:", itemsError)
      throw itemsError
    }
    console.log("Fetched items:", items?.length)

    // Only consider unwatched items
    const movieIds = (items || [])
      .filter((item) => item.status !== "watched")
      .map((item) => item.tmdb_id)
      .filter(Boolean)
    console.log("Filtered movie IDs:", movieIds)

    if (movieIds.length === 0) {
      console.log("No movies found in watchlists")
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
    console.log("Fetched movie details:", movieDetails.length)

    if (movieDetails.length === 0) {
      console.log("No valid movie details found")
      return NextResponse.json({ recommendations: [] })
    }

    // Create a prompt for OpenRouter
    const prompt = `Based on these movies that the user has in their watchlists: ${movieDetails
      .map((movie) => movie.title)
      .join(", ")}, recommend 3 similar movies that the user might enjoy. For each movie, provide a one-sentence explanation of why they would like it based on their viewing history. Focus on recommending movies that are similar in genre, style, or theme to the ones they've already chosen to watch.`
    console.log("About to call OpenRouter");

    // Get recommendations from OpenRouter
    const openrouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      })
    });
    if (!openrouterRes.ok) {
      const err = await openrouterRes.text();
      console.error("OpenRouter error:", err);
      throw new Error("OpenRouter API error: " + err);
    }
    const openrouterData = await openrouterRes.json();
    console.log("OpenRouter call complete");

    const recommendations = openrouterData.choices?.[0]?.message?.content
      ?.split("\n")
      .filter((line: string) => line.trim())
      .map((line: string) => {
        const [title, reason] = line.split(" - ")
        return { title: title.replace(/^\d+\.\s*/, ""), reason }
      })
    console.log("Parsed recommendations:", recommendations?.length)

    // Get movie details from TMDB for recommended movies
    const recommendedMovies = await Promise.all(
      recommendations?.map(async (rec: any) => {
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
    console.log("Final recommended movies:", recommendedMovies.length)

    return NextResponse.json({ recommendations: recommendedMovies })
  } catch (error) {
    console.error("Error in recommendations API:", error)
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    )
  }
} 