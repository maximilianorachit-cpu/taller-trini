import {
  collection, doc, addDoc, setDoc, updateDoc, deleteDoc,
  getDoc, getDocs, query, where, orderBy, limit,
  serverTimestamp, onSnapshot
} from 'firebase/firestore'
import { db } from './config.js'

// Agrega un documento a una colección con timestamp automático
export const agregar = async (coleccion, datos) => {
  if (!db) throw new Error('Firebase no está configurado')
  const ref = await addDoc(collection(db, coleccion), {
    ...datos,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  })
  return ref.id
}

// Actualiza un documento existente
export const actualizar = async (coleccion, id, datos) => {
  if (!db) throw new Error('Firebase no está configurado')
  const ref = doc(db, coleccion, id)
  await updateDoc(ref, { ...datos, actualizadoEn: serverTimestamp() })
}

// Obtiene todos los documentos de una colección
export const obtenerTodos = async (coleccion) => {
  if (!db) throw new Error('Firebase no está configurado')
  const snapshot = await getDocs(collection(db, coleccion))
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Obtiene un documento por ID
export const obtenerPorId = async (coleccion, id) => {
  if (!db) throw new Error('Firebase no está configurado')
  const snapshot = await getDoc(doc(db, coleccion, id))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

// Archiva un documento (activo: false) en lugar de eliminarlo
export const archivar = async (coleccion, id) => {
  return actualizar(coleccion, id, { activo: false })
}

// Escucha cambios en tiempo real de una colección
export const escuchar = (coleccion, callback) => {
  if (!db) return () => {}
  return onSnapshot(collection(db, coleccion), snapshot => {
    const datos = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(datos)
  })
}
