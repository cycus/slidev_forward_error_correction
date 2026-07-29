<script setup lang="ts">
import { computed } from 'vue'

// Tiny footnote bar for citations, pinned to the slide bottom. Every slide with
// a quantitative claim uses it. Accepts an array of [label, url] tuples (url
// optional), {label, url} objects, or a single string.
type Ref = [string, string?] | { label: string, url?: string } | string
const props = defineProps<{ refs: Ref[] | string }>()

const items = computed(() => {
  const raw = typeof props.refs === 'string' ? [props.refs] : props.refs
  return raw.map((r) => {
    if (typeof r === 'string') return { label: r, url: undefined }
    if (Array.isArray(r)) return { label: r[0], url: r[1] }
    return r
  })
})
</script>

<template>
  <footer class="source-foot">
    <span class="sf-tag">Sources</span>
    <span class="sf-list">
      <template v-for="(it, i) in items" :key="i">
        <a v-if="it.url" :href="it.url" target="_blank" rel="noopener" class="sf-item">{{ it.label }}</a>
        <span v-else class="sf-item">{{ it.label }}</span>
        <span v-if="i < items.length - 1" class="sf-sep">·</span>
      </template>
    </span>
  </footer>
</template>

<style scoped>
.source-foot {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 1.4rem;
  font-size: 0.72rem;
  line-height: 1.3;
  color: var(--fec-muted);
  border-top: 1px solid var(--fec-line);
  background: color-mix(in srgb, var(--fec-surface) 70%, transparent);
  backdrop-filter: blur(2px);
}
.sf-tag {
  flex: none;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-size: 0.62rem;
  color: var(--fec-info);
}
.sf-list {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sf-item {
  color: inherit;
}
a.sf-item:hover {
  color: var(--fec-info);
  text-decoration: underline;
}
.sf-sep {
  margin: 0 0.4rem;
  color: var(--fec-line);
}
</style>
