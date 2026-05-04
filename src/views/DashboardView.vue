<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getWorkoutStats } from '@/composables/useWorkouts'

interface Stats {
  workoutsThisWeek: number
  totalSets: number
  lastWorkout: any
}

const stats = ref<Stats>({
  workoutsThisWeek: 0,
  totalSets: 0,
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
  <div class="dashboard">
    <div class="header">
      <h1>Dashboard</h1>
      <p class="subtitle">Welcome back! Here's your workout overview.</p>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Workouts</div>
        <div class="stat-value">{{ stats.workoutsThisWeek }}</div>
        <div class="stat-unit">this week</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Sets</div>
        <div class="stat-value">{{ stats.totalSets }}</div>
        <div class="stat-unit">total</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">PRs</div>
        <div class="stat-value">3</div>
        <div class="stat-unit">this week</div>
      </div>
    </div>

    <!-- Recent Activity Section -->
    <div class="section">
      <h2 class="section-title">Recent Activity</h2>
      <div v-if="loading" class="activity-placeholder">
        <p>Loading your workouts...</p>
      </div>
      <div v-else-if="stats.lastWorkout" class="activity-placeholder">
        <p>Last workout: {{ stats.lastWorkout.date }}</p>
      </div>
      <div v-else class="activity-placeholder">
        <p>No recent workouts yet. Start logging your first workout!</p>
      </div>
    </div>

    <!-- Training Journey Section -->
    <div class="section">
      <h2 class="section-title">Training Journey</h2>
      <div class="journey-placeholder">
        <div class="journey-step">
          <div class="step-dot active"></div>
          <div class="step-label">Beginner</div>
        </div>
        <div class="journey-step">
          <div class="step-dot"></div>
          <div class="step-label">Intermediate</div>
        </div>
        <div class="journey-step">
          <div class="step-dot"></div>
          <div class="step-label">Advanced</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.header {
  margin-bottom: 16px;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: #06b6d4;
  background-color: #262626;
}

.stat-label {
  color: #808080;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #06b6d4;
}

.stat-unit {
  color: #606060;
  font-size: 12px;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #ffffff;
}

.activity-placeholder,
.journey-placeholder {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  color: #808080;
}

.journey-placeholder {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.journey-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #2a2a2a;
  border: 2px solid #404040;
  transition: all 0.2s ease;
}

.step-dot.active {
  background-color: #06b6d4;
  border-color: #06b6d4;
}

.step-label {
  font-size: 12px;
  color: #808080;
  font-weight: 500;
}

@media (max-width: 768px) {
  .dashboard {
    gap: 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .journey-placeholder {
    flex-wrap: wrap;
    gap: 24px;
  }
}
</style>
