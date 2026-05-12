<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDishStore } from '../stores/dishStore'
import { useCamera } from '../composables/useCamera'
import { useFilesystem } from '../composables/useFilesystem'
import StepInput from '../components/StepInput.vue'

const route = useRoute()
const router = useRouter()
const store = useDishStore()
const camera = useCamera()
const fs = useFilesystem()

const isEdit = computed(() => !!route.params.id)
const editingDish = computed(() => isEdit.value ? store.getById(route.params.id as string) : undefined)

const name = ref('')
const steps = ref<string[]>([])
const categoryInput = ref('')
const rating = ref(3)
const photoUrl = ref('')
const photoPath = ref('')
const thumbPath = ref('')
const isLoading = ref(false)
const fileInputRef = ref<HTMLInputElement>()

onMounted(() => {
  if (editingDish.value) {
    name.value = editingDish.value.name
    steps.value = [...editingDish.value.steps]
    categoryInput.value = editingDish.value.category?.join('，') || ''
    rating.value = editingDish.value.rating || 3
    photoUrl.value = editingDish.value.imagePath ? fs.convertToWebPath(editingDish.value.imagePath) : ''
    photoPath.value = editingDish.value.imagePath
    thumbPath.value = editingDish.value.thumbnailPath
  }
})

async function onTakePhoto() {
  isLoading.value = true
  const result = await camera.takePhoto()
  if (result) {
    photoUrl.value = result.imageUrl
    photoPath.value = result.imagePath
    thumbPath.value = result.thumbnailPath
  }
  isLoading.value = false
}

function onPickFile() {
  fileInputRef.value?.click()
}

async function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  isLoading.value = true
  const result = await camera.pickFromInput(file)
  if (result) {
    photoUrl.value = result.imageUrl
    photoPath.value = result.imagePath
    thumbPath.value = result.thumbnailPath
  }
  isLoading.value = false
  target.value = ''
}

function onSave() {
  if (!name.value.trim()) {
    alert('请输入菜名')
    return
  }
  if (steps.value.length === 0) {
    alert('请至少添加一个步骤')
    return
  }

  const categories = categoryInput.value
    .split(/[,，]/)
    .map(s => s.trim())
    .filter(Boolean)

  const input = {
    name: name.value.trim(),
    steps: steps.value,
    category: categories.length ? categories : undefined,
    rating: rating.value,
  }

  if (isEdit.value && editingDish.value) {
    const updateData: any = { ...input }
    const oldImagePath = editingDish.value.imagePath
    const oldThumbPath = editingDish.value.thumbnailPath
    if (photoPath.value !== oldImagePath) {
      updateData.imagePath = photoPath.value
      updateData.thumbnailPath = thumbPath.value
      fs.deleteFile(oldImagePath)
      fs.deleteFile(oldThumbPath)
    }
    store.updateDish(editingDish.value.id, updateData)
    router.replace({ name: 'detail', params: { id: editingDish.value.id } })
  } else {
    if (!photoPath.value) {
      alert('请添加一张照片')
      return
    }
    const dish = store.addDish(input, photoPath.value, thumbPath.value)
    router.replace({ name: 'detail', params: { id: dish.id } })
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center px-5 h-16 border-b border-border/60 flex-shrink-0 bg-surface/80 backdrop-blur-md">
      <button @click="goBack" class="w-9 h-9 rounded-full bg-paper flex items-center justify-center -ml-1 active:scale-90 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <div class="ml-3">
        <p class="text-text-muted text-[10px] tracking-widest uppercase font-serif">{{ isEdit ? 'Edit Recipe' : 'New Recipe' }}</p>
        <h1 class="text-lg font-bold leading-tight">{{ isEdit ? '编辑菜谱' : '添加菜谱' }}</h1>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-5 py-5 space-y-6">
      <!-- Photo -->
      <div>
        <label class="block text-sm font-bold mb-2 text-text-muted">成品照片</label>
        <div
          v-if="photoUrl"
          class="relative bg-white p-2 pb-5 rounded-2xl shadow-elegant"
        >
          <div class="aspect-[4/3] rounded-xl overflow-hidden bg-paper">
            <img :src="photoUrl" class="w-full h-full object-cover" />
          </div>
          <button
            @click="photoUrl = ''; photoPath = ''; thumbPath = ''"
            class="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center backdrop-blur-sm active:scale-90 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div v-else class="flex gap-3">
          <button
            @click="onTakePhoto"
            :disabled="isLoading"
            class="flex-1 aspect-[4/3] rounded-2xl border-2 border-dashed border-border/80 bg-paper/50 flex flex-col items-center justify-center gap-2 text-text-muted active:bg-secondary/30 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            <span class="text-xs">{{ isLoading ? '处理中...' : '拍照 / 选图' }}</span>
          </button>
          <button
            @click="onPickFile"
            :disabled="isLoading"
            class="flex-1 aspect-[4/3] rounded-2xl border-2 border-dashed border-border/80 bg-paper/50 flex flex-col items-center justify-center gap-2 text-text-muted active:bg-secondary/30 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            <span class="text-xs">从相册选择</span>
          </button>
        </div>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="hidden"
          @change="onFileChange"
        />
      </div>

      <!-- Name -->
      <div>
        <label class="block text-sm font-bold mb-2 text-text-muted">菜名</label>
        <input
          v-model="name"
          placeholder="例如：红烧肉"
          class="w-full px-4 py-3.5 border border-border/80 rounded-2xl bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-elegant"
        />
      </div>

      <!-- Category -->
      <div>
        <label class="block text-sm font-bold mb-2 text-text-muted">分类标签（可选）</label>
        <input
          v-model="categoryInput"
          placeholder="例如：川菜，晚餐，快手菜"
          class="w-full px-4 py-3.5 border border-border/80 rounded-2xl bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-elegant"
        />
        <p class="text-xs text-text-muted mt-1.5">多个标签用逗号分隔</p>
      </div>

      <!-- Rating -->
      <div>
        <label class="block text-sm font-bold mb-2 text-text-muted">评分</label>
        <div class="flex gap-1">
          <button
            v-for="i in 5"
            :key="i"
            @click="rating = i"
            class="text-3xl transition-all duration-200 active:scale-110"
            :class="i <= rating ? 'text-amber-400 drop-shadow-sm' : 'text-stone-200'"
          >
            ★
          </button>
        </div>
      </div>

      <!-- Steps -->
      <div>
        <label class="block text-sm font-bold mb-3 text-text-muted">做法步骤</label>
        <StepInput v-model="steps" />
      </div>
    </div>

    <!-- Save Button -->
    <div class="flex-shrink-0 px-5 py-4 border-t border-border/60 safe-bottom bg-surface/80 backdrop-blur-md">
      <button
        @click="onSave"
        class="w-full py-3.5 bg-primary text-white rounded-2xl text-sm font-bold shadow-elegant active:scale-[0.98] active:bg-primary-dark transition-all"
      >
        {{ isEdit ? '保存修改' : '添加菜谱' }}
      </button>
    </div>
  </div>
</template>
