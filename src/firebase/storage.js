import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './config.js'

// Sube un archivo y retorna la URL de descarga
export const subirArchivo = async (archivo, ruta) => {
  if (!storage) throw new Error('Firebase Storage no está configurado')
  const storageRef = ref(storage, ruta)
  const snapshot = await uploadBytes(storageRef, archivo)
  return getDownloadURL(snapshot.ref)
}

// Sube una imagen de producto (acepta File o Blob)
export const subirImagen = async (archivo, carpeta, nombre) => {
  const extension = archivo.name?.split('.').pop() || 'jpg'
  const ruta = `${carpeta}/${nombre}-${Date.now()}.${extension}`
  return subirArchivo(archivo, ruta)
}

// Elimina un archivo por su URL de Firebase Storage
export const eliminarArchivo = async (url) => {
  if (!storage) throw new Error('Firebase Storage no está configurado')
  const storageRef = ref(storage, url)
  await deleteObject(storageRef)
}
