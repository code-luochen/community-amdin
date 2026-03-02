import request from './request';

export interface QueryEmergencyDto {
  elderlyId?: number;
  status?: number; // 0-待处理 1-处理中 2-已处理
  page?: number;
  limit?: number;
}

export interface UpdateEmergencyDto {
  status: number; // 1-处理中 2-已处理
  handleResult?: string;
  handlerId?: number;
}

export interface EmergencyLog {
  id: number;
  elderlyId: number;
  elderly?: any;
  location: string;
  remark: string;
  status: number; // 0-待处理 1-处理中 2-已处理
  handlerId: number;
  handler?: any;
  handleTime: string;
  finishTime: string;
  handleResult: string;
  createdAt: string;
}

export interface EmergencyListResult {
  items: EmergencyLog[];
  total: number;
}

// 获取求助记录列表
export const fetchEmergencies = (params: QueryEmergencyDto) => {
  return request.get<any, EmergencyListResult>('/emergency', { params });
};

// 获取单个求助详情
export const getEmergency = (id: number) => {
  return request.get<any, EmergencyLog>(`/emergency/${id}`);
};

// 处理紧急求助
export const handleEmergency = (id: number, data: UpdateEmergencyDto) => {
  return request.put<any, any>(`/emergency/${id}/handle`, data);
};
