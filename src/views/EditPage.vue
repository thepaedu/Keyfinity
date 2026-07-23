<template>
  <div class="edit-page">
    <header class="edit-page__header">
      <img :src="logo" alt="Logo" class="edit-page__logo" />
    </header>

    <div class="letter">
      <section class="letter__section">
        <p class="eyebrow">01 — Nachricht</p>
        <h3 class="letter__heading">Was möchtest du sagen?</h3>
        <textarea
          v-model="message"
          rows="6"
          class="letter__textarea"
          :maxlength="maxChars"
          placeholder="Schreib deine Worte…"
        />
        <p class="meta-text" :class="{ 'meta-text--warn': message.length >= maxChars * 0.9 }">
          {{ message.length }} / {{ maxChars }} Zeichen
        </p>
      </section>

      <div class="divider" aria-hidden="true"></div>

      <section class="letter__section">
        <p class="eyebrow">02 — Fotos</p>
        <h3 class="letter__heading">Erinnerungen beilegen</h3>
        <p class="meta-text">{{ images.length }} / 3 Fotos</p>

        <label class="dropzone" :class="{ 'dropzone--disabled': images.length >= 3 }">
          <input
            type="file"
            multiple
            accept="image/*"
            @change="handleImages"
            :disabled="images.length >= 3"
          />
          <span class="dropzone__plus">+</span>
          <span class="dropzone__label">
            {{ images.length >= 3 ? 'Maximum erreicht' : 'Fotos auswählen' }}
          </span>
        </label>

        <p v-if="isLoadingImages" class="meta-text meta-text--loading">Bilder werden verarbeitet…</p>

        <div v-if="images.length" class="polaroids">
          <PolaroidPhoto
            v-for="(img, index) in images"
            :key="index"
            :src="img"
            :tilt="tiltFor(index)"
            @delete="removeImage(index)"
          />
        </div>
      </section>
    </div>

    <div class="actions-bar">
      <p v-if="errorMsg" class="error-note">{{ errorMsg }}</p>
      <div class="actions-bar__row">
        <button class="btn btn--primary" @click="save" :disabled="isLoadingImages || isSaving">
          {{ isSaving ? 'Wird gespeichert…' : isLoadingImages ? 'Lade Bilder…' : 'Speichern' }}
        </button>
        <router-link :to="`/${code}`">
          <button class="btn btn--ghost">Zurück</button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { createKeychain, getKeychain, updateKeychain } from '../services/api.js'
import deleteIcon from '../assets/delete.svg'
import logo from '../assets/logo.png'
import PolaroidPhoto from '../components/PolaroidPhoto.vue'

export default {

  components: {
  PolaroidPhoto
  },

  data() {
    return {
      message: '',
      images: [],
      isLoadingImages: false,
      isSaving: false,
      errorMsg: '',
      maxChars: 600,
      code: null,
      deleteIcon,
      logo
    }
  },

  async created() {
    this.code = this.$route.params.code

    if (!this.code) {
      const data = await createKeychain()
      this.code = data.code

      this.$router.replace(`/${this.code}/edit`)
    }

    const data = await getKeychain(this.code)
    if (data) {
      this.message = data.message || ''
      this.images = [data.image1, data.image2, data.image3].filter(Boolean)
    }
  },

  watch: {
    message(newVal) {
      if (newVal.length > this.maxChars) this.message = newVal.slice(0, this.maxChars)
    }
  },

  methods: {
    tiltFor(index) {
      const tilts = ['-4deg', '3deg', '-2deg']
      return tilts[index % tilts.length]
    },

    async handleImages(event) {
      const files = Array.from(event.target.files)
      if (!files.length) return
      this.isLoadingImages = true
      const remainingSlots = 3 - this.images.length
      if (remainingSlots <= 0) {
        alert('Maximal 3 Bilder erreicht.')
        event.target.value = null
        this.isLoadingImages = false
        return
      }
      const filesToProcess = files.slice(0, remainingSlots)
      const newImages = []
      for (let file of filesToProcess) {
        const compressed = await this.compressImage(file)
        newImages.push(compressed)
      }
      this.images = [...this.images, ...newImages]
      this.isLoadingImages = false
      event.target.value = null
      if (files.length > remainingSlots) {
        alert('Nur die ersten ' + remainingSlots + ' Bilder wurden hinzugefügt.')
      }
    },

    removeImage(index) {
      this.images.splice(index, 1)
    },

    async save() {
      this.isSaving = true
      this.errorMsg = ''
      try {
        await updateKeychain(this.code, this.message, this.images)
        this.$router.push(`/${this.code}`)
      } catch {
        this.errorMsg = 'Speichern fehlgeschlagen.'
      } finally {
        this.isSaving = false
      }
    },

    compressImage(file, maxWidth = 800, quality = 0.7) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            let width = img.width
            let height = img.height
            if (width > maxWidth) { height *= maxWidth / width; width = maxWidth }
            canvas.width = width
            canvas.height = height
            ctx.drawImage(img, 0, 0, width, height)
            resolve(canvas.toDataURL('image/jpeg', quality))
          }
          img.src = event.target.result
        }
        reader.readAsDataURL(file)
      })
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=Space+Mono:wght@400;700&display=swap');

.edit-page {
  --paper: #f6efe4;
  --card: #fffbf3;
  --ink: #2b241d;
  --ink-soft: #8a7f6f;
  --accent: #b8465a;
  --accent-soft: #f4dde1;
  --line: #ddd2bd;

  width: 100%;
  box-sizing: border-box;
  min-height: 100vh;
  padding: 28px 20px 60px;
  background: var(--paper);
  color: var(--ink);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.edit-page__header {
  display: flex;
  justify-content: center;
  padding: 4px 0 32px;
}

.edit-page__logo {
  height: 44px;
  width: auto;
}

/* --- Letter card --- */

.letter {
  position: relative;
  max-width: 560px;
  margin: 0 auto;
  background: var(--card);
  padding: 40px 32px 32px;
  box-shadow: 0 24px 48px rgba(43, 36, 29, 0.1), 0 2px 8px rgba(43, 36, 29, 0.06);
}

.letter::before {
  content: '';
  position: absolute;
  top: -11px;
  left: 0;
  right: 0;
  height: 12px;
  background-image:
    linear-gradient(135deg, var(--card) 50%, transparent 50%),
    linear-gradient(-135deg, var(--card) 50%, transparent 50%);
  background-size: 16px 16px;
  background-position: bottom left, bottom right;
  background-repeat: repeat-x;
}

.letter__section {
  display: flex;
  flex-direction: column;
}

.eyebrow {
  font-family: 'Space Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
  margin: 0 0 8px;
}

.letter__heading {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 600;
  font-size: 1.35rem;
  margin: 0 0 18px;
  color: var(--ink);
}

.letter__textarea {
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  min-height: 168px;
  border: 1px solid var(--line);
  border-radius: 3px;
  padding: 14px 16px 6px;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1rem;
  line-height: 28px;
  color: var(--ink);
  background-color: var(--card);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.letter__textarea:focus-visible {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.letter__textarea::placeholder {
  color: var(--ink-soft);
  font-style: italic;
}

.meta-text {
  align-self: flex-end;
  margin: 8px 2px 0;
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  color: var(--ink-soft);
}

.meta-text--warn {
  color: var(--accent);
}

.meta-text--loading {
  align-self: flex-start;
  margin-top: 12px;
}

.divider {
  border-top: 1px dashed var(--line);
  margin: 32px 0 28px;
}

/* --- Dropzone --- */

.dropzone {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1.5px dashed var(--line);
  border-radius: 3px;
  padding: 16px;
  margin-top: 4px;
  cursor: pointer;
  background: var(--paper);
  transition: border-color 0.15s ease, background 0.15s ease;
}

.dropzone:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.dropzone--disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.dropzone--disabled:hover {
  border-color: var(--line);
  background: var(--paper);
}

.dropzone input[type='file'] {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.dropzone__plus {
  font-family: 'Space Mono', monospace;
  font-size: 1.2rem;
  color: var(--accent);
  line-height: 1;
}

.dropzone__label {
  font-size: 0.9rem;
  color: var(--ink-soft);
}

/* --- Actions --- */

.actions-bar {
  max-width: 560px;
  margin: 28px auto 0;
}

.error-note {
  background: var(--accent-soft);
  color: var(--accent);
  border-radius: 3px;
  padding: 10px 14px;
  font-family: 'Space Mono', monospace;
  font-size: 0.8rem;
  margin: 0 0 14px;
}

.actions-bar__row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  font-family: 'Space Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.8rem;
  border-radius: 3px;
  padding: 14px 26px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.05s ease, box-shadow 0.05s ease;
}

.btn--primary {
  background: var(--accent);
  color: white;
  box-shadow: 0 4px 0 rgba(43, 36, 29, 0.18);
}

.btn--primary:hover:not(:disabled) {
  filter: brightness(1.05);
}

.btn--primary:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: 0 1px 0 rgba(43, 36, 29, 0.18);
}

.btn--ghost {
  background: transparent;
  color: var(--ink);
  border-color: var(--line);
}

.btn--ghost:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--accent-soft);
}

@media (max-width: 480px) {
  .edit-page {
    padding: 20px 14px 44px;
  }

  .letter {
    padding: 32px 20px 24px;
    margin: 0;
  }

  .actions-bar__row {
    flex-direction: column;
  }

  .actions-bar__row .btn,
  .actions-bar__row router-link {
    width: 100%;
  }

  .polaroid {
    width: 92px;
  }
}
</style>