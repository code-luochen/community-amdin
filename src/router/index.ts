import {
	createRouter,
	createWebHistory,
	type RouteRecordRaw,
} from "vue-router";
import { useUserStore } from "../store/user";

const routes: Array<RouteRecordRaw> = [
	{
		path: "/login",
		name: "Login",
		component: () => import("../views/Login.vue"),
		meta: { public: true },
	},
	{
		path: "/",
		redirect: "/login",
	},
	{
		path: "/family",
		name: "Family",
		component: () => import("../layout/index.vue"),
		meta: { role: 2 },
		children: [
			{
				path: "dashboard",
				name: "FamilyDashboard",
				component: () => import("../views/family/Dashboard.vue"),
			},
		],
	},
	{
		path: "/merchant",
		name: "Merchant",
		component: () => import("../layout/index.vue"),
		meta: { role: 3 },
		children: [
			{
				path: "dashboard",
				name: "MerchantDashboard",
				component: () => import("../views/merchant/Dashboard.vue"),
			},
		],
	},
	{
		path: "/admin",
		name: "Admin",
		component: () => import("../layout/index.vue"),
		meta: { role: 4 },
		children: [
			{
				path: "dashboard",
				name: "AdminDashboard",
				component: () => import("../views/admin/Dashboard.vue"),
			},
		],
	},
	// Catch-all route for 404
	{
		path: "/:pathMatch(.*)*",
		name: "NotFound",
		component: () => import("../views/NotFound.vue"),
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

// Global Router Guard
router.beforeEach((to, _from, next) => {
	const userStore = useUserStore();
	const token = userStore.token || localStorage.getItem("token");

	if (to.meta.public) {
		return next();
	}

	if (!token) {
		return next("/login");
	}

	const role = userStore.role;

	if (to.meta.role && to.meta.role !== role) {
		// Redirect to corresponding dashboard
		if (role === 2) return next("/family/dashboard");
		if (role === 3) return next("/merchant/dashboard");
		if (role === 4) return next("/admin/dashboard");
		return next("/login"); // Fallback
	}

	next();
});

export default router;
