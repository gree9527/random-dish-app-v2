<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { KeepAwake } from '@capacitor-community/keep-awake'
import { Capacitor } from '@capacitor/core'
import { useDishStore } from '../stores/dishStore'
import { useFilesystem } from '../composables/useFilesystem'

const route = useRoute()
const router = useRouter()
const store = useDishStore()
const fs = useFilesystem()

const dish = computed(() => store.getById(route.params.id as string))
const fullscreenStep = ref<number | null>(null)

onMounted(async () => {
  if (Capacitor.isNativePlatform()) {
    await KeepAwake.keepAwake()
  }
})

onUnmounted(async () => {
  if (Capacitor.isNativePlatform()) {
    await KeepAwake.allowSleep()
  }
})

function goBack() {
  router.back()
}

function goEdit() {
  if (!dish.value) return
  router.push({ name: 'edit', params: { id: dish.value.id } })
}

async function onDelete() {
  if (!dish.value) return
  if (confirm('确定要删除这道菜吗？')) {
    await fs.deleteFile(dish.value.imagePath)
    await fs.deleteFile(dish.value.thumbnailPath)
    store.removeDish(dish.value.id)
    router.replace({ name: 'list' })
  }
}

function openFullscreenStep(index: number) {
  fullscreenStep.value = index
}

function closeFullscreenStep() {
  fullscreenStep.value = null
}

function nextStep() {
  if (dish.value && fullscreenStep.value !== null && fullscreenStep.value < dish.value.steps.length - 1) {
    fullscreenStep.value++
  }
}

function prevStep() {
  if (fullscreenStep.value !== null && fullscreenStep.value > 0) {
    fullscreenStep.value--
  }
}
</script>

<template>
  <div v-if="dish" class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center px-5 h-16 border-b border-border/60 flex-shrink-0 bg-surface/80 backdrop-blur-md z-10">
      <button @click="goBack" class="w-9 h-9 rounded-full bg-paper flex items-center justify-center -ml-1 active:scale-90 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <div class="ml-3">
        <p class="text-text-muted text-[10px] tracking-widest uppercase font-serif">Recipe Detail</p>
        <h1 class="text-lg font-bold leading-tight truncate max-w-[200px]">{{ dish.name }}</h1>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto">
      <!-- Image with polaroid feel -->
      <div class="flex-shrink-0 mx-4 mt-4">
        <div class="bg-white p-2 pb-6 rounded-2xl shadow-elegant">
          <div class="aspect-[4/3] rounded-xl overflow-hidden bg-paper">
            <img
              v-if="dish.imagePath"
              :src="fs.convertToWebPath(dish.imagePath)"
              class="w-full h-full object-cover"
              :alt="dish.name"
            />
          </div>
          <p class="text-center text-text-muted text-xs mt-2 font-serif italic">{{ dish.name }}</p>
        </div>
      </div>

      <div class="px-5 py-5">
      <div class="flex items-start justify-between mb-3">
        <div>
          <h1 class="text-[26px] font-bold leading-tight">{{ dish.name }}</h1>
          <p class="text-text-muted text-xs mt-1 font-serif">Recipe #{{ dish.id.slice(0, 4).toUpperCase() }}</p>
        </div>
        <div class="flex gap-0.5 mt-1">
          <span v-for="i in 5" :key="i" class="text-xl" :class="i <= (dish.rating || 0) ? 'text-amber-400' : 'text-stone-200'">★</span>
        </div>
      </div>

      <div v-if="dish.category?.length" class="flex gap-2 flex-wrap mb-5">
        <span
          v-for="cat in dish.category"
          :key="cat"
          class="text-xs px-3 py-1.5 bg-secondary/60 text-accent rounded-full font-medium"
        >{{ cat }}</span>
      </div>

      <div class="mb-2">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-8 h-[2px] bg-primary rounded-full"></div>
          <h2 class="text-sm font-bold text-text-muted tracking-wide">做法步骤</h2>
        </div>
        <div class="space-y-3">
          <button
            v-for="(step, index) in dish.steps"
            :key="index"
            @click="openFullscreenStep(index)"
            class="w-full text-left flex gap-4 bg-surface border border-border/60 rounded-2xl p-4 shadow-elegant active:shadow-none active:scale-[0.99] transition-all"
          >
            <span class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-bold font-serif">
              {{ index + 1 }}
            </span>
            <p class="text-sm leading-relaxed flex-1 pt-1">{{ step }}</p>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4B5A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0 mt-1.5"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="flex-shrink-0 px-5 py-4 border-t border-border/60 flex gap-3 safe-bottom bg-surface/80 backdrop-blur-md">
      <button
        @click="goEdit"
        class="flex-1 py-3 border border-border rounded-2xl text-sm font-medium active:bg-paper transition-colors"
      >
        编辑菜谱
      </button>
      <button
        @click="onDelete"
        class="flex-1 py-3 bg-red-50/80 text-red-500 border border-red-100 rounded-2xl text-sm font-medium active:bg-red-100 transition-colors"
      >
        删除
      </button>
    </div>

    <!-- Fullscreen Step Modal -->
    <Teleport to="body">
      <Transition>
        <div
          v-if="fullscreenStep !== null"
          class="fixed inset-0 z-50 bg-bg flex flex-col"
          @click.self="closeFullscreenStep"
        >
          <div class="flex items-center justify-between px-5 h-16 border-b border-border/60 flex-shrink-0 bg-surface/80 backdrop-blur-md">
            <span class="text-sm font-medium text-text-muted font-serif">Step {{ (fullscreenStep ?? 0) + 1 }} / {{ dish.steps.length }}</span>
            <button @click="closeFullscreenStep" class="w-9 h-9 rounded-full bg-paper flex items-center justify-center active:scale-90 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <div class="flex-1 flex items-center justify-center p-8">
            <p class="text-[28px] font-medium leading-relaxed text-center">
              {{ dish.steps[fullscreenStep ?? 0] }}
            </p>
          </div>

          <div class="flex-shrink-0 px-5 py-5 border-t border-border/60 flex gap-3 safe-bottom bg-surface/80 backdrop-blur-md">
            <button
              @click="prevStep"
              :disabled="fullscreenStep === 0"
              class="flex-1 py-3.5 border border-border rounded-2xl text-sm font-medium disabled:opacity-25 active:bg-paper transition-colors"
            >
              上一步
            </button>
            <button
              @click="nextStep"
              :disabled="fullscreenStep === dish.steps.length - 1"
              class="flex-1 py-3.5 bg-primary text-white rounded-2xl text-sm font-bold disabled:opacity-40 active:scale-95 transition-transform shadow-elegant"
            >
              下一步
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>

  <div v-else class="h-full flex items-center justify-center">
    <p class="text-text-muted">菜谱不存在</p>
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.25s ease;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
