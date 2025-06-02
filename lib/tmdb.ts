// Remove client-side API key exposure - all calls now go through our API routes
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
