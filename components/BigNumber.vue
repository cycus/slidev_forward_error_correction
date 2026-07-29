<script setup lang="ts">
import { computed } from 'vue'

// Hero stat display: a big figure with a label and optional source line.
// `color` picks a semantic token (see styles/CONVENTIONS.md); default is fg.
const props = withDefaults(defineProps<{
  value: string | number
  label?: string
  source?: string
  color?: 'info' | 'parity' | 'error' | 'corrected' | 'frozen' | 'trivia' | 'default'
}>(), { label: '', source: '', color: 'default' })

const colorVar = computed(() =>
  props.color === 'default' ? 'var(--fec-fg)' : `var(--fec-${props.color})`,
)
</script>

<template>
  <div class="big-number">
    <div class="bn-value fec-tnum" :style="{ color: colorVar }">{{ value }}</div>
    <div v-if="label" class="bn-label">{{ label }}</div>
    <div v-if="source" class="bn-source">{{ source }}</div>
  </div>
</template>

<style scoped>
.big-number {
  display: inline-flex;
  flex-direction: column;
  gap: 0.15rem;
}
.bn-value {
  font-size: 3.2rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.02em;
}
.bn-label {
  font-size: 1rem;
  color: var(--fec-fg);
  max-width: 26ch;
}
.bn-source {
  font-size: 0.72rem;
  color: var(--fec-muted);
}
</style>
