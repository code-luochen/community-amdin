<template>
  <div class="service-management-wrapper">
    <div class="page-container animate-fade-in">
      <!-- Header Section -->
      <div class="premium-header relative overflow-hidden mb-5!">
        <div class="bg-shape shape-1"></div>
        <div class="bg-shape shape-2"></div>
        <div class="header-content relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div class="header-text">
            <h1 class="page-title">服务管理</h1>
            <p class="page-subtitle">管理并发布您的社区服务，随时掌握上架动态</p>
          </div>
          <button class="premium-btn primary group" @click="handleAdd">
            <el-icon class="btn-icon group-hover:rotate-90 transition-transform duration-300"><Plus /></el-icon>
            <span>发布服务</span>
          </button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="content-card shadow-soft">
        <!-- Search Bar -->
        <div class="search-toolbar">
          <el-form :model="searchForm" inline class="premium-form">
            <el-form-item>
              <el-input 
                v-model="searchForm.name" 
                placeholder="搜索服务名称..." 
                clearable 
                class="custom-input w-64"
                :prefix-icon="Search"
              />
            </el-form-item>
            <el-form-item>
              <el-select 
                v-model="searchForm.type" 
                placeholder="所有类型" 
                clearable 
                class="custom-select w-40!"
              >
                <el-option label="生活服务" :value="1" />
                <el-option label="药品服务" :value="2" />
                <el-option label="医护服务" :value="3" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="searchForm.auditStatus" placeholder="审核状态" clearable class="custom-select w-40!">
                <el-option label="待审核" :value="0" />
                <el-option label="已通过" :value="1" />
                <el-option label="已拒绝" :value="2" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select 
                v-model="searchForm.status" 
                placeholder="上下架状态" 
                clearable 
                class="custom-select w-40!"
              >
                <el-option label="已上架" :value="1" />
                <el-option label="已下架" :value="0" />
              </el-select>
            </el-form-item>
            <el-form-item class="ml-auto! mr-0!">
              <div class="action-buttons">
                <el-button @click="resetSearch" class="premium-btn secondary px-6 h-10 shadow-none border! border-slate-200! rounded-xl!">重置</el-button>
                <el-button type="primary" @click="handleSearch" class="premium-btn primary-solid px-6 h-10 rounded-xl! border-none!">
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
            <el-table-column label="服务信息" min-width="260">
              <template #default="{ row }">
                <div class="service-cell">
                  <el-image 
                    :src="getFullUrl(row.imageUrl) || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" 
                    class="service-img"
                    fit="cover"
                    :preview-src-list="row.imageUrl ? [getFullUrl(row.imageUrl)] : []"
                    preview-teleported
                  />
                  <div class="service-info flex-1 min-w-0">
                    <div class="service-name text-slate-800 font-semibold truncate" :title="row.name">{{ row.name }}</div>
                    <div class="service-desc text-slate-500 text-xs mt-0.5 truncate" :title="row.description">{{ row.description }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="服务类型" width="130">
              <template #default="{ row }">
                <div :class="['type-badge', getTypeBadgeClass(row.type)]">
                  <span class="dot"></span>
                  {{ getTypeName(row.type) }}
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="price" label="价格" width="100">
              <template #default="{ row }">
                <span class="price-text text-slate-700 font-semibold truncate"><span class="text-xs mr-0.5">¥</span>{{ row.price }}</span>
              </template>
            </el-table-column>
            
            <el-table-column label="审核状态" width="110">
              <template #default="{ row }">
                <div :class="['status-pill', getAuditStatusClass(row.auditStatus)]">
                  {{ getAuditStatusName(row.auditStatus) }}
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="上架状态" width="100">
              <template #default="{ row }">
                <el-switch
                  v-model="row.status"
                  :active-value="1"
                  :inactive-value="0"
                  class="premium-switch"
                  style="--el-switch-on-color: #10b981; --el-switch-off-color: #f43f5e"
                  @change="handleStatusChange(row)"
                  :disabled="row.auditStatus !== 1"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="发布时间" min-width="170">
              <template #default="{ row }">
                <div class="time-cell">
                  <el-icon class="mr-1 text-slate-400"><Clock /></el-icon>
                  <span>{{ formatDate(row.createdAt) }}</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="100" fixed="right" align="right">
              <template #default="{ row }">
                <div class="table-actions">
                  <el-button link type="primary" class="action-btn edit" @click="handleEdit(row)">编辑</el-button>
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
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            class="premium-pagination"
          />
        </div>
      </div>
    </div>

    <!-- Edit/Create Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑服务详情' : '发布全新服务'"
      width="540px"
      class="premium-dialog"
      :show-close="false"
      destroy-on-close
      @closed="handleDialogClosed"
    >
      <template #header="{ title }">
        <div class="dialog-custom-header">
          <h3>{{ title }}</h3>
          <p class="dialog-subtitle">{{ isEdit ? '修改已有服务信息，保存后将重新进入待审核状态' : '认真填写服务详情，提供完善的小区服务' }}</p>
        </div>
      </template>
      
      <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" class="premium-form-vertical mt-2">
        <el-form-item label="服务名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入简明扼要的服务名称" maxlength="100" show-word-limit class="custom-input" />
        </el-form-item>
        
        <div class="grid grid-cols-2 gap-5">
          <el-form-item label="服务类型" prop="type">
            <el-select v-model="formData.type" placeholder="选择服务类别" class="custom-select w-full">
              <el-option label="生活服务" :value="1" />
              <el-option label="药品服务" :value="2" />
              <el-option label="医护服务" :value="3" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="服务价格 (元)" prop="price">
            <el-input-number v-model="formData.price" :min="0" :precision="2" :step="1" placeholder="设定合理价格" class="custom-input-number w-full!" />
          </el-form-item>
        </div>
        
        <el-form-item label="服务宣传图片" prop="imageUrl">
          <el-upload
            class="service-uploader"
            :action="uploadUrl"
            :headers="headers"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
            name="file"
          >
            <div v-if="formData.imageUrl" class="uploaded-image-wrapper">
              <img :src="getFullUrl(formData.imageUrl)" class="service-preview-img" />
              <div class="upload-overlay">
                <el-icon><Camera /></el-icon>
                <span>更换图片</span>
              </div>
            </div>
            <div v-else class="upload-placeholder">
              <el-icon class="upload-icon"><Plus /></el-icon>
              <div class="upload-text">点击上传服务图片</div>
            </div>
          </el-upload>
          <div class="upload-tip text-slate-400 text-xs mt-1">支持 jpg/png 格式，大小不超过 2MB (必传)</div>
        </el-form-item>
        
        <el-form-item label="服务详细描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="说明服务具体内容，注意事项等..."
            class="custom-textarea"
          />
        </el-form-item>

        <div v-if="isEdit" class="edit-warning rounded-xl bg-amber-50 relative overflow-hidden p-3 mt-4 flex items-start gap-2 border border-amber-200">
          <el-icon class="text-amber-500 mt-0.5 text-lg"><Warning /></el-icon>
          <div class="text-sm text-amber-700 leading-snug">注意：修改服务内容后，服务将下架并需管理员重新审核。</div>
        </div>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer flex justify-end gap-3 pt-4! border-t border-slate-100">
          <button class="premium-btn secondary h-10 px-6 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors" @click="dialogVisible = false">取消</button>
          <button class="premium-btn primary-solid h-10 px-8 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors" @click="handleSubmit" :disabled="submitLoading">
            <span v-if="submitLoading" class="inline-block animate-spin mr-2">⟳</span>
            {{ isEdit ? '保存更改' : '提交发布' }}
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { serviceApi, type ServiceItem } from '../../api/service';
import { ElMessage, type FormInstance, type FormRules, type UploadProps } from 'element-plus';
import { Plus, Search, Clock, Warning, Camera } from '@element-plus/icons-vue';
import { useUserStore } from '../../store/user';

const userStore = useUserStore();

// ========== 状态管理 ==========
const loading = ref(false);
const tableData = ref<ServiceItem[]>([]);

// 搜索栏
const searchForm = reactive({
  name: '',
  type: undefined as number | undefined,
  status: undefined as number | undefined,
  auditStatus: undefined as number | undefined,
});

// 分页
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
});

// 弹窗
const dialogVisible = ref(false);
const submitLoading = ref(false);
const isEdit = ref(false);
const editId = ref<number>(0);

const formRef = ref<FormInstance>();
const formData = reactive({
  name: '',
  type: undefined as number | undefined,
  price: 0 as number | undefined,
  description: '',
  imageUrl: '',
});

const formRules = reactive<FormRules>({
  name: [{ required: true, message: '请输入服务名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择服务类型', trigger: 'change' }],
  price: [{ required: true, message: '请设置服务价格', trigger: 'blur' }],
  description: [{ required: true, message: '请输入服务描述', trigger: 'blur' }],
  imageUrl: [{ required: true, message: '请上传服务图片', trigger: 'change' }],
});

// Upload Logic
const uploadUrl = computed(() => {
  const base = import.meta.env.VITE_APP_BASE_API || '/api';
  return `${base}/services/upload`;
});

const headers = computed(() => ({
  Authorization: `Bearer ${userStore.token}`,
}));

const getFullUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const apiBaseUrl = import.meta.env.VITE_APP_BASE_API;
  if (apiBaseUrl && apiBaseUrl.startsWith('http')) {
    return new URL(apiBaseUrl).origin + path;
  }
  return path;
};

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    ElMessage.error('图片只能是 JPG/PNG 格式!');
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

const handleUploadSuccess: UploadProps['onSuccess'] = (response: any) => {
  const url = response.data?.url || response.url;
  if (url) {
    formData.imageUrl = url;
    ElMessage.success('图片上传成功');
    formRef.value?.validateField('imageUrl');
  } else {
    ElMessage.error('图片获取失败');
  }
};

// ========== 生命周期 ==========
onMounted(() => {
  fetchData();
});

// ========== 方法 ==========
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await serviceApi.findAllMerchant({
      page: pagination.page,
      limit: pagination.limit,
      name: searchForm.name || undefined,
      type: searchForm.type || undefined,
      status: searchForm.status ?? undefined,
      auditStatus: searchForm.auditStatus ?? undefined,
    });
    // @ts-ignore
    const result = res.data || res;
    tableData.value = result.items || [];
    pagination.total = result.total || 0;
  } catch (error) {
    console.error('获取服务列表失败:', error);
    ElMessage.error('获取数据失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  fetchData();
};

const resetSearch = () => {
  searchForm.name = '';
  searchForm.type = undefined;
  searchForm.status = undefined;
  searchForm.auditStatus = undefined;
  handleSearch();
};

const handleSizeChange = (val: number) => {
  pagination.limit = val;
  fetchData();
};

const handleCurrentChange = (val: number) => {
  pagination.page = val;
  fetchData();
};

// 状态切换
const handleStatusChange = async (row: ServiceItem) => {
  try {
    await serviceApi.updateStatus(row.id, row.status);
    ElMessage.success(row.status === 1 ? '上架成功' : '下架成功');
  } catch (error: any) {
    row.status = row.status === 1 ? 0 : 1; // 恢复旧状态
  }
};

// 新增服务
const handleAdd = () => {
  isEdit.value = false;
  dialogVisible.value = true;
};

// 编辑服务
const handleEdit = (row: ServiceItem) => {
  isEdit.value = true;
  editId.value = row.id;
  Object.assign(formData, {
    name: row.name,
    type: row.type,
    price: Number(row.price),
    description: row.description,
    imageUrl: row.imageUrl || '',
  });
  dialogVisible.value = true;
  setTimeout(() => {
    formRef.value?.clearValidate();
  }, 0);
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        if (isEdit.value) {
          await serviceApi.update(editId.value, {
            ...formData,
            price: formData.price ?? 0
          });
          ElMessage.success('更新服务成功');
        } else {
          await serviceApi.create({
            ...formData,
            type: formData.type!,
            price: formData.price ?? 0
          });
          ElMessage.success('发布服务成功');
        }
        dialogVisible.value = false;
        fetchData();
      } catch (error) {
        console.error('提交失败:', error);
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

const handleDialogClosed = () => {
  formRef.value?.resetFields();
  formData.name = '';
  formData.type = undefined;
  formData.price = undefined;
  formData.description = '';
  formData.imageUrl = '';
};

// 工具函数
const getTypeName = (type: number) => {
  const map: Record<number, string> = { 1: '生活服务', 2: '药品服务', 3: '医护服务' };
  return map[type] || '未知';
};

const getTypeBadgeClass = (type: number) => {
  const map: Record<number, string> = { 
    1: 'badge-life', 
    2: 'badge-medicine', 
    3: 'badge-health' 
  };
  return map[type] || 'badge-default';
};

const getAuditStatusName = (status: number) => {
  const map: Record<number, string> = { 0: '待审核', 1: '已通过', 2: '已拒绝' };
  return map[status] || '未知';
};

const getAuditStatusClass = (status: number) => {
  const map: Record<number, string> = { 0: 'pill-warning', 1: 'pill-success', 2: 'pill-danger' };
  return map[status] || 'pill-default';
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.service-management-wrapper {
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
::v-deep(.el-textarea__inner) {
  border-radius: 0.75rem;
  box-shadow: 0 0 0 1px #e2e8f0 inset !important;
  background-color: #f8fafc;
  padding: 0.25rem 1rem;
  transition: all 0.2s;
  font-family: inherit;
}

::v-deep(.el-textarea__inner) {
  padding: 0.75rem 1rem;
}

::v-deep(.el-input__wrapper:hover), 
::v-deep(.el-select__wrapper:hover),
::v-deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px #cbd5e1 inset !important;
  background-color: #ffffff;
}

::v-deep(.el-input__wrapper.is-focus), 
::v-deep(.el-select__wrapper.is-focus),
::v-deep(.el-textarea__inner:focus) {
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

.service-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.service-img {
  width: 52px;
  height: 52px;
  border-radius: 0.6rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  flex-shrink: 0;
}

.time-cell {
  display: flex;
  align-items: center;
  color: #64748b;
  font-size: 0.875rem;
}

/* Status Pills */
.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.6rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
}

.pill-warning {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fde68a;
}

.pill-success {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.pill-danger {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.pill-default {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

/* Type Badges */
.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.type-badge .dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
}

.badge-life {
  background: #eff6ff;
  color: #2563eb;
}
.badge-life .dot { background: #3b82f6; }

.badge-medicine {
  background: #fdf4ff;
  color: #c026d3;
}
.badge-medicine .dot { background: #d946ef; }

.badge-health {
  background: #ecfdf5;
  color: #059669;
}
.badge-health .dot { background: #10b981; }

.badge-default {
  background: #f5f3ff;
  color: #7c3aed;
}
.badge-default .dot { background: #8b5cf6; }

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

::v-deep(.custom-input-number .el-input__wrapper) {
  padding-left: 3rem;
  padding-right: 3rem;
}

::v-deep(.custom-input-number .el-input-number__decrease),
::v-deep(.custom-input-number .el-input-number__increase) {
  background: transparent !important;
  border: none !important;
  height: calc(100% - 2px) !important;
  top: 1px !important;
  color: #64748b !important;
}

::v-deep(.custom-input-number .el-input-number__decrease:hover),
::v-deep(.custom-input-number .el-input-number__increase:hover) {
  color: #3b82f6 !important;
}

::v-deep(.custom-input-number .el-input-number__decrease) {
  border-right: 1px solid #e2e8f0 !important;
  border-radius: 0.75rem 0 0 0.75rem !important;
  left: 1px !important;
}

::v-deep(.custom-input-number .el-input-number__increase) {
  border-left: 1px solid #e2e8f0 !important;
  border-radius: 0 0.75rem 0.75rem 0 !important;
  right: 1px !important;
}

::v-deep(.custom-input-number:hover .el-input-number__decrease) {
  border-right-color: #cbd5e1 !important;
}

::v-deep(.custom-input-number:hover .el-input-number__increase) {
  border-left-color: #cbd5e1 !important;
}

::v-deep(.custom-input-number.is-controls-right .el-input__wrapper) {
  padding-left: 1rem;
  padding-right: 3rem;
}

.uploaded-image-wrapper {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.service-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
}

.uploaded-image-wrapper:hover .upload-overlay {
  opacity: 1;
}

.upload-placeholder {
  width: 140px;
  height: 140px;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f8fafc;
  transition: all 0.2s;
  cursor: pointer;
}

.upload-placeholder:hover {
  border-color: #3b82f6;
  background-color: #f0f7ff;
}

.upload-icon {
  font-size: 28px;
  color: #94a3b8;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 12px;
  color: #64748b;
}

.service-uploader :deep(.el-upload) {
  display: block;
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
