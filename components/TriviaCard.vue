<script setup lang="ts">
// Visually distinct "did you know" card. Non-semantic violet accent so it never
// reads as parity/error. Body is the default slot; icon overridable via the
// #icon slot (keep icon usage literal so UnoCSS presetIcons can detect it).
// Source line either via the `source` prop or the #source slot.
withDefaults(defineProps<{
  title?: string
  source?: string
}>(), { title: 'Did you know?', source: '' })
</script>

<template>
  <aside class="trivia-card">
    <div class="tc-head">
      <div class="tc-icon">
        <slot name="icon"><div class="i-carbon-idea" /></slot>
      </div>
      <div class="tc-title">{{ title }}</div>
    </div>
    <div class="tc-body"><slot /></div>
    <div v-if="source || $slots.source" class="tc-source">
      <slot name="source">{{ source }}</slot>
    </div>
  </aside>
</template>

<style scoped>
.trivia-card {
  border: 1px solid var(--fec-trivia);
  border-left-width: 5px;
  border-radius: var(--fec-radius);
  background: var(--fec-trivia-soft);
  padding: 1rem 1.2rem;
  box-shadow: var(--fec-shadow);
  color: var(--fec-fg);
}
.tc-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.5rem;
}
.tc-icon {
  display: grid;
  place-items: center;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 999px;
  background: var(--fec-trivia);
  color: #fff;
  font-size: 1.15rem;
}
.tc-title {
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fec-trivia);
}
.tc-body {
  font-size: 1.05rem;
  line-height: 1.45;
}
.tc-body :deep(p) {
  margin: 0.25rem 0;
}
.tc-source {
  margin-top: 0.6rem;
  font-size: 0.78rem;
  color: var(--fec-muted);
}
.tc-source :deep(a) {
  color: var(--fec-trivia);
}
</style>
