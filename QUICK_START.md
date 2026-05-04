# 🚀 GymStats Backend Integration - Quick Start Guide

Your app is now fully integrated with Supabase! Follow these steps to get it running.

## Step 1: Create a Supabase Account & Project

1. Go to **[app.supabase.com](https://app.supabase.com)**
2. Click **"New Project"** or sign up if needed
3. Fill in:
   - **Project Name**: `gym-stats` (or anything you like)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. Wait 1-2 minutes for setup

## Step 2: Get Your API Keys

Once your project is ready:

1. Go to **Settings → API** (left sidebar)
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon Public Key** (long string starting with `eyJ...`)

## Step 3: Configure Your App

1. Open `.env.local` in your project (create it if it doesn't exist)
2. Paste your values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. **Save the file** - dev server will auto-reload

## Step 4: Create the Database Schema

1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy and paste the entire SQL code from [SETUP_SUPABASE.md](./SETUP_SUPABASE.md#3-create-database-schema)
4. Click **"Run"** (or Ctrl+Enter)
5. Wait for it to complete ✓

## Step 5: Test Your App

1. Go back to **[http://localhost:5173](http://localhost:5173)**
2. You should see the **Sign up** page
3. Create an account with any email and password
4. You should be redirected to the **Dashboard**
5. Try adding an exercise!

## ✨ Features Now Available

✅ **Authentication**
- Sign up with email/password
- Sign in to your account
- Persistent sessions
- Sign out button in sidebar

✅ **Data Persistence**
- Create exercises (synced to database)
- Log workouts
- View stats (workouts this week, total sets)
- All data is saved to Supabase

✅ **Security**
- Row-level security (RLS) ensures users only see their own data
- Passwords are hashed by Supabase Auth

## 📝 What You Can Do Now

### Dashboard Page
- View workouts from this week
- See total sets completed
- Track training progress

### Exercises Page
- ✨ **NEW**: Add exercises with muscle group
- List all your exercises
- Track personal records

### Add More Features

The API functions are ready! You can use these in any component:

```typescript
import { 
  fetchWorkouts, 
  fetchExercises,
  createWorkout,
  createExercise,
  addExerciseToWorkout,
  getWorkoutStats
} from '@/composables/useWorkouts'
```

Example:
```typescript
// Create a workout
const workout = await createWorkout(
  '2026-05-02',  // date
  45,            // duration in minutes
  'Great session!' // optional notes
)

// Add exercise to workout
await addExerciseToWorkout(
  workout.id,
  exercise.id,
  4,    // sets
  8,    // reps
  100,  // weight
  'kg'  // unit
)
```

## 🐛 Troubleshooting

### "Missing Supabase environment variables" Error
- ✓ Check `.env.local` exists
- ✓ URLs and keys are copied correctly
- ✓ Restart dev server after updating `.env.local`
- ✓ No spaces around `=` in .env file

### Can't sign up / "User already exists"
- Try a different email address
- Email must be valid (won't send email though in dev)

### Data not appearing after creating exercises
- Refresh the page
- Check browser console (F12) for errors
- Verify Row Level Security policies are enabled in Supabase

### Still stuck?
- Check terminal for error messages
- Go to Supabase **SQL Editor** → Check database schema created
- Go to Supabase **Authentication** → Verify user was created

## 📚 File Structure

```
src/
├── composables/
│   ├── useAuth.ts          # Auth functions (login, signup, logout)
│   └── useWorkouts.ts      # Data functions (exercises, workouts)
├── utils/
│   └── supabase.ts         # Supabase client config
├── views/
│   ├── LoginView.vue       # Login page
│   ├── SignupView.vue      # Sign up page
│   ├── DashboardView.vue   # Dashboard (now fetches real data)
│   ├── ExercisesView.vue   # Exercises (now has add form + real data)
│   ├── MuscleView.vue      # Muscle groups
│   └── HistoryView.vue     # Workout history

.env.local                 # Your Supabase credentials (keep secret!)
.env.example              # Template for .env.local
```

## 🔐 Security Notes

- **Never commit `.env.local`** to git (it's in .gitignore)
- Your ANON KEY is public-safe (it only reads data via RLS policies)
- Users can only access their own data (enforced by RLS)
- Change database password regularly in Supabase settings

## 🎯 Next Steps

Once everything is working, you can:

1. **Enhance the UI** - Add more visualizations and charts
2. **Add more features** - Workout templates, exercise library, progress tracking
3. **Deploy** - Use Vercel, Netlify, or your preferred host
4. **Mobile app** - Use same Supabase backend for React Native/Flutter

---

**Need help?** Check the [SETUP_SUPABASE.md](./SETUP_SUPABASE.md) file for detailed database schema and API documentation.
