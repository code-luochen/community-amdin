<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2 class="login-title">小区老年人服务管理系统</h2>
        <p class="login-subtitle">请登录以继续访问</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-position="top"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item label="账号" prop="account">
          <el-input
            v-model="loginForm.account"
            placeholder="示例: family_zhangsan_son"
            :prefix-icon="User"
            clearable
            size="large"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            clearable
            size="large"
          />
        </el-form-item>

        <el-form-item label="登录身份" prop="role">
          <el-radio-group v-model="loginForm.role" class="role-group">
            <el-radio :label="2" border>家属</el-radio>
            <el-radio :label="3" border>社区商家</el-radio>
            <el-radio :label="4" border>小区管理员</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item class="submit-item">
          <el-button
            type="primary"
            class="login-button"
            size="large"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p class="disclaimer">* 首次登录请使用管理员分配的初始密码</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { User, Lock } from "@element-plus/icons-vue";
import { useUserStore } from "../store/user";

const router = useRouter();
const userStore = useUserStore();
const loginFormRef = ref<FormInstance>();
const loading = ref(false);

const loginForm = reactive({
	account: "",
	password: "",
	role: 2, // Default to Family
});

const validateAccount = (rule: any, value: string, callback: any) => {
	if (!value) {
		return callback(new Error("请输入账号"));
	}
	if (!/^[a-zA-Z0-9_]{4,20}$/.test(value)) {
		return callback(new Error("账号必须是4-20位字母、数字或下划线"));
	}
	callback();
};

const loginRules = reactive<FormRules>({
	account: [{ required: true, validator: validateAccount, trigger: "blur" }],
	password: [{ required: true, message: "请输入密码", trigger: "blur" }],
	role: [{ required: true, message: "请选择登录身份", trigger: "change" }],
});

// Mock generating a JWT based on the role to test frontend routing guard
const generateMockToken = (role: number) => {
	const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
	const payload = btoa(
		JSON.stringify({
			id: 1,
			account: loginForm.account,
			role: role,
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2, // 2 hours
		}),
	);
	const signature = btoa("mock_signature");
	return `${header}.${payload}.${signature}`;
};

const handleLogin = async () => {
	if (!loginFormRef.value) return;

	await loginFormRef.value.validate((valid) => {
		if (valid) {
			loading.value = true;
			try {
				// Mock API call
				setTimeout(() => {
					const mockToken = generateMockToken(loginForm.role);
					userStore.setToken(mockToken);
					ElMessage.success("登录成功");

					// Redirect based on role
					switch (loginForm.role) {
						case 2:
							router.push("/family/dashboard");
							break;
						case 3:
							router.push("/merchant/dashboard");
							break;
						case 4:
							router.push("/admin/dashboard");
							break;
					}
				}, 600);
			} catch (error) {
				ElMessage.error("登录失败，请重试");
			} finally {
				loading.value = false;
			}
		}
	});
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc; /* Light modern background */
  background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
  background-size: 24px 24px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.login-card {
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
  padding: 40px 48px;
  box-sizing: border-box;
  border: 1px solid #f1f5f9;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px 0;
  letter-spacing: -0.025em;
}

.login-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.login-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #334155;
  padding-bottom: 4px;
}

.login-form :deep(.el-input__wrapper) {
  background-color: #f8fafc;
  box-shadow: 0 0 0 1px #e2e8f0 inset;
  transition: all 0.2s ease;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  background-color: #ffffff;
  box-shadow: 0 0 0 1px #3b82f6 inset, 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.role-group {
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-top: 4px;
}

.role-group :deep(.el-radio.is-bordered) {
  margin-right: 0;
  flex: 1;
  text-align: center;
  padding: 0 8px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border-color: #e2e8f0;
}

.role-group :deep(.el-radio.is-bordered.is-checked) {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.submit-item {
  margin-top: 32px;
  margin-bottom: 24px;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  background-color: #3b82f6;
  border: none;
  transition: all 0.2s ease;
}

.login-button:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.login-button:active {
  transform: translateY(0);
}

.login-footer {
  text-align: center;
  border-top: 1px solid #f1f5f9;
  padding-top: 20px;
}

.disclaimer {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
    border-radius: 12px;
    box-shadow: none;
    border: none;
    background: transparent;
  }
  
  .login-container {
    background-color: #ffffff;
    background-image: none;
    align-items: flex-start;
    padding-top: 8vh;
  }
}
</style>
