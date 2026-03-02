import request from './request';

export interface HealthRecord {
  id: number;
  elderlyId: number;
  systolicBp: number;
  diastolicBp: number;
  heartRate: number;
  bloodSugar: number;
  temperature: number;
  isAbnormal: number;
  abnormalType: string;
  recordTime: string;
  createdAt: string;
}

export interface QueryHealthRecord {
  elderlyId?: number;
  isAbnormal?: number;
  page?: number;
  limit?: number;
}

export interface CreateHealthRecord {
  elderlyId: number | string;
  systolicBp?: number;
  diastolicBp?: number;
  heartRate?: number;
  bloodSugar?: number;
  temperature?: number;
}

export interface HealthRecordListResult {
  data: HealthRecord[];
  total: number;
}

// 获取健康记录列表 (支持分页与条件过滤)
export const fetchHealthRecords = (params: QueryHealthRecord) => {
  return request.get<any, HealthRecordListResult>('/health-record', { params });
};

// 录入健康记录 (主要供家属/老人录入或模拟录入)
export const createHealthRecord = (data: CreateHealthRecord) => {
  return request.post<any, any>('/health-record', data);
};
