/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apolloClient } from '@/apollo/client'
import {
  GET_TODOS,
  ADD_TODO,
  TOGGLE_TODO,
  DELETE_TODO,
  TODOS_SUB,
} from '@/graphql/todos'

// ── Types ──────────────────────────────────────────────────────────────────
export type Todo = {
  id: string
  title: string
  is_done: boolean
  created_at: string
}

export type FilterType = 'all' | 'active' | 'done'

// ── Store ──────────────────────────────────────────────────────────────────
export const useTodoStore = defineStore('todo', () => {

  const todos   = ref<Todo[]>([])
  const loading = ref(false)
  const error   = ref<string | null>(null)
  const filter  = ref<FilterType>('all')

  // ── Challenge 1: Computed filters ───────────────────────────────────────
  const activeTodos = computed(() => todos.value.filter(t => !t.is_done))
  const doneTodos   = computed(() => todos.value.filter(t =>  t.is_done))

  const filteredTodos = computed<Todo[]>(() => {
    if (filter.value === 'active') return activeTodos.value
    if (filter.value === 'done')   return doneTodos.value
    return todos.value
  })

  const counts = computed(() => ({
    all:    todos.value.length,
    active: activeTodos.value.length,
    done:   doneTodos.value.length,
  }))

  function setFilter(f: FilterType) {
    filter.value = f
  }

  // ── Fetch ────────────────────────────────────────────────────────────────
  async function fetchTodos() {
    loading.value = true
    error.value   = null
    try {
      const { data } = await apolloClient.query<{ todos: Todo[] }>({
        query: GET_TODOS,
        fetchPolicy: 'network-only',
      })
      todos.value = data.todos
    } catch (e: any) {
      error.value = e.message ?? 'Failed to load todos'
    } finally {
      loading.value = false
    }
  }

  // ── Challenge 2 + 3: Optimistic UI + Apollo cache ───────────────────────
  async function addTodo(title: string) {
    const clean = title.trim()
    if (!clean) return

    // Optimistic: insert temp immediately
    const tempId = `temp-${Date.now()}`
    const optimistic: Todo = {
      id: tempId,
      title: clean,
      is_done: false,
      created_at: new Date().toISOString(),
    }
    todos.value = [optimistic, ...todos.value]

    try {
      const result = await apolloClient.mutate({
        mutation: ADD_TODO,
        variables: { title: clean },
        // Challenge 3: write new item into Apollo cache
        update(cache, { data }) {
          const newTodo = data?.insert_todos_one
          if (!newTodo) return
          const existing = cache.readQuery<{ todos: Todo[] }>({ query: GET_TODOS })
          if (existing) {
            cache.writeQuery({
              query: GET_TODOS,
              data: { todos: [newTodo, ...existing.todos] },
            })
          }
        },
      })

      // Fix: safely extract and type-assert the real todo
      const raw = result.data?.insert_todos_one
      if (raw?.id && raw?.title && raw?.created_at !== undefined) {
        const realTodo: Todo = {
          id: raw.id as string,
          title: raw.title as string,
          is_done: (raw.is_done ?? false) as boolean,
          created_at: raw.created_at as string,
        }
        todos.value = todos.value.map(t => (t.id === tempId ? realTodo : t))
      } else {
        // Fallback: refetch if response shape is unexpected
        await fetchTodos()
      }
    } catch (e: any) {
      // Rollback optimistic update
      todos.value = todos.value.filter(t => t.id !== tempId)
      error.value = 'Failed to add todo'
    }
  }

  async function toggleTodo(todo: Todo) {
      await apolloClient.mutate({
      mutation: TOGGLE_TODO,
      variables: { id: todo.id, done: !todo.is_done },
      })
  }
  
  async function deleteTodo(id: string) {
    // Optimistic: remove immediately
    const backup = [...todos.value]
    todos.value = todos.value.filter(t => t.id !== id)

    try {
      await apolloClient.mutate({
        mutation: DELETE_TODO,
        variables: { id },
        // Challenge 3: remove from cache
        update(cache) {
          const existing = cache.readQuery<{ todos: Todo[] }>({ query: GET_TODOS })
          if (existing) {
            cache.writeQuery({
              query: GET_TODOS,
              data: { todos: existing.todos.filter(t => t.id !== id) },
            })
          }
        },
      })
    } catch (e: any) {
      // Rollback
      todos.value = backup
      error.value = 'Failed to delete todo'
    }
  }

  // ── Real-time subscription ───────────────────────────────────────────────
  function startRealtime() {
    const obs = apolloClient.subscribe<{ todos: Todo[] }>({ query: TODOS_SUB })
    const sub = obs.subscribe({
      next: ({ data }) => {
        if (data?.todos) todos.value = data.todos
      },
      error: (e) => console.error('Subscription error', e),
    })
    return () => sub.unsubscribe()
  }

  return {
    todos,
    loading,
    error,
    filter,
    filteredTodos,
    activeTodos,
    doneTodos,
    counts,
    setFilter,
    fetchTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    startRealtime,
  }
})