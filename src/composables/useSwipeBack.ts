import { onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

const TAB_PAGES = ['home', 'list', 'settings']

export function useSwipeBack() {
  const router = useRouter()
  const route = useRoute()
  let startX = 0
  let startY = 0
  let startTime = 0

  const EDGE_THRESHOLD = 28
  const SWIPE_THRESHOLD = 72
  const TIME_THRESHOLD = 450

  function onTouchStart(e: TouchEvent) {
    const touch = e.touches[0]
    if (touch.clientX > EDGE_THRESHOLD) return
    startX = touch.clientX
    startY = touch.clientY
    startTime = Date.now()
  }

  function onTouchEnd(e: TouchEvent) {
    const touch = e.changedTouches[0]
    const dx = touch.clientX - startX
    const dy = touch.clientY - startY
    const dt = Date.now() - startTime

    if (
      dx > SWIPE_THRESHOLD &&
      dt < TIME_THRESHOLD &&
      Math.abs(dy) < Math.abs(dx) * 0.6
    ) {
      if (TAB_PAGES.includes(route.name as string)) {
        if (Capacitor.isNativePlatform()) {
          App.exitApp()
        }
      } else if (window.history.length > 1) {
        router.back()
      }
    }
  }

  onMounted(() => {
    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
  })

  onUnmounted(() => {
    document.removeEventListener('touchstart', onTouchStart)
    document.removeEventListener('touchend', onTouchEnd)
  })
}
