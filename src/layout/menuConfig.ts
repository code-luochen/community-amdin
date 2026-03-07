import type * as Icons from "@element-plus/icons-vue";

export interface MenuItem {
	title: string;
	index: string;
	icon?: keyof typeof Icons;
}

export const roleMenus: Record<number, MenuItem[]> = {
	// 2: 家属
	2: [
		{ title: "家属首页", index: "/family/dashboard", icon: "House" },
		{ title: "健康监控", index: "/family/health", icon: "Monitor" },
		{ title: "订单监督", index: "/family/order", icon: "List" },
		{ title: "绑定管理", index: "/family/binding", icon: "Link" },
		{ title: "通知中心", index: "/family/notifications", icon: "Message" },
	],
	// 3: 商家
	3: [
		{ title: "商家首页", index: "/merchant/dashboard", icon: "DataLine" },
		{ title: "订单处理", index: "/merchant/order", icon: "ShoppingCart" },
		{ title: "服务管理", index: "/merchant/service", icon: "Setting" },
		{ title: "通知中心", index: "/merchant/notifications", icon: "Message" },
	],
	// 4: 小区管理员
	4: [
		{ title: "管理员首页", index: "/admin/dashboard", icon: "Odometer" },
		{ title: "用户管理", index: "/admin/user", icon: "User" },
		{
			title: "服务审核",
			index: "/admin/service-audit",
			icon: "DocumentChecked",
		},
		{ title: "订单监控", index: "/admin/order-monitor", icon: "View" },
		{ title: "健康预警", index: "/admin/health-alert", icon: "Bell" },
		{ title: "求助处理", index: "/admin/emergency", icon: "Phone" },
		{ title: "小区地址", index: "/admin/address", icon: "Location" },
		{ title: "通知中心", index: "/admin/notifications", icon: "Message" },
	],
};
