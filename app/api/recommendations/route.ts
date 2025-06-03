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

    // Edge case: 0 movies
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

    // Prepare prompt and context
    const titles = movieDetails
      .map((movie) => movie.title)
      .filter((title): title is string => typeof title === 'string' && !!title)
    let prompt = ""
    if (titles.length <= 3) {
      prompt = `I only have these in my watchlist: ${titles.join(", ")}. Recommend 3 new movies or shows I haven't seen yet, and don't repeat any from my list. For each, provide the exact title, the IMDb ID (if available), a comma-separated list of which of my watchlist movies inspired the recommendation (as 'BasedOn'), and a one-sentence informal recommendation directed to me (second person, e.g., 'You'll love this because...'). Format each as:\nTitle: ...\nIMDb: ...\nBasedOn: ...\nBlurb: ...`;
    } else {
      prompt = `Here are some movies and shows currently on my watchlists: ${titles.join(", ")}. Based on these, recommend 3 similar movies or shows I might enjoy. For each, provide the exact title, the IMDb ID (if available), a comma-separated list of which of my watchlist movies inspired the recommendation (as 'BasedOn'), and a one-sentence informal recommendation directed to me (second person, e.g., 'You'll love this because...'). Format each as:\nTitle: ...\nIMDb: ...\nBasedOn: ...\nBlurb: ...`;
    }
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

    // Parse recommendations from AI response
    const recsRaw = openrouterData.choices?.[0]?.message?.content || ""
    const recs = recsRaw.split(/\n(?=Title: )/).map((block: string) => {
      const titleMatch = block.match(/Title: (.*)/)
      const imdbMatch = block.match(/IMDb: (tt\d+)/)
      const basedOnMatch = block.match(/BasedOn: (.*)/)
      const blurbMatch = block.match(/Blurb: (.*)/)
      return {
        title: titleMatch ? titleMatch[1].trim() : "",
        imdb: imdbMatch ? imdbMatch[1].trim() : "",
        basedOn: basedOnMatch ? basedOnMatch[1].split(",").map(s => s.trim()).filter(Boolean) : [],
        reason: blurbMatch ? blurbMatch[1].trim() : "",
      }
    }).filter((rec) => rec.title && rec.reason)
    console.log("Parsed recommendations:", recs)

    // Filter out any recommendations already in the user's watchlist
    const userTitles = new Set(titles.map(t => t.toLowerCase()))
    const filteredRecs = recs.filter((rec) => !userTitles.has(rec.title.toLowerCase()))

    // Get movie details from TMDB using IMDb ID if available, otherwise fallback to search
    const recommendedMovies = await Promise.all(
      filteredRecs.map(async (rec) => {
        try {
          let movie = null
          if (rec.imdb) {
            // Try to find by IMDb ID
            const response = await fetch(
              `${TMDB_BASE_URL}/find/${rec.imdb}?api_key=${TMDB_API_KEY}&external_source=imdb_id`
            )
            const data = await response.json()
            movie = data.movie_results?.[0] || null
          }
          if (!movie) {
            // Fallback to search by title
            const response = await fetch(
              `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
                rec.title
              )}`
            )
            const data = await response.json()
            movie = data.results?.[0] || null
          }
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
            basedOn: rec.basedOn,
          }
        } catch (error) {
          return null
        }
      })
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