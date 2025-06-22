import { NextResponse } from 'next/server'

export async function GET() {
  // Mock data for now - we'll replace this with real Supabase calls
  const mockData = {
    recommendations: [
      {
        id: 438631,
        title: "Dune",
        overview: "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.",
        poster_path: "/d5NXSklXo0qyIY2Vvchwsy6wA4r.jpg",
        backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
        vote_average: 7.8,
      },
      {
        id: 693134,
        title: "Dune: Part Two",
        overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
        poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
        backdrop_path: "/sR0SpCr1_zkZ12xVIHTojG3T6eS.jpg",
        vote_average: 8.3,
      },
      {
        id: 27205,
        title: "Inception",
        overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
        backdrop_path: "/s3TBr3j_0rBw62aN_W3S4S02S1.jpg",
        vote_average: 8.4,
      },
      {
        id: 155,
        title: "The Dark Knight",
        overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
        poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        backdrop_path: "/hqkIcbrCarCSyADc5QVB2GcgRNI.jpg",
        vote_average: 8.5,
      },
      {
        id: 122,
        title: "The Lord of the Rings: The Return of the King",
        overview: "Aragorn is revealed as the heir to the ancient kings as he, Gandalf and the other members of the broken fellowship struggle to save Gondor from Sauron's forces.",
        poster_path: "/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg",
        backdrop_path: "/9DeGfFIqjph5CBFVQrD6hd雲.jpg",
        vote_average: 8.5,
      }
    ],
    owned: [
      {
        id: "1",
        name: "Sci-Fi Epics",
        description: "A collection of the greatest sci-fi epics ever made.",
        owner_id: "user-123",
        item_count: 23,
        member_count: 5,
      },
      {
        id: "2",
        name: "Mind-Bending Thrillers",
        description: "Movies that will keep you on the edge of your seat.",
        owner_id: "user-123",
        item_count: 12,
        member_count: 2,
      }
    ],
    shared: [
      {
        id: "3",
        name: "Animated Adventures",
        description: "For the young and the young at heart.",
        owner_id: "user-456",
        item_count: 45,
        member_count: 8,
      }
    ]
  }

  return NextResponse.json(mockData)
} 