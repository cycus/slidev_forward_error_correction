<script setup lang="ts">
// Graceful placeholder for an interactive component that hasn't landed yet.
// Slide tasks (T02/T04) embed the real component's slot with a SimStub so the
// deck builds and exports cleanly before the component task (T03/T05) merges.
// When the real component arrives, swap `<SimStub .../>` for `<TheComponent .../>`.
// Static + theme-aware ⇒ exports fine to PDF (no live canvas to gate).
withDefaults(defineProps<{
  name: string
  task?: string
  note?: string
  height?: string
}>(), { task: '', note: '', height: '15rem' })
</script>

<template>
  <div class="sim-stub" :style="{ minHeight: height }">
    <div class="ss-badge">
      <div class="i-carbon-touch-interaction ss-icon" />
      <span>Interactive</span>
    </div>
    <div class="ss-name">{{ name }}</div>
    <p v-if="note" class="ss-note">{{ note }}</p>
    <div v-if="task" class="ss-task">lands in {{ task }}</div>
  </div>
</template>

<style scoped>
.sim-stub {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1.5rem;
  border: 2px dashed var(--fec-info);
  border-radius: var(--fec-radius);
  background: var(--fec-info-soft);
  color: var(--fec-fg);
  text-align: center;
}
.ss-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--fec-info);
}
.ss-icon { font-size: 1rem; }
.ss-name {
  font-family: var(--slidev-code-font-family, monospace);
  font-size: 1.4rem;
  font-weight: 700;
}
.ss-note {
  margin: 0;
  max-width: 46ch;
  font-size: 0.95rem;
  line-height: 1.4;
  color: var(--fec-muted);
}
.ss-task {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--fec-info);
  opacity: 0.85;
}
</style>
