<template>
  <div class="dashboard-wrapper">
    <div class="page-container animate-fade-in">
      <!-- Header Section -->
      <div class="premium-header relative overflow-hidden mb-6!">
        <div class="bg-shape shape-1"></div>
        <div class="bg-shape shape-2"></div>
        <div class="header-content relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div class="header-text">
            <h1 class="page-title">家属协通中心</h1>
            <p class="page-subtitle">实时掌握 {{ stats?.elderly?.nickname || stats?.elderly?.realName || '家人' }} 的健康状况与服务需求</p>
          </div>
          <div class="flex items-center gap-3 flex-wrap justify-end">
            <!-- 绑定老人切换 -->
            <div v-if="elders.length > 0" class="elder-switcher flex items-center gap-2">
              <span class="text-sm font-medium text-slate-500 whitespace-nowrap">切换老人:</span>
              <el-select
                v-model="selectedElderlyId"
                class="elder-select"
                style="width: 160px"
                @change="handleElderChange"
                :loading="loading"
              >
                <el-option
                  v-for="elder in elders"
                  :key="elder.id"
                  :label="elder.nickname || elder.username"
                  :value="elder.id"
                />
              </el-select>
            </div>
            <div class="current-date-badge shadow-sm">
              <el-icon class="mr-2 text-primary"><Calendar /></el-icon>
              <span>{{ currentDate }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Health Status Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- BP Card -->
        <div class="stat-card health shadow-soft animate-slide-up" style="animation-delay: 0.1s">
          <div class="stat-icon-wrapper blood-pressure">
            <el-icon><Monitor /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">最近血压 (mmHg)</div>
            <div class="stat-value" :class="{ 'text-red-500': stats?.latestHealth?.isAbnormal && stats?.latestHealth?.systolicBp > 140 }">
              {{ stats?.latestHealth?.systolicBp || '--' }}/{{ stats?.latestHealth?.diastolicBp || '--' }}
            </div>
            <div class="stat-footer">
              <span class="stat-trend" :class="stats?.latestHealth?.isAbnormal ? 'down' : 'up'">
                {{ stats?.latestHealth?.isAbnormal ? '数值异常' : '状况良好' }}
              </span>
            </div>
          </div>
        </div>

        <!-- HR Card -->
        <div class="stat-card health shadow-soft animate-slide-up" style="animation-delay: 0.2s">
          <div class="stat-icon-wrapper heart-rate">
            <el-icon><Timer /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">最近心率 (bpm)</div>
            <div class="stat-value" :class="{ 'text-red-500': stats?.latestHealth?.isAbnormal && (stats?.latestHealth?.heartRate > 100 || stats?.latestHealth?.heartRate < 60) }">
              {{ stats?.latestHealth?.heartRate || '--' }}
            </div>
            <div class="stat-footer">
              <span class="stat-period">记录于 {{ formatTime(stats?.latestHealth?.recordTime) }}</span>
            </div>
          </div>
        </div>

        <!-- Temp/Sugar Card -->
        <div class="stat-card health shadow-soft animate-slide-up" style="animation-delay: 0.3s">
          <div class="stat-icon-wrapper blood-sugar">
            <el-icon><Filter /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">血糖记录 (mmol/L)</div>
            <div class="stat-value">
              {{ stats?.latestHealth?.bloodSugar || '--' }}
            </div>
            <div class="stat-footer text-xs font-semibold">餐后监测</div>
          </div>
        </div>

        <!-- Warning Card -->
        <div class="stat-card health shadow-soft animate-slide-up" style="animation-delay: 0.4s">
          <div class="stat-icon-wrapper alert" :class="{ 'bg-red-500 text-white animate-pulse': stats?.abnormalCount > 0 }">
            <el-icon><Bell /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">健康警报</div>
            <div class="stat-value">{{ stats?.abnormalCount || 0 }}</div>
            <div class="stat-footer">
               <span class="stat-period">累计异常记录</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Health Trend Chart -->
        <div class="chart-card shadow-soft animate-fade-in" style="animation-delay: 0.5s">
          <div class="card-header pb-4 border-b border-gray-50 mb-4">
            <div class="flex items-center gap-2">
              <el-icon class="text-red-500"><TrendCharts /></el-icon>
              <h3 class="text-lg font-bold text-slate-800">健康趋势 (近7次记录)</h3>
            </div>
          </div>
          <div class="chart-container h-64 relative">
            <VChart 
              v-if="hasHealthData"
              class="chart" 
              :option="healthTrendOption" 
              autoresize 
              style="width: 100%; height: 100%;"
            />
            <div v-else class="flex flex-col items-center justify-center h-full text-slate-400">
               <el-icon size="40" class="mb-2 opacity-20"><Monitor /></el-icon>
               <p class="text-sm">暂无历史健康数据</p>
            </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="chart-card shadow-soft animate-fade-in" style="animation-delay: 0.6s">
          <div class="card-header border-b border-gray-50 mb-4 flex justify-between items-center pb-4">
            <div class="flex items-center gap-2">
              <el-icon class="text-indigo-500"><ShoppingCart /></el-icon>
              <h3 class="text-lg font-bold text-slate-800">家人近期服务</h3>
            </div>
            <el-button link type="primary" @click="$router.push('/family/order')">查看全部</el-button>
          </div>
          
          <div class="task-list overflow-y-auto max-h-64 pr-2">
            <div v-for="order in stats?.latestOrders" :key="order.id" class="task-item mb-3">
              <div class="task-icon" :class="getStatusClass(order.status)">
                <el-icon><component :is="getStatusIcon(order.status)" /></el-icon>
              </div>
              <div class="task-info flex-1">
                <div class="flex justify-between">
                  <span class="task-title font-bold text-slate-700">{{ order.serviceSnapshot?.name }}</span>
                  <span class="task-time text-slate-400">{{ formatDateShort(order.createdAt) }}</span>
                </div>
                <div class="task-desc text-sm text-slate-500">状态: {{ getStatusText(order.status) }}</div>
              </div>
              <el-tag :type="getStatusTagType(order.status)" size="small">{{ getStatusText(order.status) }}</el-tag>
            </div>

            <div v-if="!stats?.latestOrders?.length" class="empty-tasks py-12 text-center text-slate-400">
              <el-icon size="48" class="mb-4 opacity-20"><ShoppingCart /></el-icon>
              <p>暂无服务订单记录</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, provide } from 'vue';
import { 
  Monitor, 
  Timer, 
  Filter, 
  Bell, 
  Calendar,
  TrendCharts,
  ShoppingCart,
  Check,
  Van,
  Loading,
  CircleClose
} from '@element-plus/icons-vue';
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart as ELineChart } from "echarts/charts";
import { TooltipComponent, GridComponent, LegendComponent } from "echarts/components";
import VChart, { THEME_KEY } from "vue-echarts";
import { fetchFamilyStats } from '@/api/statistics';
import { getMyElderlyList, type ElderlyBindingInfo } from '@/api/family-binding';
import { ElMessage } from 'element-plus';

use([CanvasRenderer, ELineChart, TooltipComponent, GridComponent, LegendComponent]);
provide(THEME_KEY, "light");

const stats = ref<any>(null);
const loading = ref(true);
const elders = ref<{ id: number; nickname: string; username: string }[]>([]);
const selectedElderlyId = ref<number | undefined>(undefined);

const hasHealthData = computed(() => {
  return stats.value?.healthHistory?.length > 0;
});

const currentDate = computed(() => {
  const now = new Date();
  return now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
});

const healthTrendOption = computed(() => {
  if (!stats.value?.healthHistory) return {};
  const history = stats.value.healthHistory;
  
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['收缩压', '舒张压', '心率'], bottom: '0%', itemGap: 25 },
    grid: { left: '3%', right: '4%', bottom: '20%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: history.map((h: any) => formatTime(h.recordTime)),
      axisLabel: { color: '#94a3b8' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }
    },
    series: [
      {
        name: '收缩压',
        type: 'line',
        smooth: true,
        data: history.map((h: any) => h.systolicBp),
        itemStyle: { color: '#ef4444' }
      },
      {
        name: '舒张压',
        type: 'line',
        smooth: true,
        data: history.map((h: any) => h.diastolicBp),
        itemStyle: { color: '#3b82f6' }
      },
      {
        name: '心率',
        type: 'line',
        smooth: true,
        data: history.map((h: any) => h.heartRate),
        itemStyle: { color: '#10b981' }
      }
    ]
  };
});

const formatTime = (dateStr: string) => {
  if (!dateStr) return '--:--';
  const date = new Date(dateStr);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const formatDateShort = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const getStatusText = (status: number) => {
  const map: any = { 0: '待接单', 1: '已接单', 2: '配送中', 3: '待评价', 4: '已完成', 5: '已取消' };
  return map[status] || '未知';
};

const getStatusTagType = (status: number) => {
  const map: any = { 0: 'warning', 1: 'info', 2: 'primary', 3: 'success', 4: 'success', 5: 'danger' };
  return map[status] || '';
};

const getStatusIcon = (status: number) => {
  const map: any = { 0: Loading, 1: Check, 2: Van, 3: Check, 4: Check, 5: CircleClose };
  return map[status] || Loading;
};

const getStatusClass = (status: number) => {
  const map: any = { 0: 'bg-amber-50 text-amber-500', 1: 'bg-blue-50 text-blue-500', 2: 'bg-indigo-50 text-indigo-500', 3: 'bg-green-50 text-green-500', 4: 'bg-green-50 text-green-500', 5: 'bg-red-50 text-red-500' };
  return map[status] || '';
};

// 加载已绑定老人列表
const loadElders = async () => {
  try {
    const res: any = await getMyElderlyList();
    const bindings: ElderlyBindingInfo[] = Array.isArray(res) ? res : (res?.data || res || []);
    elders.value = (bindings as ElderlyBindingInfo[])
      .filter((b: ElderlyBindingInfo) => b.elderly)
      .map((b: ElderlyBindingInfo) => ({
        id: b.elderly.id,
        nickname: b.elderly.realName || b.elderly.nickname || b.elderly.username,
        username: b.elderly.username,
      }));
    // 默认选中第一个
    if (elders.value.length > 0) {
      selectedElderlyId.value = elders.value[0].id;
    }
  } catch (err) {
    elders.value = [];
  }
};

const initData = async () => {
  loading.value = true;
  try {
    const res = await fetchFamilyStats(selectedElderlyId.value);
    stats.value = res;
  } catch (error) {
    ElMessage.error('无法获取关联家人数据，请确认账号关联关系');
  } finally {
    loading.value = false;
  }
};

// 切换老人时重新加载数据
const handleElderChange = () => {
  initData();
};

onMounted(async () => {
  await loadElders();
  initData();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.dashboard-wrapper {
  font-family: 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif;
  color: #1e293b;
  min-height: 100%;
}
.page-container { width: 100%; }

.premium-header {
  background: white; border-radius: 1.5rem; padding: 2rem 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.03);
}

.bg-shape { position: absolute; filter: blur(60px); z-index: 0; border-radius: 50%; pointer-events: none; }
.shape-1 { width: 300px; height: 300px; background: rgba(56, 189, 248, 0.1); top: -100px; right: -50px; }
.shape-2 { width: 250px; height: 250px; background: rgba(167, 139, 250, 0.1); bottom: -120px; right: 200px; }

.page-title { font-size: 2.25rem; font-weight: 800; letter-spacing: -0.025em; color: #0f172a; margin-bottom: 0.5rem; }
.page-subtitle { color: #64748b; font-size: 1rem; }

.current-date-badge {
  background: rgba(248, 250, 252, 0.8); padding: 0.75rem 1.5rem;
  border-radius: 1rem; color: #475569; font-weight: 600; font-size: 0.95rem;
  display: flex; align-items: center; border: 1px solid #f1f5f9;
}

.elder-switcher {
  background: rgba(248, 250, 252, 0.9);
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  border: 1px solid #f1f5f9;
}

::v-deep(.elder-select .el-select__wrapper) {
  border-radius: 0.75rem;
  box-shadow: 0 0 0 1px #e2e8f0 inset !important;
  background-color: #ffffff;
  font-size: 0.875rem;
  height: 36px;
}

.stat-card.health {
  background: white; padding: 1.75rem; border-radius: 1.5rem;
  display: flex; align-items: center; gap: 1.5rem; border: 1px solid #f8fafc;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.stat-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.04); }

.stat-icon-wrapper {
  width: 4rem; height: 4rem; border-radius: 1.25rem;
  display: flex; align-items: center; justify-content: center; font-size: 1.75rem;
}
.stat-icon-wrapper.blood-pressure { background: #fef2f2; color: #ef4444; }
.stat-icon-wrapper.heart-rate { background: #f0fdf4; color: #10b981; }
.stat-icon-wrapper.blood-sugar { background: #fdf4ff; color: #a855f7; }
.stat-icon-wrapper.alert { background: #f8fafc; color: #94a3b8; }

.stat-label { font-size: 0.95rem; color: #64748b; font-weight: 600; }
.stat-value { font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0.25rem 0; }
.stat-footer { font-size: 0.8rem; font-weight: 700; }
.stat-trend.up { color: #10b981; }
.stat-trend.down { color: #f43f5e; }
.stat-period { color: #94a3b8; }

.chart-card { background: white; border-radius: 1.75rem; padding: 1.75rem; border: 1px solid #f1f5f9; display: flex; flex-direction: column; }
.chart-container { flex: 1; position: relative; }
.chart { height: 100%; width: 100%; }

.task-item { display: flex; align-items: center; gap: 1.25rem; padding: 1rem; border-radius: 1.25rem; border: 1px solid #f1f5f9; }
.task-icon { width: 2.75rem; height: 2.75rem; border-radius: 1rem; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
.task-title { font-size: 0.95rem; }
.task-time { font-size: 0.75rem; font-weight: 500; }

.animate-slide-up { opacity: 0; animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-fade-in { opacity: 0; animation: fadeIn 0.8s ease-out forwards; }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
