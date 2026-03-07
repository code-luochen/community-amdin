<template>
  <div class="notification-wrapper animate-fade-in">
    <div class="page-container">
      <!-- Header Section -->
      <div class="premium-header relative overflow-hidden mb-5!">
        <div class="bg-shape shape-1"></div>
        <div class="bg-shape shape-2"></div>
        <div class="header-content relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div class="header-text">
            <h1 class="page-title">通知中心</h1>
            <p class="page-subtitle">查看系统预警、订单状态与您的所有系统消息</p>
          </div>
          <button class="premium-btn primary-solid" @click="handleMarkAllRead" :disabled="!hasUnread || loading">
            <el-icon class="btn-icon mr-1"><Check /></el-icon>
            <span>全部标为已读</span>
          </button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="content-card shadow-soft">
        <!-- List Header -->
        <div class="list-header flex items-center justify-between mb-4 pb-4 border-b border-dashed border-slate-200">
          <div class="flex items-center gap-3 flex-wrap">
            <div class="text-slate-700 font-semibold whitespace-nowrap">消息列表</div>
            <el-radio-group v-model="filterStatus" size="small" @change="handleFilterChange">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="unread">未读</el-radio-button>
              <el-radio-button label="read">已读</el-radio-button>
            </el-radio-group>
            <!-- 按老人筛选 -->
            <el-select
              v-if="elders.length > 0"
              v-model="selectedElderlyId"
              placeholder="全部老人"
              clearable
              size="small"
              style="width: 140px"
              @change="handleFilterChange"
            >
              <el-option
                v-for="elder in elders"
                :key="elder.id"
                :label="elder.label"
                :value="elder.id"
              />
            </el-select>
            <!-- 按类型筛选 -->
            <el-select
              v-model="filterType"
              placeholder="消息类型"
              clearable
              size="small"
              style="width: 140px"
              @change="handleFilterChange"
            >
              <el-option label="订单通知" value="order" />
              <el-option label="健康预警" value="health" />
              <el-option label="紧急求助" value="emergency" />
              <el-option label="系统通知" value="system" />
            </el-select>
          </div>
          <div class="text-sm text-slate-500">共 {{ pagination.total }} 条通知</div>
        </div>

        <div class="notification-list" v-loading="loading">
          <el-empty v-if="!loading && tableData.length === 0" description="暂无新通知" />
          
          <div
            v-for="item in tableData"
            :key="item.id"
            :class="['notification-item', !item.isRead ? 'unread' : 'read']"
            @click="readNotification(item)"
          >
            <!-- Unread Dot -->
            <div v-if="!item.isRead" class="unread-dot"></div>
            
            <div class="item-icon-wrapper" :class="'icon-' + getNotificationConfig(item.type).color">
              <el-icon :size="20"><component :is="getNotificationConfig(item.type).icon" /></el-icon>
            </div>
            
            <div class="item-content">
              <div class="item-header flex justify-between items-start mb-1">
                <div class="item-title flex items-center gap-2">
                  <span class="font-semibold text-slate-800">{{ item.title || getNotificationConfig(item.type).label }}</span>
                  <span v-if="!item.isRead" class="new-badge">新</span>
                </div>
                <div class="item-time text-xs text-slate-400 font-medium">
                  {{ formatDate(item.createdAt) }}
                </div>
              </div>
              <div class="item-body text-sm text-slate-600 leading-relaxed">
                {{ item.content }}
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination-wrapper mt-6! pb-2!" v-if="pagination.total > 0">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.limit"
            :total="pagination.total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="fetchData"
            @current-change="fetchData"
            class="premium-pagination"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { Check, Bell, WarningFilled, ShoppingCart, InfoFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { fetchNotifications, markAsRead, markAllAsRead, type Notification } from '@/api/notification';
import { getMyElderlyList, type ElderlyBindingInfo } from '@/api/family-binding';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();

// State
const loading = ref(false);
const tableData = ref<Notification[]>([]);
const filterStatus = ref('all');
const filterType = ref<string | undefined>(undefined);
const selectedElderlyId = ref<number | undefined>(undefined);
const elders = ref<{ id: number; label: string }[]>([]);
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
});

const hasUnread = computed(() => {
  return tableData.value.some(item => !item.isRead);
});

// Helper functions
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const getNotificationConfig = (type: string | number) => {
  const configs: Record<string, { label: string; icon: any; color: string }> = {
    'order': { label: '订单通知', icon: ShoppingCart, color: 'blue' },
    'health': { label: '健康预警', icon: WarningFilled, color: 'red' },
    'emergency': { label: '紧急求助', icon: Bell, color: 'orange' },
    'system': { label: '系统通知', icon: InfoFilled, color: 'purple' }
  };
  return configs[String(type)] || configs['system'];
};

// 加载已绑定老人列表（仅家属角色会有数据）
const loadElders = async () => {
  try {
    const res: any = await getMyElderlyList();
    const bindings: ElderlyBindingInfo[] = Array.isArray(res) ? res : (res?.data || res || []);
    elders.value = bindings
      .filter((b: ElderlyBindingInfo) => b.elderly)
      .map((b: ElderlyBindingInfo) => ({
        id: b.elderly.id,
        label: b.elderly.realName || b.elderly.nickname || b.elderly.username,
      }));
  } catch (err) {
    elders.value = [];
  }
};

// API calls
const handleFilterChange = () => {
  pagination.page = 1;
  fetchData();
};

const fetchData = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.page,
      limit: pagination.limit,
    };
    
    if (filterStatus.value === 'unread') {
      params.isRead = 0;
    } else if (filterStatus.value === 'read') {
      params.isRead = 1;
    }

    if (selectedElderlyId.value) {
      params.elderlyId = selectedElderlyId.value;
    }

    if (filterType.value) {
      params.type = filterType.value;
    }

    const res: any = await fetchNotifications(params);

    tableData.value = res.data || [];
    pagination.total = res.total || 0;
  } catch (error) {
    ElMessage.error('获取通知数据失败');
  } finally {
    loading.value = false;
  }
};

const readNotification = async (item: Notification) => {
  if (item.isRead) return;
  try {
    await markAsRead(item.id);
    item.isRead = 1;
    // Dispatch custom event to notify layout header
    window.dispatchEvent(new Event('unread-count-changed'));
  } catch (error) {
    ElMessage.error('标记已读失败');
  }
};

const handleMarkAllRead = async () => {
  try {
    await markAllAsRead();
    ElMessage.success('全部通知已标记为已读');
    fetchData();
    window.dispatchEvent(new Event('unread-count-changed'));
  } catch (error) {
    ElMessage.error('操作失败，请重试');
  }
};

// Lifecycle
onMounted(async () => {
  // 仅家属端需要加载老人列表用于筛选
  if (userStore.role === 2) {
    await loadElders();
  }
  fetchData();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.notification-wrapper {
  font-family: 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif;
  color: #1e293b;
  min-height: 100%;
}

.page-container {
  width: 100%;
}

/* Header Aesthetics (Same as UserManagement) */
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

.premium-btn.primary-solid {
  background: #0f172a;
  color: white;
  box-shadow: 0 4px 14px 0 rgba(15, 23, 42, 0.2);
}

.premium-btn.primary-solid:not(:disabled):hover {
  background: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px 0 rgba(15, 23, 42, 0.3);
}

.premium-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

/* Content Area */
.content-card {
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  border: 1px solid #f1f5f9;
}

/* List Styles */
.notification-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-item {
  display: flex;
  gap: 1.25rem;
  padding: 1.25rem;
  border-radius: 1rem;
  border: 1px solid #f1f5f9;
  background-color: #ffffff;
  transition: all 0.25s ease;
  cursor: pointer;
  position: relative;
}

.notification-item:hover {
  background-color: #f8fafc;
  border-color: #e2e8f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.notification-item.unread {
  background-color: #f0f9ff;
  border-color: #e0f2fe;
}

.notification-item.unread:hover {
  background-color: #e0f2fe;
}

.notification-item.read {
  opacity: 0.85;
}

.item-icon-wrapper {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.icon-blue { background: #eff6ff; color: #3b82f6; }
.icon-red { background: #fef2f2; color: #ef4444; }
.icon-orange { background: #fff7ed; color: #f97316; }
.icon-purple { background: #faf5ff; color: #a855f7; }

.item-content {
  flex: 1;
}

.new-badge {
  background: #ef4444;
  color: white;
  font-size: 0.65rem;
  padding: 0.15rem 0.4rem;
  border-radius: 0.25rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.unread-dot {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 10px;
  height: 10px;
  background-color: #ff4d4f;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  animation: pulse-red 2s infinite;
  z-index: 20;
}

@keyframes pulse-red {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
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
