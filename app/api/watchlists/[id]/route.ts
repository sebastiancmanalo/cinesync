import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Mock data for now - we'll replace this with real Supabase calls
    const mockWatchlist = {
      id,
      name: "Sci-Fi Epics",
      description: "A collection of the greatest sci-fi epics ever made.",
      owner_id: "user-123",
      created_at: "2024-01-01T00:00:00Z",
      items: [
        {
          id: 1,
          movie_id: 438631,
          title: "Dune",
          overview: "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.",
          poster_path: "/d5NXSklXo0qyIY2Vvchwsy6wA4r.jpg",
          backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
          vote_average: 7.8,
          added_at: "2024-01-01T00:00:00Z",
          added_by: {
            id: "user-123",
            name: "John Doe",
            email: "john@example.com"
          },
          watched: false,
          watched_at: null,
          watched_by: null,
          reviews: [
            {
              id: "review-1",
              user_id: "user-456",
              user_name: "Jane Smith",
              rating: 5,
              comment: "Absolutely stunning! The world-building is incredible and the performances are top-notch. Denis Villeneuve has created a masterpiece.",
              created_at: "2024-01-10T00:00:00Z"
            },
            {
              id: "review-2",
              user_id: "user-789",
              user_name: "Mike Johnson",
              rating: 4,
              comment: "Great adaptation of the book. The visuals are breathtaking and the story is compelling. Can't wait for Part Two!",
              created_at: "2024-01-12T00:00:00Z"
            }
          ]
        },
        {
          id: 2,
          movie_id: 693134,
          title: "Dune: Part Two",
          overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
          poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
          backdrop_path: "/sR0SpCr1_zkZ12xVIHTojG3T6eS.jpg",
          vote_average: 8.3,
          added_at: "2024-01-02T00:00:00Z",
          added_by: {
            id: "user-456",
            name: "Jane Smith",
            email: "jane@example.com"
          },
          watched: true,
          watched_at: "2024-01-15T00:00:00Z",
          watched_by: {
            id: "user-123",
            name: "John Doe",
            email: "john@example.com"
          },
          reviews: [
            {
              id: "review-3",
              user_id: "user-123",
              user_name: "John Doe",
              rating: 5,
              comment: "Even better than the first one! The action sequences are incredible and the character development is perfect. A true epic.",
              created_at: "2024-01-16T00:00:00Z"
            },
            {
              id: "review-4",
              user_id: "user-456",
              user_name: "Jane Smith",
              rating: 5,
              comment: "This exceeded all my expectations. The cinematography is mind-blowing and the story is perfectly paced.",
              created_at: "2024-01-18T00:00:00Z"
            }
          ]
        },
        {
          id: 3,
          movie_id: 27205,
          title: "Inception",
          overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
          poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
          backdrop_path: "/s3TBr3j_0rBw62aN_W3S4S02S1.jpg",
          vote_average: 8.4,
          added_at: "2024-01-03T00:00:00Z",
          added_by: {
            id: "user-789",
            name: "Mike Johnson",
            email: "mike@example.com"
          },
          watched: false,
          watched_at: null,
          watched_by: null,
          reviews: [
            {
              id: "review-5",
              user_id: "user-123",
              user_name: "John Doe",
              rating: 4,
              comment: "Mind-bending concept executed brilliantly. Christopher Nolan at his best. The ending still has me thinking!",
              created_at: "2024-01-05T00:00:00Z"
            }
          ]
        }
      ],
      members: [
        {
          id: "user-123",
          email: "john@example.com",
          full_name: "John Doe",
          avatar_url: null,
          role: "owner"
        },
        {
          id: "user-456",
          email: "jane@example.com",
          full_name: "Jane Smith",
          avatar_url: null,
          role: "member"
        },
        {
          id: "user-789",
          email: "mike@example.com",
          full_name: "Mike Johnson",
          avatar_url: null,
          role: "member"
        }
      ]
    }

    return NextResponse.json(mockWatchlist)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 500 }
    )
  }
} 