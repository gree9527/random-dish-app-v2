<script setup lang="ts">
import { ref, nextTick } from 'vue'

const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', steps: string[]): void
}>()

const newStep = ref('')
const editingIndex = ref<number | null>(null)
const editingText = ref('')
const editAreaRef = ref<HTMLTextAreaElement>()

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
  if (editingIndex.value === index) {
    editingIndex.value = null
    editingText.value = ''
  }
}

function moveStep(index: number, direction: number) {
  const next = [...props.modelValue]
  const target = index + direction
  if (target < 0 || target >= next.length) return
  const temp = next[index]
  next[index] = next[target]
  next[target] = temp
  emit('update:modelValue', next)
  if (editingIndex.value === index) {
    editingIndex.value = target
  } else if (editingIndex.value === target) {
    editingIndex.value = index
  }
}

function startEdit(index: number) {
  editingIndex.value = index
  editingText.value = props.modelValue[index]
  nextTick(() => {
    focusEdit(editAreaRef.value)
  })
}

function saveEdit() {
  if (editingIndex.value === null) return
  const text = editingText.value.trim()
  if (!text) return
  const next = [...props.modelValue]
  next[editingIndex.value] = text
  emit('update:modelValue', next)
  editingIndex.value = null
  editingText.value = ''
}

function cancelEdit() {
  editingIndex.value = null
  editingText.value = ''
}

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

function onEditInput(e: Event) {
  autoResize(e.target as HTMLTextAreaElement)
}

function onNewInput(e: Event) {
  autoResize(e.target as HTMLTextAreaElement)
}

function focusEdit(el: HTMLTextAreaElement | undefined) {
  if (!el) return
  nextTick(() => {
    el.focus()
    autoResize(el)
  })
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="(step, index) in modelValue"
      :key="index"
      class="flex items-center gap-2 bg-white border border-border/60 rounded-2xl py-2 px-3 shadow-elegant transition-all"
      :class="editingIndex === index ? 'ring-2 ring-primary/20 border-primary/30' : ''"
    >
      <span class="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold font-serif">
        {{ index + 1 }}
      </span>

      <div v-if="editingIndex === index" class="flex-1">
        <textarea
          ref="editAreaRef"
          v-model="editingText"
          rows="1"
          @input="onEditInput"
          class="w-full px-3 py-2 text-sm border border-primary/30 rounded-xl bg-paper focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed min-h-[3rem] overflow-hidden"
        ></textarea>
        <div class="flex gap-2 mt-2">
          <button
            @click="saveEdit"
            class="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold active:scale-95 transition-transform"
          >
            保存
          </button>
          <button
            @click="cancelEdit"
            class="px-3 py-1.5 border border-border rounded-lg text-xs text-text-muted active:bg-paper transition-colors"
          >
            取消
          </button>
        </div>
      </div>

      <template v-else>
        <p
          @click="startEdit(index)"
          class="flex-1 text-sm leading-relaxed cursor-text"
          style="white-space: pre-line"
        >{{ step }}</p>
        <div class="grid grid-cols-2 gap-0.5 self-center">
          <button v-if="index > 0" @click="moveStep(index, -1)" class="w-5 h-5 flex items-center justify-center rounded-md text-text-muted/60 hover:text-text hover:bg-paper transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
          </button>
          <button v-else class="w-5 h-5 invisible"></button>
          <button v-if="index < modelValue.length - 1" @click="moveStep(index, 1)" class="w-5 h-5 flex items-center justify-center rounded-md text-text-muted/60 hover:text-text hover:bg-paper transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <button v-else class="w-5 h-5 invisible"></button>
          <button @click="startEdit(index)" class="w-5 h-5 flex items-center justify-center rounded-md text-primary/60 hover:text-primary hover:bg-primary/5 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
          </button>
          <button @click="removeStep(index)" class="w-5 h-5 flex items-center justify-center rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </template>
    </div>

    <div class="flex gap-2 items-start">
      <textarea
        v-model="newStep"
        placeholder="输入步骤内容，点击添加"
        rows="1"
        @input="onNewInput"
        class="flex-1 px-4 py-3 border border-border/80 rounded-2xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-elegant resize-none leading-relaxed min-h-[3rem] overflow-hidden"
      ></textarea>
      <button
        @click="addStep"
        class="px-5 py-3 bg-primary text-white rounded-2xl text-sm font-bold shadow-elegant active:scale-95 active:bg-primary-dark transition-all"
      >
        添加
      </button>
    </div>
  </div>
</template>
