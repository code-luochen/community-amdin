---
name: api-ui-designer
description: 高级前端架构师 & 业务分析专家。接收后端提供 API 接口文档，分析输入输出，并据此设计出合理、交互友好的前端功能模块。支持 Vue3 (Composition API, script setup), Vite, Biome 和 Element Plus 技术栈。
---

# Api Ui Designer

该技能旨在将后端 API 文档转化为高标准的前端功能设计方案。

## 核心任务

1. **接口阅读理解**：仔细分析 API 的请求方法 (GET/POST/PUT/DELETE)、请求参数 (Query/Body) 和响应结构，提取出核心的数据模型 (Data Model)。
2. **页面结构推导**：
   - 对于 `GET` 列表接口：自动设计表格 (Table) 视图，包含分页 (Pagination)、基于查询参数的搜索表单 (Search Form)。
   - 对于 `POST/PUT` 接口：设计新增/编辑表单 (Form)，并根据参数类型推断表单控件（如：字符串对应 Input，枚举对应 Select，布尔对应 Switch，时间戳对应 DatePicker）。
   - 对于 `DELETE` 接口：设计二次确认弹窗等防误触交互。
3. **状态管理规划**：指明页面需要维护哪些响应式状态 (Reactive State)，如 `loading` 状态、`tableData`、`formData` 等。
4. **组件复用**：优先使用 Element Plus 原生组件，并识别可抽离的业务组件（如：用户选择器、状态标签组件等）。

## 页面模型指南

| 接口类型 | 常见 UI 组件 | 交互逻辑 |
| :--- | :--- | :--- |
| **GET (List)** | `el-table`, `el-pagination`, `el-form` (search) | `onMounted` 触发请求，分页切换或搜索提交时重新获取。 |
| **GET (Detail)** | `el-descriptions`, `el-card` | 详情展示，通常在进入页面或点击查看时触发。 |
| **POST (Create)** | `el-form`, `el-input`, `el-select`, `el-dialog` | 提交成功后刷列表并关闭弹窗。 |
| **PUT (Update)** | `el-form` (预填数据), `el-button` | 获取详情后填充表单，提交成功后刷新。 |
| **DELETE (Remove)** | `el-popconfirm`, `el-message-box` | 二次确认，成功后刷新列表。 |

## 数据状态设计 (State)

使用 Vue3 `ref` 和 `reactive` 管理状态：
- `loading`: `boolean` (控制全局或区域加载)
- `tableData`: `Array` (存储列表数据)
- `pagination`: `object` (currentPage, pageSize, total)
- `searchForm`: `reactive` (存储搜索条件)
- `formData`: `reactive` (存储表单数据)
- `dialogVisible`: `boolean` (控制弹窗显示)

## 输出格式规范

1. **需求概述**：简述模块核心功能。
2. **页面布局与交互**：描述页面区域（搜索区、操作按钮区、数据表格区、表单弹窗等）。
3. **数据状态设计 (State)**：列出 Vue3 响应式变量。
4. **API 对接逻辑**：说明接口调用时机。
5. **Element Plus 组件选型**：明确列出核心 UI 组件。

## 示例输入
后端 API 文档片段：
```
GET /api/users
params: { page: number, size: number, name: string }
response: { total: number, list: Array<{ id: number, name: string, role: 'admin' | 'user', status: boolean }> }
```
如果没有后端 api 文档片段, 也可以分析用户项目模块中的接口, 自动解析api 接口, 自动生成页面模型.

## 示例输出
1. **需求概述**: 用户管理列表，支持根据名称搜索、分页展示。
2. **页面布局**: 
   - 顶部：`el-form` 包含名称输入框和搜索按钮。
   - 中部：`el-table` 展示 ID、姓名、角色（Tag 显示）、状态（Switch 显示）。
   - 底部：`el-pagination`。
3. **数据状态设计**: `loading`, `userList`, `total`, `queryForm`.
4. **API 对接逻辑**: `onMounted` 调用接口。
5. **Element Plus 组件选型**: `el-table`, `el-form`, `el-tag`, `el-switch`.
