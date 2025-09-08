<template>
  <div ref="noteEl" class="note-item" :style="style" :title="props.note.content">
    {{ getDisplayText(props.note) }}
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed } from 'vue';
import { useDraggable } from '@vueuse/core';
import type { QuadrantNote } from '@/types';
import type { StyleValue } from 'vue';

const props = defineProps<{
  note: QuadrantNote;
}>();

const emit = defineEmits<{
  (e: 'drag-move', position: { x: number; y: number }): void;
  (e: 'drag-end', position: { x: number; y: number }): void;
}>();

const noteEl = ref<HTMLElement | null>(null);

const { x, y, isDragging } = useDraggable(noteEl, {
  onStart: (_, event) => {
    document.body.style.cursor = 'grabbing';
  },
  onMove: (position) => {
    emit('drag-move', position);
  },
  onEnd: (position) => {
    document.body.style.cursor = '';
    emit('drag-end', position);
  },
});

const style = computed<StyleValue>(() => {
  if (isDragging.value) {
    return {
      position: 'fixed',
      top: `${y.value}px`,
      left: `${x.value}px`,
      transition: 'none',
      transform: 'scale(1.05) rotate(3deg)',
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)',
      zIndex: '1000',
      opacity: '0.9',
    };
  }
  return {};
});

function getDisplayText(note: QuadrantNote): string {
  const maxLength = 30;
  const text = note.title?.trim() || note.content;
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
</script>

<style scoped>
.note-item {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
  cursor: grab;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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

.note-item:not(.is-dragging):hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #409eff;
  transform: translateY(-2px);
}

.note-item:active {
  cursor: grabbing;
}
</style>