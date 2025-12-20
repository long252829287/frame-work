<template>
  <div class="quadrant-board">
    <LoadingComp v-if="isLoading" overlay text="加载笔记中…" />

    <div v-else-if="notes.length === 0" class="empty-state">
      <p>暂无笔记，请先创建一些笔记</p>
    </div>

    <div v-else class="quadrant-layout">
      <!-- 用户颜色图例 (仅共享模式) -->
      <div v-if="isSharedMode" class="user-legend">
        <h4>参与者</h4>
        <div class="legend-items">
          <div v-for="user in userColors" :key="user.username" class="legend-item">
            <div class="color-indicator" :style="{ backgroundColor: user.color }"></div>
            <span>{{ user.username }}</span>
          </div>
        </div>
      </div>

      <div class="quadrant-container" ref="boardRef">
        <div class="quadrant q2" ref="q2Ref">
          <h3 class="quadrant-title">重要但不紧急</h3>
          <TransitionGroup name="note-list" tag="div" class="quadrant-content">
            <NoteItem v-for="note in importantNotUrgentNotes" :key="note._id" :note="note"
              @drag-move="highlightDropZone" @drag-end="(pos) => handleDragEnd(note, pos.x, pos.y)" />
          </TransitionGroup>
        </div>
        <div class="quadrant q1" ref="q1Ref">
          <h3 class="quadrant-title">重要且紧急</h3>
          <TransitionGroup name="note-list" tag="div" class="quadrant-content">
            <NoteItem v-for="note in importantUrgentNotes" :key="note._id" :note="note" @drag-move="highlightDropZone"
              @drag-end="(pos) => handleDragEnd(note, pos.x, pos.y)" />
          </TransitionGroup>
        </div>
        <div class="quadrant q3" ref="q3Ref">
          <h3 class="quadrant-title">不重要不紧急</h3>
          <TransitionGroup name="note-list" tag="div" class="quadrant-content">
            <NoteItem v-for="note in notImportantNotUrgentNotes" :key="note._id" :note="note"
              @drag-move="highlightDropZone" @drag-end="(pos) => handleDragEnd(note, pos.x, pos.y)" />
          </TransitionGroup>
        </div>
        <div class="quadrant q4" ref="q4Ref">
          <h3 class="quadrant-title">不重要但紧急</h3>
          <TransitionGroup name="note-list" tag="div" class="quadrant-content">
            <NoteItem v-for="note in notImportantUrgentNotes" :key="note._id" :note="note"
              @drag-move="highlightDropZone" @drag-end="(pos) => handleDragEnd(note, pos.x, pos.y)" />
          </TransitionGroup>
        </div>
      </div>
    </div>

    <div class="uncategorized-area" ref="uncategorizedRef">
      <h3 class="uncategorized-title">待分类笔记 ({{ uncategorizedNotes.length }})</h3>
      <TransitionGroup name="note-list" tag="div" class="uncategorized-content">
        <NoteItem v-for="note in uncategorizedNotes" :key="note._id" :note="note" @drag-move="highlightDropZone"
          @drag-end="(pos) => handleDragEnd(note, pos.x, pos.y)" />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { commonService } from '@/service'
import type { PaginatedList, QuadrantNote, SharedQuadrantNote } from '@/types'
import NoteItem from '@/components/noteItem/noteItemComp.vue'

interface QuadrantCoords {
  x: number
  y: number
}

interface UserColor {
  username: string
  color: string
}

// Props 定义
const props = defineProps<{
  sharedNoteId?: string // 传入此参数表示为共享模式
}>()

// Events 定义
const emit = defineEmits<{
  (e: 'update-note', note: SharedQuadrantNote): void
}>()

// 判断是否为共享模式
const isSharedMode = computed(() => !!props.sharedNoteId)

// 响应式引用
const boardRef = ref<HTMLElement | null>(null)
const uncategorizedRef = ref<HTMLElement | null>(null)
const notes = ref<(QuadrantNote | SharedQuadrantNote)[]>([])
const isLoading = ref(true)

// 用户颜色配置 (仅共享模式使用)
const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#f3f3f3', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
]

// 计算用户颜色映射 (仅共享模式)
const userColors = computed<UserColor[]>(() => {
  if (!isSharedMode.value) return []
  const users = [...new Set(notes.value.map(note => (note as SharedQuadrantNote).createdBy).filter(Boolean))]
  return users.map((username, index) => ({
    username,
    color: USER_COLORS[index % USER_COLORS.length]
  }))
})

// 拖拽相关

const q1Ref = ref<HTMLElement | null>(null)
const q2Ref = ref<HTMLElement | null>(null)
const q3Ref = ref<HTMLElement | null>(null)
const q4Ref = ref<HTMLElement | null>(null)

// 组件挂载时获取笔记
onMounted(async () => {
  await fetchNotes()
})

async function fetchNotes(): Promise<void> {
  try {
    isLoading.value = true

    if (isSharedMode.value) {
      // 共享模式：获取共享笔记内容
      const response = await commonService.apiGetSharedNoteContent(props.sharedNoteId!)
      let rawNotes: SharedQuadrantNote[] = response.data.data.notes || []

      // 先收集所有用户并创建颜色映射
      const users = [...new Set(rawNotes.map(note => note.createdBy).filter(Boolean))]
      const userColorMap = new Map<string, string>()
      users.forEach((username, index) => {
        userColorMap.set(username, USER_COLORS[index % USER_COLORS.length])
      })

      // 为每个笔记分配用户颜色
      const processedNotes = rawNotes.map((note) => {
        const color = userColorMap.get(note.createdBy) || USER_COLORS[0]

        return {
          ...note,
          x_axis: note.x_axis ?? 0,
          y_axis: note.y_axis ?? 0,
          color
        }
      })

      notes.value = processedNotes
    } else {
      // 普通模式：获取个人笔记
      const response = await commonService.apiGetNotes()
      const paginatedData = response.data as PaginatedList<QuadrantNote>
      const rawNotes: QuadrantNote[] = paginatedData.data.notes || []

      notes.value = rawNotes.map((note) => ({
        ...note,
        x_axis: note.x_axis ?? 0,
        y_axis: note.y_axis ?? 0,
      }))
    }
  } catch (error) {
    console.error('获取笔记失败:', error)
  } finally {
    isLoading.value = false
  }
}

const importantUrgentNotes = computed(() =>
  notes.value
    .filter((n) => (n.y_axis ?? 0) > 0 && (n.x_axis ?? 0) > 0)
    .sort((a, b) => (a.order || 0) - (b.order || 0)),
)

const importantNotUrgentNotes = computed(() =>
  notes.value
    .filter((n) => (n.y_axis ?? 0) > 0 && (n.x_axis ?? 0) < 0)
    .sort((a, b) => (a.order || 0) - (b.order || 0)),
)

const notImportantNotUrgentNotes = computed(() =>
  notes.value
    .filter((n) => (n.y_axis ?? 0) < 0 && (n.x_axis ?? 0) < 0)
    .sort((a, b) => (a.order || 0) - (b.order || 0)),
)

const notImportantUrgentNotes = computed(() =>
  notes.value
    .filter((n) => (n.y_axis ?? 0) < 0 && (n.x_axis ?? 0) > 0)
    .sort((a, b) => (a.order || 0) - (b.order || 0)),
)

const uncategorizedNotes = computed(() =>
  notes.value
    .filter((n) => (n.y_axis ?? 0) === 0 || (n.x_axis ?? 0) === 0)
    .sort((a, b) => (a.order || 0) - (b.order || 0)),
)

async function handleDragEnd(note: QuadrantNote | SharedQuadrantNote, clientX: number, clientY: number): Promise<void> {
  clearAllHighlights()

  const newCoords = getQuadrantFromPosition(clientX, clientY)

  if (!newCoords || (newCoords.x === note.x_axis && newCoords.y === note.y_axis)) {
    return
  }

  const noteToUpdate = notes.value.find((n) => n._id === note._id)
  if (!noteToUpdate) return

  const originalState = {
    x_axis: noteToUpdate.x_axis,
    y_axis: noteToUpdate.y_axis,
    order: noteToUpdate.order,
  }

  const targetList = notes.value.filter(
    (n) =>
      n._id !== noteToUpdate._id && // 排除正在移动的笔记
      n.x_axis === newCoords.x &&
      n.y_axis === newCoords.y,
  )

  const maxOrder = targetList.reduce((max, item) => Math.max(max, item.order || 0), -1)
  const newOrder = maxOrder + 1

  noteToUpdate.x_axis = newCoords.x
  noteToUpdate.y_axis = newCoords.y
  noteToUpdate.order = newOrder

  try {
    if (isSharedMode.value) {
      await commonService.apiUpdateSharedNoteItem(noteToUpdate._id, {
        x_axis: newCoords.x,
        y_axis: newCoords.y,
        order: newOrder,
      })
      emit('update-note', noteToUpdate as SharedQuadrantNote)
    } else {
      await commonService.apiUpdateNote(noteToUpdate._id, {
        x_axis: newCoords.x,
        y_axis: newCoords.y,
        order: newOrder,
      })
    }
  } catch (error) {
    console.error('更新笔记位置失败，正在回滚:', error)

    const noteToRollback = notes.value.find((n) => n._id === note._id)
    if (noteToRollback) {
      noteToRollback.x_axis = originalState.x_axis
      noteToRollback.y_axis = originalState.y_axis
      noteToRollback.order = originalState.order
    }
  }
}

let lastHighlightedZone: string | null = null
function highlightDropZone(position: { x: number; y: number }): void {
  const currentZone = getDropZoneFromPosition(position.x, position.y)
  if (currentZone !== lastHighlightedZone) {
    if (lastHighlightedZone) removeDropZoneHighlight(lastHighlightedZone)
    if (currentZone) addDropZoneHighlight(currentZone)
    lastHighlightedZone = currentZone
  }
}
function clearAllHighlights() {
  if (lastHighlightedZone) removeDropZoneHighlight(lastHighlightedZone)
  lastHighlightedZone = null
}

function getQuadrantFromPosition(x: number, y: number): QuadrantCoords | null {
  const quadrantRefs = [
    { ref: q1Ref.value, coords: { x: 1, y: 1 } },
    { ref: q2Ref.value, coords: { x: -1, y: 1 } },
    { ref: q3Ref.value, coords: { x: -1, y: -1 } },
    { ref: q4Ref.value, coords: { x: 1, y: -1 } },
    { ref: uncategorizedRef.value, coords: { x: 0, y: 0 } },
  ]

  for (const { ref, coords } of quadrantRefs) {
    if (ref) {
      const rect = ref.getBoundingClientRect()
      if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
        return coords
      }
    }
  }

  return null
}

function getDropZoneFromPosition(x: number, y: number): string | null {
  const zones = [
    { ref: q1Ref.value, name: 'q1' },
    { ref: q2Ref.value, name: 'q2' },
    { ref: q3Ref.value, name: 'q3' },
    { ref: q4Ref.value, name: 'q4' },
    { ref: uncategorizedRef.value, name: 'uncategorized' },
  ]

  for (const { ref, name } of zones) {
    if (ref) {
      const rect = ref.getBoundingClientRect()
      if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
        return name
      }
    }
  }

  return null
}

function addDropZoneHighlight(zoneName: string) {
  const zoneMap: Record<string, HTMLElement | null> = {
    q1: q1Ref.value,
    q2: q2Ref.value,
    q3: q3Ref.value,
    q4: q4Ref.value,
    uncategorized: uncategorizedRef.value,
  }

  const element = zoneMap[zoneName]
  if (element) {
    element.classList.add('drop-zone-active')
  }
}

function removeDropZoneHighlight(zoneName: string) {
  const zoneMap: Record<string, HTMLElement | null> = {
    q1: q1Ref.value,
    q2: q2Ref.value,
    q3: q3Ref.value,
    q4: q4Ref.value,
    uncategorized: uncategorizedRef.value,
  }

  const element = zoneMap[zoneName]
  if (element) {
    element.classList.remove('drop-zone-active')
  }
}

defineExpose({
  fetchNotes
})
</script>

<style scoped>
.quadrant-board,
.shared-quadrant-board {
  position: relative;
  width: 100%;
  max-width: 1200px;
  padding: 20px;
}

.user-legend {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-primary);
}

.user-legend h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-primary);
}

.color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: var(--color-text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(15, 23, 42, 0.08);
  border-top: 4px solid var(--color-accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: var(--color-text-tertiary);
  font-size: 16px;
}

/* 有内容时的网格布局 */
.quadrant-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.quadrant-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-xl);
  position: relative;
  height: 600px;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  overflow: hidden;
  gap: 0;
}

.quadrant {
  padding: 15px;
  border: 1px solid var(--color-border-secondary);
  position: relative;
  background: rgba(255, 255, 255, 0.55);
  transition: background-color 0.2s ease;
}

.quadrant:hover {
  background: rgba(255, 255, 255, 0.7);
}

.quadrant-title {
  text-align: center;
  color: var(--color-text-secondary);
  font-weight: 600;
  user-select: none;
  font-size: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border-secondary);
}

.quadrant-content {
  overflow-y: auto;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 8px;
}

/* 象限特殊颜色 */
.q1 {
  background: linear-gradient(135deg, rgba(254, 226, 226, 0.55) 0%, rgba(255, 255, 255, 0.6) 70%);
  border-top-right-radius: 12px;
  position: relative;
  z-index: 1;
}

.q2 {
  background: linear-gradient(135deg, rgba(209, 250, 229, 0.55) 0%, rgba(255, 255, 255, 0.6) 70%);
  border-top-left-radius: 12px;
  position: relative;
  z-index: 1;
}

.q3 {
  background: linear-gradient(135deg, rgba(224, 242, 254, 0.6) 0%, rgba(255, 255, 255, 0.6) 70%);
  border-bottom-left-radius: 12px;
  position: relative;
  z-index: 1;
}

.q4 {
  background: linear-gradient(135deg, rgba(254, 243, 199, 0.55) 0%, rgba(255, 255, 255, 0.6) 70%);
  border-bottom-right-radius: 12px;
  position: relative;
  z-index: 1;
}

/* 坐标轴 */
.axis {
  background-color: rgba(15, 23, 42, 0.10);
  position: absolute;
  z-index: 1;
}

/* 待分类区域 */
.uncategorized-area {
  margin-top: 20px;
  border: 1px dashed var(--color-border-primary);
  border-radius: var(--radius-xl);
  padding: 15px;
  min-height: 150px;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  transition: all 0.3s ease;
}

.uncategorized-title {
  text-align: center;
  color: var(--color-text-secondary);
  font-weight: 600;
  margin: 0 0 12px 0;
  font-size: 16px;
}

.uncategorized-content {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* TransitionGroup 动画效果 */
.note-list-enter-active,
.note-list-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.note-list-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.note-list-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.note-list-move {
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.note-list-move.dragging {
  transition: none !important;
}

/* 放置区域高亮 */
.drop-zone-active {
  background-color: rgba(0, 122, 255, 0.08) !important;
  border-color: rgba(0, 122, 255, 0.55) !important;
  box-shadow: inset 0 0 0 2px rgba(0, 122, 255, 0.22) !important;
  transition: all 0.2s ease !important;
}

.quadrant.drop-zone-active {
  background: rgba(0, 122, 255, 0.08) !important;
}

.uncategorized-area.drop-zone-active {
  background-color: rgba(0, 122, 255, 0.06) !important;
  border-color: rgba(0, 122, 255, 0.55) !important;
}

/* 响应式设计 */
@media (max-width: 768px) {

  .quadrant-board,
  .shared-quadrant-board {
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

  .legend-items {
    gap: 12px;
  }

  .legend-item {
    font-size: 12px;
  }
}
</style>
