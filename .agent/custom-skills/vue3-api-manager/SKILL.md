---
name: vue3-api-manager
description: 为 Vue3 + TS 项目配置基于 Axios 的响应式 API 管理层，包含拦截器、全局错误处理、JWT 自动注入以及模块化 API 定义。
---

# Vue3 API Manager Architect

这个 Skill 充当“前端架构师”，负责为社区养老系统构建标准化的网络请求层。它确保所有 API 调用都具备类型提示，并且能够自动处理身份验证逻辑。

## 核心架构原则

1. **统一封装**：使用 Axios 创建单例，集中处理请求/响应拦截。
2. **类型安全**：强制使用 TypeScript 泛型（Generics）定义接口返回结构。
3. **状态联动**：与 `useUserStore` 深度耦合，自动从 Pinia 读取 Token 并处理 401 登录失效。
4. **环境解耦**：利用 Vite 环境变量区分开发与生产地址。

## 脚本生成流程

当用户要求添加 API 管理或请求封装时，你需要：

1. **创建 `src/api/request.ts`**：
   - 配置 `axios.create`。
   - 请求拦截器：从 `useUserStore` 获取 Token 并注入 Header。
   - 响应拦截器：统一处理 `code !== 200` 的业务错误，并使用 Element Plus 的 `ElMessage` 报错。

2. **创建 `src/api/types.ts`**：
   - 定义基础响应结构 `Result<T>`。
   - 定义业务相关接口（如 `LoginParams`, `UserInfo`）。

3. **创建模块化 API 文件（如 `src/api/auth.ts`）**：
   - 展示如何导入 `request` 并编写具体的函数。

4. **提供 `.env` 配置文件说明**：
   - 指导用户设置 `VITE_APP_BASE_API`。

## 代码输出模板

### 1. 基础请求封装 (src/api/request.ts)
```typescript
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/user';

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 10000
});

service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

service.interceptors.response.use(
  (response) => {
    const { code, data, message } = response.data;
    if (code === 200) return data;
    
    ElMessage.error(message || '系统错误');
    if (code === 401) {
      const userStore = useUserStore();
      userStore.logout(); // 触发登出逻辑
      window.location.href = '/login';
    }
    return Promise.reject(new Error(message || 'Error'));
  },
  (error) => {
    ElMessage.error(error.message || '网络连接异常');
    return Promise.reject(error);
  }
);

export default service;
```
