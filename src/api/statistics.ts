import request from './request';

/**
 * 获取管理员数据看板统计信息
 */
export function fetchDashboardData() {
  return request({
    url: '/statistics/dashboard',
    method: 'get',
  });
}

/**
 * 获取商家首页统计信息
 */
export function fetchMerchantStats() {
  return request({
    url: '/statistics/merchant',
    method: 'get',
  });
}

/**
 * 获取家属首页统计信息
 */
export function fetchFamilyStats() {
  return request({
    url: '/statistics/family',
    method: 'get',
  });
}

export interface DashboardData {
  users: {
    elderly: number;
    family: number;
    merchant: number;
    total: number;
  };
  orders: {
    daily: number;
    weekly: number;
    monthly: number;
    pending: number;
    completed: number;
    total: number;
  };
  health: {
    warnings: number;
  };
  services: {
    life: number;
    medicine: number;
    medical: number;
    total: number;
  };
}
