# 🎬 CineSync

A modern, cinematic movie watchlist sharing app built with Next.js, Supabase, and TypeScript.

## ✨ Features

- **🎭 Cinematic Design** - Beautiful dark theme with warm accents inspired by classic cinema
- **📱 Responsive** - Works perfectly on desktop, tablet, and mobile
- **👥 Social Sharing** - Share watchlists with friends and family
- **🎬 Movie Management** - Add, remove, and mark movies as watched
- **💬 Reviews & Ratings** - Rate and review movies with star ratings
- **🔍 Smart Recommendations** - Get personalized movie suggestions
- **⚡ Real-time Updates** - Live updates when data changes
- **🔐 Secure Authentication** - Built-in user authentication with Supabase

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account
- TMDB API key (optional, for movie data)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cinesync.git
   cd cinesync
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

   # TMDB API (for movie data)
   NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here

   # OpenRouter API (for AI recommendations - optional)
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

4. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key from Settings → API
   - Run database migrations:
     ```bash
     supabase link --project-ref your_project_ref
     supabase db push
     ```

5. **Start the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Database**: PostgreSQL with Row Level Security
- **Deployment**: Vercel (recommended)
- **Package Manager**: pnpm

## 📁 Project Structure

```
cinesync/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── watchlist/         # Watchlist pages
│   └── settings/          # Settings pages
├── components/            # Reusable UI components
├── contexts/              # React contexts
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── supabase/              # Database migrations
├── types/                 # TypeScript type definitions
└── styles/                # Global styles
```

## 🎨 Design System

CineSync uses a cinematic design system with:

- **Colors**: Dark theme with warm amber/pink accents
- **Typography**: Lora (body), Playfair Display (headings), Bebas Neue (logo)
- **Components**: shadcn/ui with custom styling
- **Animations**: Smooth transitions and hover effects

## 🔧 Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking

### Database Migrations

```bash
# Create a new migration
supabase migration new migration_name

# Apply migrations
supabase db push

# Reset database
supabase db reset
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
pnpm build
pnpm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the amazing backend platform
- [shadcn/ui](https://ui.shadcn.com) for the beautiful component library
- [TMDB](https://www.themoviedb.org) for movie data
- [Next.js](https://nextjs.org) for the incredible React framework

---

Made with ❤️ for movie lovers everywhere
