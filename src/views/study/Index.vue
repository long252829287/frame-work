<template>
  <div class="study-page">
    <div class="header">
      <h1>学习记录</h1>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon>➕</el-icon>
        新建科目
      </el-button>
    </div>

    <div class="subjects-grid">
      <div v-for="subject in subjects" :key="subject.id" class="subject-card" @click="openSubject(subject)">
        <div class="card-header">
          <h3>{{ subject.name }}</h3>
          <div class="card-actions">
            <el-button size="small" type="text" @click.stop="editSubject(subject)">
              <el-icon>✏️</el-icon>
            </el-button>
            <el-popconfirm title="确定删除这个科目吗？" @confirm="deleteSubject(subject.id)">
              <template #reference>
                <el-button size="small" type="text" @click.stop>
                  <el-icon>🗑️</el-icon>
                </el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
        <p v-if="subject.description" class="description">{{ subject.description }}</p>
        <div class="file-count">
          <el-icon>📄</el-icon>
          {{ subject.files.length }} 个文件
        </div>
      </div>
    </div>

    <!-- Create/Edit Subject Dialog -->
    <el-dialog v-model="showCreateDialog" :title="editingSubject ? '编辑科目' : '新建科目'" width="500px">
      <el-form ref="formRef" :model="subjectForm" :rules="formRules" label-width="80px">
        <el-form-item label="科目名称" prop="name">
          <el-input v-model="subjectForm.name" placeholder="请输入科目名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="subjectForm.description" type="textarea" :rows="3" placeholder="请输入科目描述（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="saveSubject" :loading="saving">
          {{ editingSubject ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { commonService } from '@/service'
import type { StudySubject } from '@/types/api'

const router = useRouter()
const subjects = ref<StudySubject[]>([])
const showCreateDialog = ref(false)
const editingSubject = ref<StudySubject | null>(null)
const saving = ref(false)

const formRef = ref()
const subjectForm = reactive({
  name: '',
  description: ''
})

const formRules = {
  name: [{ required: true, message: '请输入科目名称', trigger: 'blur' }]
}

async function loadSubjects() {
  try {
    const response = await commonService.apiListStudySubjects()
    const data = response?.data as any
    subjects.value = Array.isArray(data) ? data : (data?.items || [])
  } catch (error) {
    console.error('加载科目失败:', error)
    ElMessage.error('加载科目失败')
  }
}

function openSubject(subject: StudySubject) {
  router.push(`/study/${subject.id}`)
}

function editSubject(subject: StudySubject) {
  editingSubject.value = subject
  subjectForm.name = subject.name
  subjectForm.description = subject.description || ''
  showCreateDialog.value = true
}

async function saveSubject() {
  try {
    await formRef.value?.validate()
    saving.value = true

    if (editingSubject.value) {
      await commonService.apiUpdateStudySubject(editingSubject.value.id, subjectForm)
      ElMessage.success('科目更新成功')
    } else {
      await commonService.apiCreateStudySubject(subjectForm)
      ElMessage.success('科目创建成功')
    }

    showCreateDialog.value = false
    resetSubjectForm()
    await loadSubjects()
  } catch (error) {
    console.error('保存科目失败:', error)
    ElMessage.error('保存科目失败')
  } finally {
    saving.value = false
  }
}

async function deleteSubject(id: string) {
  try {
    await commonService.apiDeleteStudySubject(id)
    ElMessage.success('科目删除成功')
    await loadSubjects()
  } catch (error) {
    console.error('删除科目失败:', error)
    ElMessage.error('删除科目失败')
  }
}

function resetSubjectForm() {
  subjectForm.name = ''
  subjectForm.description = ''
  editingSubject.value = null
}

onMounted(() => {
  loadSubjects()
})
</script>

<style scoped lang="scss">
.study-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
    color: #1f2937;
  }
}

.subjects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.subject-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }

    .card-actions {
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
  }

  &:hover .card-actions {
    opacity: 1;
  }

  .description {
    color: #6b7280;
    font-size: 14px;
    margin: 8px 0;
    line-height: 1.5;
  }

  .file-count {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #6b7280;
    font-size: 14px;
    margin-top: 12px;
  }
}
</style>
