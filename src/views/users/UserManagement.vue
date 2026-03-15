<template>
  <div class="user-management-wrapper">
    <div class="page-container animate-fade-in">
      <!-- Header Section -->
      <div class="premium-header relative overflow-hidden mb-5!">
        <div class="bg-shape shape-1"></div>
        <div class="bg-shape shape-2"></div>
        <div class="header-content relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div class="header-text">
            <h1 class="page-title">用户管理</h1>
            <p class="page-subtitle">统筹系统用户、权限控制与角色分配</p>
          </div>
          <button class="premium-btn primary group" @click="openDialog()">
            <el-icon class="btn-icon group-hover:rotate-90 transition-transform duration-300"><Plus /></el-icon>
            <span>新增用户</span>
          </button>
        </div>
      </div>

      <!-- Main Content Area: unified card for filters and table -->
      <div class="content-card shadow-soft">
        <!-- Search Bar -->
        <div class="search-toolbar">
          <el-form :model="searchForm" inline class="premium-form">
            <el-form-item>
              <el-input 
                v-model="searchForm.username" 
                placeholder="搜索账号名称..." 
                clearable 
                class="custom-input w-64"
                :prefix-icon="Search"
              />
            </el-form-item>
            <el-form-item>
              <el-select 
                v-model="searchForm.role" 
                placeholder="所有角色" 
                clearable 
                class="custom-select w-40!"
              >
                <el-option label="老年人" :value="1" />
                <el-option label="家属" :value="2" />
                <el-option label="社区商家" :value="3" />
                <el-option label="管理员" :value="4" />
              </el-select>
            </el-form-item>
            <el-form-item class="ml-auto! mr-0!">
              <div class="action-buttons">
                <el-button @click="resetSearch" class="premium-btn secondary px-6 h-10 shadow-none border! border-slate-200! rounded-xl!">重置</el-button>
                <el-button type="primary" @click="handleSearch" :loading="loading" class="premium-btn primary-solid px-6 h-10 rounded-xl! border-none!">
                  查询
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <!-- Table -->
        <div class="table-wrapper">
          <el-table 
            :data="tableData" 
            v-loading="loading" 
            class="premium-table" 
            style="width: 100%"
          >
            <el-table-column label="账户信息" min-width="220">
              <template #default="{ row }">
                <div class="user-cell">
                  <el-avatar 
                    :size="44" 
                    :src="row.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" 
                    class="user-avatar"
                  />
                  <div class="user-info">
                    <div class="username text-slate-800 font-semibold">{{ row.username }}</div>
                    <div class="nickname text-slate-500 text-xs mt-0.5">{{ row.nickname }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="realName" label="真实姓名" min-width="120">
              <template #default="{ row }">
                <span class="text-slate-600 font-medium">{{ row.realName || '-' }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="phone" label="联系电话" min-width="130">
              <template #default="{ row }">
                <span class="text-slate-600">{{ row.phone || '-' }}</span>
              </template>
            </el-table-column>

            <el-table-column label="居住/入驻地址" min-width="200">
              <template #default="{ row }">
                <!-- Direct user address (for Merchants/Admins or recently updated) -->
                <div v-if="row.community" class="text-xs">
                  <div class="text-slate-700 font-semibold">{{ row.community.name }}</div>
                  <div class="text-slate-400 mt-0.5" v-if="row.house">
                     {{ row.house.buildingNo }} - {{ row.house.unitNo || '' }} - {{ row.house.roomNo }}
                  </div>
                  <div v-else class="text-slate-400 mt-0.5 italics">（仅绑定小区）</div>
                </div>
                <!-- Legacy profile-based address (for existing Elderly users) -->
                <div v-else-if="row.profile?.house" class="text-xs">
                  <div class="text-slate-700 font-semibold">{{ row.profile.house.community?.name }}</div>
                  <div class="text-slate-400 mt-0.5">
                    {{ row.profile.house.buildingNo }} - {{ row.profile.house.unitNo || '' }} - {{ row.profile.house.roomNo }}
                  </div>
                </div>
                <span v-else class="text-slate-300">-</span>
              </template>
            </el-table-column>
            
            <el-table-column label="角色身份" min-width="140">
              <template #default="{ row }">
                <div :class="['role-badge', getRoleBadgeClass(row.role)]">
                  <span class="dot"></span>
                  {{ getRoleName(row.role) }}
                </div>
              </template>
            </el-table-column>

            <el-table-column label="绑定关系" min-width="160">
              <template #default="{ row }">
                <div v-if="row.role === 1 || row.role === 2" class="bindings-cell">
                  <!-- 老年人: 展示其绑定的家属 -->
                  <template v-if="row.role === 1 && row.elderlyBindings?.length">
                    <el-tag
                      v-for="binding in row.elderlyBindings"
                      :key="binding.id"
                      size="small"
                      class="mr-1 mb-1"
                      type="success"
                      effect="light"
                    >
                      <span v-if="binding.family">{{ binding.family.realName || binding.family.nickname }}</span>
                      <span class="text-xs text-green-600">({{ getDisplayRelation(binding.relation, true) }})</span>
                    </el-tag>
                  </template>
                  
                  <!-- 家属: 展示其绑定的老年人 -->
                  <template v-else-if="row.role === 2 && row.familyBindings?.length">
                    <el-tag
                      v-for="binding in row.familyBindings"
                      :key="binding.id"
                      size="small"
                      class="mr-1 mb-1"
                      type="warning"
                      effect="light"
                    >
                      <span v-if="binding.elderly">{{ binding.elderly.realName || binding.elderly.nickname }}</span>
                      <span class="text-xs text-yellow-600">({{ getDisplayRelation(binding.relation, false) }})</span>
                    </el-tag>
                  </template>

                  <span v-else class="text-slate-300 text-xs">-</span>
                </div>
                <span v-else class="text-slate-300">-</span>
              </template>
            </el-table-column>
            
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-switch
                  v-model="row.status"
                  :active-value="1"
                  :inactive-value="2"
                  class="premium-switch"
                  style="--el-switch-on-color: #10b981; --el-switch-off-color: #f43f5e"
                  @change="handleStatusChange(row)"
                  :disabled="(row.role === 4 && row.id === 1) || row.id === userStore.userInfo?.id"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="注册时间" min-width="180">
              <template #default="{ row }">
                <div class="time-cell">
                  <el-icon class="mr-1"><Clock /></el-icon>
                  <span>{{ formatDate(row.createdAt) }}</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="160" fixed="right" align="right">
              <template #default="{ row }">
                <div class="table-actions">
                  <el-button link type="primary" class="action-btn edit" @click="openDialog(row)">编辑</el-button>
                  <el-popconfirm
                    title="确定重置该账号密码吗？"
                    @confirm="handleResetPassword(row.id)"
                    width="200"
                    confirm-button-type="danger"
                    hide-icon
                  >
                    <template #reference>
                      <el-button link type="danger" class="action-btn delete" :disabled="row.role === 4 && row.id === 1">重置密码</el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- Pagination -->
        <div class="pagination-wrapper mt-6! pb-2!">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.limit"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="fetchData"
            @current-change="fetchData"
            class="premium-pagination"
          />
        </div>
      </div>
    </div>

    <!-- Form Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户信息' : '创建新用户'"
      width="480px"
      class="premium-dialog"
      :show-close="false"
      destroy-on-close
    >
      <template #header="{ title }">
        <div class="dialog-custom-header">
          <h3>{{ title }}</h3>
          <p class="dialog-subtitle">{{ isEdit ? '修改已有用户的各项配置资料' : '填写基础信息以完成新用户注册' }}</p>
        </div>
      </template>
      
      <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" class="premium-form-vertical mt-2">
        <el-form-item label="登录账号" prop="username">
          <el-input v-model="formData.username" placeholder="4-20位字母数字下划线" class="custom-input" :disabled="isEdit" />
        </el-form-item>
        
        <el-form-item label="初始密码" prop="password" v-if="!isEdit">
          <el-input v-model="formData.password" placeholder="6-16位安全密码" show-password class="custom-input" />
        </el-form-item>
        
        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="用户角色" prop="role">
            <el-select v-model="formData.role" placeholder="选择角色身份" class="custom-select w-full" :disabled="isEdit">
              <el-option label="老年人" :value="1" />
              <el-option label="家属" :value="2" />
              <el-option label="社区商家" :value="3" />
              <el-option label="管理员" :value="4" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="系统昵称" prop="nickname">
            <el-input v-model="formData.nickname" placeholder="显示用昵称" class="custom-input" />
          </el-form-item>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="真实姓名 (选填)" prop="realName">
            <el-input v-model="formData.realName" placeholder="用户的真实身份姓名" class="custom-input" />
          </el-form-item>

          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="formData.phone" placeholder="11位手机号码" class="custom-input" />
          </el-form-item>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="所属小区" prop="communityId">
            <el-select v-model="formData.communityId" placeholder="选择小区" class="custom-select w-full" @change="handleCommunityChange">
              <el-option v-for="opt in communityOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>

          <el-form-item label="房产地址" prop="houseId" v-if="formData.role !== 3">
            <el-cascader
              v-model="formData.houseId"
              :options="currentAddressOptions"
              :props="{ label: 'label', value: 'value', children: 'children', checkStrictly: false }"
              placeholder="选择楼栋/单元/门牌"
              class="custom-cascader w-full"
              :disabled="!formData.communityId"
            />
          </el-form-item>
        </div>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button class="premium-btn secondary h-10 px-6 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors" @click="dialogVisible = false">取消</button>
          <button class="premium-btn primary-solid h-10 px-8 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors" @click="submitForm" :disabled="submitLoading">
            <span v-if="submitLoading" class="inline-block animate-spin mr-2">⟳</span>
            {{ isEdit ? '保存修改' : '确认创建' }}
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Plus, Search, Clock } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { useUserStore } from '@/store/user';
import {
  fetchUsers,
  createUser,
  updateUser,
  updateUserStatus,
  resetPassword,
  type User,
  type UserQuery
} from '@/api/users';
import { getAddressTree } from '@/api/community';

const userStore = useUserStore();

// State
const loading = ref(false);
const submitLoading = ref(false);
const tableData = ref<User[]>([]);
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
});

const searchForm = reactive<UserQuery>({
  username: '',
  role: undefined,
});

// Dialog state
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const currentUserId = ref<number | null>(null);

const formData = reactive({
  username: '',
  password: '',
  role: undefined as number | undefined,
  nickname: '',
  realName: '',
  phone: '',
  communityId: undefined as number | undefined,
  houseId: [] as any[], // [buildingNo, unitNo, houseId]
});

const communityOptions = ref<any[]>([]);
const allAddressData = ref<any[]>([]);
const currentAddressOptions = ref<any[]>([]);

const formRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { pattern: /^[a-z0-9_]{4,20}$/, message: '长度在4-20个字符间，仅支持小写字母、数字和下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 16, message: '长度在6到16字符之间', trigger: 'blur' }
  ].map(r => ({ ...r, required: !isEdit.value })),
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号码', trigger: 'blur' }
  ],
  communityId: [{ required: true, message: '请选择所属小区', trigger: 'change' }],
  houseId: [
    { 
      validator: (_: any, value: any, callback: any) => {
        // Only skip validation for roles that don't need a house address (e.g. Merchants)
        if (formData.role === 3) {
          callback();
        } else if (!value || value.length === 0) {
          callback(new Error('请选择详细地址'));
        } else {
          callback();
        }
      }, 
      trigger: 'change' 
    }
  ],
});

// Helper functions
const getRoleName = (role: number) => {
  const map: Record<number, string> = { 1: '老年人', 2: '家属', 3: '社区商家', 4: '管理员' };
  return map[role] || '未知角色';
};

const getRoleBadgeClass = (role: number) => {
  const map: Record<number, string> = { 
    1: 'badge-elderly', 
    2: 'badge-family', 
    3: 'badge-merchant', 
    4: 'badge-admin' 
  };
  return map[role] || 'badge-default';
};

/**
 * 获取对应显示的关系名称 (自动映射对称关系)
 * @param relation 原始记录的关系
 * @param isElderlyPerspective 是否从老人的视角查看（若是，则需要转换成"子女"等对称关系）
 */
const getDisplayRelation = (relation: string, isElderlyPerspective: boolean) => {
  if (!relation) return isElderlyPerspective ? '家属' : '长辈';
  // 如果不是老人视角，说明家属在看老人，直接显示原始定义的"父亲/母亲"等
  if (!isElderlyPerspective) return relation;

  // 如果是老人视角看家属，需要将"父亲"转换成"子女"
  const inverseMap: Record<string, string> = {
    '父亲': '子女',
    '爸爸': '子女',
    '母亲': '子女',
    '妈妈': '子女',
    '爷爷': '孙辈',
    '外公': '孙辈',
    '奶奶': '孙辈',
    '外婆': '孙辈',
    '伯父': '侄辈',
    '伯母': '侄辈',
    '叔叔': '侄辈',
    '婶婶': '侄辈',
    '姑姑': '侄辈',
    '姑丈': '侄辈',
    '舅舅': '侄辈',
    '舅妈': '侄辈',
    '阿姨': '侄辈',
    '姨丈': '侄辈',
    '岳父': '女婿/儿媳',
    '公公': '儿媳/女婿',
    '岳母': '女婿/儿媳',
    '婆婆': '儿媳/女婿',
  };

  // 模糊匹配
  for (const key in inverseMap) {
    if (relation.includes(key)) return inverseMap[key];
  }

  return '晚辈';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// API calls
const fetchData = async () => {
  loading.value = true;
  try {
    const res: any = await fetchUsers({
      page: pagination.page,
      limit: pagination.limit,
      username: searchForm.username || undefined,
      role: searchForm.role || undefined,
    });
    // @ts-ignore depending on axios interceptor
    const result = res.data || res;
    tableData.value = result.items || [];
    pagination.total = result.total || 0;
  } catch (error) {
    ElMessage.error('获取用户数据失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  fetchData();
};

const resetSearch = () => {
  searchForm.username = '';
  searchForm.role = undefined;
  handleSearch();
};

const openDialog = async (row?: any) => {
  isEdit.value = !!row;
  await fetchAddressTree(); // Ensure we have the tree for both modes
  
  if (row) {
    currentUserId.value = row.id;
    formData.username = row.username;
    formData.role = row.role;
    formData.nickname = row.nickname;
    formData.realName = row.realName || '';
    formData.phone = row.phone || '';
    formData.password = '';
    
    // Populate address info: Prefer direct user relations, fallback to profile
    if (row.community) {
      formData.communityId = Number(row.community.id);
      handleCommunityChange(formData.communityId);
      if (row.house) {
        formData.houseId = [
          row.house.buildingNo,
          row.house.unitNo || '__none__',
          row.house.id
        ];
      } else {
        formData.houseId = [];
      }
    } else if (row.profile?.house) {
      formData.communityId = Number(row.profile.house.communityId);
      handleCommunityChange(formData.communityId);
      formData.houseId = [
        row.profile.house.buildingNo,
        row.profile.house.unitNo || '__none__',
        row.profile.house.id
      ];
    } else {
      formData.communityId = undefined;
      formData.houseId = [];
      currentAddressOptions.value = [];
    }
  } else {
    currentUserId.value = null;
    formData.username = '';
    formData.password = '';
    formData.role = undefined;
    formData.nickname = '';
    formData.realName = '';
    formData.phone = '';
    formData.communityId = undefined;
    formData.houseId = [];
    currentAddressOptions.value = [];
  }
  
  dialogVisible.value = true;
  setTimeout(() => {
    formRef.value?.clearValidate();
  }, 0);
};

const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        if (isEdit.value && currentUserId.value) {
          const houseId = formData.houseId.length > 0 ? formData.houseId[formData.houseId.length - 1] : undefined;
          await updateUser(currentUserId.value, {
            nickname: formData.nickname,
            realName: formData.realName,
            phone: formData.phone,
            communityId: formData.communityId,
            houseId: houseId
          });
          ElMessage.success('用户资料已成功更新');
        } else {
          const houseId = formData.houseId.length > 0 ? formData.houseId[formData.houseId.length - 1] : undefined;

          await createUser({
            ...formData,
            role: formData.role,
            communityId: formData.communityId,
            houseId,
          });
          ElMessage.success('新用户创建成功');
        }
        dialogVisible.value = false;
        fetchData();
      } catch (error: any) {
        ElMessage.error(error.message || '操作未完成，请重试');
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

const handleStatusChange = async (row: User) => {
  try {
    await updateUserStatus(row.id, row.status);
    ElMessage.success(`状态已${row.status === 1 ? '激活' : '封禁'}`);
  } catch (error) {
    row.status = row.status === 1 ? 2 : 1;
    ElMessage.error('状态修改未生效');
  }
};

const handleResetPassword = async (id: number) => {
  try {
    await resetPassword(id);
    ElMessage.success('该用户密码已重置为 123456');
  } catch (error) {
    ElMessage.error('密码重置请求失败');
  }
};

const fetchAddressTree = async () => {
  try {
    const res: any = await getAddressTree();
    const rawData = Array.isArray(res) ? res : (res.data || []);
    allAddressData.value = rawData.map((node: any) => ({
      ...node,
      communityId: Number(node.communityId) // Normalize
    }));
    
    // Transform to Community options
    communityOptions.value = allAddressData.value.map((node: any) => ({
      label: node.communityName,
      value: node.communityId
    }));
  } catch (error) {
    ElMessage.error('获取小区列表失败');
  }
};

const handleCommunityChange = (val: any) => {
  formData.houseId = [];
  const normalizedVal = Number(val);
  const node = allAddressData.value.find(n => Number(n.communityId) === normalizedVal);
  if (node) {
    currentAddressOptions.value = node.buildings.map((b: any) => ({
      label: b.buildingNo,
      value: b.buildingNo,
      children: b.units.map((u: any) => ({
        label: u.unitNo || '无单元',
        value: u.unitNo || '__none__',
        children: u.rooms.map((r: any) => ({
          label: r.roomNo,
          value: r.id
        }))
      }))
    }));
  } else {
    currentAddressOptions.value = [];
  }
};

// Lifecycle
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.user-management-wrapper {
  font-family: 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif;
  color: #1e293b;
  min-height: 100%;
}

.page-container {
  width: 100%;
}

/* Header Aesthetics */
.premium-header {
  background: white;
  border-radius: 1.25rem;
  padding: 1.5rem 2rem;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.01);
}

.bg-shape {
  position: absolute;
  filter: blur(60px);
  z-index: 0;
  border-radius: 50%;
  pointer-events: none;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: rgba(56, 189, 248, 0.15);
  top: -100px;
  right: -50px;
}

.shape-2 {
  width: 250px;
  height: 250px;
  background: rgba(167, 139, 250, 0.15);
  bottom: -120px;
  right: 200px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 400;
}

/* Buttons */
.premium-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: none;
}

.premium-btn.primary {
  background: #0f172a;
  color: white;
  box-shadow: 0 4px 14px 0 rgba(15, 23, 42, 0.2);
}

.premium-btn.primary:hover {
  background: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px 0 rgba(15, 23, 42, 0.3);
}

/* Form Styles */
.premium-form .el-form-item {
  margin-bottom: 0;
  margin-right: 1rem;
}

.content-card {
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  border: 1px solid #f1f5f9;
}

.search-toolbar {
  padding-bottom: 1.5rem;
  border-bottom: 1px dashed #e2e8f0;
  margin-bottom: 1.5rem;
}

/* Custom Overrides for Element Plus */
::v-deep(.el-input__wrapper), 
::v-deep(.el-select__wrapper),
::v-deep(.el-cascader) {
  border-radius: 0.75rem;
  box-shadow: 0 0 0 1px #e2e8f0 inset !important;
  background-color: #f8fafc;
  transition: all 0.2s;
}

::v-deep(.el-input__wrapper),
::v-deep(.el-select__wrapper) {
  padding: 0.25rem 1rem;
}

::v-deep(.el-cascader .el-input__wrapper) {
  padding: 0.25rem 1rem;
  background-color: transparent !important;
  box-shadow: none !important;
}

::v-deep(.el-input__wrapper:hover), 
::v-deep(.el-select__wrapper:hover),
::v-deep(.el-cascader:hover) {
  box-shadow: 0 0 0 1px #cbd5e1 inset !important;
  background-color: #ffffff;
}

::v-deep(.el-input__wrapper.is-focus), 
::v-deep(.el-select__wrapper.is-focus),
::v-deep(.el-cascader.is-focus) {
  box-shadow: 0 0 0 2px #3b82f6 inset !important;
  background-color: #ffffff;
}

/* Table Aesthetics */
.premium-table {
  --el-table-border-color: transparent;
  --el-table-header-bg-color: #fefefe;
  --el-table-header-text-color: #64748b;
  --el-table-tr-bg-color: transparent;
}

::v-deep(.el-table th.el-table__cell) {
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.02em;
  padding: 1rem 0;
  border-bottom: 1px solid #f1f5f9;
}

::v-deep(.el-table td.el-table__cell) {
  padding: 1rem 0;
  border-bottom: 1px solid #f8fafc;
  transition: background-color 0.2s;
}

::v-deep(.el-table__row:hover td.el-table__cell) {
  background-color: #f8fafc !important;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  border: 2px solid white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}

.time-cell {
  display: flex;
  align-items: center;
  color: #64748b;
  font-size: 0.875rem;
}

/* Role Badges */
.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.role-badge .dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
}

.badge-elderly {
  background: #ecfdf5;
  color: #059669;
}
.badge-elderly .dot { background: #10b981; }

.badge-family {
  background: #fffbeb;
  color: #d97706;
}
.badge-family .dot { background: #f59e0b; }

.badge-merchant {
  background: #eff6ff;
  color: #2563eb;
}
.badge-merchant .dot { background: #3b82f6; }

.badge-admin {
  background: #f5f3ff;
  color: #7c3aed;
}
.badge-admin .dot { background: #8b5cf6; }

/* Actions */
.table-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.action-btn {
  font-weight: 600;
  font-family: inherit;
}

.action-btn.edit {
  color: #3b82f6;
}
.action-btn.edit:hover {
  color: #2563eb;
  background: #eff6ff;
  border-radius: 0.5rem;
  padding: 0.25rem 0.5rem;
}

.action-btn.delete {
  color: #ef4444;
}
.action-btn.delete:hover {
  color: #dc2626;
  background: #fef2f2;
  border-radius: 0.5rem;
  padding: 0.25rem 0.5rem;
}

/* Dialog Reskin */
::v-deep(.el-overlay-dialog) {
  backdrop-filter: blur(8px);
  background-color: rgba(15, 23, 42, 0.4);
}

::v-deep(.premium-dialog) {
  border-radius: 1.5rem !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
  background: #ffffff !important;
  overflow: hidden;
}

::v-deep(.premium-dialog .el-dialog__header) {
  padding: 0 !important;
  margin: 0 !important;
}

.dialog-custom-header {
  padding: 2rem 2rem 1rem;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  border-bottom: 1px solid #f1f5f9;
}

.dialog-custom-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.dialog-custom-header .dialog-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

::v-deep(.premium-dialog .el-dialog__body) {
  padding: 1.5rem 2rem !important;
}

::v-deep(.premium-dialog .el-dialog__footer) {
  padding: 1rem 2rem 1.5rem !important;
  border-top: none;
}

.premium-form-vertical ::v-deep(.el-form-item) {
  margin-bottom: 1.25rem;
}

.premium-form-vertical ::v-deep(.el-form-item__label) {
  font-weight: 500;
  color: #334155;
  padding-bottom: 0.25rem;
  line-height: 1.5;
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(15px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

