# WatchTogether

> **Disclaimer:** _None of the features described below have been implemented yet. This project is currently in the planning or early setup phase._

A collaborative platform for creating and managing shared watchlists with friends, partners, or groups—complete with smart time estimation, streaming availability, and group voting.

---

## 🚀 Overview

**WatchTogether** helps people coordinate what to watch together, track progress, and make group decisions—eliminating the hassle of fragmented lists and manual planning.

---

## 🔧 Environment Variables

To enable movie and TV show search functionality, you'll need to set up the following environment variables:

### Required for Supabase (Already configured)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### Optional for TMDB Integration
- `TMDB_API_KEY` - Your TMDB API key (get one at https://www.themoviedb.org/settings/api)

**Note:** The app will work without the TMDB API key by using mock data for demonstration purposes. To enable real movie/TV show search, sign up for a free TMDB API key and add it to your environment variables.

---

## 📦 Features

### Core (MVP)
- [x] Shared Lists: Create and manage watchlists with others (owner, editor, viewer roles)
- [x] Auto Metadata Fetching: Pulls title, year, poster, runtime, description, and streaming info from APIs (TMDb, JustWatch)
- [x] Time Estimation: Calculates total watch time for movies and TV series (customizable by season/episode)
- [x] Smart Queue: Suggests what to watch next based on available time and filters (runtime, genre, platform, person-added)
- [ ] Platform Aggregation: Shows where each title is available to stream; filter by shared subscriptions
- [x] Notes & Voting: Add notes, emojis, comments, and group voting (thumbs-up/down or ratings)
- [x] Progress Tracking: Mark items as watched/in progress; visual completion indicators

### Planned / In Progress
- [ ] Calendar Sync: Add watch sessions to a shared calendar (Google Calendar integration)
- [ ] Completion Estimation: Suggests what you can finish today, this weekend, etc.
- [ ] Invite Flows: Share lists via invite link or username
- [x] Responsive Mobile UX: Optimized for all devices
- [ ] Analytics Dashboard: Usage tracking and engagement metrics

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React, TailwindCSS
- **Backend:** Next.js API Routes, Server Actions
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Google OAuth)
- **APIs:** TMDb (The Movie Database)
- **Hosting:** Vercel

---

## 📈 Progress & Milestones

### Phase 1: MVP (Complete)
- [x] Shared lists, search & add titles, metadata fetching, watch time calculation
- [x] Mark as watched/in progress
- [x] Modern UI with cinema theming
- [x] User authentication with Google

### Phase 2: V1 Launch (In Progress)
- [ ] Platform availability info
- [x] Voting and smart sorting
- [ ] Invite flows and link-sharing
- [x] Responsive mobile UX

### Phase 3: Growth & Polish (Upcoming)
- [ ] Calendar sync
- [ ] Reminder notifications
- [ ] Performance improvements and caching
- [ ] Analytics dashboard

### Phase 4: Feedback & Expansion (Ongoing)
- [ ] Gather user feedback
- [ ] Add wishlist features (genre tagging, AI-based recommendations, integrations with Letterboxd/Trakt, etc.)

---

## 📊 Success Metrics

- Number of active shared lists
- Daily/weekly active users
- Average titles per list
- % of titles marked "watched"
- Average session time
- % of users who invite others
- Retention (7/30 days)
- Qualitative feedback (ease of use, usefulness, NPS)

---

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your environment variables (see above)
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

---

## 📝 Contributing

1. Fork the repo and clone locally
2. Install dependencies (`npm install`)
3. Set up environment variables (see `.env.example`)
4. Run the app locally (`npm run dev`)
5. Open a PR with your changes

---

## 📬 Contact & Feedback

We welcome feedback and contributions! Please open an issue or reach out to the maintainers.

# WatchTogether

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/sebastiancmanalos-projects/v0-watch-together)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/Uuy1Y2u5pYx)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/sebastiancmanalos-projects/v0-watch-together](https://vercel.com/sebastiancmanalos-projects/v0-watch-together)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/Uuy1Y2u5pYx](https://v0.dev/chat/projects/Uuy1Y2u5pYx)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
