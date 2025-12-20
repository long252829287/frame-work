<template>
  <div ref="noteEl" class="note-item" :style="style" :title="`${props.note.createdBy}:${props.note.content}`">
    <div class="note-content">
      {{ getDisplayText(props.note) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDraggable } from '@vueuse/core'
import type { QuadrantNote } from '@/types'
import type { StyleValue } from 'vue'

const props = defineProps<{
  note: QuadrantNote
}>()

const emit = defineEmits<{
  (e: 'drag-move', position: { x: number; y: number }): void
  (e: 'drag-end', position: { x: number; y: number }): void
}>()

const noteEl = ref<HTMLElement | null>(null)

type DragBaseRect = { left: number; top: number }

const fixedContainingBlockEl = ref<HTMLElement | null>(null)
const fixedContainingBlockRect = ref<DragBaseRect>({ left: 0, top: 0 })

function findFixedContainingBlock(el: HTMLElement): HTMLElement | null {
  // For `position: fixed`, browsers may use a non-viewport containing block when an ancestor has
  // `transform` / `filter` / `backdrop-filter` / `perspective` / `contain: paint` / `will-change`.
  // In that case, using viewport-based `clientX/clientY` directly causes a down-right jump.
  let current: HTMLElement | null = el.parentElement
  while (current) {
    const style = window.getComputedStyle(current)
    const hasTransform = style.transform !== 'none'
    const hasFilter = style.filter !== 'none'
    const hasPerspective = style.perspective !== 'none'
    const hasContainPaint = (style.contain || '').includes('paint')
    const hasWillChange = (style.willChange || '').includes('transform') || (style.willChange || '').includes('filter')
    const backdropFilter = (style as any).backdropFilter as string | undefined
    const hasBackdropFilter = !!backdropFilter && backdropFilter !== 'none'

    if (hasTransform || hasFilter || hasBackdropFilter || hasPerspective || hasContainPaint || hasWillChange) {
      return current
    }

    current = current.parentElement
  }
  return null
}

function updateFixedContainingBlockRect(): void {
  if (!fixedContainingBlockEl.value) {
    fixedContainingBlockRect.value = { left: 0, top: 0 }
    return
  }
  const rect = fixedContainingBlockEl.value.getBoundingClientRect()
  fixedContainingBlockRect.value = { left: rect.left, top: rect.top }
}

const { x, y, isDragging } = useDraggable(noteEl, {
  onStart: (position, event) => {
    document.body.style.cursor = 'grabbing'
    if (noteEl.value) {
      fixedContainingBlockEl.value = findFixedContainingBlock(noteEl.value)
      updateFixedContainingBlockRect()
    }
    // Prevent the note from jumping to (0,0) before the first pointermove.
    // `position` is the pointer offset inside the element.
    x.value = event.clientX - position.x
    y.value = event.clientY - position.y
  },
  onMove: (_, event) => {
    updateFixedContainingBlockRect()
    emit('drag-move', { x: event.clientX, y: event.clientY })
  },
  onEnd: (_, event) => {
    document.body.style.cursor = ''
    fixedContainingBlockEl.value = null
    fixedContainingBlockRect.value = { left: 0, top: 0 }
    emit('drag-end', { x: event.clientX, y: event.clientY })
  },
})

const style = computed<StyleValue>(() => {
  const baseStyle: any = {}

  // 如果有创建者，应用用户颜色
  if (props.note.createdBy && props.note.color) {
    baseStyle.borderLeftColor = props.note.color
    baseStyle.borderLeftWidth = '4px'
    baseStyle.borderLeftStyle = 'solid'
  }

  if (isDragging.value) {
    const left = x.value - fixedContainingBlockRect.value.left
    const top = y.value - fixedContainingBlockRect.value.top
    return {
      ...baseStyle,
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      transition: 'none',
      transform: 'scale(1.05) rotate(3deg)',
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)',
      zIndex: '1000',
      opacity: '0.9',
    }
  }
  return baseStyle
})

function getDisplayText(note: QuadrantNote): string {
  const maxLength = 30
  const text = note.title?.trim() || note.content
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}
</script>

<style scoped>
.note-item {
  background-color: var(--glass-bg-strong, rgba(255, 255, 255, 0.74));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.72));
  border-radius: var(--radius-md, 10px);
  padding: 10px 12px;
  margin-bottom: 8px;
  cursor: grab;
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(var(--glass-blur, 18px));
  -webkit-backdrop-filter: blur(var(--glass-blur, 18px));
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
  position: relative;
  z-index: 10;
  user-select: none;
  will-change: transform, box-shadow;
  flex-shrink: 0;
  width: auto;
  max-width: 100%;
}

.note-creator {
  font-size: 11px;
  color: var(--color-text-tertiary);
  margin-bottom: 4px;
  font-weight: 500;
}

.note-content {
  color: var(--color-text-primary);
}

.note-item:not(.is-dragging):hover {
  box-shadow: var(--shadow-lg);
  border-color: rgba(0, 122, 255, 0.35);
  transform: translateY(-2px);
}

.note-item:active {
  cursor: grabbing;
}
</style>
