import { initializeApp, getApps } from 'firebase/app'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const cfg = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

// Firebase solo se activa si todas las variables de entorno están configuradas
export const firebaseActivo = Object.values(cfg).every(Boolean)

let db   = null
let auth = null

if (firebaseActivo) {
  const app = getApps().length ? getApps()[0] : initializeApp(cfg)
  // Persistencia offline con IndexedDB — API moderna (Firebase v10+)
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  })
  auth = getAuth(app)
}

export { db, auth }
