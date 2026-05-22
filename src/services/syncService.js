import {
  collection, doc, writeBatch, getDocs, serverTimestamp,
} from 'firebase/firestore'
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { db, auth, firebaseActivo } from './firebase.js'

// ─── Auth ─────────────────────────────────────────────────────────────────────

let _uid = null

// Inicia sesión anónima y guarda el UID
export async function autenticar() {
  if (!firebaseActivo) return null
  if (_uid) return _uid
  try {
    const { user } = await signInAnonymously(auth)
    _uid = user.uid
    return _uid
  } catch (e) {
    console.error('[sync] auth error:', e.code)
    return null
  }
}

// Escucha cambios de auth y actualiza el UID
if (firebaseActivo) {
  onAuthStateChanged(auth, user => { _uid = user?.uid ?? null })
}

// ─── Push (local → Firestore) ─────────────────────────────────────────────────

// Sube un array de items a una subcolección del usuario en lotes de 500
export async function empujar(nombreColeccion, items) {
  if (!firebaseActivo || !_uid || !items?.length) return false
  try {
    const colRef = collection(db, `usuarios/${_uid}/${nombreColeccion}`)
    // Firestore writeBatch acepta máx 500 operaciones
    const lotes = []
    for (let i = 0; i < items.length; i += 499) {
      const batch = writeBatch(db)
      items.slice(i, i + 499).forEach(item => {
        const docRef = doc(colRef, String(item.id))
        batch.set(docRef, { ...item, _syncedAt: serverTimestamp() })
      })
      lotes.push(batch.commit())
    }
    await Promise.all(lotes)
    return true
  } catch (e) {
    console.error(`[sync] empujar(${nombreColeccion}):`, e.message)
    return false
  }
}

// ─── Pull (Firestore → local) ─────────────────────────────────────────────────

// Descarga todos los documentos de una subcolección del usuario
export async function jalar(nombreColeccion) {
  if (!firebaseActivo || !_uid) return null
  try {
    const colRef = collection(db, `usuarios/${_uid}/${nombreColeccion}`)
    const snap   = await getDocs(colRef)
    return snap.docs.map(d => {
      const data = d.data()
      delete data._syncedAt // campo interno, no lo pasamos a los stores
      return data
    })
  } catch (e) {
    console.error(`[sync] jalar(${nombreColeccion}):`, e.message)
    return null
  }
}

// ─── Sync completo ─────────────────────────────────────────────────────────────

// Empuja todas las colecciones al mismo tiempo en paralelo
export async function sincronizarTodo(colecciones) {
  if (!firebaseActivo) return false
  const uid = await autenticar()
  if (!uid) return false
  const resultados = await Promise.all(
    Object.entries(colecciones).map(([nombre, items]) => empujar(nombre, items))
  )
  return resultados.every(Boolean)
}

// Jalamos todas las colecciones en paralelo
export async function restaurarTodo(nombresColecciones) {
  if (!firebaseActivo) return null
  const uid = await autenticar()
  if (!uid) return null
  const resultados = await Promise.all(
    nombresColecciones.map(async nombre => [nombre, await jalar(nombre)])
  )
  return Object.fromEntries(resultados)
}
