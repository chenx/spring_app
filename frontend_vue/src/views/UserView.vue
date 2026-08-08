<template>
  <div class="user-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span style="font-size: 18px; font-weight: bold">User Management</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            Add User
          </el-button>
        </div>
      </template>

      <el-table :data="users" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="username" label="Username" width="150" />
        <el-table-column prop="email" label="Email" width="220" />
        <el-table-column prop="role" label="Role" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.role === 'ADMIN' ? 'danger' : 'info'">
              {{ row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created At" width="200">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" fixed="right" width="200" align="center">
          <template #default="{ row }">
            <el-tooltip
              :content="[1, 2].includes(row.id) ? 'Cannot edit default testing account' : ''"
              :disabled="![1, 2].includes(row.id)"
              placement="top"
            >
              <el-button type="primary" size="small" @click="handleEdit(row as User)"
                :disabled="[1, 2].includes(Number(row.id))">
                <el-icon><Edit /></el-icon>
                Edit
              </el-button>
            </el-tooltip>
            <el-tooltip
              :content="[1, 2].includes(row.id) ? 'Cannot delete default testing account' : ''"
              :disabled="![1, 2].includes(row.id)"
              placement="top"
            >
              <el-button type="danger" size="small" @click="handleDelete(row as User)"
                :disabled="[1, 2].includes(Number(row.id))">
                <el-icon><Delete /></el-icon>
                Delete
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? 'Edit User' : 'Add User'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="Username" prop="username">
          <el-input v-model="form.username" placeholder="Enter username" />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" placeholder="Enter email" />
        </el-form-item>
        <el-form-item label="Role" prop="role">
          <el-select v-model="form.role" placeholder="Select role" style="width: 100%">
            <el-option label="User" value="USER" />
            <el-option label="Admin" value="ADMIN" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">
          {{ isEdit ? 'Update' : 'Create' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getUsers, createUser, updateUser, deleteUser } from '@/api/user'
import type { User, UserRequest } from '@/types'

const users = ref<User[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number>(0)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const form = reactive<UserRequest>({
  username: '',
  email: '',
  role: 'USER',
})

const rules = reactive<FormRules<UserRequest>>({
  username: [
    { required: true, message: 'Please enter username', trigger: 'blur' },
    { min: 2, max: 50, message: 'Username must be 2-50 characters', trigger: 'blur' },
  ],
  email: [
    { required: true, message: 'Please enter email', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email', trigger: 'blur' },
  ],
  role: [
    { required: true, message: 'Please select role', trigger: 'change' },
  ],
})

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString()
}

async function fetchUsers() {
  loading.value = true
  try {
    const res = await getUsers()
    users.value = res.data
  } catch (err: any) {
    ElMessage.error(err.message || 'Failed to fetch users')
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  isEdit.value = false
  editingId.value = 0
  form.username = ''
  form.email = ''
  form.role = 'USER'
  dialogVisible.value = true
}

function handleEdit(row: User) {
  isEdit.value = true
  editingId.value = row.id
  form.username = row.username
  form.email = row.email
  form.role = row.role
  dialogVisible.value = true
}

async function handleDelete(row: User) {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete user "${row.username}"?`,
      'Confirm Delete',
      { confirmButtonText: 'Delete', cancelButtonText: 'Cancel', type: 'warning' }
    )
    await deleteUser(row.id)
    ElMessage.success('User deleted successfully')
    await fetchUsers()
  } catch (err: any) {
    if (err !== 'cancel') {
      ElMessage.error(err.message || 'Failed to delete user')
    }
  }
}

async function submitForm() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value) {
      await updateUser(editingId.value, { ...form })
      ElMessage.success('User updated successfully')
    } else {
      await createUser({ ...form })
      ElMessage.success('User created successfully')
    }
    dialogVisible.value = false
    await fetchUsers()
  } catch (err: any) {
    ElMessage.error(err.message || 'Operation failed')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
