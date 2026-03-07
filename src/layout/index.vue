<template>
  <el-container :class="['dynamic-layout', themeClass]">
    <el-aside width="240px" class="layout-aside">
      <div class="logo-container">
        <el-icon :size="28" class="logo-icon"><HomeFilled /></el-icon>
        <span class="logo-text">{{ roleTitle }}后台</span>
      </div>

      <el-menu
        :default-active="activePath"
        class="layout-menu"
        router
        unique-opened
        :collapse-transition="false"
      >
        <el-menu-item
          v-for="item in currentMenus"
          :key="item.index"
          :index="item.index"
        >
          <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
          <template #title>
            <span>{{ item.title }}</span>
          </template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <span class="greeting">欢迎回来，{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</span>
        </div>
        <div class="header-right">
          <div class="notification-icon-wrapper" @click="goToNotifications">
            <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99" class="notification-badge">
              <el-icon :size="20" class="bell-icon"><Bell /></el-icon>
            </el-badge>
          </div>
          <el-dropdown @command="handleCommand" trigger="click">
            <span class="user-dropdown">
              <el-avatar :size="32" :src="userAvatar" />
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="layout-main">
        <div class="main-content-wrapper">
          <router-view v-slot="{ Component }">
            <transition name="fade-transform" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowDown, HomeFilled, Bell } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import { useUserStore } from '../store/user';
import { roleMenus } from './menuConfig';
import { fetchUnreadCount } from '@/api/notification';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const currentRole = computed(() => userStore.role || 0);
const currentMenus = computed(() => roleMenus[currentRole.value] || []);

const userAvatar = computed(() => {
  const path = userStore.userInfo?.avatar;
  if (!path) return 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
  if (path.startsWith('http')) return path;
  
  const apiBaseUrl = import.meta.env.VITE_APP_BASE_API;
  if (apiBaseUrl && apiBaseUrl.startsWith('http')) {
    const origin = new URL(apiBaseUrl).origin;
    return `${origin}${path}`;
  }
  return path;
});

const themeClass = computed(() => {
  switch (currentRole.value) {
    case 2:
      return 'theme-family';
    case 3:
      return 'theme-merchant';
    case 4:
      return 'theme-admin';
    default:
      return 'theme-default';
  }
});

const roleTitle = computed(() => {
  switch (currentRole.value) {
    case 2:
      return '家属';
    case 3:
      return '商家';
    case 4:
      return '平台';
    default:
      return '系统';
  }
});

const activePath = computed(() => route.path);

const unreadCount = ref(0);
let pollingTimer: any = null;

const loadUnreadCount = async () => {
  if (!userStore.token) return;
  try {
    const res: any = await fetchUnreadCount();
    const newCount = res?.data ?? res ?? 0;
    
    // 如果未读数增加了，说明有新消息，弹出提示
    if (newCount > unreadCount.value) {
      ElNotification({
        title: '新消息提醒',
        message: `您有 ${newCount - unreadCount.value} 条新的未读通知`,
        type: 'info',
        position: 'bottom-right',
        duration: 5000,
        onClick: () => goToNotifications()
      });
    }
    
    unreadCount.value = newCount;
  } catch (error) {
    console.warn('Failed to fetch unread count');
  }
};

const goToNotifications = () => {
  if (currentRole.value === 2) router.push('/family/notifications');
  else if (currentRole.value === 3) router.push('/merchant/notifications');
  else if (currentRole.value === 4) router.push('/admin/notifications');
};

onMounted(() => {
  loadUnreadCount();
  pollingTimer = setInterval(loadUnreadCount, 30000); // 30s poll
  window.addEventListener('unread-count-changed', loadUnreadCount);
});

onUnmounted(() => {
  if (pollingTimer) clearInterval(pollingTimer);
  window.removeEventListener('unread-count-changed', loadUnreadCount);
});

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });
      userStore.clearToken();
      ElMessage.success('已退出登录');
      router.push('/login');
    } catch {
      // 用户点击了取消
    }
  } else if (command === 'profile') {
    if (currentRole.value === 2) router.push('/family/profile');
    else if (currentRole.value === 3) router.push('/merchant/profile');
    else if (currentRole.value === 4) router.push('/admin/profile');
  }
};
</script>

<style>
/* 全局主题变量：这里不能使用 scoped，否则主题色无法作用到全局子组件 
*/
.theme-family {
  --el-color-primary: #f59e0b;
  --el-color-primary-light-3: #fcd34d;
  --el-color-primary-light-5: #fde68a;
  --el-color-primary-light-7: #fef3c7;
  --el-color-primary-light-9: #fffbeb;
  --el-color-primary-dark-2: #d97706;
  --layout-aside-bg: #fffbeb;
  --layout-header-border: #fef3c7;
}

.theme-merchant {
  --el-color-primary: #0ea5e9;
  --el-color-primary-light-3: #7dd3fc;
  --el-color-primary-light-5: #bae6fd;
  --el-color-primary-light-7: #e0f2fe;
  --el-color-primary-light-9: #f0f9ff;
  --el-color-primary-dark-2: #0369a1;
  --layout-aside-bg: #f8fafc;
  --layout-header-border: #e2e8f0;
}

.theme-admin {
  --el-color-primary: #7c3aed;
  --el-color-primary-light-3: #a78bfa;
  --el-color-primary-light-5: #c4b5fd;
  --el-color-primary-light-7: #ddd6fe;
  --el-color-primary-light-9: #ede9fe;
  --el-color-primary-dark-2: #5b21b6;
  --layout-aside-bg: #1e1b4b;
  --layout-aside-text: #c7d2fe;
  --layout-aside-active-bg: #312e81;
  --layout-aside-active-text: #ffffff;
}
</style>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

.dynamic-layout {
  height: 100vh;
  width: 100vw;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  overflow: hidden;
  background-color: var(--el-bg-color-page);
}

.layout-aside {
  background-color: var(--layout-aside-bg, #ffffff);
  border-right: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.logo-container {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 700;
  color: var(--el-color-primary);
  border-bottom: 1px solid var(--layout-header-border, var(--el-border-color-light));
  white-space: nowrap;
}

.logo-icon {
  color: var(--el-color-primary);
}

.theme-admin .logo-container {
  border-bottom: 1px solid #312e81;
}

.layout-menu {
  flex: 1;
  border-right: none;
  background-color: transparent;
}

.theme-admin .layout-menu {
  --el-menu-text-color: var(--layout-aside-text);
  --el-menu-hover-bg-color: rgba(255, 255, 255, 0.05);
  --el-menu-active-color: var(--layout-aside-active-text);
}

.layout-menu .el-menu-item.is-active {
  font-weight: 600;
  background-color: var(--layout-aside-active-bg, var(--el-color-primary-light-9));
  position: relative;
}

.layout-menu .el-menu-item.is-active::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: var(--el-color-primary);
}

.layout-header {
  height: 64px;
  background-color: #ffffff;
  border-bottom: 1px solid var(--layout-header-border, var(--el-border-color-light));
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px -1px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.greeting {
  font-size: 15px;
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-icon-wrapper {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.2s;
  color: var(--el-text-color-regular);
}

.notification-icon-wrapper:hover {
  background-color: var(--el-fill-color-light);
  color: var(--el-color-primary);
}

.bell-icon {
  margin-top: 2px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.user-dropdown:hover {
  background-color: var(--el-fill-color-light);
}

.layout-main {
  background-color: var(--el-bg-color-page);
  padding: 24px;
  overflow-y: auto;
  position: relative;
}

.main-content-wrapper {
  background: var(--el-bg-color);
  border-radius: 16px;
  padding: 24px;
  min-height: calc(100% - 48px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--el-border-color-lighter);
}

.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.25s ease;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-15px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(15px);
}
</style>