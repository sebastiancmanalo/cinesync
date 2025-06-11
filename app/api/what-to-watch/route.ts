import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { movies } = body;

    if (!Array.isArray(movies) || movies.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty movies array' }, { status: 400 });
    }

    const updatedMovies = await Promise.all(
      movies.map(async (movie) => {
        const prompt = `Give a playful reason to watch the movie "${movie.title}".`;
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'perplexity/sonar-small-chat',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 100,
          }),
        });
        const data = await response.json();
        const reason = data.choices?.[0]?.message?.content || 'No reason provided.';
        return { ...movie, reason };
      })
    );

    return NextResponse.json({ movies: updatedMovies });
  } catch (error) {
    console.error('Error in /api/what-to-watch:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 