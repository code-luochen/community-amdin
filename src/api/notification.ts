import request from "./request";

export interface Notification {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: string;
  isRead: number;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationQuery {
  page?: number;
  limit?: number;
  isRead?: string | number | boolean;
  elderlyId?: number;
  type?: string;
}

export const fetchNotifications = (params?: NotificationQuery) => {
  return request({
    url: '/notifications',
    method: 'GET',
    params,
  });
};

export const fetchUnreadCount = () => {
  return request({
    url: '/notifications/unread-count',
    method: 'GET',
  });
};

export const markAsRead = (id: number) => {
  return request({
    url: `/notifications/${id}/read`,
    method: 'PATCH',
  });
};

export const markAllAsRead = () => {
  return request({
    url: '/notifications/read-all',
    method: 'PATCH',
  });
};
