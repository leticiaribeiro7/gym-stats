# GymStats Backend Setup Guide

## 1. Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Enter project details and create
4. Wait for the project to be set up

## 2. Get Your Credentials

1. Go to Project Settings → API
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon Public Key** → `VITE_SUPABASE_ANON_KEY`
3. Paste into `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Create Database Schema

Go to **SQL Editor** in Supabase and run this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (auto-created by Supabase Auth)
-- You don't need to create this - it's managed by Auth

-- Exercises table
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  muscle_group VARCHAR(100) NOT NULL,
  personal_record DECIMAL(10, 2) DEFAULT 0,
  unit VARCHAR(50) DEFAULT 'kg',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Workouts table
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workout exercises (linking exercises to workouts)
CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) DEFAULT 'kg',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_exercises_user_id ON exercises(user_id);
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_date ON workouts(date);
CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX idx_workout_exercises_exercise_id ON workout_exercises(exercise_id);

-- Enable Row Level Security
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own exercises
CREATE POLICY "Users can view own exercises"
  ON exercises FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercises"
  ON exercises FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercises"
  ON exercises FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercises"
  ON exercises FOR DELETE
  USING (auth.uid() = user_id);

-- Users can only see their own workouts
CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  USING (auth.uid() = user_id);

-- Users can only manage workout_exercises for their own workouts
CREATE POLICY "Users can view own workout exercises"
  ON workout_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert workout exercises"
  ON workout_exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete workout exercises"
  ON workout_exercises FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );
```

## 4. Update Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials

## 5. Start Development Server

```bash
npm run dev
```

## 6. Test the Setup

1. Go to `http://localhost:5173/signup`
2. Create an account
3. You should be redirected to the dashboard
4. You can now add workouts and exercises!

## Troubleshooting

### Missing Environment Variables
- Error: "Missing Supabase environment variables"
- Fix: Make sure `.env.local` is created with your credentials
- Restart the dev server after updating `.env.local`

### Authentication Not Working
- Check that Supabase Auth is enabled (it's default)
- Verify your `VITE_SUPABASE_ANON_KEY` is correct

### Database Not Found
- Make sure you've run the SQL schema in the Supabase SQL Editor
- Check that Row Level Security is enabled (RLS policies above)

## Data Model Overview

```
User (Supabase Auth)
├── Exercise (muscle_group, PR)
│   └── Workout Exercise (sets, reps, weight)
│       └── Workout (date, duration)
```

## API Functions Available

All functions are in `src/composables/useWorkouts.ts`:

- `fetchWorkouts()` - Get all user workouts
- `fetchExercises()` - Get all user exercises  
- `createWorkout(date, duration, notes)` - Create workout
- `createExercise(name, muscleGroup, unit)` - Create exercise
- `addExerciseToWorkout(workoutId, exerciseId, sets, reps, weight)` - Add exercise to workout
- `getWorkoutDetails(workoutId)` - Get detailed workout data
- `getWorkoutStats()` - Get dashboard stats
