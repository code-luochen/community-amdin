<template>
  <div class="emergency-management-wrapper">
    <div class="page-container animate-fade-in">
      <!-- Header Section -->
      <div class="premium-header relative overflow-hidden mb-5!">
        <div class="bg-shape shape-1"></div>
        <div class="bg-shape shape-2"></div>
        <div class="header-content relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div class="header-text">
            <h1 class="page-title">求助处理</h1>
            <p class="page-subtitle">监控、分配与处理老年人发送的紧急求助</p>
          </div>
        </div>
      </div>

      <!-- Main Content Area: unified card for filters and table -->
      <div class="content-card shadow-soft">
        <!-- Search Bar -->
        <div class="search-toolbar">
          <el-form :model="searchForm" inline class="premium-form">
            <el-form-item>
              <el-select 
                v-model="searchForm.status" 
                placeholder="求助状态" 
                clearable 
                class="custom-select w-40!"
              >
                <el-option label="待处理" :value="0" />
                <el-option label="处理中" :value="1" />
                <el-option label="已处理" :value="2" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select 
                v-model="searchForm.communityId" 
                placeholder="所属小区" 
                clearable 
                class="custom-select w-48!"
              >
                <el-option v-for="c in communityOptions" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
            <el-form-item class="ml-auto! mr-0!">
              <div class="action-buttons">
                <el-button @click="resetSearch" class="premium-btn secondary px-6 h-10 shadow-none border! border-slate-200! rounded-xl!">重置</el-button>
                <el-button type="primary" @click="handleSearch" :loading="loading" class="premium-btn primary-solid px-6 h-10 rounded-xl! border-none!">
                  查询
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <!-- Table -->
        <div class="table-wrapper">
          <el-table 
            :data="tableData" 
            v-loading="loading" 
            class="premium-table" 
            style="width: 100%"
          >
            <el-table-column label="求助老人" min-width="180">
              <template #default="{ row }">
                <div class="user-cell">
                  <el-avatar 
                    :size="44" 
                    :src="row.elderly?.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" 
                    class="user-avatar"
                  />
                  <div class="user-info">
                    <div class="username text-slate-800 font-semibold">{{ row.elderly?.nickname || '未知用户' }}</div>
                    <div class="text-slate-400 text-xs mt-0.5">
                      <template v-if="row.elderly?.community">
                        {{ row.elderly.community.name }}
                        <template v-if="row.elderly.house">
                          - {{ row.elderly.house.buildingNo }}栋{{ row.elderly.house.unitNo ? row.elderly.house.unitNo + '单元' : '' }}{{ row.elderly.house.roomNo }}
                        </template>
                      </template>
                      <template v-else>ID: {{ row.elderlyId }}</template>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="location" label="求助位置信息" min-width="200">
              <template #default="{ row }">
                <div class="flex items-start gap-1">
                  <el-icon class="mt-0.5 text-blue-500"><Location /></el-icon>
                  <span class="text-slate-600 truncate break-all" :title="row.location">{{ row.location || '未知位置' }}</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <div :class="['role-badge', getStatusBadgeClass(row.status)]">
                  <span class="dot"></span>
                  {{ getStatusName(row.status) }}
                </div>
              </template>
            </el-table-column>

            <el-table-column label="处理人员" min-width="180">
              <template #default="{ row }">
                <div class="user-cell" v-if="row.handler">
                  <el-avatar 
                    :size="32" 
                    :src="row.handler?.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" 
                    class="user-avatar"
                  />
                  <div class="user-info">
                    <div class="username text-slate-800 font-medium text-sm">{{ row.handler?.nickname }}</div>
                  </div>
                </div>
                <span v-else class="text-slate-400 text-sm">暂无处理人</span>
              </template>
            </el-table-column>
            
            <el-table-column label="求助时间" min-width="160">
              <template #default="{ row }">
                <div class="time-cell">
                  <el-icon class="mr-1"><Clock /></el-icon>
                  <span>{{ formatDate(row.createdAt) }}</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="180" fixed="right" align="right">
              <template #default="{ row }">
                <div class="table-actions">
                  <el-button v-if="row.status === 0" link type="primary" class="action-btn process" @click="openProcessDialog(row, 1)">指派处理</el-button>
                  <el-button v-if="row.status === 1" link type="success" class="action-btn success" @click="openProcessDialog(row, 2)">处理完成</el-button>
                  <el-button v-if="row.status === 2" link type="info" class="action-btn detail" @click="viewDetails(row)">查看处理</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- Pagination -->
        <div class="pagination-wrapper mt-6! pb-2!">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.limit"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="fetchData"
            @current-change="fetchData"
            class="premium-pagination"
          />
        </div>
      </div>
    </div>

    <!-- Process Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 1 ? '指派紧急处理' : '登记处理结果'"
      width="500px"
      class="premium-dialog"
      :show-close="false"
      destroy-on-close
    >
      <template #header="{ title }">
        <div class="dialog-custom-header">
          <h3>{{ title }}</h3>
          <p class="dialog-subtitle">{{ dialogType === 1 ? '将该求助任务分配给指定的管理员或家属' : '登记此紧急情况的最终处理方案和结果' }}</p>
        </div>
      </template>
      
      <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" class="premium-form-vertical mt-2">
        <div class="bg-slate-50 p-4 rounded-xl mb-5 space-y-2">
          <div class="flex items-start text-sm"><strong class="w-20 text-slate-500">发文字段：</strong> <span class="text-slate-800 font-medium">{{ currentRow?.elderly?.nickname }}</span></div>
          <div class="flex items-start text-sm"><strong class="w-20 text-slate-500">位置：</strong> <span class="text-slate-800 flex-1">{{ currentRow?.location }}</span></div>
          <div class="flex items-start text-sm" v-if="currentRow?.remark"><strong class="w-20 text-slate-500">备注：</strong> <span class="text-red-500 font-medium">{{ currentRow?.remark }}</span></div>
        </div>

        <template v-if="dialogType === 1">
          <el-form-item label="分配处理人员" prop="handlerId">
            <el-select v-model="formData.handlerId" placeholder="请选择分配给的人员" class="custom-select w-full" filterable :loading="handlerLoading">
              <el-option
                v-for="user in handlerList"
                :key="user.id"
                :label="`${user.nickname} (${user.username})`"
                :value="user.id"
              />
            </el-select>
          </el-form-item>
        </template>
        
        <template v-else-if="dialogType === 2">
          <el-form-item label="处理结果详情" prop="handleResult">
            <el-input 
              v-model="formData.handleResult" 
              type="textarea" 
              :rows="4" 
              placeholder="请详细描述对该求助进行了哪些处理，老人的现状等..." 
              class="custom-input" 
            />
          </el-form-item>
        </template>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button class="premium-btn secondary h-10 px-6 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors" @click="dialogVisible = false">取消</button>
          <button class="premium-btn primary-solid h-10 px-8 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors" @click="submitForm" :disabled="submitLoading">
            <span v-if="submitLoading" class="inline-block animate-spin mr-2">⟳</span>
            确认提交
          </button>
        </div>
      </template>
    </el-dialog>

    <!-- Details Dialog -->
    <el-dialog
      v-model="detailsVisible"
      title="处理记录详情"
      width="500px"
      class="premium-dialog"
      :show-close="false"
    >
      <template #header="{ title }">
        <div class="dialog-custom-header">
          <h3>{{ title }}</h3>
          <p class="dialog-subtitle">查看该次紧急求助的所有处理反馈</p>
        </div>
      </template>
      <div class="py-2" v-if="currentRow">
        <el-descriptions :column="1" border class="premium-descriptions">
          <el-descriptions-item label="求助时间">{{ formatDate(currentRow.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="求助位置">{{ currentRow.location }}</el-descriptions-item>
          <el-descriptions-item label="处理人员">{{ currentRow.handler?.nickname || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="处理开始">{{ currentRow.handleTime ? formatDate(currentRow.handleTime) : '-' }}</el-descriptions-item>
          <el-descriptions-item label="处理完成">{{ currentRow.finishTime ? formatDate(currentRow.finishTime) : '-' }}</el-descriptions-item>
          <el-descriptions-item label="处理结果" class-name="font-semibold text-emerald-600!">
            {{ currentRow.handleResult || '无详细处理结果' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <div class="dialog-footer flex justify-end pt-4 border-t border-slate-100">
          <button class="premium-btn secondary h-10 px-6 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors" @click="detailsVisible = false">关闭窗口</button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Clock, Location } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { fetchEmergencies, handleEmergency, type EmergencyLog } from '@/api/emergency';
import { fetchUsers, type User } from '@/api/users';
import { getCommunityList, type Community } from '@/api/community';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();

// State
const loading = ref(false);
const submitLoading = ref(false);
const tableData = ref<EmergencyLog[]>([]);
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
});

const searchForm = reactive({
  status: undefined as number | undefined,
  communityId: undefined as number | undefined,
});

const communityOptions = ref<Community[]>([]);

// Process dialog state
const dialogVisible = ref(false);
const detailsVisible = ref(false);
const dialogType = ref<1 | 2>(1); // 1: 指派处理, 2: 登记完成
const formRef = ref<FormInstance>();
const currentRow = ref<EmergencyLog | null>(null);

const formData = reactive({
  handlerId: undefined as number | undefined,
  handleResult: '',
});

const formRules = reactive<FormRules>({
  handlerId: [{ required: true, message: '请选择要指派的处理人员', trigger: 'change' }],
  handleResult: [{ required: true, message: '必须填写处理结果才能完结该求助', trigger: 'blur' }],
});

// Handler selection list
const handlerList = ref<User[]>([]);
const handlerLoading = ref(false);

const loadHandlers = async () => {
  handlerLoading.value = true;
  try {
    // Admins and potentially family can handle. We fetch admins for now.
    const res: any = await fetchUsers({ page: 1, limit: 100, role: 4 });
    const data = res.data || res;
    handlerList.value = data.items || [];
  } catch (err) {
    console.error(err);
  } finally {
    handlerLoading.value = false;
  }
};

// Formatting helpers
const getStatusName = (status: number) => {
  const map: Record<number, string> = { 0: '待处理', 1: '处理中', 2: '已处理' };
  return map[status] || '未知';
};

const getStatusBadgeClass = (status: number) => {
  const map: Record<number, string> = { 
    0: 'badge-danger', 
    1: 'badge-warning', 
    2: 'badge-success' 
  };
  return map[status] || 'badge-default';
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// Core Functions
const fetchData = async () => {
  loading.value = true;
  try {
    const res: any = await fetchEmergencies({
      page: pagination.page,
      limit: pagination.limit,
      status: searchForm.status,
      communityId: searchForm.communityId,
    });
    const result = res.data || res;
    tableData.value = result.items || [];
    pagination.total = result.total || 0;
  } catch (error) {
    ElMessage.error('获取紧急求助数据失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  fetchData();
};

const resetSearch = () => {
  searchForm.status = undefined;
  searchForm.communityId = undefined;
  handleSearch();
};

const fetchInitialData = async () => {
  try {
    const res = await getCommunityList();
    // @ts-ignore
    communityOptions.value = res.data || res;
  } catch (err) {
    console.error('Fetch community error:', err);
  }
}

const openProcessDialog = (row: EmergencyLog, type: 1 | 2) => {
  currentRow.value = row;
  dialogType.value = type;
  
  if (type === 1) {
    formData.handlerId = userStore.userInfo?.id ? Number(userStore.userInfo.id) : undefined; // default assign to self
    formData.handleResult = '';
    if (handlerList.value.length === 0) {
      loadHandlers();
    }
  } else {
    formData.handlerId = undefined;
    formData.handleResult = row.handleResult || '';
  }
  
  dialogVisible.value = true;
  setTimeout(() => {
    formRef.value?.clearValidate();
  }, 0);
};

const viewDetails = (row: EmergencyLog) => {
  currentRow.value = row;
  detailsVisible.value = true;
};

const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid && currentRow.value) {
      submitLoading.value = true;
      try {
        const payload: any = { status: dialogType.value };
        if (dialogType.value === 1) {
          payload.handlerId = formData.handlerId;
        } else {
          payload.handleResult = formData.handleResult;
        }
        
        await handleEmergency(currentRow.value.id, payload);
        ElMessage.success(dialogType.value === 1 ? '求助任务已成功指派' : '求助处理结果登入成功');
        dialogVisible.value = false;
        fetchData();
      } catch (error: any) {
        ElMessage.error(error.message || '操作未完成，请重试');
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

onMounted(() => {
  fetchInitialData();
  fetchData();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.emergency-management-wrapper {
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
  background: rgba(244, 63, 94, 0.15); /* Red tinted for emergency */
  top: -100px;
  right: -50px;
}

.shape-2 {
  width: 250px;
  height: 250px;
  background: rgba(251, 146, 60, 0.15); /* Orange tinted */
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

.premium-btn.primary-solid {
  background: #0f172a;
  color: white;
  box-shadow: 0 4px 14px 0 rgba(15, 23, 42, 0.2);
}

.premium-btn.primary-solid:hover {
  background: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px 0 rgba(15, 23, 42, 0.3);
}

/* Form Styles */
.premium-form .el-form-item {
  margin-bottom: 0;
  margin-right: 1rem;
}

.content-card {
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  border: 1px solid #f1f5f9;
}

.search-toolbar {
  padding-bottom: 1.5rem;
  border-bottom: 1px dashed #e2e8f0;
  margin-bottom: 1.5rem;
}

/* Custom Overrides for Element Plus */
::v-deep(.el-input__wrapper), 
::v-deep(.el-select__wrapper),
::v-deep(.el-textarea__inner) {
  border-radius: 0.75rem;
  box-shadow: 0 0 0 1px #e2e8f0 inset !important;
  background-color: #f8fafc;
  padding: 0.25rem 1rem;
  transition: all 0.2s;
}

::v-deep(.el-textarea__inner) {
  padding: 0.75rem 1rem;
  font-family: inherit;
}

::v-deep(.el-input__wrapper:hover), 
::v-deep(.el-select__wrapper:hover),
::v-deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px #cbd5e1 inset !important;
  background-color: #ffffff;
}

::v-deep(.el-input__wrapper.is-focus), 
::v-deep(.el-select__wrapper.is-focus),
::v-deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 2px #3b82f6 inset !important;
  background-color: #ffffff;
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

.badge-danger {
  background: #fef2f2;
  color: #dc2626;
}
.badge-danger .dot { background: #ef4444; }

.badge-warning {
  background: #fffbeb;
  color: #d97706;
}
.badge-warning .dot { background: #f59e0b; }

.badge-success {
  background: #ecfdf5;
  color: #059669;
}
.badge-success .dot { background: #10b981; }

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

.action-btn.process {
  color: #ef4444;
}
.action-btn.process:hover {
  background: #fef2f2;
  border-radius: 0.5rem;
  padding: 0.25rem 0.5rem;
}

.action-btn.success {
  color: #10b981;
}
.action-btn.success:hover {
  background: #ecfdf5;
  border-radius: 0.5rem;
  padding: 0.25rem 0.5rem;
}

.action-btn.detail {
  color: #3b82f6;
}
.action-btn.detail:hover {
  background: #eff6ff;
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

::v-deep(.premium-descriptions.el-descriptions) {
  --el-descriptions-border-color: #e2e8f0;
}

::v-deep(.premium-descriptions .el-descriptions__label) {
  background-color: #f8fafc;
  font-weight: 600;
  color: #475569;
  width: 100px;
}

::v-deep(.premium-descriptions .el-descriptions__content) {
  color: #1e293b;
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
