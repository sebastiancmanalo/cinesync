// Server-side TMDB utilities with secure API key access
// Use TMDB_API_KEY (without NEXT_PUBLIC_ prefix) for server-only access
const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = "https://api.themoviedb.org/3"

if (!TMDB_API_KEY) {
  console.warn("TMDB_API_KEY environment variable is not set")
}

export async function searchMoviesAndTVServer(query: string) {
  if (!TMDB_API_KEY) {
    console.error("TMDB API key not configured")
    return []
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`,
    )

    if (!response.ok) {
      throw new Error("Failed to search")
    }

    const data = await response.json()
    return data.results.filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
  } catch (error) {
    console.error("Error searching TMDB:", error)
    return []
  }
}

export async function getMovieDetailsServer(id: number) {
  if (!TMDB_API_KEY) {
    console.error("TMDB API key not configured")
    return null
  }

  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}`)

    if (!response.ok) {
      throw new Error("Failed to fetch movie details")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching movie details:", error)
    return null
  }
}

export async function getTVDetailsServer(id: number) {
  if (!TMDB_API_KEY) {
    console.error("TMDB API key not configured")
    return null
  }

  try {
    const response = await fetch(`${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}`)

    if (!response.ok) {
      throw new Error("Failed to fetch TV details")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching TV details:", error)
    return null
  }
}
