import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'
import type { User, Session } from '@supabase/supabase-js'

export const user = ref<User | null>(null)
export const session = ref<Session | null>(null)
export const loading = ref(false)
export const error = ref('')

export const isLoggedIn = computed(() => !!session.value)

// Initialize auth state
export async function initAuth() {
  const { data: { session: currentSession } } = await supabase.auth.getSession()
  session.value = currentSession
  user.value = currentSession?.user || null
}

// Sign up with email
export async function signUp(email: string, password: string) {
  loading.value = true
  error.value = ''

  try {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) throw signUpError

    return data
  } catch (err: any) {
    error.value = err.message || 'Sign up failed'
    throw err
  } finally {
    loading.value = false
  }
}

// Sign in with email
export async function signIn(email: string, password: string) {
  loading.value = true
  error.value = ''

  try {
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) throw signInError

    session.value = data.session
    user.value = data.user
    return data
  } catch (err: any) {
    error.value = err.message || 'Sign in failed'
    throw err
  } finally {
    loading.value = false
  }
}

// Sign out
export async function signOut() {
  loading.value = true
  error.value = ''

  try {
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) throw signOutError

    session.value = null
    user.value = null
  } catch (err: any) {
    error.value = err.message || 'Sign out failed'
    throw err
  } finally {
    loading.value = false
  }
}

// Listen to auth changes
supabase.auth.onAuthStateChange((event, currentSession) => {
  session.value = currentSession
  user.value = currentSession?.user || null
})


