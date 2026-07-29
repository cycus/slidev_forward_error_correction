<script setup lang="ts">
// Full-slide part cover: eyebrow (Part N · year), title, one-line thesis, and
// 7 progress dots (one per content part). part=0 renders the Prologue with no
// dot filled. See styles/CONVENTIONS.md.
const props = withDefaults(defineProps<{
  part: number
  title: string
  thesis?: string
  year?: string | number
}>(), { thesis: '', year: '' })

const totalParts = 7
const dots = Array.from({ length: totalParts }, (_, i) => i + 1)
</script>

<template>
  <div class="section-cover">
    <div class="sc-eyebrow">
      <span class="sc-part">{{ part === 0 ? 'Prologue' : `Part ${part}` }}</span>
      <span v-if="year" class="sc-year">{{ year }}</span>
    </div>
    <h1 class="sc-title">{{ title }}</h1>
    <p v-if="thesis" class="sc-thesis">{{ thesis }}</p>
    <div class="sc-dots" aria-hidden="true">
      <span
        v-for="d in dots"
        :key="d"
        class="sc-dot"
        :class="{ 'is-active': d === part, 'is-done': d < part }"
      />
    </div>
    <slot />
  </div>
</template>

<style scoped>
.section-cover {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 1.1rem;
  padding: 0 5rem;
  color: var(--fec-fg);
}
.sc-eyebrow {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--fec-info);
}
.sc-year {
  color: var(--fec-muted);
  font-variant-numeric: tabular-nums;
}
.sc-year::before {
  content: '·';
  margin-right: 0.75rem;
  color: var(--fec-line);
}
.sc-title {
  margin: 0;
  font-size: 3.4rem;
  line-height: 1.05;
  font-weight: 700;
}
.sc-thesis {
  margin: 0;
  max-width: 42ch;
  font-size: 1.35rem;
  line-height: 1.4;
  color: var(--fec-muted);
}
.sc-dots {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.75rem;
}
.sc-dot {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 999px;
  background: var(--fec-line);
  transition: all 0.3s ease;
}
.sc-dot.is-done {
  background: var(--fec-frozen);
}
.sc-dot.is-active {
  background: var(--fec-info);
  transform: scale(1.35);
  box-shadow: 0 0 0 4px var(--fec-info-soft);
}
</style>
