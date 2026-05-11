<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Dish } from '../types/dish'

const props = defineProps<{
  dishes: Dish[]
}>()

const emit = defineEmits<{
  (e: 'select', dish: Dish): void
  (e: 'request-spin'): void
}>()

const MIN_SECTORS = 8
const isSpinning = ref(false)
const rotation = ref(0)

const wheelDishes = computed(() => {
  const list = props.dishes
  if (list.length === 0) return []
  if (list.length >= MIN_SECTORS) return list
  const result: Dish[] = []
  while (result.length < MIN_SECTORS) {
    result.push(...list)
  }
  return result.slice(0, Math.max(MIN_SECTORS, list.length))
})

const sectorAngle = computed(() => 360 / wheelDishes.value.length)
const colors = [
  '#D4652A', '#C17F4E', '#D4855A', '#C46B3A',
  '#B87333', '#CD7F32', '#D4652A', '#B8692A',
]

function spin(targetIndex: number) {
  if (isSpinning.value || wheelDishes.value.length === 0) return
  isSpinning.value = true
  const extraRounds = 5
  const targetAngle = 360 * extraRounds + (360 - targetIndex * sectorAngle.value - sectorAngle.value / 2)
  rotation.value += targetAngle

  setTimeout(() => {
    isSpinning.value = false
    const actualIndex = targetIndex % props.dishes.length
    emit('select', props.dishes[actualIndex])
  }, 4000)
}

function onRequestSpin() {
  if (props.dishes.length === 0) return
  emit('request-spin')
}

function getIndexByDishId(id: string): number {
  return wheelDishes.value.findIndex((d) => d.id === id)
}

function getSectorStyle(index: number) {
  const angle = sectorAngle.value
  return {
    transform: `rotate(${index * angle}deg)`,
    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((angle * Math.PI) / 180)}% ${50 - 50 * Math.cos((angle * Math.PI) / 180)}%)`,
    backgroundColor: colors[index % colors.length],
  }
}

function getLabelStyle(index: number) {
  const angle = sectorAngle.value
  const midAngle = (index * angle + angle / 2) * (Math.PI / 180)
  const radius = 36
  return {
    transform: `translate(-50%, -50%) rotate(${angle / 2}deg)`,
    left: `${50 + radius * Math.sin(midAngle)}%`,
    top: `${50 - radius * Math.cos(midAngle)}%`,
  }
}

defineExpose({ spin, getIndexByDishId })
</script>

<template>
  <div class="relative w-[280px] h-[280px] mx-auto my-6">
    <!-- Outer decorative ring -->
    <div class="absolute -inset-3 rounded-full border-2 border-dashed border-border/60"></div>

    <!-- Pointer -->
    <div class="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-1 z-30">
      <div class="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[24px] border-l-transparent border-r-transparent border-t-primary drop-shadow-md"></div>
    </div>

    <!-- Wheel -->
    <div
      class="w-full h-full rounded-full relative overflow-hidden border-[6px] border-white shadow-elegant-lg"
      :style="{ transform: `rotate(${rotation}deg)`, transition: isSpinning ? 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none' }"
    >
      <!-- Sectors -->
      <div
        v-for="(_dish, index) in wheelDishes"
        :key="index"
        class="absolute w-full h-full origin-bottom-right"
        :style="getSectorStyle(index)"
      ></div>

      <!-- Divider lines -->
      <div class="absolute inset-0">
        <div
          v-for="i in wheelDishes.length"
          :key="`line-${i}`"
          class="absolute top-0 left-1/2 w-[1px] h-1/2 bg-white/20 origin-bottom"
          :style="{ transform: `translateX(-50%) rotate(${(i - 1) * sectorAngle}deg)` }"
        ></div>
      </div>

      <!-- Labels -->
      <div class="absolute inset-0">
        <div
          v-for="(dish, index) in wheelDishes"
          :key="`label-${index}`"
          class="absolute text-[11px] font-bold text-white/90 whitespace-nowrap origin-center tracking-wide"
          :style="getLabelStyle(index)"
        >
          {{ dish.name.slice(0, 3) }}
        </div>
      </div>

      <!-- Center hole shadow -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/10"></div>
    </div>

    <!-- Center button -->
    <button
      @click="onRequestSpin"
      :disabled="isSpinning || dishes.length === 0"
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[72px] h-[72px] rounded-full bg-white text-primary font-bold text-base shadow-elegant-lg active:scale-90 disabled:opacity-50 disabled:active:scale-100 z-20 border-4 border-secondary transition-transform"
    >
      <span v-if="isSpinning" class="inline-block animate-spin">⟳</span>
      <span v-else>开始</span>
    </button>
  </div>
</template>
