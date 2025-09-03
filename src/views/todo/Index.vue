<script setup lang="ts">
import { ref } from 'vue'
import { useTodoStore, type Quadrant } from '@/stores/todo'

const store = useTodoStore()

const title = ref('')
const description = ref('')
const quadrant = ref<Quadrant>('q1')

function handleAdd() {
  const t = title.value.trim()
  if (!t) return
  store.addTodo({ title: t, description: description.value, quadrant: quadrant.value })
  title.value = ''
  description.value = ''
  quadrant.value = 'q1'
}

function move(id: string, q: Quadrant) {
  store.moveQuadrant(id, q)
}

function toggle(id: string) {
  store.toggleComplete(id)
}

function remove(id: string) {
  store.remove(id)
}
</script>

<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold">四象限待办（Eisenhower Matrix）</h1>

    <div class="bg-white/5 border border-white/10 rounded-xl p-4 shadow">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          v-model="title"
          type="text"
          placeholder="待办标题"
          class="col-span-1 md:col-span-2 px-3 py-2 rounded border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          v-model="description"
          type="text"
          placeholder="可选描述"
          class="col-span-1 md:col-span-1 px-3 py-2 rounded border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          v-model="quadrant"
          class="px-3 py-2 rounded border border-white/10 bg-white/5 focus:outline-none"
        >
          <option value="q1">紧急且重要</option>
          <option value="q2">重要不紧急</option>
          <option value="q3">紧急不重要</option>
          <option value="q4">不紧急不重要</option>
        </select>
      </div>
      <div class="mt-3 flex justify-end">
        <button
          class="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
          :disabled="!title.trim()"
          @click="handleAdd"
        >
          添加
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <section class="border border-red-400/40 rounded-xl overflow-hidden">
        <header class="bg-red-500/20 text-red-200 font-semibold px-4 py-2">紧急且重要</header>
        <ul class="divide-y divide-white/10">
          <li v-for="t in store.byQuadrant.q1" :key="t.id" class="p-3 flex items-start gap-3">
            <input type="checkbox" :checked="t.completed" @change="toggle(t.id)" />
            <div class="flex-1">
              <div class="font-medium" :class="{ 'line-through opacity-60': t.completed }">{{ t.title }}</div>
              <div v-if="t.description" class="text-sm opacity-80">{{ t.description }}</div>
              <div class="mt-2 flex flex-wrap gap-2">
                <button class="text-xs px-2 py-1 rounded bg-blue-500/20" @click="move(t.id, 'q2')">移到 重要不紧急</button>
                <button class="text-xs px-2 py-1 rounded bg-amber-500/20" @click="move(t.id, 'q3')">移到 紧急不重要</button>
                <button class="text-xs px-2 py-1 rounded bg-gray-500/20" @click="move(t.id, 'q4')">移到 不紧急不重要</button>
                <button class="text-xs px-2 py-1 rounded bg-rose-500/30" @click="remove(t.id)">删除</button>
              </div>
            </div>
          </li>
        </ul>
      </section>

      <section class="border border-emerald-400/40 rounded-xl overflow-hidden">
        <header class="bg-emerald-500/20 text-emerald-200 font-semibold px-4 py-2">重要不紧急</header>
        <ul class="divide-y divide-white/10">
          <li v-for="t in store.byQuadrant.q2" :key="t.id" class="p-3 flex items-start gap-3">
            <input type="checkbox" :checked="t.completed" @change="toggle(t.id)" />
            <div class="flex-1">
              <div class="font-medium" :class="{ 'line-through opacity-60': t.completed }">{{ t.title }}</div>
              <div v-if="t.description" class="text-sm opacity-80">{{ t.description }}</div>
              <div class="mt-2 flex flex-wrap gap-2">
                <button class="text-xs px-2 py-1 rounded bg-red-500/20" @click="move(t.id, 'q1')">移到 紧急且重要</button>
                <button class="text-xs px-2 py-1 rounded bg-amber-500/20" @click="move(t.id, 'q3')">移到 紧急不重要</button>
                <button class="text-xs px-2 py-1 rounded bg-gray-500/20" @click="move(t.id, 'q4')">移到 不紧急不重要</button>
                <button class="text-xs px-2 py-1 rounded bg-rose-500/30" @click="remove(t.id)">删除</button>
              </div>
            </div>
          </li>
        </ul>
      </section>

      <section class="border border-amber-400/40 rounded-xl overflow-hidden">
        <header class="bg-amber-500/20 text-amber-200 font-semibold px-4 py-2">紧急不重要</header>
        <ul class="divide-y divide-white/10">
          <li v-for="t in store.byQuadrant.q3" :key="t.id" class="p-3 flex items-start gap-3">
            <input type="checkbox" :checked="t.completed" @change="toggle(t.id)" />
            <div class="flex-1">
              <div class="font-medium" :class="{ 'line-through opacity-60': t.completed }">{{ t.title }}</div>
              <div v-if="t.description" class="text-sm opacity-80">{{ t.description }}</div>
              <div class="mt-2 flex flex-wrap gap-2">
                <button class="text-xs px-2 py-1 rounded bg-red-500/20" @click="move(t.id, 'q1')">移到 紧急且重要</button>
                <button class="text-xs px-2 py-1 rounded bg-green-500/20" @click="move(t.id, 'q2')">移到 重要不紧急</button>
                <button class="text-xs px-2 py-1 rounded bg-gray-500/20" @click="move(t.id, 'q4')">移到 不紧急不重要</button>
                <button class="text-xs px-2 py-1 rounded bg-rose-500/30" @click="remove(t.id)">删除</button>
              </div>
            </div>
          </li>
        </ul>
      </section>

      <section class="border border-gray-400/40 rounded-xl overflow-hidden">
        <header class="bg-gray-500/20 text-gray-200 font-semibold px-4 py-2">不紧急不重要</header>
        <ul class="divide-y divide-white/10">
          <li v-for="t in store.byQuadrant.q4" :key="t.id" class="p-3 flex items-start gap-3">
            <input type="checkbox" :checked="t.completed" @change="toggle(t.id)" />
            <div class="flex-1">
              <div class="font-medium" :class="{ 'line-through opacity-60': t.completed }">{{ t.title }}</div>
              <div v-if="t.description" class="text-sm opacity-80">{{ t.description }}</div>
              <div class="mt-2 flex flex-wrap gap-2">
                <button class="text-xs px-2 py-1 rounded bg-red-500/20" @click="move(t.id, 'q1')">移到 紧急且重要</button>
                <button class="text-xs px-2 py-1 rounded bg-green-500/20" @click="move(t.id, 'q2')">移到 重要不紧急</button>
                <button class="text-xs px-2 py-1 rounded bg-amber-500/20" @click="move(t.id, 'q3')">移到 紧急不重要</button>
                <button class="text-xs px-2 py-1 rounded bg-rose-500/30" @click="remove(t.id)">删除</button>
              </div>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <section class="bg-white/5 border border-white/10 rounded-xl p-4">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold">已完成</h2>
        <button class="text-sm text-rose-300 hover:text-rose-200" @click="store.clearCompleted()">清空</button>
      </div>
      <ul class="mt-2 divide-y divide-white/10">
        <li v-for="t in store.byQuadrant.done" :key="t.id" class="p-3 flex items-start gap-3 opacity-70">
          <input type="checkbox" :checked="t.completed" @change="toggle(t.id)" />
          <div class="flex-1">
            <div class="line-through">{{ t.title }}</div>
            <div v-if="t.description" class="text-sm">{{ t.description }}</div>
          </div>
          <button class="text-xs px-2 py-1 rounded bg-rose-500/30" @click="remove(t.id)">删除</button>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
</style>

<template></template>
