import { type NextRequest, NextResponse } from "next/server"
import { getMovieDetails, getTVDetails } from "@/lib/tmdb"

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

    const details = type === "movie" ? await getMovieDetails(mediaId) : await getTVDetails(mediaId)

    if (!details) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    return NextResponse.json(details)
  } catch (error) {
    console.error("Media details error:", error)
    return NextResponse.json({ error: "Failed to fetch media details" }, { status: 500 })
  }
}
