// Client-side TMDB utilities - NO API KEY USAGE
// All API calls go through our server-side routes

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
  vote_average: number
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

// Utility functions that don't require API access
export function getImageUrl(path: string, size: "w200" | "w500" | "original" = "w500"): string {
  if (!path) return "/placeholder.svg"
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

export function formatRuntime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${remainingMinutes}m`
}

export function getMediaTitle(item: TMDBSearchResult | TMDBMovieDetails | TMDBTVDetails): string {
  if ("title" in item && item.title) return item.title
  if ("name" in item && item.name) return item.name
  return "Unknown Title"
}

export function getMediaYear(item: TMDBSearchResult | TMDBMovieDetails | TMDBTVDetails): number | null {
  const date = ("release_date" in item ? item.release_date : item.first_air_date) || ""
  return date ? new Date(date).getFullYear() : null
}
