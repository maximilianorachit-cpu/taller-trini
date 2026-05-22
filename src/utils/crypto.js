// Hashea un PIN usando SHA-256 con la Web Crypto API nativa
export const hashPin = async (pin) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(`taller-trini-v1-${pin}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Compara un PIN ingresado contra el hash guardado
export const verificarPin = async (pin, hashGuardado) => {
  const hash = await hashPin(pin)
  return hash === hashGuardado
}

// Encripta un string con AES-GCM (datos sensibles como teléfonos, direcciones)
export const encriptar = async (texto, clave) => {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(clave.padEnd(32, '0').slice(0, 32))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData, { name: 'AES-GCM' }, false, ['encrypt']
  )
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, cryptoKey, encoder.encode(texto)
  )
  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), iv.length)
  return btoa(String.fromCharCode(...combined))
}

// Desencripta un string encriptado con encriptar()
export const desencriptar = async (textoCifrado, clave) => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const keyData = encoder.encode(clave.padEnd(32, '0').slice(0, 32))
  const combined = Uint8Array.from(atob(textoCifrado), c => c.charCodeAt(0))
  const iv = combined.slice(0, 12)
  const encrypted = combined.slice(12)
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData, { name: 'AES-GCM' }, false, ['decrypt']
  )
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv }, cryptoKey, encrypted
  )
  return decoder.decode(decrypted)
}
