<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { commonService } from '@/service'
import type { PaginatedList, NoteItem } from '@/types'
import QuadrantViewComp from '@/components/quadrantView/quadrantViewComp.vue'
const loading = ref(false)
const list = ref<NoteItem[]>([])
const total = ref(0)

const editor = reactive<Partial<NoteItem>>({
  _id: '',
  title: '',
  content: '',
  tags: [],
})
const drawerVisible = ref(false)

const componentKey = ref(0)

async function fetchNotes() {
  loading.value = true
  try {
    const res = await commonService.apiGetNotes()
    const data = res.data as PaginatedList<NoteItem>
    list.value = data.data.notes || []
    total.value = data.data.count || 0
  } finally {
    loading.value = false
  }
}

function openCreate() {
  Object.assign(editor, { _id: '', title: '', content: '', tags: [] })
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
  if (editor._id) {
    await commonService.apiUpdateNote(editor._id as string, editor)
  } else {
    await commonService.apiCreateNote(editor as any)
  }
  drawerVisible.value = false
  await fetchNotes()
  componentKey.value++
}

async function removeNote(row: NoteItem) {
  await commonService.apiDeleteNote(row._id)
  await fetchNotes()
  componentKey.value++
}

onMounted(fetchNotes)
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">我的笔记 ({{ total }})</h2>
      </div>
      <div>
        <el-button type="primary" @click="openCreate">新建笔记</el-button>
      </div>
    </div>

    <quadrant-view-comp :key="componentKey" />

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="title" label="标题" width="240" />
      <el-table-column prop="content" label="内容">
        <template #default="{ row }">
          <div class="content-cell">{{ row.content }}</div>
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

    <el-drawer v-model="drawerVisible" :title="editor._id ? '编辑笔记' : '新建笔记'" size="50%">
      <el-form label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="editor.title" placeholder="可选" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="editor.content" type="textarea" :autosize="{ minRows: 8 }" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="editor.tags"
            multiple
            filterable
            allow-create
            default-first-option
            class="full-width"
          >
            <el-option v-for="t in editor.tags || []" :key="t" :label="t" :value="t" />
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

<style scoped>
.page-container {
  max-width: 960px;
  margin: 20px auto;
  padding-top: 60px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.page-title {
  margin: 0;
}

.content-cell {
  white-space: pre-wrap;
}

.full-width {
  width: 100%;
}
</style>
