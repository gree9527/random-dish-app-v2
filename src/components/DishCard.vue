<script setup lang="ts">
import type { Dish } from '../types/dish'
import { useFilesystem } from '../composables/useFilesystem'

const props = defineProps<{
  dish: Dish
}>()

const fs = useFilesystem()
</script>

<template>
  <div class="bg-white rounded-[20px] overflow-hidden shadow-elegant border border-border/40 active:scale-[0.97] transition-all duration-200">
    <div class="aspect-square bg-paper overflow-hidden relative">
      <img
        v-if="dish.thumbnailPath"
        :src="fs.convertToWebPath(dish.thumbnailPath)"
        class="w-full h-full object-cover"
        loading="lazy"
        :alt="dish.name"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-text-muted/50">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
      </div>

      <!-- Rating badge -->
      <div v-if="dish.rating" class="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-bold text-amber-500 shadow-sm">
        {{ '★'.repeat(dish.rating) }}
      </div>
    </div>
    <div class="p-3.5">
      <h3 class="font-bold text-sm truncate text-text">{{ dish.name }}</h3>
      <div class="flex items-center justify-between mt-1.5">
        <p class="text-[11px] text-text-muted">{{ dish.steps.length }} 个步骤</p>
        <div v-if="dish.category?.length" class="flex gap-1">
          <span
            v-for="cat in dish.category.slice(0, 2)"
            :key="cat"
            class="text-[9px] px-1.5 py-0.5 bg-secondary/70 text-accent rounded-full font-medium"
          >{{ cat }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
