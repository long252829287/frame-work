<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          <el-button circle size="small" @click="goBack" class="back-button">
            <el-icon>
              <ArrowLeft />
            </el-icon>
          </el-button>
          共享笔记 ({{ total }})
        </h1>
        <p class="page-subtitle">与他人协作的笔记本</p>
      </div>
      <div>
        <el-button type="primary" @click="openCreateDialog">新建共享笔记</el-button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading loading-icon">
        <Loading />
      </el-icon>
      <p class="loading-text">加载中...</p>
    </div>

    <div v-else-if="list.length === 0" class="empty-state">
      <el-empty description="暂无共享笔记">
        <el-button type="primary" @click="openCreateDialog">创建第一个共享笔记</el-button>
      </el-empty>
    </div>

    <div v-else class="shared-notes-grid">
      <div v-for="note in list" :key="note._id" class="shared-note-card" @click="goToDetail(note._id)">
        <div class="card-header">
          <h3>{{ note.title }}</h3>
          <el-dropdown>
            <el-icon>
              <MoreFilled />
            </el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click.stop="editNote(note)">编辑</el-dropdown-item>
                <el-dropdown-item @click.stop="deleteNote(note)" divided>删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div class="card-content">
          <div class="participants">
            <span class="label">参与者:</span>
            <el-space wrap>
              <el-tag v-for="participant in note.participants" :key="participant" size="small">
                {{ participant }}
              </el-tag>
            </el-space>
          </div>
          <div class="meta-info">
            <span>创建者: {{ note.createdBy }}</span>
            <span v-if="note.createdAt">{{ formatDate(note.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建/编辑共享笔记对话框 -->
    <el-dialog v-model="dialogVisible" :title="editingNote ? '编辑共享笔记' : '新建共享笔记'" width="600px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="笔记标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入笔记标题" />
        </el-form-item>
        <el-form-item label="参与用户" prop="participants">
          <el-select v-model="form.participants" multiple filterable placeholder="请选择参与用户" class="full-width"
            :loading="usersLoading">
            <el-option v-for="user in availableUsers" :key="user._id" :label="user.nickname || user.username"
              :value="user.username" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveNote" :loading="saving">
          {{ editingNote ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading, MoreFilled, ArrowLeft } from '@element-plus/icons-vue'
import { commonService } from '@/service'
import type { SharedNote, User } from '@/types'

const router = useRouter()

const loading = ref(false)
const usersLoading = ref(false)
const saving = ref(false)
const list = ref<SharedNote[]>([])
const total = ref(0)
const availableUsers = ref<User[]>([])

const dialogVisible = ref(false)
const editingNote = ref<SharedNote | null>(null)
const formRef = ref()

const form = reactive({
  title: '',
  participants: [] as string[]
})

const rules = {
  title: [
    { required: true, message: '请输入笔记标题', trigger: 'blur' },
    { min: 1, max: 50, message: '标题长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  participants: [
    { required: true, message: '请选择至少一个参与用户', trigger: 'change' }
  ]
}

onMounted(() => {
  fetchSharedNotes()
  fetchUsers()
})

async function fetchSharedNotes() {
  loading.value = true
  try {
    const res = await commonService.apiGetSharedNotes()
    list.value = res.data.data.notes || []
    total.value = 0
  } finally {
    loading.value = false
  }
}

async function fetchUsers() {
  usersLoading.value = true
  try {
    const res = await commonService.apiGetAllUsers()
    console.log('res', res);
    availableUsers.value = res.data.data || []
  } finally {
    usersLoading.value = false
  }
}

function openCreateDialog() {
  editingNote.value = null
  resetForm()
  dialogVisible.value = true
}

function editNote(note: SharedNote) {
  editingNote.value = note
  form.title = note.title
  form.participants = [...note.participants]
  dialogVisible.value = true
}

function resetForm() {
  form.title = ''
  form.participants = []
  formRef.value?.clearValidate()
}

async function saveNote() {
  const valid = await formRef.value?.validate()
  if (!valid) return

  saving.value = true
  try {
    if (editingNote.value) {
      await commonService.apiUpdateSharedNote(editingNote.value._id, form)
      ElMessage.success('共享笔记更新成功')
    } else {
      await commonService.apiCreateSharedNote(form)
      ElMessage.success('共享笔记创建成功')
    }

    dialogVisible.value = false
    await fetchSharedNotes()
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  } finally {
    saving.value = false
  }
}

async function deleteNote(note: SharedNote) {
  try {
    await ElMessageBox.confirm(
      '确认删除这个共享笔记吗？删除后无法恢复。',
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await commonService.apiDeleteSharedNote(note._id)
    ElMessage.success('删除成功')
    await fetchSharedNotes()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请重试')
    }
  }
}

function goToDetail(noteId: string) {
  router.push(`/shared-notes/${noteId}`)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

function goBack() {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  margin-right: 8px;
}

.page-title {
  margin: 0;
}

.page-subtitle {
  margin: var(--spacing-sm) 0 0 0;
  color: var(--color-text-secondary);
}

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

.full-width {
  width: 100%;
}

.shared-notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.shared-note-card {
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  background: var(--color-bg-primary);
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  box-shadow: var(--shadow-sm);
}

.shared-note-card:hover {
  border-color: var(--color-accent-primary);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.card-header h3 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: 1.4;
  flex: 1;
  margin-right: var(--spacing-sm);
}

.card-header .el-dropdown {
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast);
}

.card-header .el-dropdown:hover {
  background-color: var(--color-bg-secondary);
}

.card-content .participants {
  margin-bottom: 12px;
}

.card-content .label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-right: var(--spacing-sm);
}

.meta-info {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .shared-notes-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .shared-note-card {
    padding: 16px;
  }
}
</style>
