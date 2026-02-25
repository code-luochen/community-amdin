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
		if (code === 200) return data;

		ElMessage.error(message || "系统错误");
		if (code === 401) {
			const userStore = useUserStore();
			userStore.clearToken(); // 触发登出逻辑
			window.location.href = "/login";
		}
		return Promise.reject(new Error(message || "Error"));
	},
	(error) => {
		ElMessage.error(error.message || "网络连接异常");
		return Promise.reject(error);
	},
);

export default service;
