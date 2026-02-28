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
	// ================= 角色 2: 家属端路由 =================
	{
		path: "/family",
		name: "Family",
		component: () => import("../layout/index.vue"),
		redirect: '/family/dashboard',
		meta: { role: 2 },
		children: [
			{
				path: "dashboard",
				name: "FamilyDashboard",
				component: () => import("@views/family/Dashboard.vue"),
			},
			// {
			// 	path: "health",
			// 	name: "FamilyHealth",
			// 	component: () => import("@views/family/Health.vue"),
			// 	meta: { title: "健康监控", role: 2 },
			// },
			{
				path: "order",
				name: "FamilyOrder",
				component: () => import("../views/family/Order.vue"),
				meta: { title: "订单监督", role: 2 },
			},
		],
	},
	// ================= 角色 3: 商户端路由 =================
	{
		path: "/merchant",
		name: "Merchant",
		component: () => import("../layout/index.vue"),
		redirect: '/merchant/dashboard',
		meta: { role: 3 },
		children: [
			{
				path: "dashboard",
				name: "MerchantDashboard",
				component: () => import("../views/merchant/Dashboard.vue"),
			},
			{
				path: "order",
				name: "MerchantOrder",
				component: () => import("../views/merchant/Order.vue"),
				meta: { title: "订单处理", role: 3 },
			},
			// {
			// 	path: 'service',
			// 	name: 'MerchantService',
			// 	component: () => import('@views/merchant/service.vue'),
			// 	meta: { title: '服务管理', role: 3 }
			// }
		],
	},
	// ================= 角色 4: 管理员端路由 =================
	{
		path: "/admin",
		name: "Admin",
		component: () => import("../layout/index.vue"),
		redirect: '/admin/dashboard',
		meta: { role: 4 },
		children: [
			{
				path: "dashboard",
				name: "AdminDashboard",
				component: () => import("../views/admin/Dashboard.vue"),
			},
			{
				path: 'user',
				name: 'AdminUser',
				component: () => import('../views/users/UserManagement.vue'),
				meta: { title: '用户管理', role: 4 }
			},
			// {
			// 	path: 'service-audit',
			// 	name: 'AdminServiceAudit',
			// 	component: () => import('@views/admin/service-audit.vue'),
			// 	meta: { title: '服务审核', role: 4 }
			// },
			{
				path: 'order-monitor',
				name: 'AdminOrderMonitor',
				component: () => import('../views/admin/order-monitor.vue'),
				meta: { title: '订单监控', role: 4 }
			},
			// {
			// 	path: 'health-alert',
			// 	name: 'AdminHealthAlert',
			// 	component: () => import('@views/admin/health-alert.vue'),
			// 	meta: { title: '健康预警', role: 4 }
			// },
			// {
			// 	path: 'emergency',
			// 	name: 'AdminEmergency',
			// 	component: () => import('@views/admin/emergency.vue'),
			// 	meta: { title: '求助处理', role: 4 }
			// }
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
		if (role === 2) return next("/family");
		if (role === 3) return next("/merchant");
		if (role === 4) return next("/admin");
		return next("/login"); // Fallback
	}

	next();
});

export default router;
