<template>
  <div class="user-management-container p-6 animate-fade-in text-slate-900 bg-slate-50 min-h-screen">
    <!-- Header -->
    <div class="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center transition-all hover:shadow-md">
      <div>
        <h1 class="text-2xl font-bold bg-linear-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">用户管理</h1>
        <p class="text-sm text-slate-500 mt-2">统筹管理系统用户权限、账号及活动状态</p>
      </div>
      <div>
        <el-button type="primary" class="shadow-md shadow-blue-500/30" round @click="openDialog()">
          <el-icon class="mr-1"><Plus /></el-icon> 新增用户
        </el-button>
      </div>
    </div>

    <!-- Search Section -->
    <el-card class="mb-6 border-slate-100! shadow-sm! rounded-2xl! overflow-visible hover:shadow-md transition-shadow">
      <el-form :model="searchForm" inline class="search-form flex flex-wrap gap-2">
        <el-form-item label="账号名称">
          <el-input v-model="searchForm.username" placeholder="请输入账号" clearable class="w-48 rounded-lg!" />
        </el-form-item>
        <el-form-item label="用户角色">
          <el-select v-model="searchForm.role" placeholder="请选择角色" clearable class="w-48">
            <el-option label="老年人" :value="1" />
            <el-option label="家属" :value="2" />
            <el-option label="商家" :value="3" />
            <el-option label="管理员" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading" round class="px-6">查 询</el-button>
          <el-button @click="resetSearch" round>重 置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table Section -->
    <el-card class="border-slate-100! shadow-sm! rounded-2xl! overflow-hidden hover:shadow-md transition-shadow">
      <el-table :data="tableData" v-loading="loading" class="w-full" :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: '600' }">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="账号信息" min-width="180">
          <template #default="{ row }">
            <div class="flex items-center gap-3">
              <el-avatar :size="36" :src="row.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
              <div>
                <div class="font-medium text-slate-800">{{ row.username }}</div>
                <div class="text-xs text-slate-500">{{ row.nickname }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="realName" label="真实姓名" min-width="120">
          <template #default="{ row }">{{ row.realName || '-' }}</template>
        </el-table-column>
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)" round effect="light" class="border-opacity-50 font-medium">
              {{ getRoleName(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="2"
              active-color="#10b981"
              inactive-color="#f43f5e"
              @change="handleStatusChange(row)"
              :disabled="row.role === 4 && row.id === 1"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="180">
          <template #default="{ row }">
            <span class="text-slate-500 text-sm">{{ new Date(row.createdAt).toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-button link type="primary" size="small" @click="openDialog(row)">编辑</el-button>
              <el-popconfirm
                title="确定重置该账号密码为 123456 吗？"
                @confirm="handleResetPassword(row.id)"
                confirm-button-type="danger"
              >
                <template #reference>
                  <el-button link type="warning" size="small" :disabled="row.role === 4 && row.id === 1">重置密码</el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-6 flex justify-end">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
          class="font-medium!"
        />
      </div>
    </el-card>

    <!-- Form Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '新增用户'"
      width="500px"
      class="rounded-2xl! fade-in overflow-hidden"
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px" class="pr-6 mt-4">
        <el-form-item label="账号" prop="username">
          <el-input v-model="formData.username" placeholder="4-20位字母数字下划线" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="formData.password" placeholder="6-16位密码" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.role" placeholder="选择用户角色" class="w-full" :disabled="isEdit">
            <el-option label="老年人" :value="1" />
            <el-option label="家属" :value="2" />
            <el-option label="商家" :value="3" />
            <el-option label="管理员" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="系统显示名称" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="formData.realName" placeholder="选填，用户真实姓名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" round>取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading" round class="px-6 shadow-md shadow-blue-500/30">
            确 定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import {
  fetchUsers,
  createUser,
  updateUser,
  updateUserStatus,
  resetPassword,
  type User,
  type UserQuery
} from '@/api/users';

// State
const loading = ref(false);
const submitLoading = ref(false);
const tableData = ref<User[]>([]);
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
});

const searchForm = reactive<UserQuery>({
  username: '',
  role: undefined,
});

// Dialog state
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const currentUserId = ref<number | null>(null);

const formData = reactive({
  username: '',
  password: '',
  role: undefined as number | undefined,
  nickname: '',
  realName: '',
});

const formRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { pattern: /^[a-z0-9_]{4,20}$/, message: '长度在4-20个字符间，仅支持小写字母、数字和下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
});

// Helper functions
const getRoleName = (role: number) => {
  const map: Record<number, string> = { 1: '老年人', 2: '家属', 3: '社区商家', 4: '管理员' };
  return map[role] || '未知';
};

const getRoleTagType = (role: number) => {
  const map: Record<number, string> = { 1: 'success', 2: 'warning', 3: 'primary', 4: 'danger' };
  return map[role] || 'info';
};

// API calls
const fetchData = async () => {
  loading.value = true;
  try {
    const res: any = await fetchUsers({
      page: pagination.page,
      limit: pagination.limit,
      username: searchForm.username || undefined,
      role: searchForm.role || undefined,
    });
    // @ts-ignore depending on axios interceptor
    const result = res.data || res; // Handle standard API response wrappers 
    tableData.value = result.data || [];
    pagination.total = result.total || 0;
  } catch (error) {
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  fetchData();
};

const resetSearch = () => {
  searchForm.username = '';
  searchForm.role = undefined;
  handleSearch();
};

const openDialog = (row?: User) => {
  isEdit.value = !!row;
  if (row) {
    currentUserId.value = row.id;
    formData.username = row.username;
    formData.role = row.role;
    formData.nickname = row.nickname;
    formData.realName = row.realName || '';
    formData.password = ''; // Edit doesn't touch password
  } else {
    currentUserId.value = null;
    formData.username = '';
    formData.password = '';
    formData.role = undefined;
    formData.nickname = '';
    formData.realName = '';
  }
  dialogVisible.value = true;
  // Clear validation next tick
  setTimeout(() => {
    formRef.value?.clearValidate();
  }, 0);
};

const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        if (isEdit.value && currentUserId.value) {
          await updateUser(currentUserId.value, {
            nickname: formData.nickname,
            realName: formData.realName
          });
          ElMessage.success('更新成功');
        } else {
          await createUser({
            ...formData,
            role: formData.role
          });
          ElMessage.success('创建成功');
        }
        dialogVisible.value = false;
        fetchData();
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败');
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

const handleStatusChange = async (row: User) => {
  try {
    await updateUserStatus(row.id, row.status);
    ElMessage.success('状态更新成功');
  } catch (error) {
    // revert
    row.status = row.status === 1 ? 2 : 1;
    ElMessage.error('状态更新失败');
  }
};

const handleResetPassword = async (id: number) => {
  try {
    await resetPassword(id);
    ElMessage.success('密码已重置为 123456');
  } catch (error) {
    ElMessage.error('密码重置失败');
  }
};

// Lifecycle
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
::v-deep(.el-card) {
  border-radius: 1rem;
}
::v-deep(.el-table) {
  border-radius: 0.5rem;
  overflow: hidden;
}
</style>
