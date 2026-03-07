<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header flex items-center gap-2">
          <el-button link @click="goBack" class="back-btn!">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <span>个人信息设置</span>
        </div>
      </template>

      <div class="profile-content">
        <!-- Avatar Section -->
        <div class="avatar-section">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :headers="headers"
            name="file"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <div class="avatar-wrapper">
              <el-avatar
                v-if="tempAvatar || profileForm.avatar"
                :src="getAvatarUrl(tempAvatar || profileForm.avatar)"
                :size="100"
                class="avatar-img"
              />
              <div v-else class="avatar-placeholder">
                <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
              </div>
              <div class="avatar-overlay">
                <el-icon><Camera /></el-icon>
                <span>更换头像</span>
              </div>
            </div>
          </el-upload>
          <div class="avatar-tip">支持 jpg/png 格式，大小不超过 2MB</div>
        </div>

        <!-- Form Section -->
        <el-form
          ref="formRef"
          :model="profileForm"
          :rules="rules"
          label-position="top"
          class="profile-form"
        >
          <el-form-item label="登录账号" prop="username">
            <el-input v-model="profileForm.username" disabled />
          </el-form-item>

          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="profileForm.nickname" placeholder="请输入你的昵称" clearable />
          </el-form-item>

          <el-form-item label="真实姓名" prop="realName">
            <el-input v-model="profileForm.realName" placeholder="请输入你的真实姓名" clearable />
          </el-form-item>

          <el-form-item label="注册时间" prop="createdAt">
            <el-input :model-value="formatDate(profileForm.createdAt)" disabled />
          </el-form-item>

          <div class="form-actions gap-3">
            <el-button @click="goBack">取消</el-button>
            <el-button type="primary" :loading="saving" @click="saveProfile">
              保存修改
            </el-button>
          </div>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Camera, Plus, ArrowLeft } from '@element-plus/icons-vue';
import { ElMessage, type FormInstance, type FormRules, type UploadProps } from 'element-plus';
import { onMounted, reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getProfile, updateProfile } from '../../api/users';
import { useUserStore } from '../../store/user';

const router = useRouter();
const userStore = useUserStore();
const formRef = ref<FormInstance>();
const saving = ref(false);

const goBack = () => {
  router.back();
};

const uploadUrl = computed(() => {
  const base = import.meta.env.VITE_APP_BASE_API || '/api';
  return `${base}/users/avatar`;
});

const headers = computed(() => ({
  Authorization: `Bearer ${userStore.token}`,
}));

const profileForm = reactive({
  id: 0,
  username: '',
  nickname: '',
  realName: '',
  avatar: '',
  createdAt: '',
});

const rules = reactive<FormRules>({
  nickname: [
    { required: true, message: '昵称不能为空', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
  ],
});

const fetchProfile = async () => {
  try {
    const res = await getProfile();
    if (res) {
      Object.assign(profileForm, res);
      // Synchronize in case it was updated elsewhere
      userStore.updateUserInfo({
        nickname: res.nickname,
        avatar: res.avatar,
      });
    }
  } catch (error) {
    console.error('Failed to fetch profile', error);
  }
};

const getAvatarUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  // If backend returned a relative path starting with /uploads
  // Construct the full URL for it to load correctly, proxy handles /uploads 
  // Wait, does the proxy handle /uploads? Let's check vite config. Only /api is proxied.
  // Wait, if /uploads is not proxied in vite.config.ts, the image will 404 in dev!
  // It's safer to point to VITE_APP_BASE_API origin if it exists, or proxy it.
  // Assuming baseUrl proxy works or we just use absolute URL. 
  // Actually, wait, NestJS is serving it at /uploads. Let's prepend 'http://localhost:3000' in dev or base path.
  // For now, let's keep it simple: API proxy is for /api. The backend serves root '/uploads'.
  // If we are on Vite dev server, /uploads will fail unless proxied. Let's assume the backend absolute path or we should add /uploads proxy.
  // But wait, the backend `avatar` field saves `/uploads/avatars/...`.
  // If VITE_APP_BASE_API is '/api', and we want access to '/uploads', we might need to point it to the backend host.
  const apiBaseUrl = import.meta.env.VITE_APP_BASE_API;
  if (apiBaseUrl && apiBaseUrl.startsWith('http')) {
    const origin = new URL(apiBaseUrl).origin;
    return `${origin}${path}`;
  }
  // In dev environment with Vite proxy, maybe we just use the path, but it might break. We will fix vite.config.ts later if needed.
  return path;
};

const formatNumber = (n: number) => n.toString().padStart(2, '0');
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${formatNumber(d.getMonth() + 1)}-${formatNumber(d.getDate())} ${formatNumber(d.getHours())}:${formatNumber(d.getMinutes())}`;
};

const beforeAvatarUpload: UploadProps['beforeUpload'] = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    ElMessage.error('头像只能是 JPG/PNG 格式!');
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!');
    return false;
  }
  return true;
};

const tempAvatar = ref('');

const handleAvatarSuccess: UploadProps['onSuccess'] = (response) => {
  if (response.code === 200 && response.data?.url) {
    tempAvatar.value = response.data.url;
    ElMessage.success('头像上传成功，请点击保存生效');
  } else if (response.url) {
    // If backend didn't wrap in {data, code}
    tempAvatar.value = response.url;
    ElMessage.success('头像上传成功，请点击保存生效');
  } else {
    ElMessage.error('头像上传失败');
  }
};

const saveProfile = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true;
      try {
        await updateProfile({
          nickname: profileForm.nickname,
          realName: profileForm.realName,
          // 如果有新上传但还没保存的头像，也一并提交
          ...(tempAvatar.value ? { avatar: tempAvatar.value } : {}),
        });
        ElMessage.success('个人信息更新成功');
        userStore.updateUserInfo({
          nickname: profileForm.nickname,
          ...(tempAvatar.value ? { avatar: tempAvatar.value } : {}),
        });
        // 保存成功后，将表单内容及暂存框重置为最新状态
        if (tempAvatar.value) {
          profileForm.avatar = tempAvatar.value;
          tempAvatar.value = '';
        }
        await fetchProfile();

        // 根据角色返回对应的首页
        const rolePaths: Record<number, string> = {
          2: "/family/dashboard",
          3: "/merchant/dashboard",
          4: "/admin/dashboard",
        };
        const targetPath = rolePaths[userStore.role as number] || "/";
        router.push(targetPath);
      } catch (error) {
        console.error('Update profile failed:', error);
      } finally {
        saving.value = false;
      }
    }
  });
};

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.profile-container {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
}

.profile-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 20px 0;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid var(--el-color-primary-light-8);
  transition: all 0.3s;
}

.avatar-wrapper:hover {
  border-color: var(--el-color-primary);
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background-color: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-placeholder .el-icon {
  font-size: 28px;
  color: #94a3b8;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay .el-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.avatar-overlay span {
  font-size: 12px;
}

.avatar-tip {
  font-size: 12px;
  color: var(--text-muted, #64748b);
}

.profile-form {
  width: 100%;
  max-width: 480px;
}

.profile-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--text-main);
}

.profile-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  padding: 0 12px;
  height: 40px;
}
.profile-form :deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #f1f5f9;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.form-actions .el-button {
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 500;
}

.back-btn {
  font-size: 18px;
  color: #64748b;
  padding: 0;
}
.back-btn:hover {
  color: var(--el-color-primary);
}
</style>
