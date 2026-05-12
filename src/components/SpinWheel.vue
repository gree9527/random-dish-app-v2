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

const isSpinning = ref(false)
const rotation = ref(0)

const wheelDishes = computed(() => props.dishes)

const sectorAngle = computed(() => {
  const count = wheelDishes.value.length
  if (count === 0) return 0
  return 360 / count
})
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

function getColorForDish(dishId: string): string {
  const originalIndex = props.dishes.findIndex((d) => d.id === dishId)
  return colors[(originalIndex >= 0 ? originalIndex : 0) % colors.length]
}

const wheelStyle = computed(() => {
  const style: Record<string, string> = {
    transform: `rotate(${rotation.value}deg)`,
    transition: isSpinning.value ? 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
  }
  const count = wheelDishes.value.length
  if (count === 0) return style
  if (count === 1) {
    style.backgroundColor = getColorForDish(wheelDishes.value[0].id)
    return style
  }
  const stops: string[] = []
  let current = 0
  for (let i = 0; i < count; i++) {
    const next = current + sectorAngle.value
    const color = getColorForDish(wheelDishes.value[i].id)
    stops.push(`${color} ${current}deg, ${color} ${next}deg`)
    current = next
  }
  style.background = `conic-gradient(from 0deg, ${stops.join(', ')})`
  return style
})

function getLabelStyle(index: number) {
  const angle = sectorAngle.value
  const count = wheelDishes.value.length
  const radius = count <= 2 ? 30 : 36
  let midAngle: number
  if (count === 1) {
    midAngle = 0
  } else {
    midAngle = (index * angle + angle / 2) * (Math.PI / 180)
  }
  return {
    transform: `translate(-50%, -50%)`,
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
      :style="wheelStyle"
    >
      <!-- Labels -->
      <div class="absolute inset-0">
        <div
          v-for="(dish, index) in wheelDishes"
          :key="`label-${index}`"
          class="absolute text-[9px] font-bold text-white/90 text-center overflow-hidden text-ellipsis whitespace-nowrap leading-tight"
          style="max-width: 60px"
          :style="getLabelStyle(index)"
        >
          {{ dish.name }}
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
