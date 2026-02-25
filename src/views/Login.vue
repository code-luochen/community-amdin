<template>
  <div class="login-container">
    <div class="login-wrapper">
      
      <!-- Left Panel: Branding & Value Prop -->
      <div class="login-branding">
        <div class="brand-content">
          <div class="logo-wrapper">
            <el-icon :size="40" class="logo-icon"><HomeFilled /></el-icon>
            <span class="logo-text">社区养老 SaaS</span>
          </div>
          
          <h1 class="brand-title">用心服务每一位长者</h1>
          <p class="brand-desc">贴心、便捷、高效的社区服务管理系统。我们致力于构建充满温度的小区生态，让长者的晚年生活更加安心、舒心。</p>
          
          <div class="feature-list">
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>实时关注，家属更放心</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>优质商家，生活更便利</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>智能统筹，社区更高效</span>
            </div>
          </div>
        </div>
        
        <!-- Decorative Background Elements -->
        <div class="decor-circle circle-1"></div>
        <div class="decor-circle circle-2"></div>
        <div class="decor-glass"></div>
      </div>

      <!-- Right Panel: Form -->
      <div class="login-form-panel">
        <div class="form-header">
          <h2 class="form-title">欢迎登录系统</h2>
          <p class="form-subtitle">请输入您的账号和密码以继续访问</p>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-position="top"
          class="custom-form"
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
            <el-radio-group v-model="loginForm.role" class="custom-role-group">
              <el-radio :label="2" border>家属</el-radio>
              <el-radio :label="3" border>商家</el-radio>
              <el-radio :label="4" border>管理员</el-radio>
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
              登录系统
            </el-button>
          </el-form-item>
        </el-form>

        <div class="form-footer">
          <p class="disclaimer">首次登录请使用管理员分配的初始密码</p>
          <p class="copyright">© {{ new Date().getFullYear() }} 社区老年人服务管理平台</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { User, Lock, HomeFilled, Check } from "@element-plus/icons-vue";
import { useUserStore } from "../store/user";

const router = useRouter();
const userStore = useUserStore();
const loginFormRef = ref<FormInstance>();
const loading = ref(false);

const loginForm = reactive({
	account: "",
	password: "",
	role: 2, // 默认选商家：2-家属
});

// 前端规则校验
const validateAccount = (rule: any, value: string, callback: any) => {
	if (!value) {
		return callback(new Error("请输入账号"));
	}
	// 长度4-20字符，仅支持字母、数字、下划线
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

// 模拟生成与身份匹配的临时测试 Token (仅前端联调用，后端开发后替换为真实接口)
const generateMockToken = (role: number) => {
	const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
	const payload = btoa(
		JSON.stringify({
			id: 1,
			account: loginForm.account,
			role: role,
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2, // 2小时过期时间
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
				// 模拟调用 API 登录方法
				setTimeout(() => {
					// 这里之后应替换为您真实的 API 请求
					const mockToken = generateMockToken(loginForm.role);

					userStore.setToken(mockToken);
					ElMessage.success("登录成功");

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
				ElMessage.error("登录失败，请检查您的网络连接或后端服务");
			} finally {
				loading.value = false;
			}
		}
	});
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

.login-container {
  /* Theme variables from ui-ux-pro-max (Community Elderly Care / Warm Minimal) */
  --el-color-primary: #0369a1;
  --el-color-primary-light-3: #38bdf8;
  --el-color-primary-light-5: #7dd3fc;
  --el-color-primary-light-7: #bae6fd;
  --el-color-primary-light-8: #e0f2fe;
  --el-color-primary-light-9: #f0f9ff;
  --el-color-primary-dark-2: #0c4a6e;
  
  --text-main: #0c4a6e;
  --text-muted: #475569;
  --text-light: #94a3b8;
  --bg-color: #f0f9ff;
  --card-bg: #ffffff;
  --border-color: #e2e8f0;

  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color);
  background-image: radial-gradient(#e0f2fe 1px, transparent 1px);
  background-size: 24px 24px;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  padding: 24px;
  box-sizing: border-box;
}

.login-wrapper {
  display: flex;
  width: 100%;
  max-width: 1000px;
  min-height: 600px;
  background: var(--card-bg);
  border-radius: 24px;
  box-shadow: 0 20px 40px -10px rgba(3, 105, 161, 0.1), 0 10px 20px -5px rgba(3, 105, 161, 0.05);
  overflow: hidden;
}

/* Left Panel: Branding */
.login-branding {
  flex: 1;
  background: linear-gradient(135deg, #0369a1 0%, #0c4a6e 100%);
  color: #ffffff;
  padding: 48px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.brand-content {
  position: relative;
  z-index: 10;
  max-width: 380px;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
}

.logo-icon {
  color: #38bdf8;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.brand-title {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.25;
  margin: 0 0 16px 0;
  color: #ffffff;
}

.brand-desc {
  font-size: 16px;
  line-height: 1.6;
  color: #bae6fd;
  margin: 0 0 40px 0;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  font-weight: 500;
  color: #e0f2fe;
}

.feature-icon {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
  padding: 4px;
  border-radius: 50%;
  font-size: 14px;
}

/* Decorative background shapes */
.decor-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
}

.circle-1 {
  width: 400px;
  height: 400px;
  top: -100px;
  right: -150px;
  border: 40px solid rgba(255, 255, 255, 0.05);
}

.circle-2 {
  width: 300px;
  height: 300px;
  bottom: -50px;
  left: -100px;
  background: radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%);
}

.decor-glass {
  position: absolute;
  top: 60%;
  right: -20%;
  width: 300px;
  height: 150px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  transform: rotate(-15deg);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Right Panel: Form */
.login-form-panel {
  flex: 1;
  padding: 56px 64px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: var(--card-bg);
}

.form-header {
  margin-bottom: 36px;
}

.form-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.form-subtitle {
  font-size: 15px;
  color: var(--text-muted);
  margin: 0;
}

.custom-form :deep(.el-form-item__label) {
  font-weight: 600;
  color: var(--text-main);
  padding-bottom: 6px;
  font-size: 15px;
}

/* Accessible & highly visible inputs */
.custom-form :deep(.el-input__wrapper) {
  background-color: #f8fafc !important;
  box-shadow: 0 0 0 1px #cbd5e1 inset !important;
  border-radius: 12px !important;
  padding: 0 16px !important;
  height: 52px !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.custom-form :deep(.el-input__wrapper.is-focus) {
  background-color: #ffffff !important;
  box-shadow: 0 0 0 2px var(--el-color-primary-light-5), 0 0 0 1px var(--el-color-primary) inset !important;
}

.custom-form :deep(.el-input__inner) {
  font-size: 15px;
  color: var(--text-main);
}

/* Role Radio Buttons */
.custom-role-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
}

.custom-role-group :deep(.el-radio.is-bordered) {
  margin: 0;
  height: 48px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;
  background: #ffffff;
}

.custom-role-group :deep(.el-radio.is-bordered.is-checked) {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
  box-shadow: 0 0 0 1px var(--el-color-primary) inset;
}

.custom-role-group :deep(.el-radio.is-bordered:hover:not(.is-checked)) {
  background-color: #f8fafc;
  border-color: #94a3b8;
}

.custom-role-group :deep(.el-radio__input) {
  display: none; /* Make it look like segmented control */
}

.custom-role-group :deep(.el-radio__label) {
  padding-left: 0;
  font-weight: 600;
  font-size: 14px;
  color: var(--text-muted);
}

.custom-role-group :deep(.el-radio.is-checked .el-radio__label) {
  color: var(--el-color-primary);
}

/* Submit Button */
.submit-item {
  margin-top: 36px;
  margin-bottom: 24px;
}

.login-button {
  width: 100%;
  height: 52px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: var(--el-color-primary);
  border: none;
  box-shadow: 0 8px 16px -4px rgba(3, 105, 161, 0.4);
  transition: all 0.25s ease;
}

.login-button:hover {
  background: #0284c7;  /* Taildwind sky-600 */
  transform: translateY(-2px);
  box-shadow: 0 12px 20px -4px rgba(3, 105, 161, 0.5);
}

.login-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 8px -2px rgba(3, 105, 161, 0.4);
}

/* Footer */
.form-footer {
  text-align: center;
  margin-top: auto;
}

.disclaimer {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0 0 8px 0;
}

.copyright {
  font-size: 12px;
  color: var(--text-light);
  margin: 0;
}

/* Responsive */
@media (max-width: 900px) {
  .login-wrapper {
    flex-direction: column;
    max-width: 480px;
    min-height: auto;
  }
  
  .login-branding {
    padding: 32px 32px 48px;
    text-align: center;
  }
  
  .brand-content {
    margin: 0 auto;
  }
  
  .logo-wrapper {
    justify-content: center;
    margin-bottom: 24px;
  }
  
  .brand-title {
    font-size: 28px;
  }
  
  .brand-desc {
    margin-bottom: 24px;
  }
  
  .feature-list {
    align-items: center;
  }
  
  .login-form-panel {
    padding: 40px 32px;
    border-radius: 24px 24px 0 0;
    margin-top: -24px;
    position: relative;
    z-index: 20;
    box-shadow: 0 -4px 16px rgba(0,0,0,0.05);
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 16px;
  }
  
  .login-branding {
    padding: 32px 24px 40px;
  }
  
  .login-form-panel {
    padding: 32px 24px;
  }
  
  .form-title {
    font-size: 24px;
  }
  
  .custom-role-group {
    display: flex;
    flex-direction: column;
  }
}
</style>
