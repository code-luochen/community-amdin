---
name: vue3-dynamic-layout
description: 为 Vue3 + Element Plus 的后台系统提供基于角色权限（家属/商家/管理员）的动态布局（Layout）与侧边栏菜单生成方案。
---

# Vue3 Dynamic Layout Architect

这个 Skill 充当“前端架构师”，负责构建社区养老服务管理系统 Web 端的整体页面骨架。核心任务是利用 Element Plus 的 Layout 容器和 Menu 组件，结合 Pinia 中的角色信息，动态渲染左侧导航栏。

## 核心架构设计

1. **统一的 Layout 容器**：使用 `el-container` 划分页面为 `el-aside`（侧边栏）、`el-header`（顶部导航）和 `el-main`（主内容区）。
2. **动态菜单映射表**：在配置中针对 Role ID 预定义菜单结构。
3. **响应式路由激活**：将 `el-menu` 的 `default-active` 与当前路由的 `path` 绑定，确保刷新页面后菜单高亮正确。

## 菜单结构映射规则

- **Role ID 2 (家属)**：家属首页 (`/family/dashboard`)、健康监控页 (`/family/health`)、订单监督页 (`/family/order`)。
- **Role ID 3 (商家)**：商家首页 (`/merchant/dashboard`)、订单处理页 (`/merchant/order`)、服务管理页 (`/merchant/service`)。
- **Role ID 4 (管理员)**：管理员首页 (`/admin/dashboard`)、用户管理 (`/admin/user`)、服务审核 (`/admin/service-audit`)、订单监控 (`/admin/order-monitor`)、健康预警 (`/admin/health-alert`)、求助处理 (`/admin/emergency`)。

## 样式要求
界面样式使用 ui-ux-pro-max 设计, 要求能够区分不同角色, 能够根据登录的角色主题样式全局生效

## 代码输出模板

当用户要求生成布局模块时，请输出以下核心代码结构：

### 1. 动态菜单配置 (src/layout/menuConfig.ts)
```typescript
export interface MenuItem {
  title: string;
  index: string;
  icon?: string;
}

export const roleMenus: Record<number, MenuItem[]> = {
  // 2: 家属
  2: [
    { title: '家属首页', index: '/family/dashboard', icon: 'House' },
    { title: '健康监控', index: '/family/health', icon: 'Monitor' },
    { title: '订单监督', index: '/family/order', icon: 'List' }
  ],
  // 3: 商家
  3: [
    { title: '商家首页', index: '/merchant/dashboard', icon: 'DataLine' },
    { title: '订单处理', index: '/merchant/order', icon: 'ShoppingCart' },
    { title: '服务管理', index: '/merchant/service', icon: 'Setting' }
  ],
  // 4: 小区管理员
  4: [
    { title: '管理员首页', index: '/admin/dashboard', icon: 'Odometer' },
    { title: '用户管理', index: '/admin/user', icon: 'User' },
    { title: '服务审核', index: '/admin/service-audit', icon: 'DocumentChecked' },
    { title: '订单监控', index: '/admin/order-monitor', icon: 'View' },
    { title: '健康预警', index: '/admin/health-alert', icon: 'Bell' },
    { title: '求助处理', index: '/admin/emergency', icon: 'Phone' }
  ]
};
```
