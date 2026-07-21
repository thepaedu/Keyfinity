<template>
  <div class="message-editor-container">
    <h3>Nachricht bearbeiten</h3>
    <div class="text-area-container">
      <textarea v-model="message" rows="5" style="width:100%" :maxlength="maxChars" />
      <p>{{ message.length }} / {{ maxChars }} Zeichen</p>
    </div>
  </div>

  <div class="message-editor-container">
    <h3>Bilder hinzufügen</h3>
    <p>Maximal 3 Bilder möglich ({{ images.length }}/3)</p>
    <input type="file" multiple accept="image/*" @change="handleImages" :disabled="images.length >= 3" />
    <p v-if="isLoadingImages">Bilder werden verarbeitet...</p>
    <div v-if="images.length" class="preview">
      <div v-for="(img, index) in images" :key="index" class="preview-img">
        <img :src="img" />
        <button class="delete-btn" @click="removeImage(index)">
          <img :src="deleteIcon" alt="Löschen" />
        </button>
      </div>
    </div>
  </div>

  <div class="controlls-container">
    <p v-if="errorMsg" style="color:red">{{ errorMsg }}</p>
    <button @click="save" :disabled="isLoadingImages || isSaving">
      {{ isSaving ? 'Wird gespeichert...' : isLoadingImages ? 'Lade Bilder...' : 'Speichern' }}
    </button>
    <router-link :to="`/${code}`">
      <button>Zurück</button>
    </router-link>
  </div>
</template>

<script>
import { createKeychain, getKeychain, updateKeychain } from '../services/api.js'
import deleteIcon from '../assets/delete.svg'

export default {
  data() {
    return {
      message: '',
      images: [],
      isLoadingImages: false,
      isSaving: false,
      errorMsg: '',
      maxChars: 600,
      code: null,
      deleteIcon
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

<style>
.preview {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
  margin-left: 15%;
  margin-right: 15%;
}

.preview-img img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.preview-img {
  position: relative;
}

.delete-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  border: none;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.delete-btn img {
  width: 12px;
  height: 12px;
}

.text-area-container {
  margin-left: 15%;
  margin-right: 15%;
}

.controlls-container {
  margin-top: 20px;
  border: 1px solid var(--border);
  padding: 10px;
}

</style>