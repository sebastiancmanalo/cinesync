import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 100,
        });
        const reason = response.choices[0]?.message?.content || 'No reason provided.';
        return { ...movie, reason };
      })
    );

    return NextResponse.json({ movies: updatedMovies });
  } catch (error) {
    console.error('Error in /api/what-to-watch:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 