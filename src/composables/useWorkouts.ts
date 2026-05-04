import { ref } from 'vue'
import { supabase } from '@/utils/supabase'
import { user } from './useAuth'

export interface Workout {
  id: string
  user_id: string
  date: string
  duration: number
  notes?: string
  created_at: string
}

export interface Exercise {
  id: string
  user_id: string
  name: string
  muscle_group: string
  personal_record: number
  unit: string
  created_at: string,
  pr_updated_at: string
}

export interface WorkoutExercise {
  id: string
  workout_id: string
  exercise_id: string
  sets: number
  reps: number
  weight: number
  unit: string
  created_at: string
}

const workouts = ref<Workout[]>([])
const exercises = ref<Exercise[]>([])
const loading = ref(false)
const error = ref('')

// Fetch user's workouts
export async function fetchWorkouts() {
  loading.value = true
  error.value = ''

  try {
    const { data, error: fetchError } = await supabase
      .from('workouts')
      .select(
        `
        *,
        workout_exercises (
          *,
          exercises (*)
        )
      `,
      )
      .eq('user_id', user.value?.id)
      .order('date', { ascending: false })

    if (fetchError) throw fetchError
    workouts.value = data || []
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch workouts'
  } finally {
    loading.value = false
  }
}

// Fetch user's exercises
export async function fetchExercises() {
  loading.value = true
  error.value = ''

  try {
    const { data, error: fetchError } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', user.value?.id)
      .order('name', { ascending: true })

    if (fetchError) throw fetchError
    exercises.value = data || []
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch exercises'
  } finally {
    loading.value = false
  }
}

// Create a new workout
export async function createWorkout(date: string, duration: number, notes?: string) {
  try {
    const { data, error: createError } = await supabase
      .from('workouts')
      .insert({
        user_id: user.value?.id,
        date,
        duration,
        notes,
      })
      .select()

    if (createError) throw createError
    if (data) workouts.value.unshift(data[0])
    return data?.[0]
  } catch (err: any) {
    error.value = err.message || 'Failed to create workout'
    throw err
  }
}

// Add exercise to workout
export async function addExerciseToWorkout(
  workoutId: string,
  exerciseId: string,
  sets: number,
  reps: number,
  weight: number,
  unit: string = 'kg',
) {
  try {
    const { data, error: createError } = await supabase
      .from('workout_exercises')
      .insert({
        workout_id: workoutId,
        exercise_id: exerciseId,
        sets,
        reps,
        weight,
        unit,
      })
      .select()

    if (createError) throw createError
    return data?.[0]
  } catch (err: any) {
    error.value = err.message || 'Failed to add exercise to workout'
    throw err
  }
}

// Create a new exercise
export async function createExercise(name: string, muscleGroup: string, unit: string = 'kg') {
  try {
    const { data, error: createError } = await supabase
      .from('exercises')
      .insert({
        user_id: user.value?.id,
        name,
        muscle_group: muscleGroup,
        unit,
        personal_record: 0,
      })
      .select()

    if (createError) throw createError
    if (data) exercises.value.push(data[0])
    return data?.[0]
  } catch (err: any) {
    error.value = err.message || 'Failed to create exercise'
    throw err
  }
}

export async function updateExercise(exerciseId: string, updateValues: Partial<Exercise>) {
  try {
    const { error } = await supabase
      .from('exercises')
      .update({
        ...updateValues,
      })
      .eq('id', exerciseId)

    if (error) throw error
  } catch (err: any) {
    error.value = 'Failed to update exercise'
    throw err
  }
}

// Get workout details with exercises
export async function getWorkoutDetails(workoutId: string) {
  try {
    const { data: workoutData, error: workoutError } = await supabase
      .from('workouts')
      .select(
        `
        *,
        workout_exercises (
          *,
          exercises (*)
        )
      `,
      )
      .eq('id', workoutId)
      .single()

    if (workoutError) throw workoutError
    return workoutData
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch workout details'
    throw err
  }
}

// Get stats for dashboard
export async function getWorkoutStats() {
  try {
    const today = new Date()
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const { data, error: fetchError } = await supabase
      .from('workouts')
      .select('*, workout_exercises(*)')
      .eq('user_id', user.value?.id)
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])

    if (fetchError) throw fetchError

      const { count: prCount, error: prError } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.value?.id)
      .gte('pr_updated_at', sevenDaysAgo.toISOString().split('T')[0])
      
    if (prError) throw prError

    const workoutsCount = data?.length || 0
    const setsCount = data?.reduce((sum, w) => sum + (w.workout_exercises?.length || 0), 0) || 0

    return {
      workoutsThisWeek: workoutsCount,
      totalSets: setsCount,
      prsThisWeek: prCount || 0,
      lastWorkout: data?.[0],
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch stats'
    throw err
  }
}

export { workouts, exercises, loading, error }
