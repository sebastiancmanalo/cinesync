# 🗄️ Supabase Database Setup Guide

## 📋 **What We've Created**

I've created a **clean, comprehensive database schema** for your CineSync app with:

### ✅ **Tables Created:**
- **`profiles`** - User profiles (extends Supabase auth)
- **`watchlists`** - Movie watchlists
- **`watchlist_members`** - Sharing functionality
- **`watchlist_items`** - Movies in watchlists
- **`reviews`** - User reviews and ratings

### ✅ **Features Included:**
- **Row Level Security (RLS)** - Secure data access
- **Automatic triggers** - Profile creation, timestamps
- **Proper indexes** - Fast queries
- **TypeScript types** - Full type safety

---

## 🚀 **Setup Steps**

### **Step 1: Create New Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `cinesync`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to you
5. Click "Create new project"
6. Wait 2-3 minutes for setup

### **Step 2: Get Your Credentials**
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (starts with `https://`)
   - **Publishable key** (new format: starts with `sb_publishable_`) OR **Anon public key** (legacy: starts with `eyJ`)
   - **Secret key** (new format: starts with `sb_secret_`) OR **Service role key** (legacy: starts with `eyJ`)
   
   **Note:** You can use either the new API keys (recommended) or legacy keys - both work with the codebase.

### **Step 3: Set Up Environment Variables**
Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_key_or_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_secret_key_or_service_role_key_here

# TMDB API (for movie data)
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
```

### **Step 4: Run Database Migration**
1. **Link your project** (replace `your_project_ref` with your actual project ref):
   ```bash
   supabase link --project-ref your_project_ref
   ```

2. **Push the migration**:
   ```bash
   supabase db push
   ```

### **Step 5: Test the Setup**
1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test authentication** - Sign up/sign in should work
3. **Test watchlist creation** - Should work without errors
4. **Test adding movies** - Should work smoothly

---

## 🔧 **What the Schema Provides**

### **User Management:**
- Automatic profile creation when users sign up
- Profile updates (name, avatar)
- Secure user data access

### **Watchlist Features:**
- Create, read, update, delete watchlists
- Share watchlists with other users
- Public/private watchlist settings
- Member management (add/remove users)

### **Movie Management:**
- Add movies to watchlists
- Mark movies as watched/unwatched
- Track who added each movie
- Store movie metadata (TMDB integration ready)

### **Reviews & Ratings:**
- Rate movies (1-5 stars)
- Add comments to reviews
- Edit/delete your own reviews
- View all reviews for movies

### **Security:**
- Row Level Security (RLS) on all tables
- Users can only access their own data
- Watchlist owners control member access
- Secure sharing between users

---

## 🎯 **Next Steps After Setup**

1. **Test the full flow**:
   - Sign up → Create watchlist → Add movies → Add reviews → Share with friends

2. **Deploy to Vercel**:
   - Push to GitHub
   - Connect to Vercel
   - Add environment variables in Vercel dashboard

3. **Optional Enhancements**:
   - Add TMDB API integration for movie search
   - Add email notifications for sharing
   - Add real-time updates with Supabase subscriptions

---

## 🆘 **Troubleshooting**

### **If you get "infinite recursion" errors:**
- This means the old schema is still in place
- Run `supabase db reset` to completely reset the database
- Then run `supabase db push` again

### **If authentication doesn't work:**
- Check your environment variables are correct
- Make sure you're using the right Supabase project
- Verify the migration ran successfully

### **If you get TypeScript errors:**
- The new types should resolve all conflicts
- Restart your TypeScript server in your editor
- Run `npm run type-check` to verify

---

## 🎉 **You're Ready!**

Your CineSync app now has a **production-ready database schema** that will:
- ✅ Work perfectly with your existing UI
- ✅ Handle all the features you've built
- ✅ Scale as your app grows
- ✅ Keep your data secure

**Go ahead and set up your Supabase project - you're all set!** 🚀 