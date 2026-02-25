// 基础响应结构
export interface Result<T = any> {
	code: number;
	message: string;
	data: T;
}

// 分页响应结构
export interface PageResult<T = any> {
	total: number;
	list: T[];
}

// 下面可以添加业务相关的接口定义
export interface LoginParams {
	account: string;
	password?: string;
	role?: string; 
}

export interface UserInfo {
	id: string;
	account: string;
	role: string;
	avatar?: string;
}
