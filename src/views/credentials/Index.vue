<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { commonService } from '@/service'
import type { CredentialItem } from '@/types'

const loading = ref(false)
const list = ref<CredentialItem[]>([])

const editorVisible = ref(false)
const revealVisible = ref(false)
const revealPassword = ref('')

const form = reactive<{
  id?: string
  account: string
  password?: string
  website: string
  notes?: string
}>({
  account: '',
  password: '',
  website: '',
  notes: '',
})

async function fetchList() {
  loading.value = true
  try {
    const res = await commonService.apiListCredentials()
    const data = res.data as any
    list.value = Array.isArray(data) ? data : (data?.items ?? data?.list ?? [])
  } finally {
    loading.value = false
  }
}

function openCreate() {
  Object.assign(form, { id: '', account: '', password: '', website: '', notes: '' })
  editorVisible.value = true
}

function openEdit(row: CredentialItem) {
  Object.assign(form, {
    id: row.id,
    account: row.account,
    password: '',
    website: row.website,
    notes: row.notes || '',
  })
  editorVisible.value = true
}

async function save() {
  if (!form.account || !form.website) {
    window.alert('账号与站点不能为空')
    return
  }
  if (form.id) {
    const { id, account, password, website, notes } = form
    await commonService.apiUpdateCredential(id!, { account, password, website, notes })
  } else {
    const { account, password, website, notes } = form
    if (!password) {
      window.alert('创建时请输入密码')
      return
    }
    await commonService.apiCreateCredential({ account, password, website, notes })
  }
  editorVisible.value = false
  await fetchList()
}

async function removeRow(row: CredentialItem) {
  await commonService.apiDeleteCredential(row.id)
  await fetchList()
}

async function reveal(row: CredentialItem) {
  const res = await commonService.apiRevealCredentialPassword(row.id)
  revealPassword.value = (res.data as any)?.password || ''
  revealVisible.value = true
}

onMounted(fetchList)
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">凭据管理</h2>
      <el-button type="primary" @click="openCreate">新增凭据</el-button>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="account" label="账号" width="260" />
      <el-table-column prop="website" label="网站" />
      <el-table-column prop="notes" label="备注" />
      <el-table-column label="操作" width="260" fixed="right">
        <template #default="{ row }">
          <el-space>
            <el-button link type="primary" @click="reveal(row)">明文查看</el-button>
            <el-button link @click="openEdit(row)">编辑</el-button>
            <el-popconfirm title="确认删除该凭据？" @confirm="removeRow(row)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </el-space>
        </template>
      </el-table-column>
    </el-table>

    <el-drawer v-model="editorVisible" :title="form.id ? '编辑凭据' : '新增凭据'" size="40%">
      <el-form label-width="100px">
        <el-form-item label="账号">
          <el-input v-model="form.account" placeholder="例如 user@example.com" />
        </el-form-item>
        <el-form-item :label="form.id ? '新密码' : '密码'">
          <el-input v-model="form.password" type="password" placeholder="留空则不修改" />
        </el-form-item>
        <el-form-item label="网站">
          <el-input v-model="form.website" placeholder="例如 https://example.com" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.notes" type="textarea" :autosize="{ minRows: 3 }" />
        </el-form-item>
        <el-form-item>
          <el-space>
            <el-button type="primary" @click="save">保存</el-button>
            <el-button @click="editorVisible = false">取消</el-button>
          </el-space>
        </el-form-item>
      </el-form>
    </el-drawer>

    <el-dialog v-model="revealVisible" title="明文密码" width="400px">
      <div class="password-display">
        {{ revealPassword || '无' }}
      </div>
      <template #footer>
        <el-button type="primary" @click="revealVisible = false">我知道了</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1000px;
  margin: 20px auto;
  margin-top: 90px;
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

.password-display {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.3px;
}
</style>
