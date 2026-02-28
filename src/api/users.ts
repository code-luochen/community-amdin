import request from './request';

// 获取用户列表
export interface UserQuery {
  page?: number;
  limit?: number;
  username?: string;
  role?: number;
}

export interface User {
  id: number;
  username: string;
  nickname: string;
  realName?: string;
  role: number;
  status: number;
  lastLoginAt?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserListResult {
  data: User[];
  total: number;
}

// 统一包装类型，由于后端可能返回的是有 { data, meta } 或是由于 axios 拦截器直接返回结果，
// 这里依照通用设计给出接口定义。

export const fetchUsers = (params: UserQuery) => {
  return request.get<any, UserListResult>('/users', { params });
};

// 创建用户
export const createUser = (data: Partial<User>) => {
  return request.post<any, any>('/users', data);
};

// 更新用户
export const updateUser = (id: number, data: Partial<User>) => {
  return request.patch<any, any>(`/users/${id}`, data);
};

// 更新用户状态
export const updateUserStatus = (id: number, status: number) => {
  return request.patch<any, any>(`/users/${id}/status`, { status });
};

// 重置密码
export const resetPassword = (id: number) => {
  return request.post<any, any>(`/users/${id}/reset-password`);
};
