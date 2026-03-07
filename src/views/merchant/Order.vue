<template>
  <div class="order-management-wrapper">
    <div class="page-container animate-fade-in">
      <div class="premium-header relative overflow-hidden mb-5!">
        <div class="bg-shape shape-1"></div>
        <div class="bg-shape shape-2"></div>
        <div class="header-content relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div class="header-text">
            <h1 class="page-title">订单处理</h1>
            <p class="page-subtitle">查看与处理来自平台所有长者的服务需求</p>
          </div>
          <div class="header-stats flex gap-4 text-sm text-slate-500 font-medium">
            <div class="stat-item bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
              您的订单总数: <span class="text-slate-800 font-bold ml-1">{{ total }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="content-card shadow-soft">
        <div class="search-toolbar">
          <el-form :model="queryParams" inline class="premium-form">
            <el-form-item>
              <el-select v-model="queryParams.status" placeholder="全选状态" clearable class="custom-select w-40!">
                <el-option label="待接单" :value="0" />
                <el-option label="已接单" :value="1" />
                <el-option label="配送中" :value="2" />
                <el-option label="已完成" :value="3" />
                <el-option label="已取消" :value="4" />
              </el-select>
            </el-form-item>
            <el-form-item class="ml-auto! mr-0!">
              <div class="action-buttons">
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
            
            <el-table-column label="服务项信息" min-width="150">
              <template #default="{ row }">
                <div class="user-info">
                  <div class="text-slate-800 font-semibold">{{ row.serviceSnapshot?.name || '-' }}</div>
                  <div class="text-slate-400 text-xs mt-0.5">预约: {{ formatDate(row.serviceTime) }}</div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="address" label="配送/服务地址" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                 <span class="text-slate-600 truncate-2">{{ row.address }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="remark" label="备注留言" min-width="140" show-overflow-tooltip>
              <template #default="{ row }">
                 <span class="text-slate-500 italic">{{ row.remark || '无备注' }}</span>
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
            
            <el-table-column label="操作台" width="180" fixed="right" align="right">
              <template #default="{ row }">
                <div class="table-actions">
                  <el-button v-if="row.status === 0" link type="primary" class="action-btn edit" @click="handleUpdateStatus(row, 1)">我要接单</el-button>
                  <el-button v-else-if="row.status === 1" link type="success" class="action-btn success" @click="handleUpdateStatus(row, 2)">开始配送</el-button>
                  <el-button v-else-if="row.status === 2" link type="warning" class="action-btn warning" @click="handleUpdateStatus(row, 3)">确认完成</el-button>
                  <span v-else class="text-slate-400 text-xs pr-4 inline-block">无需处理</span>
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
import { ElMessage, ElMessageBox } from 'element-plus';
import { getOrderList, updateOrderStatus } from '../../api/order';
import { useUserStore } from '../../store/user';

const userStore = useUserStore();
const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);

const queryParams = reactive({
  page: 1,
  limit: 10,
  status: undefined as number | undefined,
  merchantId: userStore.userInfo?.id?.toString(),
});

const fetchOrders = async () => {
  loading.value = true;
  try {
    const res = await getOrderList(queryParams);
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
  queryParams.status = undefined;
  handleSearch();
};

const handleUpdateStatus = async (row: any, newStatus: number) => {
  const actionText = newStatus === 1 ? '接单' : newStatus === 2 ? '配送' : '完成';
  try {
    await ElMessageBox.confirm(`确定要执行【${actionText}】操作吗？`, '操作确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    const res = await updateOrderStatus(row.id, newStatus);
    if(res) {
      ElMessage.success(`操作成功！`);
      fetchOrders();
    }
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('操作失败');
    }
  }
};

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

.table-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.action-btn { font-weight: 600; font-family: inherit; }
.action-btn.edit { color: #3b82f6; }
.action-btn.edit:hover { color: #2563eb; background: #eff6ff; border-radius: 0.5rem; padding: 0.25rem 0.5rem; }

.action-btn.delete { color: #ef4444; }
.action-btn.delete:hover { color: #dc2626; background: #fef2f2; border-radius: 0.5rem; padding: 0.25rem 0.5rem; }

.action-btn.success { color: #10b981; }
.action-btn.success:hover { color: #059669; background: #ecfdf5; border-radius: 0.5rem; padding: 0.25rem 0.5rem; }

.action-btn.warning { color: #f59e0b; }
.action-btn.warning:hover { color: #d97706; background: #fffbeb; border-radius: 0.5rem; padding: 0.25rem 0.5rem; }

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
.truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
}
</style>
