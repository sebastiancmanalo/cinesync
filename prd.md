# PRD.md

## Product Name  
**WatchTogether**

---

## Problem Statement  
In an age of fragmented streaming services and overwhelming content choices, people struggle to keep track of what movies or TV shows they want to watch—especially with others. Coordinating shared watchlists with friends, partners, or roommates often requires manual effort, multiple apps, and lacks useful context like total time commitment or streaming availability.

---

## Target Users  
- Couples, friends, and roommates who regularly watch content together  
- Long-distance friends or partners maintaining shared media interests  
- Media enthusiasts who track, plan, and optimize viewing schedules  
- Book club–style viewing groups or remote movie night communities

---

## Key Features  
*Note: None of the following features have been implemented yet. All are in the planning or pre-development stage.*

1. **Shared Lists**  
   - Create and manage watchlists with one or more people  
   - Permissions: owner, editor, viewer  

2. **Auto Metadata Fetching**  
   - Automatically pull data (title, year, poster, runtime, description, streaming availability) from APIs like TMDb or JustWatch  

3. **Time Estimation**  
   - Auto-calculate total watch time for movies  
   - For TV series: option to select how many seasons/episodes you plan to watch, and get total estimated time  

4. **"Next Up" Smart Queue**  
   - Suggest what to watch next based on runtime availability (e.g., "You have 45 mins free")  
   - Filter and sort by time, genre, platform, or person-added  

5. **Platform Aggregation**  
   - Indicate where each title is currently available for streaming  
   - Optionally filter by shared subscription services  

6. **Notes & Voting**  
   - Add personal notes, emojis, or comments on items  
   - Group voting: thumbs-up/thumbs-down or rating to prioritize entries  

7. **Calendar Sync (optional MVP+)**  
   - Add scheduled watch sessions to a shared calendar  
   - Estimate completion date based on frequency of viewing  

---

## User Flow  
*All user flows are proposed and not yet implemented.*

1. **Onboarding**  
   - Sign up/log in  
   - Create or join a shared list (via invite link or username)  

2. **Adding Titles**  
   - Search for a title via TMDb API  
   - Select show/movie → auto-fill metadata  
   - Optionally add notes or change episode count  

3. **Viewing the List**  
   - See list in order by vote, runtime, or time added  
   - Click on an item to expand metadata, comments, streaming info  

4. **Tracking Progress**  
   - Mark a movie/show as "watched" or "in progress"  
   - Visual indicator shows % complete for shows  

5. **Time Calculation**  
   - Sidebar shows total watch time for list  
   - Estimation widget suggests what you can finish today, this weekend, etc.  

---

## Technical Requirements  
*All technical requirements are planned and not yet implemented.*

**Frontend:**  
- React.js with TailwindCSS (or similar modern UI library)  
- Responsive design (mobile-first)  
- State management via Redux or Context API  

**Backend:**  
- Node.js + Express for API handling  
- MongoDB or PostgreSQL for persistent list/user data  
- Authentication via JWT or OAuth2  

**APIs:**  
- TMDb API for metadata (titles, posters, runtimes)  
- JustWatch API (or alternative) for streaming availability  
- (Optional) Google Calendar API for calendar sync  

**Hosting:**  
- Frontend: Vercel or Netlify  
- Backend: Render, Railway, or AWS EC2  
- Database: MongoDB Atlas or Supabase/PostgreSQL  

---

## Success Metrics  
*Metrics to be tracked once features are implemented and users are active.*

**Core Metrics:**  
- # of active shared lists  
- Daily/weekly active users  
- Average number of titles per list  
- % of titles marked "watched" (engagement metric)  
- Avg time spent on the platform per session  

**Growth Metrics:**  
- % of users who invite others  
- List-to-signup conversion rate  
- Retention over 7 and 30 days  

**Qualitative Feedback:**  
- User-reported ease of use and usefulness of time estimates  
- NPS score from early adopters  

---

## Timeline and Milestones  
*No features have been implemented yet. All phases are pending development.*

**Phase 1: MVP (Pending)**  
- Core functionality: shared lists, search & add titles, metadata fetching, watch time calculation  
- Mark as watched/in progress  
- Basic frontend UI  
- User authentication  

**Phase 2: V1 Launch (Pending)**  
- Platform availability info  
- Voting and smart sorting  
- Invite flows and link-sharing  
- Responsive mobile UX  

**Phase 3: Growth & Polish (Pending)**  
- Calendar sync  
- Reminder notifications  
- Performance improvements and caching  
- Analytics dashboard for usage tracking  

**Phase 4: Feedback & Expansion (Ongoing, Pending)**  
- Gather feedback from early users  
- Add wishlist features (e.g., genre tagging, AI-based recs, integrations with Letterboxd, Trakt, etc.)
