const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "demo_key"
const TMDB_BASE_URL = "https://api.themoviedb.org/3"

export interface TMDBSearchResult {
  id: number
  title?: string
  name?: string
  overview: string
  poster_path?: string
  release_date?: string
  first_air_date?: string
  media_type: "movie" | "tv"
  runtime?: number
  number_of_episodes?: number
  number_of_seasons?: number
}

export interface TMDBMovieDetails {
  id: number
  title: string
  overview: string
  poster_path?: string
  release_date: string
  runtime: number
  genres: { id: number; name: string }[]
}

export interface TMDBTVDetails {
  id: number
  name: string
  overview: string
  poster_path?: string
  first_air_date: string
  number_of_episodes: number
  number_of_seasons: number
  episode_run_time: number[]
  genres: { id: number; name: string }[]
}

export async function searchMoviesAndTV(query: string): Promise<TMDBSearchResult[]> {
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

export async function getMovieDetails(id: number): Promise<TMDBMovieDetails | null> {
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

export async function getTVDetails(id: number): Promise<TMDBTVDetails | null> {
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

export function getImageUrl(path: string, size: "w200" | "w500" | "original" = "w500"): string {
  return `https://image.tmdb.org/t/p/${size}${path}`
}

export function calculateWatchTime(
  mediaType: "movie" | "tv",
  runtime?: number,
  episodeRuntime?: number[],
  totalEpisodes?: number,
  plannedEpisodes?: number,
): number {
  if (mediaType === "movie") {
    return runtime || 0
  }

  if (mediaType === "tv") {
    const avgRuntime = episodeRuntime?.length ? episodeRuntime.reduce((a, b) => a + b, 0) / episodeRuntime.length : 45 // Default to 45 minutes

    const episodes = plannedEpisodes || totalEpisodes || 0
    return Math.round(avgRuntime * episodes)
  }

  return 0
}
