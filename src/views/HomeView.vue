<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDishStore } from '../stores/dishStore'
import SpinWheel from '../components/SpinWheel.vue'

const store = useDishStore()
const router = useRouter()
const wheelRef = ref<InstanceType<typeof SpinWheel>>()

const hasDishes = computed(() => store.dishCount > 0)
const showResult = ref(false)
const resultDish = ref(store.dishes[0])
const isRecent = ref(false)

function onRequestSpin() {
  const spinResult = store.spinWheel()
  if (!spinResult) return
  resultDish.value = spinResult.dish
  isRecent.value = spinResult.isRecent

  const idx = wheelRef.value?.getIndexByDishId(spinResult.dish.id)
  if (idx !== undefined && idx >= 0) {
    wheelRef.value?.spin(idx)
  }
}

function onSelect(dish: typeof resultDish.value) {
  resultDish.value = dish
  showResult.value = true
}

function goToDetail() {
  showResult.value = false
  store.recordEaten(resultDish.value.id)
  router.push({ name: 'detail', params: { id: resultDish.value.id } })
}

function reSpin() {
  showResult.value = false
  setTimeout(() => onRequestSpin(), 300)
}
</script>

<template>
  <div class="h-full flex flex-col relative">
    <!-- Decorative top pattern -->
    <div class="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-secondary/40 to-transparent pointer-events-none"></div>

    <div class="flex-1 flex flex-col items-center justify-center px-5 relative">
      <div class="text-center mb-6">
        <p class="text-text-muted text-sm tracking-widest uppercase mb-2 font-serif">Random Dish</p>
        <h1 class="text-[32px] font-bold leading-tight tracking-tight">
          今天吃什么？
        </h1>
        <p class="text-text-muted text-sm mt-2">转一转，决定你的下一顿饭</p>
      </div>

      <SpinWheel
        v-if="hasDishes"
        ref="wheelRef"
        :dishes="store.dishes"
        @request-spin="onRequestSpin"
        @select="onSelect"
      />

      <div v-else class="text-center py-16">
        <div class="w-28 h-28 mx-auto mb-6 rounded-full bg-secondary/60 flex items-center justify-center shadow-elegant">
          <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#C17F4E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M16 12a4 4 0 0 1-8 0"/>
          </svg>
        </div>
        <p class="text-text-muted">还没有菜谱</p>
        <p class="text-text-muted text-sm mt-1">记录下你的拿手好菜吧</p>
        <button
          @click="$router.push({ name: 'add' })"
          class="mt-6 px-8 py-3 bg-primary text-white rounded-full text-sm font-medium shadow-elegant active:scale-95 transition-transform"
        >
          添加第一道菜
        </button>
      </div>
    </div>

    <!-- Result Modal -->
    <Teleport to="body">
      <Transition>
        <div
          v-if="showResult"
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          @click.self="showResult = false"
        >
          <div class="bg-surface rounded-[28px] p-7 w-full max-w-sm text-center shadow-elegant-lg animate-gentle-bounce"
          >
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/80 flex items-center justify-center">
              <span class="text-3xl">✨</span>
            </div>

            <p class="text-text-muted text-xs tracking-widest uppercase mb-1 font-serif">Today's Choice</p>
            <h2 class="text-2xl font-bold text-primary mb-1">{{ resultDish.name }}</h2>
            <p class="text-text-muted text-sm mb-5">就是它啦，动手做起来吧！</p>

            <div
              v-if="isRecent"
              class="mb-5 p-4 bg-amber-50/80 border border-amber-200/60 rounded-2xl text-sm text-amber-800"
            >
              <span class="inline-block mr-1">⚠️</span>
              这道菜最近刚吃过，确定要做吗？
            </div>

            <div class="flex gap-3">
              <button
                @click="goToDetail"
                class="flex-1 py-3.5 bg-primary text-white rounded-2xl text-sm font-bold shadow-elegant active:scale-95 transition-transform"
              >
                查看做法
              </button>
              <button
                v-if="isRecent"
                @click="reSpin"
                class="flex-1 py-3.5 bg-cream text-text rounded-2xl text-sm font-medium border border-border active:bg-secondary/50 transition-colors"
              >
                再转一次
              </button>
              <button
                v-else
                @click="showResult = false"
                class="flex-1 py-3.5 bg-cream text-text rounded-2xl text-sm font-medium border border-border active:bg-secondary/50 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.v-enter-from {
  opacity: 0;
}
.v-leave-to {
  opacity: 0;
}
</style>
