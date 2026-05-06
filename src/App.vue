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
  <div class="h-screen bg-[#0f0f0f] text-white">
    <div v-if="isLoggedIn" class="flex h-screen bg-[#0f0f0f] text-white">
      <!-- Sidebar Navigation -->
      <aside class="flex w-[250px] shrink-0 flex-col overflow-y-auto border-r border-[#2a2a2a] bg-[#1a1a1a] px-4 py-6 max-md:w-[60px] max-md:px-2 max-md:py-4">
        <div class="mb-8 flex items-center gap-3 max-md:mb-6 max-md:justify-center">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600">
            <div class="text-lg font-bold text-white">GS</div>
          </div>
          <h1 class="m-0 text-xl font-semibold max-md:hidden">GymStats</h1>
        </div>

        <nav class="flex flex-1 flex-col gap-2">
          <RouterLink to="/" class="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-neutral-400 transition-all hover:bg-[#2a2a2a] hover:text-white [&.active]:bg-cyan-500 [&.active]:text-black max-md:justify-center max-md:p-3" active-class="active">
            <span class="flex items-center justify-center text-lg">📊</span>
            <span class="whitespace-nowrap max-md:hidden">Dashboard</span>
          </RouterLink>
          <RouterLink to="/exercises" class="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-neutral-400 transition-all hover:bg-[#2a2a2a] hover:text-white [&.active]:bg-cyan-500 [&.active]:text-black max-md:justify-center max-md:p-3" active-class="active">
            <span class="flex items-center justify-center text-lg">💪</span>
            <span class="whitespace-nowrap max-md:hidden">Exercises</span>
          </RouterLink>
          <RouterLink to="/muscle" class="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-neutral-400 transition-all hover:bg-[#2a2a2a] hover:text-white [&.active]:bg-cyan-500 [&.active]:text-black max-md:justify-center max-md:p-3" active-class="active">
            <span class="flex items-center justify-center text-lg">🦵</span>
            <span class="whitespace-nowrap max-md:hidden">Muscle</span>
          </RouterLink>
          <RouterLink to="/history" class="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-neutral-400 transition-all hover:bg-[#2a2a2a] hover:text-white [&.active]:bg-cyan-500 [&.active]:text-black max-md:justify-center max-md:p-3" active-class="active">
            <span class="flex items-center justify-center text-lg">📈</span>
            <span class="whitespace-nowrap max-md:hidden">History</span>
          </RouterLink>
        </nav>

        <div class="mt-6 border-t border-[#2a2a2a] pt-4">
          <button @click="handleSignOut" class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-neutral-400 transition-all hover:bg-[#2a2a2a] hover:text-white max-md:justify-center max-md:p-3">
            <span class="flex items-center justify-center text-lg">🚪</span>
            <span class="whitespace-nowrap max-md:hidden">Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto px-8 py-6 max-md:px-4">
        <RouterView />
      </main>
    </div>

    <div v-else>
      <RouterView />
    </div>
  </div>
</template>
