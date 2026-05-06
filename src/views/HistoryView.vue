<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchWorkouts, fetchExercises, createWorkout, addExerciseToWorkout, updateExercise, workouts, exercises, loading, error } from '@/composables/useWorkouts'


const showForm = ref(false)
const isSubmitting = ref(false)
const newWorkout = ref({
  date: new Date().toISOString().split('T')[0],
  duration: 60,
  notes: '',
  unit: ''
})

const newWorkoutExercises = ref([
  { exercise_id: '', sets: 3, reps: 10, weight: 0 }
])

onMounted(async () => {
  await Promise.all([fetchWorkouts(), fetchExercises()])
})

const addExerciseRow = () => {
  newWorkoutExercises.value.push({ exercise_id: '', sets: 3, reps: 10, weight: 0 })
}

const removeExerciseRow = (index: number) => {
  newWorkoutExercises.value.splice(index, 1)
}

const submitWorkout = async () => {
  if (!newWorkout.value.date || !newWorkout.value.duration) return
  
  isSubmitting.value = true
  try {
    const workout = await createWorkout(
      newWorkout.value.date,
      newWorkout.value.duration,
      newWorkout.value.notes
    )

    // Recalculate PR for all exercises every time a workout is submitted
    newWorkoutExercises.value.forEach(async ex => {
      const pr = ex.weight * (1 + (0.0333 * ex.reps))
      const dbExercise = exercises.value.find((e) => e.id === ex.exercise_id)
      if (dbExercise && dbExercise.personal_record < pr) {
        await updateExercise(dbExercise.id, { 
          personal_record: pr,
          pr_updated_at: new Date().toISOString()
        })
      }
    })

    if (workout && newWorkoutExercises.value.length > 0) {
      const promises = newWorkoutExercises.value
        .filter(e => e.exercise_id)
        .map(e => addExerciseToWorkout(workout.id, e.exercise_id, e.sets, e.reps, e.weight))

      await Promise.all(promises)
      await fetchWorkouts() // Refresh to load nested exercises
    }

    showForm.value = false
    newWorkout.value = {
      date: new Date().toISOString().split('T')[0],
      duration: 60,
      notes: '',
      unit: ''
    }
    newWorkoutExercises.value = [{ exercise_id: '', sets: 3, reps: 10, weight: 0 }]
  } catch (err) {
    console.error(err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="mb-2 text-[28px] font-bold">Workout History</h1>
          <p class="text-sm text-neutral-500">View all your past workouts.</p>
        </div>
        <button @click="showForm = !showForm" class="cursor-pointer rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
          {{ showForm ? 'Cancel' : 'Add Workout' }}
        </button>
      </div>
    </div>

    <div v-if="showForm" class="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-6">
      <h2 class="mb-4 text-xl">Log New Workout</h2>
      <form @submit.prevent="submitWorkout" class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="date" class="text-sm font-medium text-neutral-200">Date</label>
          <input type="date" id="date" v-model="newWorkout.date" required class="rounded-lg border border-[#404040] bg-[#262626] p-3 font-[inherit] text-white focus:border-cyan-500 focus:outline-none" />
        </div>
        
        <div class="flex flex-col gap-2">
          <label for="duration" class="text-sm font-medium text-neutral-200">Duration (minutes)</label>
          <input type="number" id="duration" v-model="newWorkout.duration" min="1" required class="rounded-lg border border-[#404040] bg-[#262626] p-3 font-[inherit] text-white focus:border-cyan-500 focus:outline-none" />
        </div>

        <div class="flex flex-col gap-2">
          <label for="notes" class="text-sm font-medium text-neutral-200">Notes</label>
          <textarea id="notes" v-model="newWorkout.notes" rows="3" placeholder="How did it go?" class="rounded-lg border border-[#404040] bg-[#262626] p-3 font-[inherit] text-white focus:border-cyan-500 focus:outline-none"></textarea>
        </div>

        <div class="flex flex-col gap-2">
          <label for="unit" class="text-sm font-medium text-neutral-200">Unit</label>
          <input type="text" id="unit" v-model="newWorkout.unit" class="rounded-lg border border-[#404040] bg-[#262626] p-3 font-[inherit] text-white focus:border-cyan-500 focus:outline-none" />
        </div>

        <div class="my-2 flex flex-col gap-4 rounded-lg border border-[#333] bg-[#1f1f1f] p-4">
          <h3 class="m-0 text-base">Exercises</h3>
          <p v-if="exercises.length === 0" class="text-sm text-red-500">
            No exercises available. Create some on the Exercises page first.
          </p>
          
          <div v-for="(ex, index) in newWorkoutExercises" :key="index" class="flex items-end gap-3 max-md:flex-col max-md:items-stretch">
            <div class="flex flex-[2] flex-col gap-2">
              <label v-if="index === 0" class="text-sm font-medium text-neutral-200">Exercise</label>
              <select v-model="ex.exercise_id" required class="rounded-lg border border-[#404040] bg-[#262626] p-3 font-[inherit] text-white focus:border-cyan-500 focus:outline-none">
                <option disabled value="">{{ exercises.length ? 'Select an exercise' : 'None available' }}</option>
                <option v-for="dbEx in exercises" :key="dbEx.id" :value="dbEx.id">{{ dbEx.name }}</option>
              </select>
            </div>
            
            <div class="flex flex-1 flex-col gap-2">
              <label v-if="index === 0" class="text-sm font-medium text-neutral-200">Sets</label>
              <input type="number" v-model="ex.sets" min="1" required class="rounded-lg border border-[#404040] bg-[#262626] p-3 font-[inherit] text-white focus:border-cyan-500 focus:outline-none" />
            </div>
            
            <div class="flex flex-1 flex-col gap-2">
              <label v-if="index === 0" class="text-sm font-medium text-neutral-200">Reps</label>
              <input type="number" v-model="ex.reps" min="1" required class="rounded-lg border border-[#404040] bg-[#262626] p-3 font-[inherit] text-white focus:border-cyan-500 focus:outline-none" />
            </div>
            
            <div class="flex flex-1 flex-col gap-2">
              <label v-if="index === 0" class="text-sm font-medium text-neutral-200">Weight (kg)</label>
              <input type="number" v-model="ex.weight" min="0" step="0.5" required class="rounded-lg border border-[#404040] bg-[#262626] p-3 font-[inherit] text-white focus:border-cyan-500 focus:outline-none" />
            </div>
            
            <div class="flex h-[42px] items-center">
              <button type="button" @click="removeExerciseRow(index)" class="cursor-pointer bg-transparent px-1 py-2 text-lg text-red-500 transition-opacity hover:opacity-70" v-if="newWorkoutExercises.length > 1" title="Remove">✕</button>
            </div>
          </div>
          
          <button type="button" @click="addExerciseRow" class="self-start rounded-lg border border-cyan-500 bg-transparent px-4 py-2 text-sm font-semibold text-cyan-500 transition-all hover:bg-cyan-500/10" v-if="exercises.length > 0">+ Add another exercise</button>
        </div>

        <button type="submit" class="mt-2 self-start cursor-pointer rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50" :disabled="isSubmitting">
          {{ isSubmitting ? 'Saving...' : 'Save Workout' }}
        </button>
      </form>
    </div>

    <div v-if="loading" class="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center text-neutral-500">
      <p>Loading workout history...</p>
    </div>

    <div v-else-if="error" class="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center text-neutral-500">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="workouts.length === 0" class="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center text-neutral-500">
      <p>No workouts yet. Add a workout to see history.</p>
    </div>

    <div v-else class="flex flex-col gap-6">
      <div
        v-for="workout in workouts"
        :key="workout.id"
        class="flex gap-4 max-md:flex-col"
      >
        <div class="min-w-[100px] pt-3 text-xs font-semibold text-neutral-600 max-md:pt-0">{{ workout.date }}</div>
        <div class="flex-1 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 transition-all hover:border-cyan-500 hover:bg-[#262626]">
          <div class="mb-3 flex flex-col gap-2">
            <div
              v-for="exercise in workout.workout_exercises"
              :key="exercise.id"
              class="flex items-center justify-between border-b border-[#2a2a2a] py-2 last:border-b-0"
            >
              <span class="text-sm text-white">
                {{ exercise.exercises?.name || 'Unknown exercise' }}
              </span>
              <span class="text-xs font-semibold text-cyan-500">
                {{ exercise.sets }} x {{ exercise.reps }}
              </span>
            </div>
          </div>
          <div class="pt-2 text-xs text-neutral-500">
            ⏱️ {{ workout.duration }} min
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
