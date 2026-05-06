<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signIn, error as authError, loading } from '@/composables/useAuth'

const router = useRouter()
const email = ref('')
const password = ref('')

async function handleLogin() {
  try {
    await signIn(email.value, password.value)
    router.push('/')
  } catch (err) {
    // Error is handled in useAuth composable
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-[#0f0f0f] p-5 text-white">
    <div class="w-full max-w-[400px] rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
      <div class="mb-8 text-center">
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 text-xl font-bold">GS</div>
        <h1 class="mb-2 text-2xl font-bold">GymStats</h1>
        <p class="text-sm text-neutral-500">Sign in to your account</p>
      </div>

      <form @submit.prevent="handleLogin" class="mb-6 flex flex-col gap-4">
        <div v-if="authError" class="rounded-lg border border-red-500 bg-red-500/10 p-3 text-xs text-red-300">
          {{ authError }}
        </div>

        <div class="flex flex-col gap-2">
          <label for="email" class="text-xs font-semibold uppercase tracking-[0.5px] text-neutral-500">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="you@example.com"
            required
            class="rounded-lg border border-[#3a3a3a] bg-[#262626] p-3 text-sm text-white transition-all placeholder:text-neutral-600 focus:border-cyan-500 focus:bg-[#1f1f1f] focus:outline-none"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="password" class="text-xs font-semibold uppercase tracking-[0.5px] text-neutral-500">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            class="rounded-lg border border-[#3a3a3a] bg-[#262626] p-3 text-sm text-white transition-all placeholder:text-neutral-600 focus:border-cyan-500 focus:bg-[#1f1f1f] focus:outline-none"
          />
        </div>

        <button type="submit" class="cursor-pointer rounded-lg bg-cyan-500 p-3 text-sm font-semibold text-black transition-all hover:not-disabled:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <div class="text-center text-xs text-neutral-500">
        <p>Don't have an account? <RouterLink to="/signup" class="font-semibold text-cyan-500 hover:text-cyan-600">Sign up</RouterLink></p>
      </div>
    </div>
  </div>
</template>
