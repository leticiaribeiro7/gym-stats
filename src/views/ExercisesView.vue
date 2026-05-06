<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchExercises, exercises, createExercise } from '@/composables/useWorkouts'
import { useExternalApi } from '@/composables/useExternalApi'


const showForm = ref(false)
const newExerciseName = ref('')
const newExerciseMuscle = ref('')
const loading = ref(false)
const search = ref('')
const selectedExercise = ref<any>(null)

// Chamando a composable e renomeando as propriedades para o template
const {
  data: searchResults,
  isLoading: isSearching,
  error: searchError,
  fetchData: searchExercises
} = useExternalApi()


const muscleGroups = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Forearms',
  'Legs',
  'Quads',
  'Hamstrings',
  'Calves',
  'Abs',
  'Glutes',
] // TODO: para exercicios personalizados 

onMounted(async () => {
  await fetchExercises()
})

async function handleAddExercise() {
  if (!newExerciseName.value) return

  loading.value = true
  try {
    await createExercise(newExerciseName.value, newExerciseMuscle.value)
    newExerciseName.value = ''
    newExerciseMuscle.value = ''
    showForm.value = false
  } finally {
    loading.value = false
  }
}

async function saveFromApi(apiExercise: any) {
  loading.value = true
  try {
    await searchExercises(`exercises/${apiExercise.exerciseId}`) // Fetch details to get instructions, etc
    const exerciseDetails = searchResults.value
    if (!exerciseDetails) return

    const muscle = exerciseDetails.targetMuscles ? exerciseDetails.targetMuscles.join(', ') : 'Unknown'
  
    await createExercise(
      apiExercise.name,
      muscle,
      'kg',
      exerciseDetails.gifUrl,
      exerciseDetails.instructions ? exerciseDetails.instructions.join("\n") : ''
    )

    search.value = ''
    searchResults.value = null
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="exercises">
    <div class="header">
      <h1>Exercises</h1>
      <p class="subtitle">All your exercises and personal records.</p>
    </div>

    <div class="actions">
      <button v-if="!showForm" @click="showForm = true" class="btn-primary">
        + Add Exercise
      </button>

    </div>

    <!-- Add Exercise Form -->
    <div v-if="showForm" class="form-card">
      <div class="form-header">
        <h3>Add New Exercise</h3>
        <button @click="showForm = false" class="btn-close">✕</button>
      </div>

      <form @submit.prevent="handleAddExercise" class="form">
        <div class="form-group">
          <label for="exercise-name">Exercise Name</label>
          <input type="text" id="notes" v-model="search" placeholder="Search exercises..." />
          <button type="button" class="btn-primary" @click="searchExercises(`exercises/search?search=${search}&threshold=0.7`)" :disabled="isSearching">
            {{ isSearching ? 'Searching...' : 'Search' }}
          </button>

        </div>

        <!-- Search Results from API -->
        <div v-if="searchError" class="empty-state">
          <p style="color: #ef4444;">Failed to search: {{ searchError }}</p>
        </div>

        <div v-if="searchResults" class="exercises-list"
          style="margin-bottom: 24px; border: 1px dashed #06b6d4; padding: 16px; border-radius: 12px;">

          <h3 style="margin-bottom: 12px; color: #06b6d4;">Search Results</h3>

          <div v-for="(ex, index) in searchResults" :key="ex.id || index" class="exercise-item">
            <div class="exercise-info">
              <h3 style="text-transform: capitalize;">{{ ex.name }}</h3>
              <img :src="ex.gifUrl" alt="Dynamic GIF" />
            </div>

            <button @click="saveFromApi(ex)" class="btn-primary" :disabled="loading">
              {{ loading ? 'Saving...' : 'Add to My List' }}
            </button>
          </div>

        </div>
      </form>
    </div>

    <!-- Exercises List -->
    <div v-if="exercises.length > 0" class="exercises-list">
      <div v-for="exercise in exercises" :key="exercise.id" class="exercise-item" @click="selectedExercise = exercise">

        <div class="exercise-info">
          <h3>{{ exercise.name }}</h3>
          <p class="muscle-group">{{ exercise.muscle_group }}</p>
        </div>

        <div class="exercise-meta">
          <span class="pr">PR: {{ exercise.personal_record }} {{ exercise.unit }}</span>
          <button class="btn-icon">→</button>
        </div>
      </div>

    </div>
    <div v-else class="empty-state">
      <p>No exercises yet. Create your first one!</p>
    </div>

    <!-- Exercise Details Modal -->
    <div v-if="selectedExercise" class="modal-overlay" @click.self="selectedExercise = null">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ selectedExercise.name }}</h2>
          <button @click="selectedExercise = null" class="btn-close">✕</button>
        </div>
        <div class="modal-body">
          <img :src="selectedExercise.gif_url" :alt="selectedExercise.name" />
          <p><strong>Instructions:</strong> {{ selectedExercise.instructions }}</p>
          <p><strong>Muscle Group:</strong> {{ selectedExercise.muscle_group }}</p>
          <p v-if="selectedExercise.personal_record"><strong>Personal Record:</strong> {{
            selectedExercise.personal_record }} {{ selectedExercise.unit }}</p>
          <p v-else><strong>Personal Record:</strong> Not set yet</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.exercises {
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

.actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  background-color: #06b6d4;
  color: #000000;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #0891b2;
}

.form-card {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 20px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.form-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  color: #808080;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
}

.btn-close:hover {
  color: #ffffff;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #808080;
}

input,
select {
  background-color: #262626;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  padding: 12px;
  color: #ffffff;
  font-size: 14px;
  transition: all 0.2s ease;
}

input:focus,
select:focus {
  outline: none;
  border-color: #06b6d4;
  background-color: #1f1f1f;
}

select {
  cursor: pointer;
}

.btn-submit {
  background-color: #06b6d4;
  color: #000000;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-submit:hover:not(:disabled) {
  background-color: #0891b2;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.exercises-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.exercise-item {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.exercise-item:hover {
  border-color: #06b6d4;
  background-color: #262626;
}

.exercise-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.muscle-group {
  color: #808080;
  font-size: 12px;
}

.exercise-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pr {
  color: #06b6d4;
  font-size: 12px;
  font-weight: 600;
}

.btn-icon {
  background: none;
  color: #808080;
  font-size: 18px;
  padding: 0;
  cursor: pointer;
  transition: color 0.2s ease;
  border: none;
}

.btn-icon:hover {
  color: #06b6d4;
}

.empty-state {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  color: #808080;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 16px;
}

.modal-content {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  text-transform: capitalize;
}

.modal-body p {
  margin: 0 0 12px 0;
  color: #d4d4d4;
  font-size: 16px;
}

.modal-body strong {
  color: #ffffff;
}
</style>
