<template>
  <div class="address-management-wrapper">
    <div class="page-container animate-fade-in">
      <!-- Header Section -->
      <div class="premium-header relative overflow-hidden mb-5!">
        <div class="bg-shape shape-1"></div>
        <div class="bg-shape shape-2"></div>
        <div class="header-content relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div class="header-text">
            <h1 class="page-title">小区与地址管理</h1>
            <p class="page-subtitle">配置小区信息及房屋地址字典，为订单配送和老人信息提供精确地址</p>
          </div>
          <button class="premium-btn primary group" @click="openCreateCommunityDialog">
            <el-icon class="btn-icon group-hover:rotate-90 transition-transform duration-300"><Plus /></el-icon>
            <span>新建小区</span>
          </button>
        </div>
      </div>

      <!-- Main Layout: Grid -->
      <div class="layout-grid">
        <!-- Left: Community List Panel -->
        <div class="content-card shadow-soft community-panel">
          <div class="section-header">
            <div class="flex items-center gap-2">
              <span class="section-title">小区列表</span>
              <span class="count-badge">{{ communities.length }}</span>
            </div>
          </div>
          <div v-loading="communityLoading" class="community-list scrollbar-hide">
            <el-empty v-if="!communityLoading && communities.length === 0" description="暂无小区数据" :image-size="60" />
            <div
              v-for="c in communities"
              :key="c.id"
              :class="['community-item', selectedCommunity?.id === c.id && 'active']"
              @click="selectCommunity(c)"
            >
              <div class="community-icon-bg">
                <el-icon><OfficeBuilding /></el-icon>
              </div>
              <div class="community-info">
                <div class="name">{{ c.name }}</div>
                <div class="addr text-slate-400 text-xs truncate">{{ c.address }}</div>
              </div>
              <div class="item-actions">
                <el-button link type="primary" size="small" @click.stop="openEditCommunityDialog(c)">编辑</el-button>
                <el-popconfirm title="确定删除该小区？相关房屋数据将一并清除" @confirm="handleDeleteCommunity(c.id)">
                  <template #reference>
                    <el-button link type="danger" size="small" @click.stop>删除</el-button>
                  </template>
                </el-popconfirm>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: House Dictionary Panel -->
        <div class="content-card shadow-soft house-panel">
          <div v-if="!selectedCommunity" class="select-prompt">
            <div class="prompt-icon-bg">
              <el-icon><Location /></el-icon>
            </div>
            <h3>请先选择一个小区</h3>
            <p>点击左侧列表中的小区来管理其下属的房屋地址</p>
          </div>

          <template v-else>
            <!-- Panel Header -->
            <div class="section-header house-header flex justify-between items-center mb-6">
              <div class="flex items-center gap-3">
                <div class="active-community-badge">
                  <span class="dot"></span>
                  {{ selectedCommunity.name }}
                </div>
                <span class="house-count text-slate-400 text-sm font-medium">{{ houses.length }} 条记录</span>
              </div>
              <div class="header-actions">
                <el-button @click="openBatchDialog" class="premium-btn secondary h-9 px-4 rounded-lg bg-slate-50 border-slate-100 hover:bg-slate-100">
                  <el-icon class="mr-1"><Download /></el-icon>批量导入
                </el-button>
                <el-button type="primary" @click="openAddHouseDialog" class="premium-btn primary-solid h-9 px-4 rounded-lg bg-slate-900 border-none">
                  <el-icon class="mr-1"><Plus /></el-icon>逐条添加
                </el-button>
              </div>
            </div>

            <!-- Filter Bar -->
            <div class="filter-strip mb-6">
              <el-select 
                v-model="filterBuilding" 
                placeholder="全部楼栋筛选" 
                clearable 
                class="custom-select w-56!"
                @change="fetchHouses"
              >
                <el-option v-for="b in uniqueBuildings" :key="b" :label="b" :value="b" />
              </el-select>
            </div>

            <!-- House Table -->
            <div class="table-wrapper">
              <el-table :data="filteredHouses" v-loading="houseLoading" class="premium-table" style="width: 100%" size="default">
                <el-table-column prop="buildingNo" label="楼栋号" min-width="120">
                  <template #default="{ row }">
                    <span class="font-semibold text-slate-700">{{ row.buildingNo }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="unitNo" label="单元" min-width="100">
                  <template #default="{ row }">
                    <span class="text-slate-500">{{ row.unitNo || '无单元' }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="roomNo" label="门牌号" min-width="120">
                  <template #default="{ row }">
                    <div class="room-chip">{{ row.roomNo }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" fixed="right" align="right">
                  <template #default="{ row }">
                    <el-popconfirm title="确定删除该地址吗？" @confirm="handleDeleteHouse(row.id)">
                      <template #reference>
                        <el-button link type="danger" class="action-btn delete">删除</el-button>
                      </template>
                    </el-popconfirm>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- ─── Dialogs (Reskinned to Premium) ─── -->

    <!-- Community Form Dialog -->
    <el-dialog
      v-model="communityDialogVisible"
      :title="editingCommunity ? '编辑小区' : '新建小区'"
      width="480px"
      class="premium-dialog"
      destroy-on-close
    >
      <template #header="{ title }">
        <div class="dialog-custom-header">
          <h3>{{ title }}</h3>
          <p class="dialog-subtitle">{{ editingCommunity ? '更新该小区的名称或详细地理位置' : '在系统中注册一个新的服务覆盖小区' }}</p>
        </div>
      </template>
      <el-form ref="communityFormRef" :model="communityForm" :rules="communityRules" label-position="top" class="premium-form-vertical">
        <el-form-item label="小区名称" prop="name" class="mb-4">
          <el-input v-model="communityForm.name" placeholder="请输入小区名称（例：阳光美地）" class="custom-input" />
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="communityForm.address" placeholder="请输入完整地理位置信息" class="custom-input" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer flex justify-end gap-3 pt-4 border-t border-slate-50">
          <button class="premium-btn secondary h-10 px-6" @click="communityDialogVisible = false">取消</button>
          <button class="premium-btn primary-solid h-10 px-8 bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors" @click="submitCommunityForm" :disabled="submitting">
            <span v-if="submitting" class="animate-spin mr-2">⟳</span>
            {{ editingCommunity ? '保存修改' : '确认创建' }}
          </button>
        </div>
      </template>
    </el-dialog>

    <!-- House Form Dialog -->
    <el-dialog v-model="houseDialogVisible" title="新增房屋地址" width="420px" class="premium-dialog" destroy-on-close>
      <template #header="{ title }">
        <div class="dialog-custom-header">
          <h3>{{ title }}</h3>
          <p class="dialog-subtitle">为 {{ selectedCommunity?.name }} 添加具体的楼栋门牌</p>
        </div>
      </template>
      <el-form ref="houseFormRef" :model="houseForm" :rules="houseRules" label-position="top" class="premium-form-vertical">
        <el-form-item label="楼栋号" prop="buildingNo">
          <el-input v-model="houseForm.buildingNo" placeholder="例：3号楼 或 A座" class="custom-input" />
        </el-form-item>
        <el-form-item label="单元号 (选填)" prop="unitNo">
          <el-input v-model="houseForm.unitNo" placeholder="无单元可留空" class="custom-input" />
        </el-form-item>
        <el-form-item label="门牌号" prop="roomNo">
          <el-input v-model="houseForm.roomNo" placeholder="例：402" class="custom-input" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer flex justify-end gap-3 pt-4">
          <button class="premium-btn secondary h-10 px-6" @click="houseDialogVisible = false">取消</button>
          <button class="premium-btn primary-solid h-10 px-8 bg-slate-900 text-white" @click="submitHouseForm" :disabled="submitting">
            确认添加
          </button>
        </div>
      </template>
    </el-dialog>

    <!-- Batch Import Dialog -->
    <el-dialog v-model="batchDialogVisible" title="批量导入房屋" width="600px" class="premium-dialog" destroy-on-close>
      <template #header="{ title }">
        <div class="dialog-custom-header">
          <h3>{{ title }}</h3>
          <p class="dialog-subtitle">通过文本格式快速导入多个房屋地址数据</p>
        </div>
      </template>
      <div class="batch-guide mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
        <el-icon class="text-slate-400 mt-1"><InfoFilled /></el-icon>
        <div class="text-xs text-slate-500 leading-relaxed">
          <strong class="text-slate-700">格式指导：</strong> 每行一个地址，格式为 <code class="bg-white px-1 font-semibold text-slate-900 border rounded">楼栋号,单元号,门牌号</code>（单元可为空）。<br/>
          <span class="mt-1 block opacity-70">示例：A楼,1单元,401<br/>B楼,,302</span>
        </div>
      </div>
      <el-input
        v-model="batchText"
        type="textarea"
        :rows="8"
        placeholder="输入地址数据..."
        class="premium-textarea"
      />
      <div v-if="parsedBatchItems.length > 0" class="preview-area mt-4">
        <div class="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">解析预览 ({{ parsedBatchItems.length }} 条)</div>
        <div class="flex flex-wrap gap-2">
          <span v-for="(item, i) in parsedBatchItems.slice(0, 10)" :key="i" class="preview-chip">
            {{ item.buildingNo }}-{{ item.roomNo }}
          </span>
          <span v-if="parsedBatchItems.length > 10" class="text-slate-300 text-xs mt-1">...等更多</span>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer flex justify-end gap-3 pt-4">
          <button class="premium-btn secondary h-10 px-6" @click="batchDialogVisible = false">取消</button>
          <button class="premium-btn primary-solid h-10 px-8 bg-indigo-600 hover:bg-indigo-700 text-white" @click="submitBatch" :disabled="submitting || parsedBatchItems.length === 0">
            导入 {{ parsedBatchItems.length }} 条记录
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { Plus, OfficeBuilding, Location, InfoFilled, Download } from '@element-plus/icons-vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import {
  getCommunityList, createCommunity, updateCommunity, deleteCommunity,
  getHouseList, createHouse, batchCreateHouses, deleteHouse,
  type Community, type HouseDict, type CreateCommunityDto, type CreateHouseDictDto,
} from '@/api/community';

// ── State ──
const communityLoading = ref(false);
const houseLoading = ref(false);
const submitting = ref(false);
const communities = ref<Community[]>([]);
const selectedCommunity = ref<Community | null>(null);
const houses = ref<HouseDict[]>([]);
const communityDialogVisible = ref(false);
const houseDialogVisible = ref(false);
const batchDialogVisible = ref(false);
const editingCommunity = ref<Community | null>(null);
const filterBuilding = ref<string | undefined>(undefined);

// ── Computed ──
const uniqueBuildings = computed(() =>
  [...new Set(houses.value.map(h => h.buildingNo))].sort()
);
const filteredHouses = computed(() =>
  filterBuilding.value ? houses.value.filter(h => h.buildingNo === filterBuilding.value) : houses.value
);

// ── Forms ──
const communityFormRef = ref<FormInstance>();
const communityForm = reactive<CreateCommunityDto>({ name: '', address: '' });
const communityRules: FormRules = {
  name: [{ required: true, message: '请输入小区名称', trigger: 'blur' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
};
const houseFormRef = ref<FormInstance>();
const houseForm = reactive({ buildingNo: '', unitNo: '', roomNo: '' });
const houseRules: FormRules = {
  buildingNo: [{ required: true, message: '请输入楼栋号', trigger: 'blur' }],
  roomNo: [{ required: true, message: '请输入门牌号', trigger: 'blur' }],
};
const batchText = ref('');
const parsedBatchItems = computed<CreateHouseDictDto[]>(() => {
  if (!selectedCommunity.value) return [];
  return batchText.value.split('\n')
    .map(l => l.trim()).filter(Boolean)
    .map(l => {
      const p = l.split(',');
      return { communityId: selectedCommunity.value!.id, buildingNo: (p[0] || '').trim(), unitNo: (p[1] || '').trim() || undefined, roomNo: (p[2] || '').trim() };
    }).filter(i => i.buildingNo && i.roomNo);
});

// ── API ──
const fetchCommunities = async () => {
  communityLoading.value = true;
  try {
    const res: any = await getCommunityList();
    communities.value = Array.isArray(res) ? res : (res?.data || []);
  } catch { ElMessage.error('获取小区列表失败'); } finally { communityLoading.value = false; }
};
const selectCommunity = async (c: Community) => {
  selectedCommunity.value = c; filterBuilding.value = undefined; await fetchHouses();
};
const fetchHouses = async () => {
  if (!selectedCommunity.value) return;
  houseLoading.value = true;
  try {
    const res: any = await getHouseList({ communityId: selectedCommunity.value.id });
    houses.value = Array.isArray(res) ? res : (res?.data || []);
  } catch { ElMessage.error('获取房屋列表失败'); } finally { houseLoading.value = false; }
};

const openCreateCommunityDialog = () => { editingCommunity.value = null; Object.assign(communityForm, { name: '', address: '' }); communityDialogVisible.value = true; };
const openEditCommunityDialog = (c: Community) => { editingCommunity.value = c; Object.assign(communityForm, { name: c.name, address: c.address }); communityDialogVisible.value = true; };
const submitCommunityForm = async () => {
  await communityFormRef.value?.validate(async valid => {
    if (!valid) return; submitting.value = true;
    try {
      editingCommunity.value ? await updateCommunity(editingCommunity.value.id, communityForm) : await createCommunity(communityForm);
      ElMessage.success(editingCommunity.value ? '已成功更新' : '已成功创建');
      communityDialogVisible.value = false; await fetchCommunities();
    } catch {} finally { submitting.value = false; }
  });
};
const handleDeleteCommunity = async (id: number) => {
  try { await deleteCommunity(id); ElMessage.success('已移除'); if (selectedCommunity.value?.id === id) { selectedCommunity.value = null; houses.value = []; } await fetchCommunities(); } catch {}
};
const openAddHouseDialog = () => { Object.assign(houseForm, { buildingNo: '', unitNo: '', roomNo: '' }); houseDialogVisible.value = true; };
const submitHouseForm = async () => {
  await houseFormRef.value?.validate(async valid => {
    if (!valid || !selectedCommunity.value) return; submitting.value = true;
    try {
      await createHouse({ communityId: selectedCommunity.value.id, buildingNo: houseForm.buildingNo, unitNo: houseForm.unitNo || undefined, roomNo: houseForm.roomNo });
      ElMessage.success('已添加房屋地址'); houseDialogVisible.value = false; await fetchHouses();
    } catch {} finally { submitting.value = false; }
  });
};
const handleDeleteHouse = async (id: number) => { try { await deleteHouse(id); ElMessage.success('已移除'); await fetchHouses(); } catch {} };
const openBatchDialog = () => { batchText.value = ''; batchDialogVisible.value = true; };
const submitBatch = async () => {
  if (!parsedBatchItems.value.length) return; submitting.value = true;
  try { await batchCreateHouses(parsedBatchItems.value); ElMessage.success(`成功导入 ${parsedBatchItems.value.length} 条数据`); batchDialogVisible.value = false; await fetchHouses(); } catch {} finally { submitting.value = false; }
};
onMounted(fetchCommunities);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.address-management-wrapper {
  font-family: 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif;
  color: #1e293b;
  min-height: 100%;
}
.page-container { width: 100%; }

/* --- Premium Header --- */
.premium-header {
  background: white; border-radius: 1.25rem; padding: 1.56rem 2rem;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.01);
}
.bg-shape { position: absolute; filter: blur(60px); z-index: 0; border-radius: 50%; pointer-events: none; }
.shape-1 { width: 300px; height: 300px; background: rgba(56, 189, 248, 0.12); top: -100px; right: -50px; }
.shape-2 { width: 250px; height: 250px; background: rgba(167, 139, 250, 0.12); bottom: -120px; right: 200px; }
.page-title { font-size: 2rem; font-weight: 700; letter-spacing: -0.02em; color: #0f172a; margin-bottom: 0.5rem; }
.page-subtitle { color: #64748b; font-size: 0.95rem; font-weight: 400; }

/* --- Buttons --- */
.premium-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.75rem 1.5rem; border-radius: 0.8rem; font-weight: 600; font-size: 0.9rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; border: 1px solid transparent;
}
.premium-btn.primary { background: #0f172a; color: white; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15); }
.premium-btn.primary:hover { background: #1e293b; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(15, 23, 42, 0.25); }

/* --- Layout --- */
.layout-grid {
  display: grid; grid-template-columns: 320px 1fr; gap: 1.25rem; align-items: stretch;
}
.content-card {
  background: white; border-radius: 1.5rem; padding: 1.5rem; border: 1px solid #f1f5f9;
}
.shadow-soft { box-shadow: 0 4px 24px -6px rgba(0, 0, 0, 0.04); }

/* --- Community List --- */
.section-header .section-title { font-weight: 700; font-size: 1.1rem; color: #0f172a; }
.count-badge { background: #f1f5f9; color: #64748b; font-size: 0.75rem; padding: 0.15rem 0.5rem; border-radius: 6px; font-weight: 600; }

.community-list { margin-top: 1.25rem; display: flex; flex-direction: column; gap: 0.6rem; max-height: 600px; overflow-y: auto; }
.community-item {
  display: flex; align-items: center; gap: 0.875rem; padding: 0.875rem 1rem; border-radius: 1rem;
  background: white; border: 1px solid #f1f5f9; transition: all 0.2s; cursor: pointer; position: relative;
}
.community-item:hover { border-color: #cbd5e1; background: #f8fafc; }
.community-item.active { background: #f1f5ff; border-color: #dee5ff; }
.community-item.active::after {
  content: ''; position: absolute; left: 0; top: 1rem; bottom: 1rem; width: 4px; background: #4f46e5; border-radius: 0 4px 4px 0;
}
.community-icon-bg {
  width: 2.5rem; height: 2.5rem; border-radius: 0.75rem; background: #f1f5f9;
  display: flex; align-items: center; justify-content: center; color: #64748b; flex-shrink: 0;
}
.active .community-icon-bg { background: #4f46e5; color: white; }
.community-info { flex: 1; min-width: 0; }
.community-info .name { font-weight: 600; font-size: 0.9rem; color: #1e293b; }
.item-actions { display: flex; opacity: 0; transition: opacity 0.2s; }
.community-item:hover .item-actions { opacity: 1; }

/* --- House Panel --- */
.house-panel { min-height: 500px; }
.select-prompt {
  height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 0;
}
.prompt-icon-bg {
  width: 4.5rem; height: 4.5rem; border-radius: 1.5rem; background: #f8fafc; color: #cbd5e1;
  display: flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 1.5rem;
}
.select-prompt h3 { font-size: 1.15rem; font-weight: 700; color: #334155; margin-bottom: 0.5rem; }
.select-prompt p { font-size: 0.9rem; color: #94a3b8; }

.active-community-badge {
  display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.8rem;
  background: #f1f5ff; color: #4f46e5; font-weight: 700; font-size: 0.9rem; border-radius: 0.75rem;
}
.active-community-badge .dot { width: 6px; height: 6px; background: #4f46e5; border-radius: 50%; display: inline-block; }

.room-chip {
  display: inline-block; background: #f8fafc; border: 1px solid #e2e8f0;
  padding: 0.2rem 0.6rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.85rem; color: #475569;
}

/* --- EP Overrides --- */
::v-deep(.el-input__wrapper), ::v-deep(.el-select__wrapper), ::v-deep(.el-textarea__inner) {
  border-radius: 0.75rem !important; box-shadow: 0 0 0 1px #e2e8f0 inset !important;
  background-color: #f8fafc !important; border: none !important;
}
::v-deep(.el-input__wrapper.is-focus), ::v-deep(.el-select__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #4f46e5 inset !important; background-color: white !important;
}

.premium-table { font-size: 0.9rem; --el-table-header-bg-color: #f8fafc; }
::v-deep(.el-table th.xl-table__cell) { font-weight: 700; color: #475569; }

/* --- Dialogs --- */
::v-deep(.premium-dialog) { border-radius: 1.5rem !important; overflow: hidden; }
.dialog-custom-header { padding: 1.5rem 2rem; background: #fefefe; border-bottom: 1px solid #f1f5f9; }
.dialog-custom-header h3 { font-size: 1.2rem; font-weight: 700; color: #0f172a; margin-bottom: 0.25rem; }
.dialog-custom-header .dialog-subtitle { font-size: 0.85rem; color: #94a3b8; }
::v-deep(.el-dialog__body) { padding: 1.5rem 2rem !important; }
::v-deep(.el-dialog__footer) { padding: 1rem 2rem 1.5rem !important; }

/* --- Batch Guide --- */
.preview-chip {
  background: #f1f5ff; color: #4f46e5; font-size: 0.75rem; font-weight: 600;
  padding: 0.2rem 0.5rem; border-radius: 6px; border: 1px solid #e0e7ff;
}

.animate-fade-in { animation: fadeIn 0.5s ease forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Scrollbar hide */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
