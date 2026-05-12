<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', steps: string[]): void
}>()

const newStep = ref('')

function addStep() {
  const text = newStep.value.trim()
  if (!text) return
  emit('update:modelValue', [...props.modelValue, text])
  newStep.value = ''
}

function removeStep(index: number) {
  const next = [...props.modelValue]
  next.splice(index, 1)
  emit('update:modelValue', next)
}

function moveStep(index: number, direction: number) {
  const next = [...props.modelValue]
  const target = index + direction
  if (target < 0 || target >= next.length) return
  const temp = next[index]
  next[index] = next[target]
  next[target] = temp
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="(step, index) in modelValue"
      :key="index"
      class="flex items-start gap-3 bg-white border border-border/60 rounded-2xl p-4 shadow-elegant active:shadow-none active:scale-[0.99] transition-all"
    >
      <span class="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold font-serif mt-0.5">
        {{ index + 1 }}
      </span>
      <p class="flex-1 text-sm leading-relaxed pt-1">{{ step }}</p>
      <div class="flex flex-col gap-0.5">
        <button v-if="index > 0" @click="moveStep(index, -1)" class="text-text-muted/60 hover:text-text p-1 rounded-lg hover:bg-paper transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
        </button>
        <button v-if="index < modelValue.length - 1" @click="moveStep(index, 1)" class="text-text-muted/60 hover:text-text p-1 rounded-lg hover:bg-paper transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <button @click="removeStep(index)" class="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
    </div>

    <div class="flex gap-2">
      <input
        v-model="newStep"
        @keydown.enter="addStep"
        placeholder="输入步骤内容，按回车添加"
        class="flex-1 px-4 py-3 border border-border/80 rounded-2xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-elegant"
      />
      <button
        @click="addStep"
        class="px-5 py-3 bg-primary text-white rounded-2xl text-sm font-bold shadow-elegant active:scale-95 active:bg-primary-dark transition-all"
      >
        添加
      </button>
    </div>
  </div>
</template>
