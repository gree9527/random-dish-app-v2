<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useDishStore } from '../stores/dishStore'
import DishCard from '../components/DishCard.vue'

const store = useDishStore()
const router = useRouter()

function goToDetail(id: string) {
  router.push({ name: 'detail', params: { id } })
}

function goToAdd() {
  router.push({ name: 'add' })
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="px-5 pt-5 pb-3 flex items-center justify-between">
      <div>
        <p class="text-text-muted text-xs tracking-widest uppercase font-serif">My Recipes</p>
        <h1 class="text-2xl font-bold mt-0.5">我的菜谱</h1>
      </div>
      <button
        @click="goToAdd"
        class="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shadow-elegant active:scale-90 transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
      </button>
    </div>

    <div v-if="store.dishCount === 0" class="flex-1 flex flex-col items-center justify-center text-center px-8">
      <div class="w-24 h-24 mb-5 rounded-full bg-secondary/50 flex items-center justify-center shadow-elegant">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C17F4E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
      </div>
      <p class="text-text-muted">还没有记录任何菜谱</p>
      <p class="text-text-muted text-sm mt-1">点击右上角按钮添加你的拿手菜</p>
    </div>

    <div v-else class="flex-1 overflow-y-auto px-5 pb-5">
      <div class="grid grid-cols-2 gap-4 stagger-children">
        <DishCard
          v-for="dish in store.dishList"
          :key="dish.id"
          :dish="dish"
          @click="goToDetail(dish.id)"
        />
      </div>
    </div>
  </div>
</template>
