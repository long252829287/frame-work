<template>
  <div class="study-detail">
    <div class="header">
      <el-button @click="$router.back()" type="text">
        <el-icon>⬅️</el-icon>
        返回
      </el-button>
      <h1>{{ subject?.name }}</h1>
      <el-button type="primary" @click="showCreateFileDialog = true">
        <el-icon>➕</el-icon>
        新建文件
      </el-button>
    </div>

    <div class="content">
      <div class="file-list">
        <div class="file-header">
          <h3>文件列表</h3>
          <span class="file-count">{{ subject?.files.length || 0 }} 个文件</span>
        </div>
        <div class="files">
          <div v-for="fileName in subject?.files" :key="fileName" class="file-item"
            :class="{ active: selectedFile === fileName }" @click="selectFile(fileName)">
            <el-icon>📄</el-icon>
            <span>{{ fileName }}</span>
            <div class="file-actions">
              <el-button size="small" type="text" @click.stop="editFile(fileName)">
                <el-icon>✏️</el-icon>
              </el-button>
              <el-popconfirm title="确定删除这个文件吗？" @confirm="deleteFile(fileName)">
                <template #reference>
                  <el-button size="small" type="text" @click.stop>
                    <el-icon>🗑️</el-icon>
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>
        </div>
      </div>

      <div class="markdown-preview">
        <div v-if="selectedFile" class="preview-header">
          <h3>{{ selectedFile }}</h3>
          <el-button type="primary" size="small" @click="editCurrentFile">
            <el-icon>✏️</el-icon>
            编辑
          </el-button>
        </div>
        <div v-if="selectedFile" class="preview-content">
          <div v-html="renderedMarkdown" class="markdown-body"></div>
        </div>
        <div v-else class="no-file">
          <el-icon>📄</el-icon>
          <p>选择一个文件进行预览</p>
        </div>
      </div>
    </div>

    <!-- Create/Edit File Dialog -->
    <el-dialog v-model="showCreateFileDialog" :title="editingFile ? '编辑文件' : '新建文件'" width="80%">
      <el-form ref="fileFormRef" :model="fileForm" :rules="fileFormRules" label-width="80px">
        <el-form-item label="文件名" prop="name">
          <el-input v-model="fileForm.name" placeholder="请输入文件名（不需要.md后缀）" :disabled="editingFile" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="fileForm.content" type="textarea" :rows="20" placeholder="请输入Markdown内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateFileDialog = false">取消</el-button>
        <el-button type="primary" @click="saveFile" :loading="savingFile">
          {{ editingFile ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import { commonService } from '@/service'
import type { StudySubject, MarkdownFile } from '@/types/api'

const route = useRoute()
const router = useRouter()

const subject = ref<StudySubject | null>(null)
const selectedFile = ref('')
const currentFileContent = ref('')
const showCreateFileDialog = ref(false)
const editingFile = ref('')
const savingFile = ref(false)

const fileFormRef = ref()
const fileForm = reactive({
  name: '',
  content: ''
})

const fileFormRules = {
  name: [{ required: true, message: '请输入文件名', trigger: 'blur' }],
  content: [{ required: true, message: '请输入文件内容', trigger: 'blur' }]
}

const renderedMarkdown = computed(() => {
  // Simple markdown rendering
  return currentFileContent.value
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\n/g, '<br>')
})

async function loadSubject() {
  const subjectId = route.params.id as string
  try {
    const response = await commonService.apiGetStudySubject(subjectId)
    subject.value = response.data
  } catch (error) {
    console.error('加载科目失败:', error)
    ElMessage.error('加载科目失败')
    router.push('/study')
  }
}

async function selectFile(fileName: string) {
  if (!subject.value) return

  try {
    selectedFile.value = fileName
    const response = await commonService.apiGetMarkdownFile(subject.value.id, fileName)
    currentFileContent.value = response.data.content
  } catch (error) {
    console.error('加载文件失败:', error)
    ElMessage.error('加载文件失败')
  }
}

function editFile(fileName: string) {
  editingFile.value = fileName
  fileForm.name = fileName.replace('.md', '')
  fileForm.content = currentFileContent.value
  showCreateFileDialog.value = true
}

function editCurrentFile() {
  if (selectedFile.value) {
    editFile(selectedFile.value)
  }
}

async function saveFile() {
  try {
    await fileFormRef.value?.validate()
    savingFile.value = true

    if (!subject.value) return

    if (editingFile.value) {
      await commonService.apiUpdateMarkdownFile(
        subject.value.id,
        editingFile.value,
        { content: fileForm.content }
      )
      ElMessage.success('文件更新成功')
    } else {
      await commonService.apiCreateMarkdownFile(
        subject.value.id,
        { name: fileForm.name, content: fileForm.content }
      )
      ElMessage.success('文件创建成功')
    }

    showCreateFileDialog.value = false
    resetFileForm()
    await loadSubject()
  } catch (error) {
    console.error('保存文件失败:', error)
    ElMessage.error('保存文件失败')
  } finally {
    savingFile.value = false
  }
}

async function deleteFile(fileName: string) {
  if (!subject.value) return

  try {
    await commonService.apiDeleteMarkdownFile(subject.value.id, fileName)
    ElMessage.success('文件删除成功')
    await loadSubject()

    if (selectedFile.value === fileName) {
      selectedFile.value = ''
      currentFileContent.value = ''
    }
  } catch (error) {
    console.error('删除文件失败:', error)
    ElMessage.error('删除文件失败')
  }
}

function resetFileForm() {
  fileForm.name = ''
  fileForm.content = ''
  editingFile.value = ''
}

onMounted(() => {
  loadSubject()
})
</script>

<style scoped lang="scss">
.study-detail {
  padding: 24px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;

  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #1f2937;
    flex: 1;
  }
}

.content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  flex: 1;
  overflow: hidden;
}

.file-list {
  border-right: 1px solid #e5e7eb;
  padding-right: 24px;
  overflow-y: auto;

  .file-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .file-count {
      color: #6b7280;
      font-size: 14px;
    }
  }

  .files {
    .file-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      margin-bottom: 4px;

      &:hover {
        background-color: #f3f4f6;
      }

      &.active {
        background-color: #dbeafe;
        color: #1d4ed8;
      }

      .file-actions {
        margin-left: auto;
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      &:hover .file-actions {
        opacity: 1;
      }
    }
  }
}

.markdown-preview {
  overflow-y: auto;

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .preview-content {
    padding: 16px;
    background-color: #f9fafb;
    border-radius: 8px;

    .markdown-body {
      line-height: 1.6;
      color: #374151;

      h1,
      h2,
      h3 {
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
      }

      h1 {
        font-size: 24px;
      }

      h2 {
        font-size: 20px;
      }

      h3 {
        font-size: 18px;
      }

      p {
        margin-bottom: 16px;
      }

      strong {
        font-weight: 600;
      }

      em {
        font-style: italic;
      }
    }
  }

  .no-file {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    color: #9ca3af;

    .el-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    p {
      margin: 0;
      font-size: 16px;
    }
  }
}
</style>
