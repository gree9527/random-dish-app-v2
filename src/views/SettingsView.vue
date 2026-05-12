<script setup lang="ts">
import { ref } from 'vue'
import { useDishStore } from '../stores/dishStore'
import { useBackup } from '../composables/useBackup'

const store = useDishStore()
const backup = useBackup()

const exporting = ref(false)
const importing = ref(false)
const fileInputRef = ref<HTMLInputElement>()

async function onExport() {
  exporting.value = true
  try {
    await backup.shareBackup(store.dishes)
    alert(`备份已保存到手机 Documents 文件夹\n文件名：猪猪饲养员-备份-xxxx.zip`)
  } catch (err) {
    alert('导出失败：' + (err as Error).message)
  } finally {
    exporting.value = false
  }
}

function onPickImport() {
  fileInputRef.value?.click()
}

async function onImportFile(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!confirm('导入备份会覆盖现有数据，确定继续吗？')) {
    target.value = ''
    return
  }

  importing.value = true
  try {
    const { dishes } = await backup.importBackup(file)
    store.importDishes(dishes)
    alert('导入成功！')
  } catch (err) {
    alert('导入失败：' + (err as Error).message)
  } finally {
    importing.value = false
    target.value = ''
  }
}

function onClearAll() {
  if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
    store.clearAll()
    alert('已清空所有数据')
  }
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="px-5 pt-5 pb-3">
      <p class="text-text-muted text-xs tracking-widest uppercase font-serif">Settings</p>
      <h1 class="text-2xl font-bold mt-0.5">设置</h1>
    </div>

    <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
      <!-- Backup -->
      <div class="bg-surface rounded-[24px] border border-border/60 overflow-hidden shadow-elegant">
        <div class="px-5 py-3.5 border-b border-border/60">
          <h2 class="font-bold text-sm text-text-muted tracking-wide">数据备份</h2>
        </div>
        <button
          @click="onExport"
          :disabled="exporting"
          class="w-full px-5 py-4 flex items-center justify-between text-left active:bg-paper/60 transition-colors disabled:opacity-50"
        >
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-secondary/60 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C17F4E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            </div>
            <span class="text-sm font-medium">{{ exporting ? '导出中...' : '导出备份' }}</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4B5A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
        <button
          @click="onPickImport"
          :disabled="importing"
          class="w-full px-5 py-4 flex items-center justify-between text-left border-t border-border/60 active:bg-paper/60 transition-colors disabled:opacity-50"
        >
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-secondary/60 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C17F4E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            </div>
            <span class="text-sm font-medium">{{ importing ? '导入中...' : '导入备份' }}</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4B5A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
        <input
          ref="fileInputRef"
          type="file"
          accept=".zip"
          class="hidden"
          @change="onImportFile"
        />
      </div>

      <!-- Danger Zone -->
      <div class="bg-surface rounded-[24px] border border-border/60 overflow-hidden shadow-elegant">
        <div class="px-5 py-3.5 border-b border-border/60">
          <h2 class="font-bold text-sm text-red-500 tracking-wide">危险操作</h2>
        </div>
        <button
          @click="onClearAll"
          class="w-full px-5 py-4 flex items-center gap-3 text-left text-red-500 active:bg-red-50/50 transition-colors"
        >
          <div class="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </div>
          <span class="text-sm font-medium">清空所有数据</span>
        </button>
      </div>

      <!-- About -->
      <div class="text-center py-8">
        <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-secondary/50 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C17F4E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        </div>
        <p class="text-xs text-text-muted font-bold">猪猪饲养员</p>
        <p class="text-xs text-text-muted mt-0.5">v1.0 · 记录美食，随机选菜</p>
      </div>
    </div>
  </div>
</template>
