<template>
  <div class="quadrant-board">
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载笔记中...</p>
    </div>
    
    <div v-else-if="notes.length === 0" class="empty-state">
      <p>暂无笔记，请先创建一些笔记</p>
    </div>
    
    <div v-else class="quadrant-layout">
      <div class="axis-label y-axis-label-positive">重要</div>
      <div class="axis-label y-axis-label-negative">不重要</div>

      <div class="quadrant-container" ref="boardRef">
        <div class="quadrant q2" ref="q2Ref">
          <h3 class="quadrant-title">重要但不紧急</h3>
          <div class="quadrant-content">
            <div v-for="note in importantNotUrgentNotes" :key="note.id" class="note-item"
              :ref="el => noteRefs[note.id] = el" :style="noteStyles[note.id]"
              :title="note.content">
              {{ getDisplayText(note) }}
            </div>
          </div>
        </div>
        <div class="quadrant q1" ref="q1Ref">
          <h3 class="quadrant-title">重要且紧急</h3>
          <div class="quadrant-content">
            <div v-for="note in importantUrgentNotes" :key="note.id" class="note-item" 
              :ref="el => noteRefs[note.id] = el" :style="noteStyles[note.id]"
              :title="note.content">
              {{ getDisplayText(note) }}
            </div>
          </div>
        </div>
        <div class="quadrant q3" ref="q3Ref">
          <h3 class="quadrant-title">不重要不紧急</h3>
          <div class="quadrant-content">
            <div v-for="note in notImportantNotUrgentNotes" :key="note.id" class="note-item"
              :ref="el => noteRefs[note.id] = el" :style="noteStyles[note.id]"
              :title="note.content">
              {{ getDisplayText(note) }}
            </div>
          </div>
        </div>
        <div class="quadrant q4" ref="q4Ref">
          <h3 class="quadrant-title">不重要但紧急</h3>
          <div class="quadrant-content">
            <div v-for="note in notImportantUrgentNotes" :key="note.id" class="note-item"
              :ref="el => noteRefs[note.id] = el" :style="noteStyles[note.id]"
              :title="note.content">
              {{ getDisplayText(note) }}
            </div>
          </div>
        </div>

        <div class="axis x-axis"></div>
        <div class="axis y-axis"></div>
      </div>

      <div class="axis-label x-axis-label-negative">不紧急</div>
      <div class="axis-label x-axis-label-positive">紧急</div>

      <div class="uncategorized-area" ref="uncategorizedRef">
        <h3 class="uncategorized-title">待分类笔记 ({{ uncategorizedNotes.length }})</h3>
        <div class="uncategorized-content">
          <div v-for="note in uncategorizedNotes" :key="note.id" class="note-item"
            :ref="el => noteRefs[note.id] = el" :style="noteStyles[note.id]"
            :title="note.content">
            {{ getDisplayText(note) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watchEffect, reactive, nextTick } from 'vue';
import { useDraggable } from '@vueuse/core';
import { commonService } from '@/service';
import type { NoteItem, PaginatedList } from '@/types';

// 扩展 NoteItem 接口以包含象限坐标
interface QuadrantNote extends NoteItem {
  x_axis?: number;
  y_axis?: number;
}

const boardRef = ref<HTMLElement | null>(null);
const q1Ref = ref<HTMLElement | null>(null);
const q2Ref = ref<HTMLElement | null>(null);
const q3Ref = ref<HTMLElement | null>(null);
const q4Ref = ref<HTMLElement | null>(null);
const uncategorizedRef = ref<HTMLElement | null>(null);
const notes = ref<QuadrantNote[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  await fetchNotes();
});

async function fetchNotes() {
  try {
    isLoading.value = true;
    const response = await commonService.apiGetNotes();
    // 处理不同的响应格式
    if (response.data && typeof response.data === 'object') {
      if ('data' in response.data && response.data.data && 'notes' in response.data.data) {
        // PaginatedList 格式
        const paginatedData = response.data as PaginatedList<QuadrantNote>;
        notes.value = paginatedData.data.notes || [];
      } else if (Array.isArray(response.data)) {
        // 直接数组格式
        notes.value = response.data as QuadrantNote[];
      }
    }
    
    // 为没有象限坐标的笔记设置默认值
    notes.value = notes.value.map(note => ({
      ...note,
      x_axis: note.x_axis ?? 0,
      y_axis: note.y_axis ?? 0
    }));
  } catch (error) {
    console.error('获取笔记失败:', error);
  } finally {
    isLoading.value = false;
  }
}

const importantUrgentNotes = computed(() =>
  notes.value.filter(n => (n.y_axis ?? 0) > 0 && (n.x_axis ?? 0) > 0)
);

const importantNotUrgentNotes = computed(() =>
  notes.value.filter(n => (n.y_axis ?? 0) > 0 && (n.x_axis ?? 0) < 0)
);

const notImportantNotUrgentNotes = computed(() =>
  notes.value.filter(n => (n.y_axis ?? 0) < 0 && (n.x_axis ?? 0) < 0)
);

const notImportantUrgentNotes = computed(() =>
  notes.value.filter(n => (n.y_axis ?? 0) < 0 && (n.x_axis ?? 0) > 0)
);

const uncategorizedNotes = computed(() =>
  notes.value.filter(n => (n.y_axis ?? 0) === 0 || (n.x_axis ?? 0) === 0)
);

// 拖拽相关
const noteRefs = reactive<Record<string, HTMLElement | null>>({});
const noteStyles = reactive<Record<string, any>>({});

watchEffect(() => {
  nextTick(() => {
    notes.value.forEach(note => {
      if (noteRefs[note.id]) {
        const noteElement = ref(noteRefs[note.id]);
        const { x, y, style } = useDraggable(noteElement, {
          initialValue: { x: 0, y: 0 },
          onEnd: (position, event) => {
            handleDragEnd(note, event.clientX, event.clientY);
            // 重置位置
            x.value = 0;
            y.value = 0;
          }
        });
        noteStyles[note.id] = style;
      }
    });
  });
});

async function handleDragEnd(note: QuadrantNote, clientX: number, clientY: number) {
  const newCoords = getQuadrantFromPosition(clientX, clientY);

  if (newCoords && (newCoords.x !== (note.x_axis ?? 0) || newCoords.y !== (note.y_axis ?? 0))) {
    try {
      // 更新笔记，包含象限坐标
      await commonService.apiUpdateNote(note.id, {
        ...note,
        x_axis: newCoords.x,
        y_axis: newCoords.y
      } as any);
      
      // 更新本地状态
      const noteIndex = notes.value.findIndex(n => n.id === note.id);
      if (noteIndex !== -1) {
        notes.value[noteIndex].x_axis = newCoords.x;
        notes.value[noteIndex].y_axis = newCoords.y;
      }
    } catch (error) {
      console.error('更新笔记位置失败:', error);
    }
  }
}

function getQuadrantFromPosition(x: number, y: number) {
  if (!q1Ref.value || !q2Ref.value || !q3Ref.value || !q4Ref.value || !uncategorizedRef.value) {
    return null;
  }

  const q1Rect = q1Ref.value.getBoundingClientRect();
  if (x > q1Rect.left && x < q1Rect.right && y > q1Rect.top && y < q1Rect.bottom) {
    return { x: 1, y: 1 };
  }

  const q2Rect = q2Ref.value.getBoundingClientRect();
  if (x > q2Rect.left && x < q2Rect.right && y > q2Rect.top && y < q2Rect.bottom) {
    return { x: -1, y: 1 };
  }

  const q3Rect = q3Ref.value.getBoundingClientRect();
  if (x > q3Rect.left && x < q3Rect.right && y > q3Rect.top && y < q3Rect.bottom) {
    return { x: -1, y: -1 };
  }

  const q4Rect = q4Ref.value.getBoundingClientRect();
  if (x > q4Rect.left && x < q4Rect.right && y > q4Rect.top && y < q4Rect.bottom) {
    return { x: 1, y: -1 };
  }

  const uncatRect = uncategorizedRef.value.getBoundingClientRect();
  if (x > uncatRect.left && x < uncatRect.right && y > uncatRect.top && y < uncatRect.bottom) {
    return { x: 0, y: 0 };
  }

  return null;
}

function getDisplayText(note: QuadrantNote): string {
  if (note.title && note.title.trim()) {
    return note.title.length > 30 ? note.title.substring(0, 30) + '...' : note.title;
  }
  return note.content.length > 30 ? note.content.substring(0, 30) + '...' : note.content;
}
</script>

<style scoped>
.quadrant-board {
  width: 100%;
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #999;
  font-size: 16px;
}

/* 有内容时的网格布局 */
.quadrant-layout {
  display: grid;
  grid-template-columns: 60px 1fr 1fr 60px;
  grid-template-rows: 40px 1fr 1fr 40px;
  grid-template-areas:
    ".    y-pos y-pos ."
    "x-neg container container x-pos"
    "x-neg container container x-pos"
    ".    uncat uncat .";
}

.quadrant-container {
  grid-area: container;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  border: 2px solid #ddd;
  border-radius: 12px;
  position: relative;
  height: 600px;
  background: #fafafa;
  overflow: hidden;
}

.quadrant {
  padding: 15px;
  border: 1px solid #eee;
  position: relative;
  background: white;
  transition: background-color 0.2s ease;
}

.quadrant:hover {
  background: #f8f9fa;
}

.quadrant-title {
  text-align: center;
  color: #666;
  font-weight: 600;
  user-select: none;
  margin: 0 0 12px 0;
  font-size: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.quadrant-content {
  height: calc(100% - 40px);
  overflow-y: auto;
}

/* 象限特殊颜色 */
.q1 {
  background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
  border-top-right-radius: 12px;
}

.q2 {
  background: linear-gradient(135deg, #f0fff4 0%, #ffffff 100%);
  border-top-left-radius: 12px;
}

.q3 {
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
  border-bottom-left-radius: 12px;
}

.q4 {
  background: linear-gradient(135deg, #fffbf0 0%, #ffffff 100%);
  border-bottom-right-radius: 12px;
}

/* 坐标轴 */
.axis {
  background-color: #ddd;
  position: absolute;
  z-index: 1;
}

.x-axis {
  width: 100%;
  height: 2px;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}

.y-axis {
  width: 2px;
  height: 100%;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

/* 坐标轴标签 */
.axis-label {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  color: #555;
}

.y-axis-label-positive {
  grid-area: y-pos;
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.y-axis-label-negative {
  grid-area: y-pos;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  align-self: end;
}

.x-axis-label-negative {
  grid-area: x-neg;
  justify-content: flex-start;
}

.x-axis-label-positive {
  grid-area: x-pos;
  justify-content: flex-end;
}

/* 待分类区域 */
.uncategorized-area {
  grid-area: uncat;
  margin-top: 20px;
  border: 2px dashed #ccc;
  border-radius: 12px;
  padding: 15px;
  min-height: 150px;
  background: #fafafa;
}

.uncategorized-title {
  text-align: center;
  color: #666;
  font-weight: 600;
  margin: 0 0 12px 0;
  font-size: 16px;
}

.uncategorized-content {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 笔记项目 */
.note-item {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
  cursor: grab;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease-in-out;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
  position: relative;
  z-index: 2;
}

.note-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  border-color: #409eff;
}

.note-item:active {
  cursor: grabbing;
  transform: scale(1.02);
}

/* 拖拽时的样式 */
.note-item.dragging {
  opacity: 0.8;
  transform: rotate(5deg);
  z-index: 1000;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .quadrant-board {
    padding: 10px;
  }
  
  .quadrant-container {
    height: 400px;
  }
  
  .quadrant {
    padding: 10px;
  }
  
  .note-item {
    font-size: 12px;
    padding: 8px 10px;
  }
}
</style>