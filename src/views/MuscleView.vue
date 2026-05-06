<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { exercises, fetchExercises } from '@/composables/useWorkouts'

const loading = ref(true)
const error = ref('')

const muscleGroups = computed(() => {
  const groups = new Map<
    string,
    { name: string; count: number; totalPr: number; unit: string }>()

  exercises.value.forEach((exercise) => {
    const muscleGroup = exercise.muscle_group || 'Unknown'
    const existing = groups.get(muscleGroup)

    if (existing) {
      existing.count += 1
      existing.totalPr += Number(exercise.personal_record ?? 0)
    } else {
      groups.set(muscleGroup, {
        name: muscleGroup,
        count: 1,
        totalPr: Number(exercise.personal_record ?? 0),
        unit: exercise.unit || 'kg',
      })
    }
  })

  return Array.from(groups.values()).map((group) => ({
    ...group,
    averagePr: group.count ? Math.round((group.totalPr / group.count) * 100) / 100 : 0,
  }))
})

onMounted(async () => {
  try {
    await fetchExercises()
  } catch (err: any) {
    error.value = err.message || 'Failed to load muscle group data'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="mb-2 text-[28px] font-bold">Muscle Groups</h1>
      <p class="text-sm text-neutral-500">Track your training volume by muscle group.</p>
    </div>

    <div v-if="loading" class="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center text-neutral-500">
      <p>Loading muscle group data...</p>
    </div>

    <div v-else-if="error" class="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center text-neutral-500">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="muscleGroups.length === 0" class="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center text-neutral-500">
      <p>No exercises found yet. Add some exercises to populate muscle stats.</p>
    </div>

    <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
      <div v-for="(muscle, index) in muscleGroups" :key="index" class="cursor-pointer rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 transition-all hover:border-cyan-500 hover:bg-[#262626]">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold">{{ muscle.name }}</h3>
          <div class="h-3 w-3 rounded-full bg-cyan-500"></div>
        </div>
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <div class="text-xs text-neutral-500">Exercises</div>
            <div class="text-base font-semibold text-cyan-500">{{ muscle.count }}</div>
          </div>
          <div class="flex items-center justify-between">
            <div class="text-xs text-neutral-500">Avg PR</div>
            <div class="text-base font-semibold text-cyan-500">{{ muscle.averagePr }} {{ muscle.unit }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
