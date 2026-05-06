<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getWorkoutStats } from '@/composables/useWorkouts'

interface Stats {
  workoutsThisWeek: number
  totalSets: number
  prsThisWeek: number
  lastWorkout: any
}

const stats = ref<Stats>({
  workoutsThisWeek: 0,
  totalSets: 0,
  prsThisWeek: 0,
  lastWorkout: null,
})
const loading = ref(true)

onMounted(async () => {
  try {
    const workoutStats = await getWorkoutStats()
    stats.value = workoutStats
  } catch (err) {
    console.error('Failed to load stats:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex flex-col gap-8 max-md:gap-6">
    <div class="mb-4">
      <h1 class="mb-2 text-[28px] font-bold">Dashboard</h1>
      <p class="text-sm text-neutral-500">Welcome back! Here's your workout overview.</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 max-md:grid-cols-1">
      <div class="flex flex-col gap-2 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 transition-all hover:border-cyan-500 hover:bg-[#262626]">
        <div class="text-xs font-semibold uppercase tracking-[0.5px] text-neutral-500">Workouts</div>
        <div class="text-4xl font-bold text-cyan-500">{{ stats.workoutsThisWeek }}</div>
        <div class="text-xs text-neutral-600">last 7 days</div>
      </div>
      <div class="flex flex-col gap-2 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 transition-all hover:border-cyan-500 hover:bg-[#262626]">
        <div class="text-xs font-semibold uppercase tracking-[0.5px] text-neutral-500">Sets</div>
        <div class="text-4xl font-bold text-cyan-500">{{ stats.totalSets }}</div>
        <div class="text-xs text-neutral-600">total</div>
      </div>
      <div class="flex flex-col gap-2 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 transition-all hover:border-cyan-500 hover:bg-[#262626]">
        <div class="text-xs font-semibold uppercase tracking-[0.5px] text-neutral-500">PRs</div>
        <div class="text-4xl font-bold text-cyan-500">{{ stats.prsThisWeek }}</div>
        <div class="text-xs text-neutral-600">last 7 days</div>
      </div>
    </div>

    <!-- Recent Activity Section -->
    <div class="mb-6">
      <h2 class="mb-4 text-lg font-semibold text-white">Recent Activity</h2>
      <div v-if="loading" class="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center text-neutral-500">
        <p>Loading your workouts...</p>
      </div>
      <div v-else-if="stats.lastWorkout" class="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center text-neutral-500">
        <p>Last workout: {{ stats.lastWorkout.date }}</p>
      </div>
      <div v-else class="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center text-neutral-500">
        <p>No recent workouts yet. Start logging your first workout!</p>
      </div>
    </div>

    <!-- Training Journey Section -->
    <div class="mb-6">
      <h2 class="mb-4 text-lg font-semibold text-white">Training Journey</h2>
      <div class="flex items-center justify-around rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center text-neutral-500 max-md:flex-wrap max-md:gap-6">
        <div class="flex flex-col items-center gap-2">
          <div class="h-10 w-10 rounded-full border-2 border-cyan-500 bg-cyan-500 transition-all"></div>
          <div class="text-xs font-medium text-neutral-500">Beginner</div>
        </div>
        <div class="flex flex-col items-center gap-2">
          <div class="h-10 w-10 rounded-full border-2 border-[#404040] bg-[#2a2a2a] transition-all"></div>
          <div class="text-xs font-medium text-neutral-500">Intermediate</div>
        </div>
        <div class="flex flex-col items-center gap-2">
          <div class="h-10 w-10 rounded-full border-2 border-[#404040] bg-[#2a2a2a] transition-all"></div>
          <div class="text-xs font-medium text-neutral-500">Advanced</div>
        </div>
      </div>
    </div>
  </div>
</template>
