import request from './request';

export interface OrderQuery {
  page?: number;
  limit?: number;
  status?: number;
  elderlyId?: string;
  merchantId?: string;
  communityId?: number;
  address?: string;
  orderNo?: string;
}

export interface OrderListResult {
  items: any[];
  total: number;
  page: number;
  limit: number;
}

export const getOrderList = (params: OrderQuery) => {
  return request.get<any, OrderListResult>('/order', { params });
};

export const updateOrderStatus = (id: string, status: number) => {
  return request.patch<any, any>(`/order/${id}/status`, { status });
};

export const getOrderDetail = (id: string) => {
  return request.get<any, any>(`/order/${id}`);
};
