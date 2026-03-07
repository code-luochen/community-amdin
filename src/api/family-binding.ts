import request from './request';
import type { Result } from './types';

export interface BindingFilter {
  status?: number;
}

export interface ElderlyBindingInfo {
  id: number;
  elderlyId: number;
  relation: string;
  status: number;
  createdAt: string;
  elderly: {
    id: number;
    username: string;
    realName: string;
    nickname: string;
    avatar: string;
    profile: {
      age: number;
      gender: number;
      address: string;
    }
  }
}

export function getMyElderlyList() {
  return request.get<any, Result<ElderlyBindingInfo[]>>('/family-binding/my-elderly');
}

export function bindElderly(data: { username: string, relation?: string }) {
  return request.post<any, Result<any>>('/family-binding', data);
}

export function unbindElderly(elderlyId: number) {
  return request.delete<any, Result<any>>(`/family-binding/${elderlyId}`);
}
