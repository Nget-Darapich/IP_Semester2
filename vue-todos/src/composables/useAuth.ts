import { ref, computed } from 'vue'
import { apolloClient } from '@/apollo/client'

export type Role = 'anonymous' | 'teacher'

// Reactive role state
const currentRole = ref<Role>(
  (import.meta.env.VITE_HASURA_ROLE as Role) ?? 'anonymous'
)

export function useAuth() {
  const isTeacher = computed(() => currentRole.value === 'teacher')
  const isAnonymous = computed(() => currentRole.value === 'anonymous')

  function switchRole(role: Role) {
    currentRole.value = role
    // Clear Apollo cache so data reloads with new role headers
    apolloClient.resetStore()
  }

  function getHeaders() {
    return {
      'x-hasura-role': currentRole.value,
      'x-hasura-admin-secret': import.meta.env.VITE_HASURA_ADMIN_SECRET,
    }
  }

  return { currentRole, isTeacher, isAnonymous, switchRole, getHeaders }
}