import request from "./request";
import type { LoginParams, UserInfo } from "./types";

/**
 * 用户登录
 * @param data 登录信息 
 */
export function login(data: LoginParams) {
	return request({
		url: "/auth/login",
		method: "post",
		data,
	});
}

/**
 * 获取当前登录用户信息
 */
export function getUserInfo() {
	return request<UserInfo>({
		url: "/auth/profile",
		method: "get",
	});
}

/**
 * 退出登录
 */
export function logout() {
	return request({
		url: "/auth/logout",
		method: "post",
	});
}
