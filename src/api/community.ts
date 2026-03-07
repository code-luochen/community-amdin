import request from './request';

// ---------- 实体类型 ----------
export interface Community {
  id: number;
  name: string;
  address: string;
  createdAt: string;
}

export interface HouseDict {
  id: number;
  communityId: number;
  buildingNo: string;
  unitNo?: string;
  roomNo: string;
  createdAt: string;
  community?: Community;
}

export interface HouseRoom {
  unitNo: string | null;
  rooms: string[];
}

export interface HouseBuilding {
  buildingNo: string;
  units: HouseRoom[];
}

export interface AddressTreeNode {
  communityId: number;
  communityName: string;
  communityAddress: string;
  buildings: HouseBuilding[];
}

// ---------- 请求 DTO ----------
export interface CreateCommunityDto {
  name: string;
  address: string;
}

export interface UpdateCommunityDto {
  name?: string;
  address?: string;
}

export interface CreateHouseDictDto {
  communityId: number;
  buildingNo: string;
  unitNo?: string;
  roomNo: string;
}

export interface HouseDictQuery {
  communityId?: number;
  buildingNo?: string;
}

// ---------- Community API ----------

/** 获取小区列表 */
export const getCommunityList = () =>
  request<Community[]>({ url: '/community', method: 'GET' });

/** 获取小区详情（含房屋列表） */
export const getCommunityDetail = (id: number) =>
  request<Community & { houses: HouseDict[] }>({ url: `/community/${id}`, method: 'GET' });

/** 创建小区 */
export const createCommunity = (data: CreateCommunityDto) =>
  request<Community>({ url: '/community', method: 'POST', data });

/** 更新小区 */
export const updateCommunity = (id: number, data: UpdateCommunityDto) =>
  request<Community>({ url: `/community/${id}`, method: 'PUT', data });

/** 删除小区 */
export const deleteCommunity = (id: number) =>
  request({ url: `/community/${id}`, method: 'DELETE' });

/** 获取地址树（供级联选择器） */
export const getAddressTree = () =>
  request<AddressTreeNode[]>({ url: '/community/address-tree', method: 'GET' });

// ---------- HouseDict API ----------

/** 查询房屋列表（按小区/楼栋筛选） */
export const getHouseList = (params?: HouseDictQuery) =>
  request<HouseDict[]>({ url: '/community/house/list', method: 'GET', params });

/** 新增单条房屋 */
export const createHouse = (data: CreateHouseDictDto) =>
  request<HouseDict>({ url: '/community/house', method: 'POST', data });

/** 批量导入房屋 */
export const batchCreateHouses = (items: CreateHouseDictDto[]) =>
  request<HouseDict[]>({ url: '/community/house/batch', method: 'POST', data: { items } });

/** 删除房屋 */
export const deleteHouse = (id: number) =>
  request({ url: `/community/house/${id}`, method: 'DELETE' });
