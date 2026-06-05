<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useTodoStore }  from '@/stores/todo.store'
import { useAuth }       from '@/composables/useAuth'
import type { FilterType } from '@/stores/todo.store'

const todoStore = useTodoStore()
const { currentRole, isTeacher, switchRole } = useAuth()

const title = ref('')
let stopRealtime: null | (() => void) = null

onMounted(async () => {
  await todoStore.fetchTodos()
  stopRealtime = todoStore.startRealtime()
})

onBeforeUnmount(() => stopRealtime?.())

function onAdd() {
  if (!title.value.trim()) return
  todoStore.addTodo(title.value)
  title.value = ''
}
</script>

<template>
  <div class="todo-app">

    <!-- ── Challenge 4: Role switcher ── -->
    <div class="role-bar">
      <span class="role-label">Role:</span>
      <button
        :class="{ active: currentRole === 'anonymous' }"
        @click="switchRole('anonymous')"
      >
        👁 Anonymous
      </button>
      <button
        :class="{ active: currentRole === 'teacher' }"
        @click="switchRole('teacher')"
      >
        ✏️ Teacher
      </button>
    </div>

    <h1>📝 My Todos</h1>

    <!-- ── Add form: hidden for anonymous (Challenge 4) ── -->
    <div v-if="isTeacher" class="add-form">
      <input
        v-model="title"
        placeholder="What needs to be done?"
        @keyup.enter="onAdd"
      />
      <button @click="onAdd">Add</button>
    </div>
    <p v-else class="readonly-notice">
      👁 Read-only mode — switch to Teacher to add, edit, or delete.
    </p>

    <!-- ── Challenge 1: Filter tabs ── -->
    <div class="tabs">
      <button
        v-for="tab in (['all', 'active', 'done'] as FilterType[])"
        :key="tab"
        :class="{ active: todoStore.filter === tab }"
        @click="todoStore.setFilter(tab)"
      >
        {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
        <span class="badge">{{ todoStore.counts[tab] }}</span>
      </button>
    </div>

    <!-- Error -->
    <p v-if="todoStore.error" class="error">⚠️ {{ todoStore.error }}</p>

    <!-- Loading -->
    <p v-if="todoStore.loading" class="muted">Loading...</p>

    <!-- ── Todo list: uses filteredTodos (Challenge 1) ── -->
    <ul v-else-if="todoStore.filteredTodos.length > 0">
      <li
        v-for="todo in todoStore.filteredTodos"
        :key="todo.id"
        :class="{
          done: todo.is_done,
          saving: todo.id.startsWith('temp-'),
        }"
      >
        <!-- Checkbox: disabled for anonymous (Challenge 4) -->
        <input
          type="checkbox"
          :checked="todo.is_done"
          :disabled="!isTeacher"
          @change="todoStore.toggleTodo(todo)"
        />

        <span class="todo-title">{{ todo.title }}</span>

        <!-- Challenge 2: saving indicator while optimistic temp id exists -->
        <span v-if="todo.id.startsWith('temp-')" class="saving-text">
          saving…
        </span>

        <!-- Delete: hidden for anonymous (Challenge 4) -->
        <button
          v-if="isTeacher"
          class="delete-btn"
          :disabled="todo.id.startsWith('temp-')"
          @click="todoStore.deleteTodo(todo.id)"
        >
          ✕
        </button>
      </li>
    </ul>

    <p v-else class="muted">
      No todos here.
      <span v-if="isTeacher">Add one above!</span>
    </p>

    <!-- Stats footer -->
    <div class="stats">
      <span>{{ todoStore.counts.active }} remaining</span>
      <span>{{ todoStore.counts.done }} done</span>
    </div>

  </div>
</template>

<style scoped>
.todo-app {
  max-width: 520px;
  margin: 40px auto;
  font-family: sans-serif;
  padding: 0 16px;
}

/* Role bar */
.role-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}
.role-label {
  font-size: 13px;
  color: #6b7280;
}
.role-bar button {
  padding: 4px 14px;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  background: white;
  color: #374151;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
}
.role-bar button.active {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

/* Heading */
h1 {
  text-align: center;
  font-size: 22px;
  margin-bottom: 20px;
}

/* Add form */
.add-form {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.add-form input {
  flex: 1;
  padding: 9px 12px;
  border: 1px solid #d1d5db;
  border-radius: 7px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.15s;
}
.add-form input:focus {
  border-color: #4f46e5;
}
.add-form button {
  padding: 9px 18px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  font-size: 15px;
  transition: background 0.15s;
}
.add-form button:hover {
  background: #4338ca;
}

.readonly-notice {
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 16px;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.tabs button {
  flex: 1;
  padding: 7px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  background: #f9fafb;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.15s;
}
.tabs button.active {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}
.badge {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 1px 7px;
  font-size: 12px;
}
.tabs button.active .badge {
  background: rgba(255, 255, 255, 0.25);
}

/* List */
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 8px;
  background: white;
  transition: opacity 0.2s;
}

/* Challenge 2: faded while optimistic save in progress */
li.saving {
  opacity: 0.55;
}

li.done .todo-title {
  text-decoration: line-through;
  color: #9ca3af;
}

li input[type='checkbox'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #4f46e5;
  flex-shrink: 0;
}
li input[type='checkbox']:disabled {
  cursor: not-allowed;
}

.todo-title {
  flex: 1;
  font-size: 15px;
  color: #111827;
}

.saving-text {
  font-size: 11px;
  color: #9ca3af;
  flex-shrink: 0;
}

.delete-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 16px;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background 0.15s;
  flex-shrink: 0;
}
.delete-btn:hover:not(:disabled) {
  background: #fee2e2;
}
.delete-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Misc */
.error {
  color: #ef4444;
  text-align: center;
  margin-bottom: 12px;
}
.muted {
  text-align: center;
  color: #9ca3af;
  padding: 2rem 0;
  font-size: 14px;
}

/* Stats footer */
.stats {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #9ca3af;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}
</style>