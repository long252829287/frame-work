<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading loading-icon">
        <Loading />
      </el-icon>
      <p class="loading-text">加载中...</p>
    </div>

    <div v-else-if="!sharedNote" class="empty-state">
      <el-empty description="共享笔记不存在或无权访问">
        <el-button type="primary" @click="goBack">返回列表</el-button>
      </el-empty>
    </div>

    <div v-else>
      <!-- 头部信息 -->
      <div class="detail-header">
        <div>
          <div class="title-row">
            <el-button circle size="small" @click="goBack" class="back-button">
              <el-icon>
                <ArrowLeft />
              </el-icon>
            </el-button>
            <h2 class="detail-title">{{ sharedNote.title }}</h2>
          </div>
          <div class="meta-info">
            <span>创建者: {{ sharedNote.createdBy }}</span>
            <span class="meta-separator">参与者: {{ sharedNote.participants.join(', ') }}</span>
            <span class="meta-separator" v-if="sharedNote.createdAt">
              创建时间: {{ formatDate(sharedNote.createdAt) }}
            </span>
          </div>
        </div>
        <div>
          <el-button @click="openNoteCreator">新建笔记</el-button>
          <el-button type="primary" @click="refreshNotes">刷新</el-button>
        </div>
      </div>

      <!-- 四象限视图 -->
      <QuadrantViewComp ref="quadrantViewRef" :shared-note-id="sharedNote._id" @update-note="handleNoteUpdate" />

      <!-- 新建笔记对话框 -->
      <el-dialog v-model="noteDialogVisible" :title="editingNote ? '编辑笔记' : '新建笔记'" width="600px"
        @close="resetNoteForm">
        <el-form ref="noteFormRef" :model="noteForm" :rules="noteRules" label-width="80px">
          <el-form-item label="标题" prop="title">
            <el-input v-model="noteForm.title" placeholder="可选，如果为空将使用内容的前几个字" />
          </el-form-item>
          <el-form-item label="内容" prop="content">
            <el-input v-model="noteForm.content" type="textarea" :autosize="{ minRows: 6 }" placeholder="请输入笔记内容" />
          </el-form-item>
          <el-form-item label="标签" prop="tags">
            <el-select v-model="noteForm.tags" multiple filterable allow-create default-first-option class="full-width"
              placeholder="可选，输入后按回车添加标签">
              <el-option v-for="tag in noteForm.tags || []" :key="tag" :label="tag" :value="tag" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="noteDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveNote" :loading="noteSaving">
            {{ editingNote ? '更新' : '创建' }}
          </el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading, ArrowLeft } from '@element-plus/icons-vue'
import { commonService } from '@/service'
import QuadrantViewComp from '@/components/quadrantView/quadrantViewComp.vue'
import type { SharedNote, SharedQuadrantNote } from '@/types'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const noteSaving = ref(false)
const sharedNote = ref<SharedNote | null>(null)

const noteDialogVisible = ref(false)
const editingNote = ref<SharedQuadrantNote | null>(null)
const noteFormRef = ref()
const quadrantViewRef = ref()

const noteForm = reactive({
  title: '',
  content: '',
  tags: [] as string[]
})

const noteRules = {
  content: [
    { required: true, message: '请输入笔记内容', trigger: 'blur' },
    { min: 1, max: 1000, message: '内容长度在 1 到 1000 个字符', trigger: 'blur' }
  ]
}

onMounted(() => {
  fetchSharedNote()
})

async function fetchSharedNote() {
  const id = route.params.id as string
  if (!id) {
    goBack()
    return
  }

  loading.value = true
  try {
    const res = await commonService.apiGetSharedNote(id)
    sharedNote.value = res.data.data;
  } catch (error) {
    ElMessage.error('获取共享笔记失败')
    console.error('获取共享笔记失败:', error)
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/shared-notes')
}

function openNoteCreator() {
  editingNote.value = null
  resetNoteForm()
  noteDialogVisible.value = true
}

function editNote(note: SharedQuadrantNote) {
  editingNote.value = note
  noteForm.title = note.title || ''
  noteForm.content = note.content
  noteForm.tags = [...(note.tags || [])]
  noteDialogVisible.value = true
}

function resetNoteForm() {
  noteForm.title = ''
  noteForm.content = ''
  noteForm.tags = []
  noteFormRef.value?.clearValidate()
}

async function saveNote() {
  const valid = await noteFormRef.value?.validate()
  if (!valid) return

  noteSaving.value = true
  try {
    const noteData = {
      ...noteForm,
      sharedNoteId: sharedNote.value!._id,
      x_axis: 0,
      y_axis: 0,
      order: 0
    }

    if (editingNote.value) {
      await commonService.apiUpdateSharedNoteItem(editingNote.value._id, noteData)
      ElMessage.success('笔记更新成功')
    } else {
      await commonService.apiCreateSharedNoteItem(sharedNote.value!._id, noteData)
      ElMessage.success('笔记创建成功')
    }

    noteDialogVisible.value = false
    await refreshNotes()
  } catch (error) {
    ElMessage.error('操作失败，请重试')
    console.error('保存笔记失败:', error)
  } finally {
    noteSaving.value = false
  }
}

async function refreshNotes() {
  if (quadrantViewRef.value) {
    await quadrantViewRef.value.fetchNotes()
  }
}

function handleNoteUpdate(note: SharedQuadrantNote) {
  // 处理笔记更新，可能需要同步到其他用户
  console.log('笔记更新:', note)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style lang="scss" scoped>
.loading-state {
  text-align: center;
  padding: 40px;
}

.loading-icon {
  font-size: 32px;
  color: var(--color-accent-primary);
}

.loading-text {
  margin-top: var(--spacing-md);
  color: var(--color-text-secondary);
}

.empty-state {
  text-align: center;
  padding: 60px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.back-button {
  margin-right: 8px;
}

.detail-title {
  margin: 0;
}

.meta-info {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.meta-separator {
  margin-left: 16px;
}

.full-width {
  width: 100%;
}
</style>
