<template>
  <div class="health-alert-wrapper">
    <div class="page-container animate-fade-in">
      <!-- Header Section -->
      <div class="premium-header relative overflow-hidden mb-5">
        <div class="bg-shape shape-1"></div>
        <div class="bg-shape shape-2"></div>
        <div class="header-content relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div class="header-text">
            <h1 class="page-title flex items-center">
              健康监控
            </h1>
            <p class="page-subtitle">多维度掌握老人的实时健康状况和历史数据</p>
          </div>
          <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
            <div v-if="elders.length > 0" class="flex items-center flex-1 sm:flex-initial">
              <div class="text-sm font-medium text-slate-500 whitespace-nowrap mr-2">切换老人:</div>
              <el-select 
                v-model="query.elderlyId" 
                placeholder="选择老人" 
                @change="handleElderChange"
                class="custom-select w-full sm:w-52!"
              >
                <el-option
                  v-for="elder in elders"
                  :key="elder.id"
                  :label="elder.label"
                  :value="elder.id"
                />
              </el-select>
            </div>
            <div v-else class="text-sm text-slate-400 italic">暂未绑定任何老人</div>
            <button class="premium-btn primary-solid px-6 h-10 shadow-none border-none rounded-xl whitespace-nowrap shrink-0" @click="loadRecords" :disabled="!query.elderlyId">
              刷新数据
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content Area: Data Cards -->
      <div class="content-card shadow-soft mb-5">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-linear-to-br from-blue-50 to-white border border-blue-100/50 rounded-2xl p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-600/5 rounded-full group-hover:scale-110 transition-transform"></div>
            <div class="text-blue-500 mb-2">
              <el-icon :size="24"><svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-ea893728=""><path fill="currentColor" d="M118.656 439.936a32 32 0 0 1-50.56-39.68L225.28 120.32a32 32 0 0 1 50.56 39.68L118.592 440zM896 400a32 32 0 0 1-50.56 39.68l-157.44-200.32a32 32 0 0 1 50.56-39.68L896 400zM512 800a288 288 0 1 1 0-576 288 288 0 0 1 0 576zm0-64a224 224 0 1 0 0-448 224 224 0 0 0 0 448zM384 480a32 32 0 0 1 32-32h192a32 32 0 0 1 0 64H416a32 32 0 0 1-32-32z"></path></svg></el-icon>
            </div>
            <h3 class="text-sm font-semibold text-slate-500 mb-1">最近血压</h3>
            <div class="text-3xl font-bold text-slate-800 tracking-tight">
              <span v-if="records.length">{{ records[0].systolicBp || '-' }}<span class="text-xl px-1 text-slate-400">/</span>{{ records[0].diastolicBp || '-' }} <span class="text-sm font-medium text-slate-500 ml-1">mmHg</span></span>
              <span v-else>--</span>
            </div>
          </div>
          
          <div class="bg-linear-to-br from-red-50 to-white border border-red-100/50 rounded-2xl p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-red-600/5 rounded-full group-hover:scale-110 transition-transform"></div>
            <div class="text-red-500 mb-2">
              <el-icon :size="24"><svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-ea893728=""><path fill="currentColor" d="M512 896a32 32 0 0 1-22.592-9.344l-340.48-340.544a226.56 226.56 0 0 1 0-320.448 226.624 226.624 0 0 1 320.448 0L512 268.224l42.624-42.56a226.624 226.624 0 0 1 320.448 0 226.56 226.56 0 0 1 0 320.448L534.592 886.656A32 32 0 0 1 512 896zM286.656 271.808a162.56 162.56 0 0 0 0 229.888L512 826.944l225.344-225.344a162.56 162.56 0 0 0 0-229.888 162.624 162.624 0 0 0-229.888 0l-65.28 65.216a32 32 0 0 1-45.248 0l-65.216-65.152a162.624 162.624 0 0 0-229.888 0z"></path></svg></el-icon>
            </div>
            <h3 class="text-sm font-semibold text-slate-500 mb-1">最近心率</h3>
            <div class="text-3xl font-bold text-slate-800 tracking-tight">
              <span v-if="records.length">{{ records[0].heartRate || '-' }} <span class="text-sm font-medium text-slate-500 ml-1">次/分</span></span>
              <span v-else>--</span>
            </div>
          </div>

          <div class="bg-linear-to-br from-green-50 to-white border border-green-100/50 rounded-2xl p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-green-600/5 rounded-full group-hover:scale-110 transition-transform"></div>
            <div class="text-green-500 mb-2">
              <el-icon :size="24"><svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-ea893728=""><path fill="currentColor" d="M736 128a32 32 0 0 1 32 32v66.432a224 224 0 0 1 128 202.048v163.072a223.552 223.552 0 0 1-137.92 206.592l-40.064 16.064A385.92 385.92 0 0 1 512 832a386.112 386.112 0 0 1-206.016-57.856l-40.064-16.064A223.552 223.552 0 0 1 128 591.552V428.48A224 224 0 0 1 256 226.432V160a32 32 0 0 1 32-32h448zM256 288v42.048c15.104 2.88 29.888 6.784 44.416 11.2a32 32 0 1 1-18.944 61.184c-35.392-11.008-72.32-15.04-106.112-11.008l4.416 2.048A160 160 0 0 0 192 428.48v163.072c0 62.4 36.16 117.888 91.52 144.192C355.776 770.176 432.256 768 512 768c79.744 0 156.224 2.112 228.48-32.256A159.552 159.552 0 0 0 832 591.552V428.48a160 160 0 0 0-11.84-60.032l6.272-3.008c-32.704-4.864-68.544-1.28-102.848 9.344a32 32 0 0 1-18.944-61.184C720.576 308.8 735.68 304.832 752.448 302.016L768 288H256zm256-16a32 32 0 0 1 32 32v272a80 80 0 0 1-160 0V304a32 32 0 0 1 128 0z"></path></svg></el-icon>
            </div>
            <h3 class="text-sm font-semibold text-slate-500 mb-1">最近体温</h3>
            <div class="text-3xl font-bold text-slate-800 tracking-tight">
              <span v-if="records.length">{{ records[0].temperature || '-' }} <span class="text-sm font-medium text-slate-500 ml-1">℃</span></span>
              <span v-else>--</span>
            </div>
          </div>

          <div class="bg-linear-to-br from-yellow-50 to-white border border-yellow-100/50 rounded-2xl p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-yellow-600/5 rounded-full group-hover:scale-110 transition-transform"></div>
            <div class="text-yellow-500 mb-2">
              <el-icon :size="24"><svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-ea893728=""><path fill="currentColor" d="M118.656 439.936a32 32 0 0 1-50.56-39.68L225.28 120.32a32 32 0 0 1 50.56 39.68L118.592 440zM896 400a32 32 0 0 1-50.56 39.68l-157.44-200.32a32 32 0 0 1 50.56-39.68L896 400zM512 800a288 288 0 1 1 0-576 288 288 0 0 1 0 576zm0-64a224 224 0 1 0 0-448 224 224 0 0 0 0 448zM384 480a32 32 0 0 1 32-32h192a32 32 0 0 1 0 64H416a32 32 0 0 1-32-32z"></path></svg></el-icon>
            </div>
            <h3 class="text-sm font-semibold text-slate-500 mb-1">最近血糖</h3>
            <div class="text-3xl font-bold text-slate-800 tracking-tight">
              <span v-if="records.length">{{ records[0].bloodSugar || '-' }} <span class="text-sm font-medium text-slate-500 ml-1">mmol/L</span></span>
              <span v-else>--</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Area: table -->
      <div class="content-card shadow-soft relative overflow-hidden">
        <div class="px-2 py-2 mb-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-lg font-bold text-slate-800">
            历史记录查询
          </h3>
        </div>

        <div class="table-wrapper">
          <el-table 
            v-loading="loading" 
            :data="records" 
            class="premium-table" 
            style="width: 100%"
          >
            <el-table-column prop="recordTime" label="记录时间" min-width="160">
              <template #default="{ row }">
                <div class="time-cell">
                  <el-icon class="mr-1"><Clock /></el-icon>
                  <span>{{ formatDate(row.recordTime || row.createdAt) }}</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="血压 (mmHg)" min-width="140">
              <template #default="{ row }">
                <span class="text-slate-700 font-semibold">{{ row.systolicBp || '-' }}<span class="text-slate-400 px-1 font-normal">/</span>{{ row.diastolicBp || '-' }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="heartRate" label="心率 (次/分)" min-width="120">
              <template #default="{ row }">
                <span class="text-slate-700 font-semibold">{{ row.heartRate || '-' }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="bloodSugar" label="血糖 (mmol/L)" min-width="120">
              <template #default="{ row }">
                <span class="text-slate-700 font-semibold">{{ row.bloodSugar || '-' }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="temperature" label="体温 (℃)" min-width="120">
              <template #default="{ row }">
                <span class="text-slate-700 font-semibold">{{ row.temperature || '-' }}</span>
              </template>
            </el-table-column>
            
            <el-table-column label="状态" min-width="120" fixed="right">
              <template #default="{ row }">
                <div :class="['role-badge', row.isAbnormal ? 'badge-danger' : 'badge-success']">
                  <span class="dot"></span>
                  {{ row.isAbnormal ? '异常指标' : '正常指标' }}
                </div>
                <div v-if="row.isAbnormal" class="text-xs text-red-500 mt-1.5 truncate max-w-[100px] font-medium" :title="row.abnormalType">
                  {{ row.abnormalType }}
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- Pagination -->
        <div class="pagination-wrapper mt-6 pb-2">
          <el-pagination
            v-model:current-page="query.page"
            :page-size="query.limit"
            :total="total"
            background
            layout="total, prev, pager, next"
            @current-change="handleCurrentChange"
            class="premium-pagination"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchHealthRecords, HealthRecord } from '@/api/health-record';
import { getMyElderlyList, type ElderlyBindingInfo } from '@/api/family-binding';
import { ElMessage } from 'element-plus';
import { Clock } from '@element-plus/icons-vue';

const loading = ref(false);
const records = ref<HealthRecord[]>([]);
const elders = ref<{ id: number; label: string; nickname: string; username: string; relation: string }[]>([]);
const total = ref(0);
const query = ref({
  page: 1,
  limit: 10,
  elderlyId: undefined as number | undefined
});

// 从绑定关系获取老人列表，确保解绑后老人不再出现在选择器中
const loadElders = async () => {
  try {
    const res: any = await getMyElderlyList();
    // res 可能是数组本身，也可能包含在 data 字段中
    const bindingArr = Array.isArray(res) ? res : (res?.data || res || []);
    elders.value = (bindingArr as ElderlyBindingInfo[])
      .filter((b: ElderlyBindingInfo) => b.elderly)
      .map((b: ElderlyBindingInfo) => ({
        id: b.elderly.id,
        label: b.elderly.realName || b.elderly.nickname || b.elderly.username,
        nickname: b.elderly.nickname || b.elderly.username,
        username: b.elderly.username,
        relation: b.relation,
      }));
  } catch (err) {
    ElMessage.error('获取关联老人列表失败');
  }
};

const loadRecords = async () => {
  // 若没有绑定老人，直接清空数据
  if (!query.value.elderlyId) {
    records.value = [];
    total.value = 0;
    return;
  }

  loading.value = true;
  try {
    const res = await fetchHealthRecords(query.value);

    if (res && (res as any).items) {
      records.value = (res as any).items;
      total.value = (res as any).total;
    } else {
      records.value = [];
      total.value = 0;
    }
  } catch (err) {
    ElMessage.error('获取健康数据失败');
  } finally {
    loading.value = false;
  }
};

const handleCurrentChange = (val: number) => {
  query.value.page = val;
  loadRecords();
};

const handleElderChange = () => {
  query.value.page = 1;
  loadRecords();
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '--';
  const date = new Date(dateStr);
  return date.toLocaleString();
};

onMounted(async () => {
  await loadElders();
  if (elders.value.length > 0) {
    query.value.elderlyId = elders.value[0].id;
    loadRecords();
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.health-alert-wrapper {
  font-family: 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif;
  color: #1e293b;
  min-height: 100%;
  padding: 1.5rem;
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
  background: rgba(56, 189, 248, 0.15); /* Blue tinted */
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

.premium-btn.primary-solid {
  background: #0f172a;
  color: white;
  box-shadow: 0 4px 14px 0 rgba(15, 23, 42, 0.2);
  border-radius: 0.75rem;
}

.premium-btn.primary-solid:hover {
  background: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px 0 rgba(15, 23, 42, 0.3);
}

/* Content Card */
.content-card {
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  border: 1px solid #f1f5f9;
}

.shadow-soft {
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
}

/* Custom Overrides for Element Plus */
::v-deep(.custom-select .el-select__wrapper) {
  border-radius: 0.75rem;
  box-shadow: 0 0 0 1px #e2e8f0 inset !important;
  background-color: #f8fafc;
  padding: 0.25rem 1rem;
  transition: all 0.2s;
}

::v-deep(.custom-select .el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px #cbd5e1 inset !important;
  background-color: #ffffff;
}

::v-deep(.custom-select .el-select__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #3b82f6 inset !important;
  background-color: #ffffff;
}

/* Table Aesthetics */
.table-wrapper {
  overflow-x: auto;
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

/* Table Elements */
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

.badge-success {
  background: #ecfdf5;
  color: #059669;
}
.badge-success .dot { background: #10b981; }

.badge-danger {
  background: #fef2f2;
  color: #dc2626;
}
.badge-danger .dot { background: #ef4444; }

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
