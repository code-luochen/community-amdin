<template>
  <div class="order-management-wrapper">
    <div class="page-container animate-fade-in">
      <div class="premium-header relative overflow-hidden mb-5!">
        <div class="bg-shape shape-1"></div>
        <div class="bg-shape shape-2"></div>
        <div class="header-content relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div class="header-text">
            <h1 class="page-title">订单监控</h1>
            <p class="page-subtitle">全局掌握平台内所有服务订单流转状态</p>
          </div>
          <div class="header-stats flex gap-4 text-sm text-slate-500 font-medium">
            <div class="stat-item bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
              总单量: <span class="text-slate-800 font-bold ml-1">{{ total }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="content-card shadow-soft">
        <div class="search-toolbar">
          <el-form :model="queryParams" inline class="premium-form">
            <el-form-item>
              <el-input v-model="queryParams.orderNo" placeholder="订单编号 (SN...)" clearable class="custom-input w-48" :prefix-icon="Search" />
            </el-form-item>
            <el-form-item>
              <el-input v-model="queryParams.merchantId" placeholder="搜索商家账号ID..." clearable class="custom-input w-48" :prefix-icon="Search" />
            </el-form-item>
            <el-form-item>
              <el-input v-model="queryParams.elderlyId" placeholder="搜索长者账号ID..." clearable class="custom-input w-48" :prefix-icon="Search" />
            </el-form-item>
            <el-form-item>
              <el-select v-model="queryParams.status" placeholder="订单状态" clearable class="custom-select w-36!">
                <el-option label="待接单" :value="0" />
                <el-option label="已接单" :value="1" />
                <el-option label="配送中" :value="2" />
                <el-option label="已完成" :value="3" />
                <el-option label="已取消" :value="4" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="queryParams.communityId" placeholder="所属小区" clearable class="custom-select w-40!">
                <el-option v-for="c in communityOptions" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-input v-model="queryParams.address" placeholder="搜索详细地址..." clearable class="custom-input w-52" :prefix-icon="Search" />
            </el-form-item>
            <el-form-item class="ml-auto! mr-0!">
              <div class="action-buttons flex gap-3">
                <el-button @click="resetSearch" class="premium-btn secondary px-6 h-10 shadow-none border! border-slate-200! rounded-xl!">重置</el-button>
                <el-button type="primary" @click="handleSearch" :loading="loading" class="premium-btn primary-solid px-6 h-10 rounded-xl! border-none!">查询</el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <div class="table-wrapper">
          <el-table :data="tableData" v-loading="loading" class="premium-table" style="width: 100%">
            <el-table-column prop="orderNo" label="订单编号" min-width="190">
              <template #default="{ row }">
                <span class="text-slate-800 font-semibold">{{ row.orderNo }}</span>
              </template>
            </el-table-column>
            
            <el-table-column label="交易单信息" min-width="150">
              <template #default="{ row }">
                <div class="user-info">
                  <div class="text-slate-800 font-semibold">{{ row.serviceSnapshot?.name || '-' }}</div>
                  <div class="text-emerald-500 font-medium mt-0.5">¥ {{ row.serviceSnapshot?.price || 0 }}</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="参与人员" min-width="160">
              <template #default="{ row }">
                <div class="text-xs">
                  <span class="text-slate-400">商家:</span> 
                  <span class="font-medium text-slate-700 ml-1">{{ row.merchant?.nickname || row.merchantId }}</span>
                </div>
                <div class="text-xs mt-1">
                  <span class="text-slate-400">长者:</span> 
                  <span class="font-medium text-slate-700 ml-1">{{ row.elderly?.nickname || row.elderlyId }}</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="address" label="服务地址" min-width="150" show-overflow-tooltip>
              <template #default="{ row }">
                 <span class="text-slate-600">{{ row.address }}</span>
              </template>
            </el-table-column>

            <el-table-column label="时间轨迹" min-width="180">
              <template #default="{ row }">
                <div class="time-cell mb-1 text-xs"><el-icon class="mr-1"><Clock /></el-icon>创建: {{ formatDate(row.createdAt) }}</div>
                <div class="time-cell text-xs"><el-icon class="mr-1"><Clock /></el-icon>预约: {{ formatDate(row.serviceTime) }}</div>
              </template>
            </el-table-column>
            
            <el-table-column label="状态" min-width="110">
              <template #default="{ row }">
                <div :class="['status-badge', `status-${row.status}`]">
                  <span class="dot"></span>
                  {{ getStatusText(row.status) }}
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="130" fixed="right" align="right">
              <template #default="{ row }">
                <div class="table-actions">
                  <el-button v-if="row.status !== 3 && row.status !== 4" link type="danger" class="action-btn delete" @click="handleCancel(row)">强制取消</el-button>
                  <span v-else class="text-slate-400 text-xs text-right pr-4">不可操作</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination-wrapper mt-6! pb-2!">
          <el-pagination
            v-model:current-page="queryParams.page"
            v-model:page-size="queryParams.limit"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
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
import { Search, Clock } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getOrderList, updateOrderStatus } from '../../api/order';
import { getCommunityList, type Community } from '../../api/community';

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);

const queryParams = reactive({
  page: 1,
  limit: 10,
  status: undefined as number | undefined,
  elderlyId: '',
  merchantId: '',
  communityId: undefined as number | undefined,
  address: '',
  orderNo: '',
});

const communityOptions = ref<Community[]>([]);

const fetchOrders = async () => {
  loading.value = true;
  try {
    const params = {
      ...queryParams,
      elderlyId: queryParams.elderlyId || undefined,
      merchantId: queryParams.merchantId || undefined,
      address: queryParams.address || undefined,
      orderNo: queryParams.orderNo || undefined
    }
    const res = await getOrderList(params);
    tableData.value = res.items || [];
    total.value = res.total || 0;
  } catch (error) {
    ElMessage.error('获取订单列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  queryParams.page = 1;
  fetchOrders();
};

const resetSearch = () => {
  queryParams.merchantId = '';
  queryParams.elderlyId = '';
  queryParams.status = undefined;
  queryParams.communityId = undefined;
  queryParams.address = '';
  queryParams.orderNo = '';
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

const handleCancel = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要强制取消该订单吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    // status 4 = cancelled
    const res = await updateOrderStatus(row.id, 4);
    if(res) {
      ElMessage.success(`订单已取消`);
      fetchOrders();
    }
  } catch (err) {
    if(err !== 'cancel') {
      ElMessage.error('操作失败');
    }
  }
}

const handleSizeChange = (val: number) => {
  queryParams.limit = val;
  fetchOrders();
};

const handleCurrentChange = (val: number) => {
  queryParams.page = val;
  fetchOrders();
};

const getStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: '待接单',
    1: '已接单',
    2: '配送中',
    3: '已完成',
    4: '已取消'
  };
  return map[status] || '未知';
};

const formatDate = (val: string) => {
  if (!val) return '-';
  const date = new Date(val);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

onMounted(() => {
  fetchInitialData();
  fetchOrders();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.order-management-wrapper {
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

/* Form Styles */
.premium-form .el-form-item {
  margin-bottom: 1rem;
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

.time-cell {
  display: flex;
  align-items: center;
  color: #64748b;
  font-size: 0.875rem;
}

/* Order Status Badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.status-badge .dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
}

.status-0 { background: #fffbeb; color: #d97706; }
.status-0 .dot { background: #f59e0b; }

.status-1 { background: #eff6ff; color: #2563eb; }
.status-1 .dot { background: #3b82f6; }

.status-2 { background: #f5f3ff; color: #7c3aed; }
.status-2 .dot { background: #8b5cf6; }

.status-3 { background: #ecfdf5; color: #059669; }
.status-3 .dot { background: #10b981; }

.status-4 { background: #fef2f2; color: #dc2626; }
.status-4 .dot { background: #ef4444; }

/* Actions */
.table-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.action-btn { font-weight: 600; font-family: inherit; }
.action-btn.delete { color: #ef4444; }
.action-btn.delete:hover { color: #dc2626; background: #fef2f2; border-radius: 0.5rem; padding: 0.25rem 0.5rem; }

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  0% { transform: translateY(15px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.text-xs {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 2px;
}
</style>
