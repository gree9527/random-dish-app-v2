import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Dish, DishInput } from '../types/dish'

const STORAGE_KEY = 'random-dish-app-dishes'

function loadDishes(): Dish[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveDishes(dishes: Dish[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dishes))
}

function weightedRandomIndex(weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0)
  let rnd = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    rnd -= weights[i]
    if (rnd <= 0) return i
  }
  return weights.length - 1
}

export const useDishStore = defineStore('dish', () => {
  const dishes = ref<Dish[]>(loadDishes())

  const dishCount = computed(() => dishes.value.length)

  const dishList = computed(() =>
    [...dishes.value].sort((a, b) => b.createdAt - a.createdAt)
  )

  function getById(id: string): Dish | undefined {
    return dishes.value.find((d) => d.id === id)
  }

  function addDish(input: DishInput, imagePath: string, thumbnailPath: string): Dish {
    const dish: Dish = {
      id: uuidv4(),
      ...input,
      imagePath,
      thumbnailPath,
      createdAt: Date.now(),
      lastEatenAt: undefined,
    }
    dishes.value.push(dish)
    saveDishes(dishes.value)
    return dish
  }

  function updateDish(id: string, input: Partial<DishInput> & { imagePath?: string; thumbnailPath?: string }) {
    const idx = dishes.value.findIndex((d) => d.id === id)
    if (idx === -1) return
    const existing = dishes.value[idx]
    dishes.value[idx] = { ...existing, ...input }
    saveDishes(dishes.value)
  }

  function removeDish(id: string) {
    dishes.value = dishes.value.filter((d) => d.id !== id)
    saveDishes(dishes.value)
  }

  function recordEaten(id: string) {
    const idx = dishes.value.findIndex((d) => d.id === id)
    if (idx !== -1) {
      dishes.value[idx].lastEatenAt = Date.now()
      saveDishes(dishes.value)
    }
  }

  function spinWheel(): { dish: Dish; isRecent: boolean } | null {
    if (dishes.value.length === 0) return null

    const weights = dishes.value.map((d) => {
      const base = d.rating ?? 3
      let bonus = 0
      if (d.lastEatenAt) {
        const days = (Date.now() - d.lastEatenAt) / (1000 * 60 * 60 * 24)
        bonus = Math.min(Math.floor(days), 7)
      } else {
        bonus = 7
      }
      return base + bonus
    })

    const index = weightedRandomIndex(weights)
    const dish = dishes.value[index]
    const isRecent = dish.lastEatenAt ? (Date.now() - dish.lastEatenAt) < 2 * 24 * 60 * 60 * 1000 : false
    return { dish, isRecent }
  }

  function clearAll() {
    dishes.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  function importDishes(newDishes: Dish[]) {
    dishes.value = newDishes
    saveDishes(dishes.value)
  }

  return {
    dishes,
    dishCount,
    dishList,
    getById,
    addDish,
    updateDish,
    removeDish,
    recordEaten,
    spinWheel,
    clearAll,
    importDishes,
  }
})
