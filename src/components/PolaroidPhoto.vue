<script setup lang="ts">
import deleteIcon from '../assets/delete.svg'

interface Props {
  src: string
  tilt?: string
  showDelete?: boolean
  size?: 'sm' | 'lg'
}

withDefaults(defineProps<Props>(), {
  tilt: '0deg',
  showDelete: true,
  size: 'sm',
})

const emit = defineEmits<{
  (e: 'delete'): void
}>()
</script>

<template>
  <div class="polaroid" :class="size" :style="{ '--tilt': tilt }">
    <span class="polaroid__tape"></span>

    <img class="polaroid__image" :src="src" alt="" />

    <button
      v-if="showDelete"
      class="polaroid__delete"
      type="button"
      aria-label="Bild löschen"
      @click="emit('delete')"
    >
      <img :src="deleteIcon" alt="" />
    </button>
  </div>
</template>

<style scoped>
.polaroid {
  position: relative;
  width: 108px;
  background: #fff;
  padding: 8px 8px 22px;
  box-shadow: 0 10px 18px rgba(43, 36, 29, 0.18);
  transform: rotate(var(--tilt));
  transition: transform 0.2s ease;
}

.polaroid:hover {
  transform: rotate(0deg) scale(1.05);
  z-index: 1;
}

.polaroid.lg {
  width: min(80vw, 320px);
  padding: 14px 14px 34px;
}

.polaroid.lg .polaroid__image {
  height: min(70vh, 300px);
}

.polaroid.lg .polaroid__tape {
  width: 60px;
  height: 22px;
  top: -12px;
}

.polaroid__image {
  display: block;
  width: 100%;
  height: 96px;
  object-fit: cover;
}

.polaroid__tape {
  position: absolute;
  top: -9px;
  left: 50%;
  width: 42px;
  height: 16px;
  background: rgba(244, 221, 225, 0.85);
  border: 1px solid rgba(184, 70, 90, 0.15);
  transform: translateX(-50%) rotate(-3deg);
}

.polaroid__delete {
  position: absolute;
  top: -6px;
  right: -6px;
  border: 1px solid var(--line);
  background: white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: transform 0.1s ease;
}

.polaroid__delete:hover {
  transform: scale(1.08);
  border-color: var(--accent);
}

.polaroid__delete img {
  width: 11px;
  height: 11px;
}
</style>