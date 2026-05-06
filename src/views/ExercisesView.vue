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
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="mb-2 text-[28px] font-bold">Exercises</h1>
      <p class="text-sm text-neutral-500">All your exercises and personal records.</p>
    </div>

    <div class="flex gap-3">
      <button v-if="!showForm" @click="showForm = true" class="cursor-pointer rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-cyan-600">
        + Add Exercise
      </button>
    </div>

    <!-- Add Exercise Form -->
    <div v-if="showForm" class="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-base font-semibold">Add New Exercise</h3>
        <button @click="showForm = false" class="cursor-pointer bg-transparent p-0 text-xl text-neutral-500 hover:text-white">✕</button>
      </div>

      <form @submit.prevent="handleAddExercise" class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="exercise-name" class="text-xs font-semibold uppercase tracking-[0.5px] text-neutral-500">Exercise Name</label>
          <input type="text" id="notes" v-model="search" placeholder="Search exercises..." class="rounded-lg border border-[#3a3a3a] bg-[#262626] p-3 text-sm text-white transition-all focus:border-cyan-500 focus:bg-[#1f1f1f] focus:outline-none" />
          <button type="button" class="cursor-pointer rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50" @click="searchExercises(`exercises/search?search=${search}&threshold=0.7`)" :disabled="isSearching">
            {{ isSearching ? 'Searching...' : 'Search' }}
          </button>
        </div>

        <!-- Search Results from API -->
        <div v-if="searchError" class="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center text-neutral-500">
          <p class="text-red-500">Failed to search: {{ searchError }}</p>
        </div>

        <div v-if="searchResults" class="mb-6 flex flex-col gap-3 rounded-xl border border-dashed border-cyan-500 p-4">

          <h3 class="mb-3 text-cyan-500">Search Results</h3>

          <div v-for="(ex, index) in searchResults" :key="ex.id || index" class="flex cursor-pointer items-center justify-between rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 transition-all hover:border-cyan-500 hover:bg-[#262626]">
            <div>
              <h3 class="mb-1 text-base font-semibold capitalize">{{ ex.name }}</h3>
              <img :src="ex.gifUrl" alt="Dynamic GIF" class="mt-2 max-h-40 rounded-lg" />
            </div>

            <button @click="saveFromApi(ex)" class="cursor-pointer rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50" :disabled="loading">
              {{ loading ? 'Saving...' : 'Add to My List' }}
            </button>
          </div>

        </div>
      </form>
    </div>

    <!-- Exercises List -->
    <div v-if="exercises.length > 0" class="flex flex-col gap-3">
      <div v-for="exercise in exercises" :key="exercise.id" class="flex cursor-pointer items-center justify-between rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 transition-all hover:border-cyan-500 hover:bg-[#262626]" @click="selectedExercise = exercise">

        <div>
          <h3 class="mb-1 text-base font-semibold">{{ exercise.name }}</h3>
          <p class="text-xs text-neutral-500">{{ exercise.muscle_group }}</p>
        </div>

        <div class="flex items-center gap-4">
          <span class="text-xs font-semibold text-cyan-500">PR: {{ exercise.personal_record }} {{ exercise.unit }}</span>
          <button class="cursor-pointer bg-transparent p-0 text-lg text-neutral-500 transition-colors hover:text-cyan-500">→</button>
        </div>
      </div>

    </div>
    <div v-else class="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center text-neutral-500">
      <p>No exercises yet. Create your first one!</p>
    </div>

    <!-- Exercise Details Modal -->
    <div v-if="selectedExercise" class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 p-4" @click.self="selectedExercise = null">
      <div class="w-full max-w-[500px] rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-6">
        <div class="mb-5 flex items-center justify-between">
          <h2 class="m-0 text-xl font-bold capitalize">{{ selectedExercise.name }}</h2>
          <button @click="selectedExercise = null" class="cursor-pointer bg-transparent p-0 text-xl text-neutral-500 hover:text-white">✕</button>
        </div>
        <div class="[&_p]:mb-3 [&_p]:text-base [&_p]:text-neutral-300 [&_strong]:text-white">
          <img :src="selectedExercise.gif_url" :alt="selectedExercise.name" class="mb-4 max-h-64 rounded-lg" />
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
