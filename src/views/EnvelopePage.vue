<template>
  <div class="page">
    <h1 class="title">Message</h1>

    <div class="envelope" @click="toggleOpen" :class="{ open: isOpen }">

      <div class="base"></div>

      <div class="letter" v-if="isOpen" ref="letterEl">
        <p class="message-text">{{ message }}</p>
      </div>

      <div
        class="photos"
        v-if="isOpen && photos.length"
        :style="{ transform: `translateY(${photosOffset}px)` }"
      >
        <div
          v-for="(photo, index) in photos"
          :key="index"
          class="photo"
          :style="{ animationDelay: (0.2 + index * 0.2) + 's' }"
        >
          <div class="photo-inner" @click.stop="toggleEnlarge(index)">
            <img :src="photo" />
          </div>
        </div>
      </div>

      <div class="front"></div>
      <div class="flap"></div>

    </div>

    <teleport to="body">
      <transition name="fade">
        <div
          v-if="enlargedIndex !== null"
          class="lightbox-backdrop"
          @click="closeEnlarge"
        >
          <div class="lightbox-card" @click.stop>
            <img :src="photos[enlargedIndex]" />
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script>
import { getKeychain } from '../services/api.js'

export default {
  data() {
    return {
      isOpen: false,
      message: '',
      photos: [],
      photosOffset: 0,
      resizeObserver: null,
      enlargedIndex: null
    }
  },

  async created() {
    const code = this.$route.params.code
    if (!code) return

    const data = await getKeychain(code)
    if (data) {
      this.message = data.message || this.message
      this.photos = [data.image1, data.image2, data.image3].filter(Boolean)
    }
  },

  beforeUnmount() {
    if (this.resizeObserver) this.resizeObserver.disconnect()
  },

  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.$nextTick(() => this.observeLetter())
      } else {
        if (this.resizeObserver) this.resizeObserver.disconnect()
        this.enlargedIndex = null
      }
    }
  },

  methods: {
    toggleOpen() { this.isOpen = !this.isOpen },

    toggleEnlarge(index) {
      this.enlargedIndex = this.enlargedIndex === index ? null : index
    },

    closeEnlarge() {
      this.enlargedIndex = null
    },

    observeLetter() {
      const el = this.$refs.letterEl
      if (!el) return

      const BASE_LETTER_HEIGHT = 176 // 80% der Envelope-Höhe (220px)

      const updateOffset = () => {
        this.photosOffset = Math.max(0, el.offsetHeight - BASE_LETTER_HEIGHT)
      }

      updateOffset()

      if (this.resizeObserver) this.resizeObserver.disconnect()
      this.resizeObserver = new ResizeObserver(updateOffset)
      this.resizeObserver.observe(el)
    }
  },
}
</script>

<style>
.title {
  color:  #eccba0;
}

.page {
  text-align: center;
  padding: 40px;
  background: linear-gradient(to bottom, #ffe6f0, #fff);
  min-height: 100vh;
}

.message-text {
  white-space: pre-line;
  line-height: 1.5;
  font-size: 14px;
  text-align: left;
  color: #444;
  overflow-wrap: break-word;
  word-break: break-word;
  margin: 0;
}

/* Container */
.envelope {
  position: relative;
  width: 320px;
  height: 220px;
  margin: 60px auto;
  perspective: 1200px;
}

/* Base */
.base {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #e0c097;
  border-radius: 6px;
  z-index: 1;
}

/* Letter (JETZT über Base, aber unter Flap) */
.letter {
  position: absolute;
  width: 90%;
  min-height: 80%;
  height: auto;
  top: 10%;
  left: 5%;
  background: white;
  border-radius: 4px;
  padding: 15px;
  box-sizing: border-box;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  z-index: 2;
  animation: slideUp 0.6s ease;
}

/* Front */
.front {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #f5deb3;
  clip-path: polygon(0 0, 100% 0, 50% 60%);
  z-index: 3;
}

/* Flap */
.flap {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #d8b98a;
  clip-path: polygon(0 0, 100% 0, 50% 60%);
  transform-origin: top;
  transition: transform 0.8s ease;
  z-index: 4;
}

/* Open animation */
.envelope.open .flap {
  transform: rotateX(180deg);
}

.envelope.open .letter {
  z-index: 5; /* Brief kommt nach vorne */
}

.photos {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 4;
  pointer-events: none;
  transition: transform 0.3s ease;
}

.photo {
  position: absolute;
  width: 90px;
  height: 110px;
  opacity: 0;
  transform: translateY(40px) scale(0.8);
  pointer-events: auto;
}

.photo-inner {
  width: 100%;
  height: 100%;
  background: white;
  padding: 6px;
  box-sizing: border-box;
  box-shadow: 0 8px 20px rgba(0,0,0,0.25);
  border-radius: 4px;
  cursor: pointer;
  transform-origin: center center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* Kleines Hover-Feedback am Desktop, die eigentliche Vergrösserung passiert in der Lightbox */
@media (hover: hover) {
  .photo-inner:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 25px rgba(0,0,0,0.3);
  }
}

/* Bild drin */
.photo img {
  width: 100%;
  height: 80%;
  object-fit: cover;
  border-radius: 2px;
}

.photo:nth-child(1) {
  left: 0%;
  top: 130%;
}

.photo:nth-child(2) {
  left: 40%;
  top: 120%;
}

.photo:nth-child(3) {
  left: 80%;
  top: 135%;
}

/* Animation */
.envelope.open .photo {
  animation: popPhoto 0.8s forwards;
}

@keyframes popPhoto {
  0% {
    opacity: 0;
    transform: translateY(50px) scale(0.7) rotate(0deg);
  }
  60% {
    opacity: 1;
    transform: translateY(-20px) scale(1.05) rotate(var(--rot));
  }
  100% {
    opacity: 1;
    transform: translateY(-40px) scale(1) rotate(var(--rot));
  }
}

@keyframes slideUp {
  0% {
    transform: translateY(60px) scale(0.95);
    opacity: 0;
  }
  60% {
    transform: translateY(-10px) scale(1.02);
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .page {
    padding: 10px;
  }

  .envelope {
    margin: 20px auto;
    margin-top: 40%;
  }

  .letter {
    padding: 10px;
  }

  .photo {
    width: 70px;
    height: 90px;
  }

  .photo:nth-child(1) {
    left: 5%;
    top: 110%;
  }

  .photo:nth-child(2) {
    left: 35%;
    top: 105%;
  }

  .photo:nth-child(3) {
    left: 65%;
    top: 110%;
  }
}

/* Lightbox */
.lightbox-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
  box-sizing: border-box;
}

.lightbox-card {
  background: white;
  padding: 14px 14px 22px;
  border-radius: 6px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  max-width: min(90vw, 420px);
  width: 100%;
  animation: popIn 0.25s ease;
}

.lightbox-card img {
  display: block;
  width: 100%;
  max-height: 75vh;
  object-fit: contain;
  border-radius: 3px;
}

@keyframes popIn {
  0% {
    transform: scale(0.85);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>