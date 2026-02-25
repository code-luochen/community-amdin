import { defineStore } from "pinia";
import { ref } from "vue";
import type { UserInfo } from "../api/types";

export const useUserStore = defineStore("user", () => {
	const token = ref<string>(localStorage.getItem("token") || "");
	const userInfo = ref<UserInfo | null>(JSON.parse(localStorage.getItem("userInfo") || "null"));
	const role = ref<number | null>(userInfo.value?.role || null);

	const setLoginData = (newToken: string, user: UserInfo) => {
		token.value = newToken;
		userInfo.value = user;
		role.value = user.role;
		
		localStorage.setItem("token", newToken);
		localStorage.setItem("userInfo", JSON.stringify(user));
	};

	const clearToken = () => {
		token.value = "";
		role.value = null;
		userInfo.value = null;
		localStorage.removeItem("token");
		localStorage.removeItem("userInfo");
	};

	return {
		token,
		userInfo,
		role,
		setLoginData,
		clearToken,
	};
});
