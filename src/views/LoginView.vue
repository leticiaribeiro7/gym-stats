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
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo">GS</div>
        <h1>GymStats</h1>
        <p>Sign in to your account</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div v-if="authError" class="error-message">
          {{ authError }}
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>Don't have an account? <RouterLink to="/signup">Sign up</RouterLink></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #0f0f0f;
  padding: 20px;
}

.auth-card {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 20px;
  margin: 0 auto 16px;
}

.auth-header h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.auth-header p {
  color: #808080;
  font-size: 14px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.error-message {
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  color: #fca5a5;
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
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

input {
  background-color: #262626;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  padding: 12px;
  color: #ffffff;
  font-size: 14px;
  transition: all 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #06b6d4;
  background-color: #1f1f1f;
}

input::placeholder {
  color: #606060;
}

.btn-submit {
  background-color: #06b6d4;
  color: #000000;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-submit:hover:not(:disabled) {
  background-color: #0891b2;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  color: #808080;
  font-size: 12px;
}

.auth-footer a {
  color: #06b6d4;
  font-weight: 600;
  text-decoration: none;
}

.auth-footer a:hover {
  color: #0891b2;
}
</style>
