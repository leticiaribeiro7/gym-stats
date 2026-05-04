<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { exercises, fetchExercises } from '@/composables/useWorkouts'

const loading = ref(true)
const error = ref('')

const muscleGroups = computed(() => {
  const groups = new Map<
    string,
    { name: string; count: number; totalPr: number; unit: string }
  >()

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
  <div class="muscle">
    <div class="header">
      <h1>Muscle Groups</h1>
      <p class="subtitle">Track your training volume by muscle group.</p>
    </div>

    <div v-if="loading" class="empty-state">
      <p>Loading muscle group data...</p>
    </div>

    <div v-else-if="error" class="empty-state">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="muscleGroups.length === 0" class="empty-state">
      <p>No exercises found yet. Add some exercises to populate muscle stats.</p>
    </div>

    <div v-else class="muscles-grid">
      <div v-for="(muscle, index) in muscleGroups" :key="index" class="muscle-card">
        <div class="muscle-header">
          <h3>{{ muscle.name }}</h3>
          <div class="color-indicator"></div>
        </div>
        <div class="muscle-stats">
          <div class="stat">
            <div class="stat-label">Exercises</div>
            <div class="stat-value">{{ muscle.count }}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Avg PR</div>
            <div class="stat-value">{{ muscle.averagePr }} {{ muscle.unit }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.muscle {
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

.muscles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.muscle-card {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.muscle-card:hover {
  border-color: #06b6d4;
  background-color: #262626;
}

.muscle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.muscle-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.muscle-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: #808080;
  font-size: 12px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #06b6d4;
}
</style>
