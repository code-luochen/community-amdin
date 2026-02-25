import { defineStore } from "pinia";
import { ref } from "vue";

// Helper to decode JWT payload safely
function decodeJwt(token: string) {
	try {
		const base64Url = token.split(".")[1];
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split("")
				.map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
				.join(""),
		);
		return JSON.parse(jsonPayload);
	} catch (error) {
		return null;
	}
}

export const useUserStore = defineStore("user", () => {
	const token = ref<string>(localStorage.getItem("token") || "");
	const userInfo = ref<any>(null);
	const role = ref<number | null>(null);

	// Initialize role if token exists
	if (token.value) {
		const payload = decodeJwt(token.value);
		if (payload) {
			role.value = payload.role;
			userInfo.value = payload;
		}
	}

	const setToken = (newToken: string) => {
		token.value = newToken;
		localStorage.setItem("token", newToken);

		// Parse role
		const payload = decodeJwt(newToken);
		if (payload) {
			role.value = payload.role;
			userInfo.value = payload;
		}
	};

	const clearToken = () => {
		token.value = "";
		role.value = null;
		userInfo.value = null;
		localStorage.removeItem("token");
	};

	return {
		token,
		userInfo,
		role,
		setToken,
		clearToken,
	};
});
