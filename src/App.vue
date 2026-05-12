<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()

const showTabBar = computed(() => {
  return ['home', 'list', 'settings'].includes(route.name as string)
})

const tabs = [
  { name: 'home', label: '转盘', icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16z' },
  { name: 'list', label: '菜谱', icon: 'M4 6h16M4 10h16M4 14h16M4 18h12' },
  { name: 'settings', label: '设置', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' },
]

function onTabClick(name: string) {
  router.push({ name })
}
</script>

<template>
  <div class="h-full flex flex-col paper-texture">
    <main class="flex-1 overflow-y-auto safe-top">
      <RouterView />
    </main>

    <nav
      v-if="showTabBar"
      class="flex-shrink-0 bg-surface/90 backdrop-blur-md border-t border-border/60 shadow-elegant z-50"
    >
      <div class="flex items-center px-2 pt-3 tab-safe">
        <button
          v-for="tab in tabs"
          :key="tab.name"
          @click="onTabClick(tab.name)"
          class="flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-2xl transition-all duration-300"
          :class="route.name === tab.name
            ? 'text-primary bg-primary/8 scale-105'
            : 'text-text-muted hover:text-text/70'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path :d="tab.icon" />
          </svg>
          <span class="text-[11px] font-medium tracking-wide">{{ tab.label }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>
