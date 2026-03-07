<template>
  <div class="binding-management-wrapper">
    <div class="page-container animate-fade-in">
      <!-- Header Section -->
      <div class="premium-header relative overflow-hidden mb-5!">
        <div class="bg-shape shape-1"></div>
        <div class="bg-shape shape-2"></div>
        <div class="header-content relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div class="header-text">
            <h1 class="page-title">绑定管理</h1>
            <p class="page-subtitle">管理与您关联的长者账号信息</p>
          </div>
          <button class="premium-btn primary group" @click="openBindDialog">
            <el-icon class="btn-icon group-hover:rotate-90 transition-transform duration-300"><Plus /></el-icon>
            <span>添加绑定</span>
          </button>
        </div>
      </div>

      <!-- Main Content Area: unified card for table -->
      <div class="content-card shadow-soft">
        <!-- Table -->
        <div class="table-wrapper">
          <el-table 
            :data="bindingList" 
            v-loading="loading" 
            class="premium-table" 
            style="width: 100%"
          >
            <el-table-column label="老人信息" min-width="220">
              <template #default="{ row }">
                <div class="user-cell">
                  <el-avatar 
                    :size="44" 
                    :src="getAvatarUrl(row.elderly?.avatar)" 
                    class="user-avatar"
                  />
                  <div class="user-info">
                    <div class="username text-slate-800 font-semibold">{{ row.elderly?.realName || '未设置姓名' }}</div>
                    <div class="nickname text-slate-500 text-xs mt-0.5">{{ row.elderly?.username }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="老人档案" min-width="120">
              <template #default="{ row }">
                <div class="text-slate-600 font-medium text-sm flex flex-col gap-1">
                  <span v-if="row.elderly?.profile?.age">年龄: {{ row.elderly.profile.age }}岁</span>
                  <span v-if="row.elderly?.profile?.gender">性别: {{ row.elderly.profile.gender === 1 ? '男' : '女' }}</span>
                  <span v-if="!row.elderly?.profile?.age && !row.elderly?.profile?.gender" class="text-slate-400 italic">未完善</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="亲属关系" min-width="140">
              <template #default="{ row }">
                <div class="role-badge badge-family">
                  <span class="dot"></span>
                  {{ row.relation || '未设置' }}
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="绑定状态" width="120">
              <template #default="{ row }">
                <div :class="['role-badge', row.status === 1 ? 'badge-elderly' : 'badge-default']">
                  <span class="dot"></span>
                  {{ row.status === 1 ? '已绑定' : '未知' }}
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="绑定时间" min-width="180">
              <template #default="{ row }">
                <div class="time-cell">
                  <el-icon class="mr-1"><Clock /></el-icon>
                  <span>{{ formatDate(row.createdAt) }}</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="140" fixed="right" align="right">
              <template #default="{ row }">
                <div class="table-actions">
                  <el-popconfirm
                    title="确定要解绑这位老人吗？解绑后将无法接收通知和查看健康信息。"
                    @confirm="handleUnbind(row.elderlyId)"
                    width="240"
                    confirm-button-type="danger"
                    hide-icon
                  >
                    <template #reference>
                      <el-button link type="danger" class="action-btn delete">解除绑定</el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- Form Dialog -->
    <el-dialog
      v-model="dialogVisible"
      title="添加绑定老人"
      width="480px"
      class="premium-dialog"
      :show-close="false"
      destroy-on-close
    >
      <template #header="{ title }">
        <div class="dialog-custom-header">
          <h3>{{ title }}</h3>
          <p class="dialog-subtitle">填写老人登录账号建立绑定关系</p>
        </div>
      </template>
      
      <el-form ref="formRef" :model="bindForm" :rules="rules" label-position="top" class="premium-form-vertical mt-2">
        <el-form-item label="老人账号" prop="username">
          <el-input v-model="bindForm.username" placeholder="请输入老人登录账号/用户名" class="custom-input" />
        </el-form-item>
        <el-form-item label="家属关系 (选填)" prop="relation">
          <el-input v-model="bindForm.relation" placeholder="例如: 父亲、母亲、岳父、岳母" class="custom-input" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button class="premium-btn secondary h-10 px-6 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors" @click="dialogVisible = false">取消</button>
          <button class="premium-btn primary-solid h-10 px-8 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors" @click="submitBind" :disabled="submitLoading">
            <span v-if="submitLoading" class="inline-block animate-spin mr-2">⟳</span>
            确认绑定
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus, Clock } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { getMyElderlyList, bindElderly, unbindElderly, type ElderlyBindingInfo } from '../../api/family-binding';

const loading = ref(false);
const submitLoading = ref(false);
const bindingList = ref<ElderlyBindingInfo[]>([]);
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();

const bindForm = ref({
  username: '',
  relation: ''
});

const rules = {
  username: [{ required: true, message: '请输入老人的登录账号', trigger: 'blur' }],
};

const getAvatarUrl = (path?: string) => {
  if (!path) return 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
  if (path.startsWith('http')) return path;
  const apiBaseUrl = import.meta.env.VITE_APP_BASE_API;
  if (apiBaseUrl && apiBaseUrl.startsWith('http')) {
    const origin = new URL(apiBaseUrl).origin;
    return `${origin}${path}`;
  }
  return path;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const fetchList = async () => {
  loading.value = true;
  try {
    const res: any = await getMyElderlyList();
    bindingList.value = res || [];
  } catch (err: any) {
    console.error('获取绑定列表失败:', err);
  } finally {
    loading.value = false;
  }
};

const openBindDialog = () => {
  bindForm.value = { username: '', relation: '' };
  dialogVisible.value = true;
  setTimeout(() => {
    formRef.value?.clearValidate();
  }, 0);
};

const submitBind = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        await bindElderly({
          username: bindForm.value.username,
          relation: bindForm.value.relation
        });
        ElMessage.success('绑定成功');
        dialogVisible.value = false;
        fetchList();
      } catch (err: any) {
        console.error('绑定失败:', err);
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

const handleUnbind = async (elderlyId: number) => {
  try {
    await unbindElderly(elderlyId);
    ElMessage.success('解绑成功');
    fetchList();
  } catch (err: any) {
    console.error('解绑失败:', err);
  }
};

onMounted(() => {
  fetchList();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.binding-management-wrapper {
  font-family: 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif;
  color: #1e293b;
  min-height: 100%;
}

.page-container {
  width: 100%;
}

/* Header Aesthetics */
.premium-header {
  background: white;
  border-radius: 1.25rem;
  padding: 1.5rem 2rem;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.01);
}

.bg-shape {
  position: absolute;
  filter: blur(60px);
  z-index: 0;
  border-radius: 50%;
  pointer-events: none;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: rgba(56, 189, 248, 0.15);
  top: -100px;
  right: -50px;
}

.shape-2 {
  width: 250px;
  height: 250px;
  background: rgba(167, 139, 250, 0.15);
  bottom: -120px;
  right: 200px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 400;
}

/* Buttons */
.premium-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: none;
}

.premium-btn.primary {
  background: #0f172a;
  color: white;
  box-shadow: 0 4px 14px 0 rgba(15, 23, 42, 0.2);
}

.premium-btn.primary:hover {
  background: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px 0 rgba(15, 23, 42, 0.3);
}

/* Custom Overrides for Element Plus */
::v-deep(.el-input__wrapper), 
::v-deep(.el-select__wrapper) {
  border-radius: 0.75rem;
  box-shadow: 0 0 0 1px #e2e8f0 inset !important;
  background-color: #f8fafc;
  padding: 0.25rem 1rem;
  transition: all 0.2s;
}

::v-deep(.el-input__wrapper:hover), 
::v-deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px #cbd5e1 inset !important;
  background-color: #ffffff;
}

::v-deep(.el-input__wrapper.is-focus), 
::v-deep(.el-select__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #3b82f6 inset !important;
  background-color: #ffffff;
}

.content-card {
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  border: 1px solid #f1f5f9;
}

/* Table Aesthetics */
.premium-table {
  --el-table-border-color: transparent;
  --el-table-header-bg-color: #fefefe;
  --el-table-header-text-color: #64748b;
  --el-table-tr-bg-color: transparent;
}

::v-deep(.el-table th.el-table__cell) {
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.02em;
  padding: 1rem 0;
  border-bottom: 1px solid #f1f5f9;
}

::v-deep(.el-table td.el-table__cell) {
  padding: 1rem 0;
  border-bottom: 1px solid #f8fafc;
  transition: background-color 0.2s;
}

::v-deep(.el-table__row:hover td.el-table__cell) {
  background-color: #f8fafc !important;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  border: 2px solid white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}

.time-cell {
  display: flex;
  align-items: center;
  color: #64748b;
  font-size: 0.875rem;
}

/* Role Badges */
.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.role-badge .dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
}

.badge-elderly {
  background: #ecfdf5;
  color: #059669;
}
.badge-elderly .dot { background: #10b981; }

.badge-family {
  background: #fffbeb;
  color: #d97706;
}
.badge-family .dot { background: #f59e0b; }

.badge-default {
  background: #f1f5f9;
  color: #64748b;
}
.badge-default .dot { background: #94a3b8; }

/* Actions */
.table-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.action-btn {
  font-weight: 600;
  font-family: inherit;
}

.action-btn.delete {
  color: #ef4444;
}
.action-btn.delete:hover {
  color: #dc2626;
  background: #fef2f2;
  border-radius: 0.5rem;
  padding: 0.25rem 0.5rem;
}

/* Dialog Reskin */
::v-deep(.el-overlay-dialog) {
  backdrop-filter: blur(8px);
  background-color: rgba(15, 23, 42, 0.4);
}

::v-deep(.premium-dialog) {
  border-radius: 1.5rem !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
  background: #ffffff !important;
  overflow: hidden;
}

::v-deep(.premium-dialog .el-dialog__header) {
  padding: 0 !important;
  margin: 0 !important;
}

.dialog-custom-header {
  padding: 2rem 2rem 1rem;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  border-bottom: 1px solid #f1f5f9;
}

.dialog-custom-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.dialog-custom-header .dialog-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

::v-deep(.premium-dialog .el-dialog__body) {
  padding: 1.5rem 2rem !important;
}

::v-deep(.premium-dialog .el-dialog__footer) {
  padding: 1rem 2rem 1.5rem !important;
  border-top: none;
}

.premium-form-vertical ::v-deep(.el-form-item) {
  margin-bottom: 1.25rem;
}

.premium-form-vertical ::v-deep(.el-form-item__label) {
  font-weight: 500;
  color: #334155;
  padding-bottom: 0.25rem;
  line-height: 1.5;
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(15px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
