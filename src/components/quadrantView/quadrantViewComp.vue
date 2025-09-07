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
            <div 
              v-for="note in importantNotUrgentNotes" 
              :key="note.id" 
              class="note-item"
              :ref="(el: Element | ComponentPublicInstance | null) => setNoteRef(note.id, el as HTMLElement | null)"
              :title="note.content"
            >
              {{ getDisplayText(note) }}
            </div>
          </div>
        </div>
        <div class="quadrant q1" ref="q1Ref">
          <h3 class="quadrant-title">重要且紧急</h3>
          <div class="quadrant-content">
            <div 
              v-for="note in importantUrgentNotes" 
              :key="note.id" 
              class="note-item" 
              :ref="(el: Element | ComponentPublicInstance | null) => setNoteRef(note.id, el as HTMLElement | null)"
              :title="note.content"
            >
              {{ getDisplayText(note) }}
            </div>
          </div>
        </div>
        <div class="quadrant q3" ref="q3Ref">
          <h3 class="quadrant-title">不重要不紧急</h3>
          <div class="quadrant-content">
            <div 
              v-for="note in notImportantNotUrgentNotes" 
              :key="note.id" 
              class="note-item"
              :ref="(el: Element | ComponentPublicInstance | null) => setNoteRef(note.id, el as HTMLElement | null)"
              :title="note.content"
            >
              {{ getDisplayText(note) }}
            </div>
          </div>
        </div>
        <div class="quadrant q4" ref="q4Ref">
          <h3 class="quadrant-title">不重要但紧急</h3>
          <div class="quadrant-content">
            <div 
              v-for="note in notImportantUrgentNotes" 
              :key="note.id" 
              class="note-item"
              :ref="(el: Element | ComponentPublicInstance | null) => setNoteRef(note.id, el as HTMLElement | null)"
              :title="note.content"
            >
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
          <div 
            v-for="note in uncategorizedNotes" 
            :key="note.id" 
            class="note-item"
            :ref="(el: Element | ComponentPublicInstance | null) => setNoteRef(note.id, el as HTMLElement | null)"
            :title="note.content"
          >
            {{ getDisplayText(note) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue';
import type { ComponentPublicInstance } from 'vue';
import { commonService } from '@/service';
import type { NoteItem, PaginatedList } from '@/types';

// 扩展 NoteItem 接口以包含象限坐标
interface QuadrantNote extends NoteItem {
  x_axis?: number;
  y_axis?: number;
}

// 象限坐标接口
interface QuadrantCoords {
  x: number;
  y: number;
}

// 响应式引用
const boardRef = ref<HTMLElement | null>(null);
const q1Ref = ref<HTMLElement | null>(null);
const q2Ref = ref<HTMLElement | null>(null);
const q3Ref = ref<HTMLElement | null>(null);
const q4Ref = ref<HTMLElement | null>(null);
const uncategorizedRef = ref<HTMLElement | null>(null);
const notes = ref<QuadrantNote[]>([]);
const isLoading = ref(true);

// 拖拽相关
const noteRefs = reactive<Record<string, HTMLElement | null>>({});
const isDragging = ref(false);
const draggedNote = ref<QuadrantNote | null>(null);
const dropZone = ref<string | null>(null);

// 设置笔记元素引用的函数
function setNoteRef(noteId: string, el: HTMLElement | null) {
  if (el) {
    noteRefs[noteId] = el;
    setupDragEvents(el, noteId);
  } else {
    delete noteRefs[noteId];
  }
}

// 组件挂载时获取笔记
onMounted(async () => {
  await fetchNotes();
});

// 解析笔记内容中的象限坐标
function parseQuadrantCoords(content: string): { x: number; y: number; cleanContent: string } {
  const quadrantMatch = content.match(/\[quadrant:(-?\d+),(-?\d+)\]/);
  if (quadrantMatch) {
    const x = parseInt(quadrantMatch[1], 10);
    const y = parseInt(quadrantMatch[2], 10);
    const cleanContent = content.replace(/\[quadrant:-?\d+,-?\d+\]\s*/, '').trim();
    return { x, y, cleanContent };
  }
  return { x: 0, y: 0, cleanContent: content };
}

// 获取笔记数据
async function fetchNotes(): Promise<void> {
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
    
    // 解析象限坐标并清理内容
    notes.value = notes.value.map(note => {
      const { x, y, cleanContent } = parseQuadrantCoords(note.content);
      return {
        ...note,
        x_axis: note.x_axis ?? x,
        y_axis: note.y_axis ?? y,
        content: cleanContent
      };
    });
  } catch (error) {
    console.error('获取笔记失败:', error);
  } finally {
    isLoading.value = false;
  }
}

// 计算属性：按象限分类笔记
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

// 设置拖拽事件
function setupDragEvents(element: HTMLElement, noteId: string) {
  let startX = 0;
  let startY = 0;
  let dragElement: HTMLElement | null = null;
  
  const note = notes.value.find(n => n.id === noteId);
  if (!note) return;

  // 鼠标按下事件
  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    isDragging.value = true;
    draggedNote.value = note;
    
    startX = e.clientX;
    startY = e.clientY;
    
    // 创建拖拽副本
    dragElement = element.cloneNode(true) as HTMLElement;
    dragElement.style.position = 'fixed';
    dragElement.style.left = `${e.clientX - 50}px`;
    dragElement.style.top = `${e.clientY - 20}px`;
    dragElement.style.zIndex = '1000';
    dragElement.style.pointerEvents = 'none';
    dragElement.style.opacity = '0.8';
    dragElement.style.transform = 'rotate(5deg)';
    dragElement.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
    dragElement.classList.add('dragging');
    
    // 添加到body
    document.body.appendChild(dragElement);
    
    // 原元素添加拖拽状态
    element.style.opacity = '0.5';
    element.style.transform = 'scale(0.95)';
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 鼠标移动事件
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.value || !dragElement) return;
    
    dragElement.style.left = `${e.clientX - 50}px`;
    dragElement.style.top = `${e.clientY - 20}px`;
    
    // 检测当前悬停的放置区域
    const currentDropZone = getDropZoneFromPosition(e.clientX, e.clientY);
    if (currentDropZone !== dropZone.value) {
      // 移除之前的高亮
      if (dropZone.value) {
        removeDropZoneHighlight(dropZone.value);
      }
      
      // 添加新的高亮
      dropZone.value = currentDropZone;
      if (dropZone.value) {
        addDropZoneHighlight(dropZone.value);
      }
    }
  };

  // 鼠标释放事件
  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging.value) return;
    
    isDragging.value = false;
    
    // 移除拖拽副本
    if (dragElement) {
      document.body.removeChild(dragElement);
      dragElement = null;
    }
    
    // 重置原元素样式
    element.style.opacity = '';
    element.style.transform = '';
    
    // 清理放置区域高亮
    if (dropZone.value) {
      removeDropZoneHighlight(dropZone.value);
      dropZone.value = null;
    }
    
    // 处理拖拽结束
    handleDragEnd(note, e.clientX, e.clientY);
    
    draggedNote.value = null;
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  element.addEventListener('mousedown', handleMouseDown);
}

// 处理拖拽结束事件
async function handleDragEnd(note: QuadrantNote, clientX: number, clientY: number): Promise<void> {
  const newCoords = getQuadrantFromPosition(clientX, clientY);

  if (newCoords && (newCoords.x !== (note.x_axis ?? 0) || newCoords.y !== (note.y_axis ?? 0))) {
    try {
      // 创建包含象限坐标的内容标记
      const coordsTag = `[quadrant:${newCoords.x},${newCoords.y}]`;
      let updatedContent = note.content;
      
      // 移除旧的象限标记
      updatedContent = updatedContent.replace(/\[quadrant:-?\d+,-?\d+\]/g, '');
      
      // 添加新的象限标记
      updatedContent = `${coordsTag}\n${updatedContent}`.trim();
      console.log('notes', )
      // 更新笔记内容（包含象限信息）
      await commonService.apiUpdateNote(note.id, {
        content: updatedContent,
        title: note.title,
        tags: note.tags
      });
      
      // 更新本地状态 - 保持content为清洁内容，不包含象限标记
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

// 根据鼠标位置确定象限
function getQuadrantFromPosition(x: number, y: number): QuadrantCoords | null {
  const quadrantRefs = [
    { ref: q1Ref.value, coords: { x: 1, y: 1 } },
    { ref: q2Ref.value, coords: { x: -1, y: 1 } },
    { ref: q3Ref.value, coords: { x: -1, y: -1 } },
    { ref: q4Ref.value, coords: { x: 1, y: -1 } },
    { ref: uncategorizedRef.value, coords: { x: 0, y: 0 } }
  ];

  for (const { ref, coords } of quadrantRefs) {
    if (ref) {
      const rect = ref.getBoundingClientRect();
      if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
        return coords;
      }
    }
  }

  return null;
}

// 根据鼠标位置获取放置区域名称
function getDropZoneFromPosition(x: number, y: number): string | null {
  const zones = [
    { ref: q1Ref.value, name: 'q1' },
    { ref: q2Ref.value, name: 'q2' },
    { ref: q3Ref.value, name: 'q3' },
    { ref: q4Ref.value, name: 'q4' },
    { ref: uncategorizedRef.value, name: 'uncategorized' }
  ];

  for (const { ref, name } of zones) {
    if (ref) {
      const rect = ref.getBoundingClientRect();
      if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
        return name;
      }
    }
  }

  return null;
}

// 添加放置区域高亮
function addDropZoneHighlight(zoneName: string) {
  const zoneMap: Record<string, HTMLElement | null> = {
    q1: q1Ref.value,
    q2: q2Ref.value,
    q3: q3Ref.value,
    q4: q4Ref.value,
    uncategorized: uncategorizedRef.value
  };

  const element = zoneMap[zoneName];
  if (element) {
    element.classList.add('drop-zone-active');
  }
}

// 移除放置区域高亮
function removeDropZoneHighlight(zoneName: string) {
  const zoneMap: Record<string, HTMLElement | null> = {
    q1: q1Ref.value,
    q2: q2Ref.value,
    q3: q3Ref.value,
    q4: q4Ref.value,
    uncategorized: uncategorizedRef.value
  };

  const element = zoneMap[zoneName];
  if (element) {
    element.classList.remove('drop-zone-active');
  }
}

// 获取笔记显示文本
function getDisplayText(note: QuadrantNote): string {
  const maxLength = 30;
  let text = note.title?.trim() || note.content;
  
  // 确保移除任何可能的象限标记
  text = text.replace(/\[quadrant:-?\d+,-?\d+\]\s*/g, '').trim();
  
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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

/* 放置区域高亮 */
.drop-zone-active {
  background-color: rgba(64, 158, 255, 0.1) !important;
  border-color: #409eff !important;
  box-shadow: inset 0 0 0 2px rgba(64, 158, 255, 0.3) !important;
  transition: all 0.2s ease !important;
}

.quadrant.drop-zone-active {
  background: rgba(64, 158, 255, 0.1) !important;
}

.uncategorized-area.drop-zone-active {
  background-color: rgba(64, 158, 255, 0.05) !important;
  border-color: #409eff !important;
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