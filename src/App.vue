<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { isLoggedIn, signOut } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const router = useRouter()

async function handleSignOut() {
  await signOut()
  router.push('/login')
}
</script>

<template>
  <div class="app-wrapper">
    <div v-if="isLoggedIn" class="app-container">
      <!-- Sidebar Navigation -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo-container">
            <div class="logo">GS</div>
          </div>
          <h1 class="app-title">GymStats</h1>
        </div>

        <nav class="nav-menu">
          <RouterLink to="/" class="nav-link" active-class="active">
            <span class="nav-icon">📊</span>
            <span class="nav-label">Dashboard</span>
          </RouterLink>
          <RouterLink to="/exercises" class="nav-link" active-class="active">
            <span class="nav-icon">💪</span>
            <span class="nav-label">Exercises</span>
          </RouterLink>
          <RouterLink to="/muscle" class="nav-link" active-class="active">
            <span class="nav-icon">🦵</span>
            <span class="nav-label">Muscle</span>
          </RouterLink>
          <RouterLink to="/history" class="nav-link" active-class="active">
            <span class="nav-icon">📈</span>
            <span class="nav-label">History</span>
          </RouterLink>
        </nav>

        <div class="sidebar-footer">
          <button @click="handleSignOut" class="btn-signout">
            <span class="nav-icon">🚪</span>
            <span class="nav-label">Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <RouterView />
      </main>
    </div>

    <div v-else>
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.app-wrapper {
  height: 100vh;
}

.app-container {
  display: flex;
  height: 100vh;
  background-color: #0f0f0f;
  color: #ffffff;
}

.sidebar {
  width: 250px;
  background-color: #1a1a1a;
  border-right: 1px solid #2a2a2a;
  padding: 24px 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.logo-container {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo {
  font-weight: 700;
  font-size: 18px;
  color: #ffffff;
}

.app-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: #a0a0a0;
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.nav-link:hover {
  background-color: #2a2a2a;
  color: #ffffff;
}

.nav-link.active {
  background-color: #06b6d4;
  color: #000000;
}

.nav-icon {
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-label {
  white-space: nowrap;
}

.sidebar-footer {
  margin-top: 24px;
  border-top: 1px solid #2a2a2a;
  padding-top: 16px;
}

.btn-signout {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  background: none;
  border: none;
  color: #a0a0a0;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  width: 100%;
  transition: all 0.2s ease;
}

.btn-signout:hover {
  background-color: #2a2a2a;
  color: #ffffff;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: #3a3a3a;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #4a4a4a;
}

@media (max-width: 768px) {
  .sidebar {
    width: 60px;
    padding: 16px 8px;
  }

  .sidebar-header {
    margin-bottom: 24px;
    justify-content: center;
  }

  .app-title {
    display: none;
  }

  .nav-label {
    display: none;
  }

  .nav-link,
  .btn-signout {
    justify-content: center;
    padding: 12px;
  }
}
</style>
