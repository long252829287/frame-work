<script setup lang="ts">
import { ref, onMounted } from 'vue'

const theme = ref<'light' | 'dark' | 'auto'>('light')

onMounted(() => {
  // Load saved theme preference
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' || 'light'
  theme.value = savedTheme
  applyTheme(savedTheme)
})

function applyTheme(newTheme: 'light' | 'dark' | 'auto') {
  const root = document.documentElement

  if (newTheme === 'auto') {
    // Let CSS handle auto theme with prefers-color-scheme
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', newTheme)
  }

  localStorage.setItem('theme', newTheme)
  theme.value = newTheme
}

function cycleTheme() {
  const themes: ('light' | 'dark' | 'auto')[] = ['light', 'dark', 'auto']
  const currentIndex = themes.indexOf(theme.value)
  const nextTheme = themes[(currentIndex + 1) % themes.length]
  applyTheme(nextTheme)
}

function getThemeIcon() {
  switch (theme.value) {
    case 'light':
      return '☀️'
    case 'dark':
      return '🌙'
    case 'auto':
      return '🔄'
  }
}

function getThemeLabel() {
  switch (theme.value) {
    case 'light':
      return '浅色'
    case 'dark':
      return '深色'
    case 'auto':
      return '自动'
  }
}
</script>

<template>
  <button class="theme-switcher" @click="cycleTheme" :title="`当前主题: ${getThemeLabel()}`">
    <span class="theme-icon">{{ getThemeIcon() }}</span>
    <span class="theme-label">{{ getThemeLabel() }}</span>
  </button>
</template>

<style lang="scss" scoped>
.theme-switcher {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);

  &:hover {
    background: var(--color-bg-secondary);
    border-color: var(--color-accent-primary);
    color: var(--color-accent-primary);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent-primary);
    outline-offset: 2px;
  }

  .theme-icon {
    font-size: 1.1em;
    line-height: 1;
  }

  .theme-label {
    font-weight: var(--font-weight-medium);
    line-height: 1;
  }
}

// Mobile - hide label
@media (max-width: 768px) {
  .theme-switcher {
    padding: var(--spacing-sm);

    .theme-label {
      display: none;
    }
  }
}
</style>
