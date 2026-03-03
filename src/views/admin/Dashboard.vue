<template>
  <div class="dashboard-wrapper">
    <div class="page-container animate-fade-in">
      <!-- Header Section -->
      <div class="premium-header relative overflow-hidden mb-6!">
        <div class="bg-shape shape-1"></div>
        <div class="bg-shape shape-2"></div>
        <div class="header-content relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div class="header-text">
            <h1 class="page-title">系统数据看板</h1>
            <p class="page-subtitle">实时监控社区运行指标，协调服务响应与资源分配</p>
          </div>
          <div class="header-actions">
            <div class="current-date-badge shadow-sm">
              <el-icon class="mr-2 text-primary"><Calendar /></el-icon>
              <span>{{ currentDate }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div v-for="(stat, index) in quickStats" :key="index" class="stat-card shadow-soft animate-slide-up" :style="{ animationDelay: `${index * 0.1}s` }">
          <div class="stat-icon-wrapper" :class="stat.type">
            <el-icon><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-footer">
              <span class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
                <el-icon><CaretTop v-if="stat.trend > 0" /><CaretBottom v-else /></el-icon>
                {{ Math.abs(stat.trend) }}%
              </span>
              <span class="stat-period">较昨日</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <!-- Service Distribution -->
        <div class="chart-card shadow-soft animate-fade-in lg:col-span-1" style="animation-delay: 0.4s">
          <div class="card-header pb-4 border-b border-gray-50 mb-4">
            <div class="flex items-center gap-2">
              <el-icon class="text-indigo-500"><PieChart /></el-icon>
              <h3 class="text-lg font-bold text-slate-800">服务类型分布</h3>
            </div>
          </div>
          <div class="chart-container h-64 relative">
            <VChart 
              v-if="hasServiceData"
              class="chart" 
              :option="servicePieOption" 
              autoresize 
              :loading="loading"
              style="width: 100%; height: 100%;"
            />
            <div v-else class="flex flex-col items-center justify-center h-full text-slate-400">
               <el-icon size="40" class="mb-2 opacity-20"><Memo /></el-icon>
               <p class="text-sm">暂无服务分布数据</p>
            </div>
          </div>
        </div>

        <!-- Order Comparison -->
        <div class="chart-card shadow-soft animate-fade-in lg:col-span-2" style="animation-delay: 0.5s">
          <div class="card-header pb-4 border-b border-gray-50 mb-4">
            <div class="flex items-center gap-2">
              <el-icon class="text-blue-500"><TrendCharts /></el-icon>
              <h3 class="text-lg font-bold text-slate-800">订单周期对比</h3>
            </div>
          </div>
          <div class="chart-container h-64 relative">
            <VChart 
              v-if="hasOrderData"
              class="chart" 
              :option="orderBarOption" 
              autoresize 
              :loading="loading"
              style="width: 100%; height: 100%;"
            />
            <div v-else class="flex flex-col items-center justify-center h-full text-slate-400">
               <el-icon size="40" class="mb-2 opacity-20"><ShoppingCart /></el-icon>
               <p class="text-sm">暂无订单统计数据</p>
            </div>
          </div>
        </div>
      </div>

      <!-- User and Tasks Row -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <!-- User Composition -->
        <div class="chart-card shadow-soft animate-fade-in xl:col-span-1" style="animation-delay: 0.6s">
          <div class="card-header pb-4 border-b border-gray-50 mb-4">
            <div class="flex items-center gap-2">
              <el-icon class="text-indigo-900"><User /></el-icon>
              <h3 class="text-lg font-bold text-slate-800">用户构成</h3>
            </div>
          </div>
          <div class="chart-container h-80 relative">
            <VChart 
              v-if="dashboardData"
              class="chart" 
              :option="userCompositionOption" 
              autoresize 
              :loading="loading"
              style="width: 100%; height: 100%;"
            />
          </div>
        </div>

        <!-- Pending Tasks (Mixed: Audits + Emergencies) -->
        <div class="chart-card shadow-soft animate-fade-in xl:col-span-2" style="animation-delay: 0.7s">
          <div class="card-header border-b border-gray-50 mb-4 flex justify-between items-center">
            <div class="flex items-center gap-2">
              <el-icon class="text-amber-500"><Memo /></el-icon>
              <h3 class="text-lg font-bold text-slate-800">实时待办事项</h3>
            </div>
            <div class="flex gap-2">
              <el-tag size="small" type="warning">{{ pendingAudits.length }} 审核</el-tag>
              <el-tag size="small" type="danger">{{ pendingEmergencies.length }} 求助</el-tag>
            </div>
          </div>
          
          <div class="task-list overflow-y-auto max-h-80 pr-2">
            <!-- Emergencies (High Priority) -->
            <div v-for="emergency in pendingEmergencies" :key="'e' + emergency.id" class="task-item emergency animate-pulse-border mb-3">
              <div class="task-icon bg-red-50 text-red-500">
                <el-icon><Bell /></el-icon>
              </div>
              <div class="task-info flex-1">
                <div class="flex justify-between">
                  <span class="task-title font-bold text-red-600">紧急求助: {{ emergency.elderly?.nickname || '老年用户' }}</span>
                  <span class="task-time">{{ formatTime(emergency.createdAt) }}</span>
                </div>
                <div class="task-desc text-sm text-slate-500 truncate max-w-md">{{ emergency.location }}</div>
              </div>
              <el-button type="danger" size="small" class="rounded-lg!" @click="$router.push('/admin/emergency')">处理</el-button>
            </div>

            <!-- Audits -->
            <div v-for="service in pendingAudits" :key="'s' + service.id" class="task-item audit mb-3">
              <div class="task-icon bg-blue-50 text-blue-500">
                <el-icon><DocumentChecked /></el-icon>
              </div>
              <div class="task-info flex-1">
                <div class="flex justify-between">
                  <span class="task-title font-bold text-slate-700">服务审核: {{ service.name }}</span>
                  <span class="task-time text-slate-400">{{ formatTime(service.createdAt) }}</span>
                </div>
                <div class="task-desc text-sm text-slate-500">发布者: {{ service.merchant?.nickname || '社区商家' }}</div>
              </div>
              <el-button type="primary" size="small" class="rounded-lg!" @click="$router.push('/admin/service-audit')">审核</el-button>
            </div>

            <!-- Empty State -->
            <div v-if="pendingAudits.length === 0 && pendingEmergencies.length === 0" class="empty-tasks py-12 text-center text-slate-400">
              <el-icon size="48" class="mb-4 opacity-20"><CircleCheck /></el-icon>
              <p>暂无待办事项，系统运行良好</p>
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
  Odometer, 
  User, 
  ShoppingCart, 
  Bell, 
  Calendar,
  CaretTop,
  CaretBottom,
  TrendCharts,
  PieChart,
  Memo,
  DocumentChecked,
  CircleCheck
} from '@element-plus/icons-vue';
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart as EPieChart, BarChart as EBarChart, LineChart as ELineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from "echarts/components";
import VChart, { THEME_KEY } from "vue-echarts";
import { fetchDashboardData, type DashboardData } from '@/api/statistics';
import { serviceApi, type ServiceItem } from '@/api/service';
import { fetchEmergencies, type EmergencyLog } from '@/api/emergency';
import { ElMessage } from 'element-plus';

// Register ECharts modules
use([
  CanvasRenderer,
  EPieChart,
  EBarChart,
  ELineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
]);

// Provide a light theme for ECharts
provide(THEME_KEY, "light");

const dashboardData = ref<DashboardData | null>(null);
const pendingAudits = ref<ServiceItem[]>([]);
const pendingEmergencies = ref<EmergencyLog[]>([]);
const loading = ref(true);

const hasServiceData = computed(() => {
  if (!dashboardData.value) return false;
  return (dashboardData.value.services.life + dashboardData.value.services.medicine + dashboardData.value.services.medical) > 0;
});

const hasOrderData = computed(() => {
  if (!dashboardData.value) return false;
  return (dashboardData.value.orders.total) >= 0; // Even 0 total might show axes
});

const currentDate = computed(() => {
  const now = new Date();
  return now.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    weekday: 'long' 
  });
});

const quickStats = computed(() => {
  if (!dashboardData.value) return [];
  
  return [
    {
      label: '累计居民',
      value: dashboardData.value.users.elderly,
      icon: User,
      type: 'user',
      trend: 2.1,
    },
    {
      label: '本日新增订单',
      value: dashboardData.value.orders.daily,
      icon: ShoppingCart,
      type: 'order',
      trend: 8.5,
    },
    {
      label: '活跃服务商',
      value: dashboardData.value.users.merchant,
      icon: Odometer,
      type: 'service',
      trend: 0,
    },
    {
      label: '健康风险点',
      value: dashboardData.value.health.warnings,
      icon: Bell,
      type: 'warning',
      trend: -12.4,
    }
  ];
});

// ECharts Options
const servicePieOption = computed(() => {
  if (!dashboardData.value) return {};
  
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { 
      bottom: '2%', 
      left: 'center', 
      icon: 'circle', 
      itemGap: 15,
      textStyle: { color: '#64748b', fontSize: 12 } 
    },
    series: [
      {
        name: '服务种类',
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: '15', fontWeight: 'bold' } },
        data: [
          { value: dashboardData.value.services.life || 0, name: '生活服务', itemStyle: { color: '#6366f1' } },
          { value: dashboardData.value.services.medicine || 0, name: '药品服务', itemStyle: { color: '#8b5cf6' } },
          { value: dashboardData.value.services.medical || 0, name: '医护服务', itemStyle: { color: '#ec4899' } }
        ]
      }
    ]
  };
});

const orderBarOption = computed(() => {
  if (!dashboardData.value) return {};
  
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['今日', '本周', '本月'],
      axisLine: { lineStyle: { color: '#f1f5f9' } },
      axisLabel: { color: '#64748b', fontWeight: 500, margin: 15 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
      axisLabel: { color: '#94a3b8' }
    },
    series: [
      {
        name: '订单量',
        type: 'bar',
        barWidth: '35%',
        data: [
          { value: dashboardData.value.orders.daily || 0, itemStyle: { color: '#3b82f6' } },
          { value: dashboardData.value.orders.weekly || 0, itemStyle: { color: '#60a5fa' } },
          { value: dashboardData.value.orders.monthly || 0, itemStyle: { color: '#93c5fd' } }
        ],
        itemStyle: { borderRadius: [8, 8, 0, 0] }
      }
    ]
  };
});

const userCompositionOption = computed(() => {
  if (!dashboardData.value) return {};

  return {
    tooltip: { trigger: 'axis' },
    grid: { top: '5%', left: '3%', right: '10%', bottom: '5%', containLabel: true },
    xAxis: { type: 'value', show: false },
    yAxis: {
      type: 'category',
      data: ['商家', '家属', '老人'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#334155', fontWeight: 600, fontSize: 13 }
    },
    series: [
      {
        type: 'bar',
        data: [
          { value: dashboardData.value.users.merchant || 0, itemStyle: { color: '#94a3b8' } },
          { value: dashboardData.value.users.family || 0, itemStyle: { color: '#475569' } },
          { value: dashboardData.value.users.elderly || 0, itemStyle: { color: '#0f172a' } }
        ],
        barWidth: '18px',
        itemStyle: { borderRadius: 10 },
        label: { show: true, position: 'right', color: '#64748b', fontWeight: 600, formatter: '{c} 人' }
      }
    ]
  };
});

const formatTime = (dateStr: string) => {
  if (!dateStr) return '--:--';
  const date = new Date(dateStr);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const initData = async () => {
  loading.value = true;
  try {
    const [statsRes, auditRes, emergencyRes] = await Promise.all([
      fetchDashboardData(),
      serviceApi.findAllAdmin({ page: 1, limit: 10, auditStatus: 0 }),
      fetchEmergencies({ page: 1, limit: 10, status: 0 })
    ]);

    // Handle nested data if any
    const rawStats = statsRes.data || (statsRes as any);
    dashboardData.value = rawStats;
    
    pendingAudits.value = auditRes.items || auditRes.records || [];
    pendingEmergencies.value = emergencyRes.items || [];
    
    console.log('Dashboard Data Loaded:', dashboardData.value);
  } catch (error) {
    console.error('Data init failed:', error);
    ElMessage.error('获取系统运营数据概况失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
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

.page-container {
  width: 100%;
}

/* Header Aesthetics */
.premium-header {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.03);
}

.bg-shape {
  position: absolute;
  filter: blur(60px);
  z-index: 0;
  border-radius: 50%;
  pointer-events: none;
}

.shape-1 {
  width: 300px; height: 300px;
  background: rgba(56, 189, 248, 0.1); top: -100px; right: -50px;
}

.shape-2 {
  width: 250px; height: 250px;
  background: rgba(167, 139, 250, 0.1); bottom: -120px; right: 200px;
}

.page-title {
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #64748b;
  font-size: 1rem;
}

.current-date-badge {
  background: rgba(248, 250, 252, 0.8);
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  color: #475569;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  border: 1px solid #f1f5f9;
}

/* Stat Cards */
.stat-card {
  background: white;
  padding: 1.75rem;
  border-radius: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border: 1px solid #f8fafc;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.04);
}

.stat-icon-wrapper {
  width: 4rem; height: 4rem;
  border-radius: 1.25rem;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.75rem;
}

.stat-icon-wrapper.user { background: #eff6ff; color: #2563eb; }
.stat-icon-wrapper.order { background: #f0fdf4; color: #16a34a; }
.stat-icon-wrapper.service { background: #f5f3ff; color: #7c3aed; }
.stat-icon-wrapper.warning { background: #fff1f2; color: #e11d48; }

.stat-label { font-size: 0.95rem; color: #64748b; font-weight: 600; }
.stat-value { font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0.25rem 0; }
.stat-footer { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; }
.stat-trend { display: flex; align-items: center; font-weight: 700; }
.stat-trend.up { color: #10b981; }
.stat-trend.down { color: #f43f5e; }
.stat-period { color: #94a3b8; }

/* Chart Cards */
.chart-card {
  background: white;
  border-radius: 1.75rem;
  padding: 1.75rem;
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
}

.chart-container { flex: 1; position: relative; }
.chart { height: 100%; width: 100%; }

/* Task List Styles */
.task-item {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem;
  border-radius: 1.25rem;
  border: 1px solid #f1f5f9;
  transition: all 0.2s;
}

.task-item:hover {
  background-color: #f8fafc;
  border-color: #e2e8f0;
}

.task-icon {
  width: 2.75rem; height: 2.75rem;
  border-radius: 1rem;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.25rem;
}

.task-title { font-size: 0.95rem; }
.task-time { font-size: 0.75rem; font-weight: 500; }

.animate-pulse-border {
  border-color: #fecaca;
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.1); }
  70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

/* Animations */
.animate-slide-up {
  opacity: 0;
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in {
  opacity: 0;
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Scrollbar Style */
.task-list::-webkit-scrollbar { width: 4px; }
.task-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>
