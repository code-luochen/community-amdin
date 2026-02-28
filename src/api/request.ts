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
			window.location.href = "/login";
		}
		ElMessage.error(message || "系统错误");
		return Promise.reject(new Error(message || "Error"));
	},
	(error) => {
		if (error.response && (error.response.status === 401 || error.response.status === 403)) {
			const userStore = useUserStore();
			userStore.clearToken();
			window.location.href = "/login";
			ElMessage.error(error.response.data?.message || "无权限或登录已过期");
		} else {
			ElMessage.error(error.message || "网络连接异常");
		}
		return Promise.reject(error);
	},
);

export default service;
