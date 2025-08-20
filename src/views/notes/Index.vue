<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { commonService } from '@/service'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

interface NoteItem {
  id: string
  title?: string
  content: string
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

const loading = ref(false)
const list = ref<NoteItem[]>([])
const total = ref(0)

const editor = reactive<Partial<NoteItem>>({
  id: '',
  title: '',
  content: '',
  tags: [],
})
const drawerVisible = ref(false)

async function fetchNotes() {
  loading.value = true
  try {
    const res = await commonService.apiGetNotes()
    const data = res.data
    if (Array.isArray(data)) {
      list.value = data
      total.value = data.length
    } else {
      list.value = data?.items ?? data?.list ?? []
      total.value = data?.total ?? list.value.length
    }
  } finally {
    loading.value = false
  }
}

function openCreate() {
  Object.assign(editor, { id: '', title: '', content: '', tags: [] })
  drawerVisible.value = true
}

function openEdit(row: NoteItem) {
  Object.assign(editor, row)
  drawerVisible.value = true
}

async function saveNote() {
  if (!editor.content) {
    window.alert('内容不能为空')
    return
  }
  if (editor.id) {
    await commonService.apiUpdateNote(editor.id as string, editor)
  } else {
    await commonService.apiCreateNote(editor as any)
  }
  drawerVisible.value = false
  await fetchNotes()
}

async function removeNote(row: NoteItem) {
  await commonService.apiDeleteNote(row.id)
  await fetchNotes()
}

async function handleLogout() {
  try {
    await auth.logout()
    // 退出登录后跳转到登录页
    window.location.href = '/login'
  } catch (error) {
    console.error('退出登录失败:', error)
    // 即使退出失败，也清除本地状态并跳转
    window.location.href = '/login'
  }
}

onMounted(fetchNotes)
</script>

<template>
  <div style="max-width: 960px; margin: 20px auto;">
    <div style="display:flex; justify-content: space-between; align-items:center; margin-bottom: 12px;">
      <div>
        <h2 style="margin:0;">我的笔记 ({{ total }})</h2>
        <div style="color: #666; font-size: 14px; margin-top: 4px;">
          欢迎回来，{{ auth.user?.nickname || auth.user?.username || '用户' }}
        </div>
      </div>
      <div>
        <el-button type="primary" @click="openCreate">新建笔记</el-button>
        <el-button @click="handleLogout">退出登录</el-button>
      </div>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="title" label="标题" width="240" />
      <el-table-column prop="content" label="内容">
        <template #default="{ row }">
          <div style="white-space: pre-wrap;">{{ row.content }}</div>
        </template>
      </el-table-column>
      <el-table-column label="标签" width="200">
        <template #default="{ row }">
          <el-space wrap>
            <el-tag v-for="t in row.tags || []" :key="t">{{ t }}</el-tag>
          </el-space>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-popconfirm title="确认删除这条笔记？" @confirm="removeNote(row)">
            <template #reference>
              <el-button link type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-drawer v-model="drawerVisible" :title="editor.id ? '编辑笔记' : '新建笔记'" size="50%">
      <el-form label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="editor.title" placeholder="可选" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="editor.content" type="textarea" :autosize="{ minRows: 8 }" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="editor.tags" multiple filterable allow-create default-first-option style="width:100%">
            <el-option v-for="t in (editor.tags || [])" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-space>
            <el-button type="primary" @click="saveNote">保存</el-button>
            <el-button @click="drawerVisible = false">取消</el-button>
          </el-space>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<style scoped></style>
