import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description } = body

    // For now, just return a mock response
    // Later we'll integrate with Supabase
    const mockWatchlist = {
      id: `watchlist-${Date.now()}`,
      name,
      description,
      owner_id: 'user-123',
      item_count: 0,
      member_count: 1,
      created_at: new Date().toISOString()
    }

    return NextResponse.json(mockWatchlist, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create watchlist' },
      { status: 500 }
    )
  }
} 