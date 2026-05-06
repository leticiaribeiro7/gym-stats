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
  <div class="history">
    <div class="header">
      <div class="header-content">
        <div>
          <h1>Workout History</h1>
          <p class="subtitle">View all your past workouts.</p>
        </div>
        <button @click="showForm = !showForm" class="btn-primary">
          {{ showForm ? 'Cancel' : 'Add Workout' }}
        </button>
      </div>
    </div>

    <div v-if="showForm" class="form-card">
      <h2>Log New Workout</h2>
      <form @submit.prevent="submitWorkout" class="workout-form">
        <div class="form-group">
          <label for="date">Date</label>
          <input type="date" id="date" v-model="newWorkout.date" required />
        </div>
        
        <div class="form-group">
          <label for="duration">Duration (minutes)</label>
          <input type="number" id="duration" v-model="newWorkout.duration" min="1" required />
        </div>

        <div class="form-group">
          <label for="notes">Notes</label>
          <textarea id="notes" v-model="newWorkout.notes" rows="3" placeholder="How did it go?"></textarea>
        </div>

        <div class="form-group">
          <label for="notes">Unit</label>
          <input type='text' id="notes" v-model="newWorkout.unit"></input>
        </div>

        <div class="exercises-section">
          <h3>Exercises</h3>
          <p v-if="exercises.length === 0" class="empty-text">
            No exercises available. Create some on the Exercises page first.
          </p>
          
          <div v-for="(ex, index) in newWorkoutExercises" :key="index" class="exercise-input-row">
            <div class="form-group flex-2">
              <label v-if="index === 0">Exercise</label>
              <select v-model="ex.exercise_id" required>
                <option disabled value="">{{ exercises.length ? 'Select an exercise' : 'None available' }}</option>
                <option v-for="dbEx in exercises" :key="dbEx.id" :value="dbEx.id">{{ dbEx.name }}</option>
              </select>
            </div>
            
            <div class="form-group flex-1">
              <label v-if="index === 0">Sets</label>
              <input type="number" v-model="ex.sets" min="1" required />
            </div>
            
            <div class="form-group flex-1">
              <label v-if="index === 0">Reps</label>
              <input type="number" v-model="ex.reps" min="1" required />
            </div>
            
            <div class="form-group flex-1">
              <label v-if="index === 0">Weight (kg)</label>
              <input type="number" v-model="ex.weight" min="0" step="0.5" required />
            </div>
            
            <div class="form-group remove-btn-wrapper">
              <button type="button" @click="removeExerciseRow(index)" class="btn-icon-danger" v-if="newWorkoutExercises.length > 1" title="Remove">✕</button>
            </div>
          </div>
          
          <button type="button" @click="addExerciseRow" class="btn-secondary" v-if="exercises.length > 0">+ Add another exercise</button>
        </div>

        <button type="submit" class="btn-primary submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? 'Saving...' : 'Save Workout' }}
        </button>
      </form>
    </div>

    <div v-if="loading" class="empty-state">
      <p>Loading workout history...</p>
    </div>

    <div v-else-if="error" class="empty-state">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="workouts.length === 0" class="empty-state">
      <p>No workouts yet. Add a workout to see history.</p>
    </div>

    <div v-else class="workouts-timeline">
      <div
        v-for="workout in workouts"
        :key="workout.id"
        class="workout-entry"
      >
        <div class="workout-date">{{ workout.date }}</div>
        <div class="workout-card">
          <div class="workout-exercises">
            <div
              v-for="exercise in workout.workout_exercises"
              :key="exercise.id"
              class="exercise-row"
            >
              <span class="exercise-name">
                {{ exercise.exercises?.name || 'Unknown exercise' }}
              </span>
              <span class="exercise-sets">
                {{ exercise.sets }} x {{ exercise.reps }}
              </span>
            </div>
          </div>
          <div class="workout-duration">
            ⏱️ {{ workout.duration }} min
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.subtitle {
  color: #808080;
  font-size: 14px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-primary {
  background-color: #06b6d4;
  color: #000;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-card {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 24px;
}

.form-card h2 {
  font-size: 20px;
  margin-bottom: 16px;
}

.workout-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #e5e5e5;
}

.form-group input,
.form-group select,
.form-group textarea {
  background-color: #262626;
  border: 1px solid #404040;
  color: #fff;
  border-radius: 8px;
  padding: 12px;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #06b6d4;
}

.submit-btn {
  margin-top: 8px;
  align-self: flex-start;
}

.exercises-section {
  border: 1px solid #333;
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
  background-color: #1f1f1f;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.exercises-section h3 {
  font-size: 16px;
  margin: 0;
}

.empty-text {
  color: #ef4444;
  font-size: 14px;
}

.exercise-input-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.flex-1 { flex: 1; }
.flex-2 { flex: 2; }

.btn-secondary {
  background-color: transparent;
  color: #06b6d4;
  border: 1px solid #06b6d4;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-start;
}

.btn-secondary:hover {
  background-color: rgba(6, 182, 212, 0.1);
}

.btn-icon-danger {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 18px;
  cursor: pointer;
  padding: 8px 4px;
  transition: opacity 0.2s;
}

.btn-icon-danger:hover {
  opacity: 0.7;
}

.remove-btn-wrapper {
  height: 42px;
  display: flex;
  align-items: center;
}

.workouts-timeline {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.workout-entry {
  display: flex;
  gap: 16px;
}

.workout-date {
  color: #606060;
  font-size: 12px;
  font-weight: 600;
  min-width: 100px;
  padding-top: 12px;
}

.workout-card {
  flex: 1;
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
}

.workout-card:hover {
  border-color: #06b6d4;
  background-color: #262626;
}

.workout-exercises {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.exercise-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #2a2a2a;
}

.exercise-row:last-child {
  border-bottom: none;
}

.exercise-name {
  font-size: 14px;
  color: #ffffff;
}

.exercise-sets {
  font-size: 12px;
  color: #06b6d4;
  font-weight: 600;
}

.workout-duration {
  color: #808080;
  font-size: 12px;
  padding-top: 8px;
}

.empty-state {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  color: #808080;
}

@media (max-width: 768px) {
  .workout-entry {
    flex-direction: column;
  }

  .workout-date {
    padding-top: 0;
  }
}
</style>
