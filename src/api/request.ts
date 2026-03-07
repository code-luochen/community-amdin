import { useUserStore } from "@store/user";
import axios from "axios";
import { ElMessage } from "element-plus";

const service = axios.create({
	baseURL: import.meta.env.VITE_APP_BASE_API,
	timeout: 10000,
});

service.interceptors.request.use(
	(config) => {
		const userStore = useUserStore();
		if (userStore.token) {
			config.headers["Authorization"] = `Bearer ${userStore.token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

service.interceptors.response.use(
	(response) => {
		const { code, data, message } = response.data;
		if (code === 200 || !code) return data || response.data;

		if (code === 401 || code === 403) {
			const userStore = useUserStore();
			userStore.clearToken();
			// 只有不在登录页时才跳转，避免登录失败时重复跳转导致闪烁
			if (window.location.pathname !== "/login") {
				window.location.href = "/login";
			}
		}

		// 登录接口 4xx 错误统一掩盖提示
		let displayMessage = message || "系统错误";
		if (response.config.url?.includes("/auth/login") && code >= 400 && code < 500) {
			displayMessage = "账号或密码错误,请重试";
		}
		ElMessage.error(displayMessage);
		return Promise.reject(new Error(displayMessage || "Error"));
	},
	(error) => {
		const userStore = useUserStore();
		if (error.response && (error.response.status === 401 || error.response.status === 403)) {
			userStore.clearToken();
			// 只有不在登录页时才跳转，避免登录失败时重复跳转导致闪烁
			if (window.location.pathname !== "/login") {
				window.location.href = "/login";
			}
		}

		// 优先级：服务器自定义错误消息 > 服务器原始错误对象中的消息 > axios 自己的错误消息 > 默认文字
		let errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error?.message ||
			error.response?.data?.error ||
			error.message ||
			"系统异常";

		// 登录接口 4xx 错误统一掩盖提示
		if (error.config?.url?.includes("/auth/login") && error.response?.status >= 400 && error.response?.status < 500) {
			errorMessage = "账号或密码错误,请重试";
		}

		ElMessage.error(errorMessage);
		return Promise.reject(error);
	},
);

export default service;
