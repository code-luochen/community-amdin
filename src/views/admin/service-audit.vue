<template>
  <div class="service-audit-wrapper">
    <div class="page-container animate-fade-in">
      <!-- Header Section -->
      <div class="premium-header relative overflow-hidden mb-5!">
        <div class="bg-shape shape-1"></div>
        <div class="bg-shape shape-2"></div>
        <div class="header-content relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div class="header-text">
            <h1 class="page-title">服务审核</h1>
            <p class="page-subtitle">审查全平台社区商家的服务发布，保障社区服务质量</p>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="content-card shadow-soft">
        <!-- Search Bar -->
        <div class="search-toolbar">
          <el-form :model="searchForm" inline class="premium-form">
            <el-form-item>
              <el-input 
                v-model="searchForm.name" 
                placeholder="搜索服务名称..." 
                clearable 
                class="custom-input w-64"
                :prefix-icon="Search"
              />
            </el-form-item>
            <el-form-item>
              <el-select 
                v-model="searchForm.type" 
                placeholder="服务类型" 
                clearable 
                class="custom-select w-40!"
              >
                <el-option label="生活服务" :value="1" />
                <el-option label="药品服务" :value="2" />
                <el-option label="医护服务" :value="3" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="searchForm.auditStatus" placeholder="审核状态" clearable class="custom-select w-40!">
                <el-option label="待审核" :value="0" />
                <el-option label="已通过" :value="1" />
                <el-option label="已拒绝" :value="2" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select 
                v-model="searchForm.status" 
                placeholder="上下架状态" 
                clearable 
                class="custom-select w-40!"
              >
                <el-option label="已上架" :value="1" />
                <el-option label="已下架" :value="0" />
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
                <el-button type="primary" @click="handleSearch" class="premium-btn primary-solid px-6 h-10 rounded-xl! border-none!">
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
            <el-table-column label="发布商家" min-width="150" show-overflow-tooltip>
              <template #default="{ row }">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
                    <el-icon class="text-slate-400"><Shop /></el-icon>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-slate-800 font-semibold">{{ row.merchant?.nickname || '未知商家' }}</span>
                    <span v-if="row.merchant?.realName" class="text-slate-500 text-xs">{{ row.merchant?.realName }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="服务名称" min-width="180">
              <template #default="{ row }">
                <div class="flex items-center gap-3">
                  <el-image 
                    :src="row.imageUrl || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" 
                    class="service-img"
                    fit="cover"
                    :preview-src-list="row.imageUrl ? [row.imageUrl] : []"
                    preview-teleported
                  />
                  <span class="font-medium text-slate-700 truncate" :title="row.name">{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="服务类型" width="120">
              <template #default="{ row }">
                <div :class="['type-badge', getTypeBadgeClass(row.type)]">
                  <span class="dot"></span>
                  {{ getTypeName(row.type) }}
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="price" label="价格" width="100">
              <template #default="{ row }">
                <span class="price-text text-slate-700 font-semibold truncate"><span class="text-xs mr-0.5">¥</span>{{ row.price }}</span>
              </template>
            </el-table-column>
            
            <el-table-column label="审核状态" width="110">
              <template #default="{ row }">
                <div :class="['status-pill', getAuditStatusClass(row.auditStatus)]">
                  {{ getAuditStatusName(row.auditStatus) }}
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="发布时间" min-width="160">
              <template #default="{ row }">
                <div class="time-cell">
                  <el-icon class="mr-1 text-slate-400"><Clock /></el-icon>
                  <span>{{ formatDate(row.createdAt) }}</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="审核操作" width="160" fixed="right" align="right">
              <template #default="{ row }">
                <div v-if="row.auditStatus === 0" class="table-actions">
                  <el-popconfirm 
                    title="确定通过该服务审核吗？" 
                    width="200"
                    confirm-button-type="success"
                    hide-icon
                    @confirm="handleAudit(row, 1)"
                  >
                    <template #reference>
                      <el-button link type="success" class="action-btn text-emerald-600!">通过</el-button>
                    </template>
                  </el-popconfirm>
                  <el-popconfirm 
                    title="确定拒绝该服务审核吗？" 
                    width="200"
                    confirm-button-type="danger"
                    hide-icon
                    @confirm="handleAudit(row, 2)"
                  >
                    <template #reference>
                      <el-button link type="danger" class="action-btn text-rose-500!">拒绝</el-button>
                    </template>
                  </el-popconfirm>
                </div>
                <div v-else>
                  <span class="text-slate-400 text-xs font-semibold mr-2 border border-slate-200 px-3 py-1 rounded-full"><el-icon class="mr-1"><Check v-if="row.auditStatus === 1" /><Close v-else /></el-icon>审核完毕</span>
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
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            class="premium-pagination"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { serviceApi, type ServiceItem } from '../../api/service';
import { getCommunityList, type Community } from '../../api/community';
import { ElMessage } from 'element-plus';
import { Search, Clock, Shop, Check, Close } from '@element-plus/icons-vue';

// ========== 状态管理 ==========
const loading = ref(false);
const tableData = ref<ServiceItem[]>([]);

// 搜索栏
const searchForm = reactive({
  name: '',
  type: undefined as number | undefined,
  auditStatus: undefined as number | undefined,
  status: undefined as number | undefined,
  communityId: undefined as number | undefined,
});

const communityOptions = ref<Community[]>([]);

// 分页
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
});

// ========== 生命周期 ==========
onMounted(() => {
  fetchData();
  fetchInitialData();
});

const fetchInitialData = async () => {
  try {
    const res = await getCommunityList();
    // @ts-ignore
    communityOptions.value = res.data || res;
  } catch (error) {
    console.error('获取小区列表失败:', error);
  }
}

// ========== 方法 ==========
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await serviceApi.findAllAdmin({
      page: pagination.page,
      limit: pagination.limit,
      name: searchForm.name || undefined,
      type: searchForm.type || undefined,
      auditStatus: searchForm.auditStatus == null ? undefined : searchForm.auditStatus,
      status: searchForm.status ?? undefined,
      communityId: searchForm.communityId,
    });
    // @ts-ignore
    const result = res.data || res;
    tableData.value = result.items || [];
    pagination.total = result.total || 0;
  } catch (error) {
    console.error('获取服务审核列表失败:', error);
    ElMessage.error('获取数据失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  fetchData();
};

const resetSearch = () => {
  searchForm.name = '';
  searchForm.type = undefined;
  searchForm.auditStatus = undefined;
  searchForm.status = undefined;
  searchForm.communityId = undefined;
  handleSearch();
};

const handleSizeChange = (val: number) => {
  pagination.limit = val;
  fetchData();
};

const handleCurrentChange = (val: number) => {
  pagination.page = val;
  fetchData();
};

// 审核操作
const handleAudit = async (row: ServiceItem, auditStatus: number) => {
  try {
    await serviceApi.audit(row.id, auditStatus);
    ElMessage.success(auditStatus === 1 ? '已通过该服务' : '已驳回该服务');
    fetchData(); // 重新加载数据
  } catch (error: any) {
    console.error('审核失败:', error);
  }
};

// 工具函数
const getTypeName = (type: number) => {
  const map: Record<number, string> = {
    1: '生活服务',
    2: '药品服务',
    3: '医护服务',
  };
  return map[type] || '未知';
};

const getTypeBadgeClass = (type: number) => {
  const map: Record<number, string> = { 
    1: 'badge-life', 
    2: 'badge-medicine', 
    3: 'badge-health' 
  };
  return map[type] || 'badge-default';
};

const getAuditStatusName = (status: number) => {
  const map: Record<number, string> = { 0: '待审核', 1: '已通过', 2: '已拒绝' };
  return map[status] || '未知';
};

const getAuditStatusClass = (status: number) => {
  const map: Record<number, string> = { 0: 'pill-warning', 1: 'pill-success', 2: 'pill-danger' };
  return map[status] || 'pill-default';
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.service-audit-wrapper {
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
  background: rgba(167, 139, 250, 0.15); /* Purple tint for admin */
  top: -100px;
  right: -50px;
}

.shape-2 {
  width: 250px;
  height: 250px;
  background: rgba(251, 146, 60, 0.1);
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
::v-deep(.el-select__wrapper) {
  border-radius: 0.75rem;
  box-shadow: 0 0 0 1px #e2e8f0 inset !important;
  background-color: #f8fafc;
  padding: 0.25rem 1rem;
  transition: all 0.2s;
  font-family: inherit;
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

.service-img {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  border: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.time-cell {
  display: flex;
  align-items: center;
  color: #64748b;
  font-size: 0.875rem;
}

/* Status Pills */
.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.6rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
}

.pill-warning {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fde68a;
}

.pill-success {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.pill-danger {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.pill-default {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

/* Type Badges */
.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.type-badge .dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
}

.badge-life {
  background: #eff6ff;
  color: #2563eb;
}
.badge-life .dot { background: #3b82f6; }

.badge-medicine {
  background: #fdf4ff;
  color: #c026d3;
}
.badge-medicine .dot { background: #d946ef; }

.badge-health {
  background: #ecfdf5;
  color: #059669;
}
.badge-health .dot { background: #10b981; }

.badge-default {
  background: #f5f3ff;
  color: #7c3aed;
}
.badge-default .dot { background: #8b5cf6; }

/* Actions */
.table-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.action-btn {
  font-weight: 600;
  font-family: inherit;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--el-color-info-light-9);
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
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
