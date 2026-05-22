import { openDB } from 'idb'

const DB_NAME = 'taller-trini-offline'
const DB_VERSION = 1

// Inicializa la base de datos IndexedDB para funcionamiento offline
const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Tiendas para cada módulo principal
      const tiendas = ['clientes', 'pedidos', 'stock', 'maquinaria', 'galeria', 'cola_sync']
      for (const tienda of tiendas) {
        if (!db.objectStoreNames.contains(tienda)) {
          const store = db.createObjectStore(tienda, { keyPath: 'id', autoIncrement: true })
          store.createIndex('activo', 'activo')
          store.createIndex('actualizadoEn', 'actualizadoEn')
        }
      }
    },
  })
}

// Guarda un registro offline
export const guardarOffline = async (tienda, datos) => {
  const db = await initDB()
  return db.put(tienda, { ...datos, _offline: true, _timestamp: Date.now() })
}

// Obtiene todos los registros de una tienda
export const obtenerOffline = async (tienda) => {
  const db = await initDB()
  return db.getAll(tienda)
}

// Elimina un registro offline por ID
export const eliminarOffline = async (tienda, id) => {
  const db = await initDB()
  return db.delete(tienda, id)
}

// Agrega a la cola de sincronización pendiente
export const encolarSync = async (operacion) => {
  const db = await initDB()
  return db.add('cola_sync', { ...operacion, timestamp: Date.now() })
}

// Obtiene todos los elementos pendientes de sincronización
export const obtenerColaSync = async () => {
  const db = await initDB()
  return db.getAll('cola_sync')
}
