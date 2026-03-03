<template>
  <div class="dashboard-wrapper">
    <div class="page-container animate-fade-in">
      <!-- Header Section -->
      <div class="premium-header relative overflow-hidden mb-6!">
        <div class="bg-shape shape-1"></div>
        <div class="bg-shape shape-2"></div>
        <div class="header-content relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div class="header-text">
            <h1 class="page-title">商户经营概览</h1>
            <p class="page-subtitle">管理您的社区服务、追踪营收并响应订单需求</p>
          </div>
          <div class="header-actions">
            <div class="current-date-badge shadow-sm">
              <el-icon class="mr-2 text-primary"><Calendar /></el-icon>
              <span>{{ currentDate }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="stat-card shadow-soft animate-slide-up" style="animation-delay: 0.1s">
          <div class="stat-icon-wrapper income">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">今日营收</div>
            <div class="stat-value">¥{{ stats?.todayIncome || 0 }}</div>
            <div class="stat-footer">
              <span class="stat-trend up"><el-icon><CaretTop /></el-icon> 实时</span>
            </div>
          </div>
        </div>

        <div class="stat-card shadow-soft animate-slide-up" style="animation-delay: 0.2s">
          <div class="stat-icon-wrapper pending">
            <el-icon><ShoppingCart /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">待处理订单</div>
            <div class="stat-value">{{ stats?.pendingOrders || 0 }}</div>
            <div class="stat-footer">
              <span class="stat-trend" :class="stats?.pendingOrders > 0 ? 'down' : 'up'">
                {{ stats?.pendingOrders > 0 ? '需尽快处理' : '全部已处理' }}
              </span>
            </div>
          </div>
        </div>

        <div class="stat-card shadow-soft animate-slide-up" style="animation-delay: 0.3s">
          <div class="stat-icon-wrapper services">
            <el-icon><Shop /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">在架服务</div>
            <div class="stat-value">{{ stats?.activeServices || 0 }}</div>
            <div class="stat-footer">
              <span class="stat-period">共 {{ stats?.totalServices || stats?.activeServices || 0 }} 项服务</span>
            </div>
          </div>
        </div>

        <div class="stat-card shadow-soft animate-slide-up" style="animation-delay: 0.4s">
          <div class="stat-icon-wrapper total">
            <el-icon><Files /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">累计总订单</div>
            <div class="stat-value">{{ stats?.totalOrders || 0 }}</div>
            <div class="stat-footer">
               <span class="stat-period">累计服务社区居民</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <!-- Order Distribution -->
        <div class="chart-card shadow-soft animate-fade-in lg:col-span-1" style="animation-delay: 0.5s">
          <div class="card-header pb-4 border-b border-gray-50 mb-4">
            <div class="flex items-center gap-2">
              <el-icon class="text-blue-500"><PieChart /></el-icon>
              <h3 class="text-lg font-bold text-slate-800">订单状态分布</h3>
            </div>
          </div>
          <div class="chart-container h-64 relative">
            <VChart 
              v-if="hasOrderData"
              class="chart" 
              :option="orderPieOption" 
              autoresize 
              style="width: 100%; height: 100%;"
            />
            <div v-else class="flex flex-col items-center justify-center h-full text-slate-400">
               <el-icon size="40" class="mb-2 opacity-20"><Memo /></el-icon>
               <p class="text-sm">暂无订单分布数据</p>
            </div>
          </div>
        </div>

        <!-- Recent Pending Orders -->
        <div class="chart-card shadow-soft animate-fade-in lg:col-span-2" style="animation-delay: 0.6s">
          <div class="card-header border-b border-gray-50 mb-4 flex justify-between items-center pb-4">
            <div class="flex items-center gap-2">
              <el-icon class="text-amber-500"><Bell /></el-icon>
              <h3 class="text-lg font-bold text-slate-800">最新待接订单</h3>
            </div>
            <el-button link type="primary" @click="$router.push('/merchant/order')">查看全部</el-button>
          </div>
          
          <div class="task-list overflow-y-auto max-h-64 pr-2">
            <div v-for="order in pendingOrders" :key="order.id" class="task-item mb-3 animate-pulse-border">
              <div class="task-icon bg-amber-50 text-amber-500">
                <el-icon><ShoppingCart /></el-icon>
              </div>
              <div class="task-info flex-1">
                <div class="flex justify-between">
                  <span class="task-title font-bold text-slate-700">服务: {{ order.serviceSnapshot?.name }}</span>
                  <span class="task-time text-slate-400">{{ formatTime(order.createdAt) }}</span>
                </div>
                <div class="task-desc text-sm text-slate-500">订单号: {{ order.orderNo }}</div>
              </div>
              <el-button type="warning" size="small" class="rounded-lg!" @click="handleAcceptOrder(order.id)">接单</el-button>
            </div>

            <div v-if="pendingOrders.length === 0" class="empty-tasks py-12 text-center text-slate-400">
              <el-icon size="48" class="mb-4 opacity-20"><CircleCheck /></el-icon>
              <p>暂无待接订单，已全部处理完毕</p>
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
  Money, 
  ShoppingCart, 
  Shop, 
  Files, 
  Calendar,
  CaretTop,
  PieChart,
  Bell,
  Memo,
  CircleCheck
} from '@element-plus/icons-vue';
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart as EPieChart } from "echarts/charts";
import { TooltipComponent, LegendComponent } from "echarts/components";
import VChart, { THEME_KEY } from "vue-echarts";
import { fetchMerchantStats } from '@/api/statistics';
import { getOrderList, updateOrderStatus } from '@/api/order';
import { ElMessage, ElMessageBox } from 'element-plus';

use([CanvasRenderer, EPieChart, TooltipComponent, LegendComponent]);
provide(THEME_KEY, "light");

const stats = ref<any>(null);
const pendingOrders = ref<any[]>([]);
const loading = ref(true);

const hasOrderData = computed(() => {
  if (!stats.value?.distribution) return false;
  const d = stats.value.distribution;
  return (d.pending + d.processing + d.completed + d.canceled) > 0;
});

const currentDate = computed(() => {
  const now = new Date();
  return now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
});

const orderPieOption = computed(() => {
  if (!stats.value?.distribution) return {};
  const d = stats.value.distribution;
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { 
      orient: 'vertical',
      right: '10%',
      top: 'middle',
      icon: 'circle',
      itemGap: 15,
      textStyle: { color: '#64748b', fontSize: 12 } 
    },
    series: [
      {
        name: '订单状态',
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        labelLine: { show: false },
        emphasis: { 
          label: { 
            show: true, 
            fontSize: '16', 
            fontWeight: 'bold',
            formatter: '{b}\n{c}'
          } 
        },
        data: [
          { value: d.pending, name: '待接单', itemStyle: { color: '#f59e0b' } },
          { value: d.processing, name: '处理中', itemStyle: { color: '#3b82f6' } },
          { value: d.completed, name: '已完成', itemStyle: { color: '#10b981' } },
          { value: d.canceled, name: '已取消', itemStyle: { color: '#94a3b8' } }
        ]
      }
    ]
  };
});

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const handleAcceptOrder = (id: string) => {
  ElMessageBox.confirm('确定接受此订单并开始服务吗？', '接单确认', {
    confirmButtonText: '确定接单',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await updateOrderStatus(id, 1); // 1-已接单
      ElMessage.success('已接单，请尽快开始服务');
      initData();
    } catch (error) {
      ElMessage.error('接单失败');
    }
  });
};

const initData = async () => {
  loading.value = true;
  try {
    const [statsRes, ordersRes] = await Promise.all([
      fetchMerchantStats(),
      getOrderList({ status: 0, limit: 10 })
    ]);
    stats.value = statsRes;
    pendingOrders.value = ordersRes.items || [];
  } catch (error) {
    ElMessage.error('数据加载失败');
  } finally {
    loading.value = false;
  }
};

onMounted(initData);
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
  background: white;
  border-radius: 1.5rem;
  padding: 2rem 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.03);
}

.bg-shape { position: absolute; filter: blur(60px); z-index: 0; border-radius: 50%; pointer-events: none; }
.shape-1 { width: 300px; height: 300px; background: rgba(56, 189, 248, 0.1); top: -100px; right: -50px; }
.shape-2 { width: 250px; height: 250px; background: rgba(167, 139, 250, 0.1); bottom: -120px; right: 200px; }

.page-title { font-size: 2.25rem; font-weight: 800; letter-spacing: -0.025em; color: #0f172a; margin-bottom: 0.5rem; }
.page-subtitle { color: #64748b; font-size: 1rem; }

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

.stat-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.04); }

.stat-icon-wrapper {
  width: 4rem; height: 4rem;
  border-radius: 1.25rem;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.75rem;
}

.stat-icon-wrapper.income { background: #ecfdf5; color: #10b981; }
.stat-icon-wrapper.pending { background: #fffbeb; color: #f59e0b; }
.stat-icon-wrapper.services { background: #eff6ff; color: #2563eb; }
.stat-icon-wrapper.total { background: #f5f3ff; color: #7c3aed; }

.stat-label { font-size: 0.95rem; color: #64748b; font-weight: 600; }
.stat-value { font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0.25rem 0; }
.stat-footer { font-size: 0.8rem; font-weight: 700; }
.stat-trend.up { color: #10b981; }
.stat-trend.down { color: #f43f5e; }
.stat-period { color: #94a3b8; }

.chart-card { background: white; border-radius: 1.75rem; padding: 1.75rem; border: 1px solid #f1f5f9; display: flex; flex-direction: column; }
.chart-container { flex: 1; position: relative; }
.chart { height: 100%; width: 100%; }

.task-item { display: flex; align-items: center; gap: 1.25rem; padding: 1rem; border-radius: 1.25rem; border: 1px solid #f1f5f9; transition: all 0.2s; }
.task-item:hover { background-color: #f8fafc; border-color: #e2e8f0; }
.task-icon { width: 2.75rem; height: 2.75rem; border-radius: 1rem; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
.task-time { font-size: 0.75rem; font-weight: 500; }

.animate-pulse-border { border-color: #fde68a; animation: pulse-border 2s infinite; }
@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.1); }
  70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
  100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
}

.animate-slide-up { opacity: 0; animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-fade-in { opacity: 0; animation: fadeIn 0.8s ease-out forwards; }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
