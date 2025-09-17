import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export type Quadrant = 'q1' | 'q2' | 'q3' | 'q4' // q1: 紧急且重要, q2: 重要不紧急, q3: 紧急不重要, q4: 不紧急不重要

export interface TodoItem {
  id: string
  title: string
  description?: string
  quadrant: Quadrant
  completed: boolean
  createdAt: number
}

const STORAGE_KEY = 'todos.eisenhower.v1'

function loadFromStorage(): TodoItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed
    }
    return []
  } catch {
    return []
  }
}

export const useTodoStore = defineStore('todo', () => {
  const todos = ref<TodoItem[]>(loadFromStorage())

  watch(
    todos,
    (val) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    },
    { deep: true },
  )

  const byQuadrant = computed(() => ({
    q1: todos.value.filter((t) => t.quadrant === 'q1' && !t.completed),
    q2: todos.value.filter((t) => t.quadrant === 'q2' && !t.completed),
    q3: todos.value.filter((t) => t.quadrant === 'q3' && !t.completed),
    q4: todos.value.filter((t) => t.quadrant === 'q4' && !t.completed),
    done: todos.value.filter((t) => t.completed),
  }))

  function addTodo(payload: { title: string; description?: string; quadrant: Quadrant }) {
    const newItem: TodoItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: payload.title.trim(),
      description: payload.description?.trim(),
      quadrant: payload.quadrant,
      completed: false,
      createdAt: Date.now(),
    }
    todos.value.unshift(newItem)
  }

  function toggleComplete(id: string) {
    const t = todos.value.find((i) => i.id === id)
    if (t) t.completed = !t.completed
  }

  function moveQuadrant(id: string, quadrant: Quadrant) {
    const t = todos.value.find((i) => i.id === id)
    if (t) t.quadrant = quadrant
  }

  function remove(id: string) {
    todos.value = todos.value.filter((i) => i.id !== id)
  }

  function clearCompleted() {
    todos.value = todos.value.filter((i) => !i.completed)
  }

  return {
    todos,
    byQuadrant,
    addTodo,
    toggleComplete,
    moveQuadrant,
    remove,
    clearCompleted,
  }
})
