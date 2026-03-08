import request from "./request";

export interface ServiceItem {
  id: number;
  merchantId: number;
  name: string;
  type: number;
  description: string;
  price: number;
  imageUrl: string;
  status: number;
  auditStatus: number;
  createdAt: string;
  merchant?: {
    id: number;
    nickname: string;
    realName: string;
    house?: {
      buildingNo: string;
      unitNo?: string;
      roomNo: string;
    };
    community?: {
      id: number;
      name: string;
    };
  };
}

export interface ServiceQuery {
  page?: number;
  limit?: number;
  name?: string;
  type?: number;
  status?: number;
  auditStatus?: number;
  communityId?: number;
}

export interface CreateServiceDto {
  name: string;
  type: number;
  description: string;
  price: number;
  imageUrl?: string;
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {}

export const serviceApi = {
  create(data: CreateServiceDto) {
    return request.post("/services", data);
  },
  findAllMerchant(params: ServiceQuery) {
    return request.get<any, { records: ServiceItem[]; items: ServiceItem[]; total: number }>("/services/merchant", { params });
  },
  findAllAdmin(params: ServiceQuery & { auditStatus?: number }) {
    return request.get<any, { records: ServiceItem[]; items: ServiceItem[]; total: number }>("/services/admin", { params });
  },
  findOne(id: number) {
    return request.get<any, ServiceItem>(`/services/${id}`);
  },
  update(id: number, data: UpdateServiceDto) {
    return request.patch(`/services/${id}`, data);
  },
  updateStatus(id: number, status: number) {
    return request.patch(`/services/${id}/status`, { status });
  },
  audit(id: number, auditStatus: number) {
    return request.patch(`/services/${id}/audit`, { auditStatus });
  }
};
