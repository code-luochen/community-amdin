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
              <el-icon class="mr-3 text-red-500"><Warning /></el-icon>
              健康预警监控
            </h1>
            <p class="page-subtitle">实时监控用户的健康异常数据并进行预警处理</p>
          </div>
          <div class="flex items-center gap-3">
            <button class="premium-btn secondary px-6 h-10 shadow-none border border-slate-200 rounded-xl" @click="loadRecords">
              刷新
            </button>
            <button class="premium-btn primary-solid group flex items-center gap-2" @click="exportData">
              <el-icon class="group-hover:-translate-y-0.5 transition-transform"><Download /></el-icon>
              <span>导出预警报表</span>
            </button>
          </div>
        </div>
      </div>

      <div class="content-card shadow-soft mb-5">
        <!-- Alert Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-linear-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-md text-white relative overflow-hidden">
            <div class="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full"></div>
            <div class="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full"></div>
            <div class="relative z-10">
              <h3 class="text-red-100 font-medium mb-1">未处理预警</h3>
              <div class="text-4xl font-bold flex items-baseline">
                {{ total }} <span class="text-lg font-normal text-red-200 ml-2">条异常记录</span>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
            <h3 class="text-gray-500 font-medium mb-1 flex items-center"><div class="w-2 h-2 rounded-full bg-orange-400 mr-2"></div> 高发异常类型</h3>
            <div class="text-2xl font-bold text-gray-800">血压偏高 (hypertension)</div>
          </div>
          
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
            <h3 class="text-gray-500 font-medium mb-1 flex items-center"><div class="w-2 h-2 rounded-full bg-blue-400 mr-2"></div> 处理响应率</h3>
            <div class="text-2xl font-bold text-gray-800">92% <span class="text-sm text-green-500 font-semibold ml-2">↑ 2%</span></div>
          </div>
        </div>
      </div>

      <!-- Main Content Area: table -->
      <div class="content-card shadow-soft relative overflow-hidden">
        <div class="px-2 py-2 mb-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-lg font-bold text-slate-800 flex items-center">
            <span class="relative flex h-3 w-3 mr-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            实时预警列表
          </h3>
        </div>

        <div class="table-wrapper">
          <el-table 
            :data="records" 
            v-loading="loading" 
            class="premium-table" 
            style="width: 100%"
            row-class-name="hover:bg-red-50/30 transition-colors"
          >
            <el-table-column label="老人信息" min-width="140">
              <template #default="{ row }">
                <div class="user-cell">
                  <el-avatar :size="36" class="user-avatar bg-blue-50 text-blue-600 font-semibold">
                    {{ row.elderlyId }}
                  </el-avatar>
                  <div class="user-info">
                    <div class="username text-slate-800 font-semibold">ID: {{ row.elderlyId }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="recordTime" label="预警时间" min-width="170">
              <template #default="{ row }">
                <div class="time-cell">
                  <el-icon class="mr-1"><Clock /></el-icon>
                  <span>{{ formatDate(row.recordTime || row.createdAt) }}</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="异常指标" min-width="200">
              <template #default="{ row }">
                <div class="space-y-1 my-1">
                  <div v-if="row.systolicBp > 140 || row.systolicBp < 90 || row.diastolicBp > 90 || row.diastolicBp < 60" class="flex text-sm text-red-600 bg-red-50 px-2 py-1 rounded-md inline-flex whitespace-nowrap mr-2">
                    血压: {{ row.systolicBp }} / {{ row.diastolicBp }} mmHg
                  </div>
                  <div v-if="row.heartRate > 100 || row.heartRate < 60" class="flex text-sm text-red-600 bg-red-50 px-2 py-1 rounded-md inline-flex whitespace-nowrap mr-2">
                    心率: {{ row.heartRate }} 次/分
                  </div>
                  <div v-if="row.bloodSugar > 7.0 || row.bloodSugar < 3.9" class="flex text-sm text-red-600 bg-red-50 px-2 py-1 rounded-md inline-flex whitespace-nowrap mr-2">
                    血糖: {{ row.bloodSugar }} mmol/L
                  </div>
                  <div v-if="row.temperature > 37.3" class="flex text-sm text-red-600 bg-red-50 px-2 py-1 rounded-md inline-flex whitespace-nowrap mr-2">
                    体温: {{ row.temperature }} ℃
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="异常类型" min-width="140">
              <template #default="{ row }">
                <el-tag type="danger" effect="plain" class="border-red-200! uppercase font-bold tracking-wide text-xs">
                  {{ row.abnormalType || 'UNKNOWN' }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="操作" min-width="120" fixed="right" align="right">
              <template #default>
                <div class="table-actions">
                  <el-button link type="primary" class="action-btn edit">联系家属</el-button>
                </div>
              </template>
            </el-table-column>

            <template #empty>
              <el-empty description="当前一切正常，无异常记录" :image-size="120">
                <template #image>
                  <div class="text-green-500 mb-4 flex justify-center">
                    <el-icon :size="64"><CircleCheckFilled /></el-icon>
                  </div>
                </template>
              </el-empty>
            </template>
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
import { ElMessage } from 'element-plus';
import { Clock, Warning, Download, CircleCheckFilled } from '@element-plus/icons-vue';

const loading = ref(false);
const records = ref<HealthRecord[]>([]);
const total = ref(0);
const query = ref({
  page: 1,
  limit: 10,
  isAbnormal: 1 // 管理员端仅显示异常数据
});

const loadRecords = async () => {
  loading.value = true;
  try {
    const res = await fetchHealthRecords(query.value);

    if (res && res.data) {
      records.value = res.data;
      total.value = res.total;
    } else {
      // @ts-ignore
      records.value = res.items || res.list || [];
      // @ts-ignore
      total.value = res.total || 0;
    }
  } catch (err) {
    ElMessage.error('获取异常健康记录失败');
  } finally {
    loading.value = false;
  }
};

const handleCurrentChange = (val: number) => {
  query.value.page = val;
  loadRecords();
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '--';
  const date = new Date(dateStr);
  return date.toLocaleString();
};

const exportData = () => {
  ElMessage.success('报表导出任务已提交');
  // 仅前端模拟导出行为，因为基于当前PRD还未开发真实后端导出逻辑
};

onMounted(() => {
  loadRecords();
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
  background: rgba(239, 68, 68, 0.15); /* Red tinted for alert */
  top: -100px;
  right: -50px;
}

.shape-2 {
  width: 250px;
  height: 250px;
  background: rgba(245, 158, 11, 0.15); /* Orange tinted for alert */
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

.premium-btn.secondary {
  background: white;
  color: #475569;
}

.premium-btn.secondary:hover {
  background: #f8fafc;
  color: #0f172a;
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

.table-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.action-btn {
  font-weight: 600;
  font-family: inherit;
  font-size: 0.875rem;
}

.action-btn.edit {
  color: #3b82f6;
}
.action-btn.edit:hover {
  color: #2563eb;
  background: #eff6ff;
  border-radius: 0.5rem;
  padding: 0.25rem 0.5rem;
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
