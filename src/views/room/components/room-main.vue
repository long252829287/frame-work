<script lang="ts" setup>
import { ref } from 'vue'
import { ElTable } from 'element-plus'

interface User {
  date: string
  name: string
  address: string
}
const activeName = ref('1')

const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<User[]>([])
const toggleSelection = (rows?: User[]) => {
  if (rows) {
    rows.forEach((row) => {
      multipleTableRef.value!.toggleRowSelection(row, undefined)
    }) 
  } else {
    multipleTableRef.value!.clearSelection()
  }
}
const handleSelectionChange = (val: User[]) => {
  multipleSelection.value = val
}

const tableData: User[] = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-08',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-06',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-07',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
]
</script>

<template>
  <main>
    <div class="left-tip">
      <div class="demo-collapse">
          <el-collapse v-model="activeNames" accordion>
            <el-collapse-item title="斗鱼" name="1">
              <div>
                LvGe: 5110403
              </div>
              <div>
                寅子: 71314
              </div>
              <div>
                测试: 1488293
              </div>
              <div>
                测试2: 71314
              </div>
            </el-collapse-item>
            <el-collapse-item title="虎牙" name="2">
              <div>
                981585
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    <div class="right-table">
      <el-table
        ref="multipleTableRef"
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="roomNumber" width="120">
          <template #default="scope">{{ scope.row.roomNumber }}</template>
        </el-table-column>
        <el-table-column property="name" label="Name" width="120" />
        <el-table-column property="address" label="Address" show-overflow-tooltip />
      </el-table>
      <div style="margin-top: 20px">
        <el-button @click="toggleSelection([tableData[1], tableData[2]])">Toggle selection status of second and third rows</el-button>
        <el-button @click="toggleSelection()">Clear selection</el-button>
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
main {
  flex: 1;
  display: flex;
  justify-content: space-between;
  background: #fff;
  padding: 20px;
  .left-tip {
    width: 30%;
  }
  .right-table {
    width: 50%
  }
}
</style>