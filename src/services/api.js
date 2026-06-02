const API_BASE = 'https://api.detail-of-art.ch'

export async function createKeychain() {
  const res = await fetch(`${API_BASE}/api/keychains`, { method: 'POST' })
  if (!res.ok) throw new Error('Fehler beim Erstellen des Keychains')
  return res.json() // { code }
}

export async function getKeychain(code) {
  const res = await fetch(`${API_BASE}/api/keychains/${code}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Fehler beim Abrufen des Keychains')
  return res.json() // { code, message, image1, image2, image3 }
}

export async function updateKeychain(code, message, images = []) {
  const res = await fetch(`${API_BASE}/api/keychains/${code}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      image1: images[0] ?? null,
      image2: images[1] ?? null,
      image3: images[2] ?? null
    })
  })
  if (!res.ok) throw new Error('Fehler beim Speichern')
}