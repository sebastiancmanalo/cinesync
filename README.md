# 🎬 CineSync

A modern, collaborative movie and TV show watchlist sharing application built with Next.js, Supabase, and TypeScript. Create shared watchlists with friends, family, or roommates, and never lose track of what you want to watch together.

## ✨ Features

### ✅ Implemented Features

- **👥 Shared Watchlists** - Create and manage watchlists with multiple members
- **🔐 User Authentication** - Secure OAuth authentication via Supabase
- **🎬 Movie & TV Search** - Search and add movies/TV shows using TMDB API
- **📝 Reviews & Ratings** - Rate and review movies with star ratings and comments
- **👤 Member Management** - Add users to watchlists by email with role-based permissions (owner, editor, viewer)
- **📊 Dashboard** - Overview of all your watchlists with statistics
- **🎨 Modern UI** - Beautiful dark theme with responsive design
- **🔒 Row Level Security** - Secure data access with PostgreSQL RLS policies

### 🚧 Planned Features

- Smart recommendations based on watch history
- Real-time updates via Supabase subscriptions
- Time estimation and scheduling
- Platform availability integration

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account
- TMDB API key (for movie data)

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
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

   # TMDB API (for movie data)
   NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
   ```

4. **Set up Supabase Database**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key from Settings → API
   - Run database migrations from the `supabase/migrations` directory:
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

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui component library
- **Backend**: Supabase (PostgreSQL, Authentication, Row Level Security)
- **Database**: PostgreSQL with comprehensive RLS policies
- **APIs**: TMDB API for movie/TV metadata
- **Package Manager**: pnpm

## 📁 Project Structure

```
cinesync/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (REST endpoints)
│   │   ├── dashboard/    # Dashboard data endpoint
│   │   ├── watchlists/   # Watchlist CRUD operations
│   │   ├── users/        # User search endpoints
│   │   └── search/       # Movie search endpoint
│   ├── dashboard/         # Dashboard page
│   ├── watchlist/        # Individual watchlist pages
│   ├── settings/         # User settings page
│   └── auth/             # Authentication pages
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── movie-search.tsx  # Movie search component
│   └── invite-user-dialog.tsx # User invitation component
├── contexts/              # React contexts (auth)
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── supabase/         # Supabase client setup
│   └── tmdb.ts           # TMDB API integration
├── supabase/
│   └── migrations/       # Database migration files
├── types/                 # TypeScript type definitions
└── styles/               # Global styles
```

## 🎨 Design System

CineSync uses a cinematic design system with:

- **Colors**: Dark theme with warm amber/pink gradient accents
- **Typography**: Lora (body), Playfair Display (headings), Bebas Neue (logo)
- **Components**: shadcn/ui with custom styling
- **Responsive**: Mobile-first design that works on all devices

## 🔧 Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Database Migrations

The project includes migration files in `supabase/migrations/` that set up:
- User profiles and authentication
- Watchlists and member management
- Watchlist items with movie/TV metadata
- Reviews and ratings system
- Row Level Security policies

To apply migrations:
```bash
supabase db push
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_TMDB_API_KEY`
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
pnpm build
pnpm start
```

## 🔒 Security

- All API keys and secrets are stored in environment variables
- Row Level Security (RLS) policies enforce data access at the database level
- User authentication handled securely via Supabase Auth
- No hardcoded credentials in the codebase

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the amazing backend platform
- [shadcn/ui](https://ui.shadcn.com) for the beautiful component library
- [TMDB](https://www.themoviedb.org) for movie and TV show data
- [Next.js](https://nextjs.org) for the incredible React framework

---

Made with ❤️ for movie lovers everywhere
