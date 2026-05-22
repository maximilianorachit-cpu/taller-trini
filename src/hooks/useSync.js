import { useEffect } from 'react'
import { useAppStore } from '../store/appStore.js'
import { obtenerColaSync, eliminarOffline } from '../db/indexedDB.js'

// Sincroniza los datos offline con Firebase cuando se recupera la conexión
export const useSync = () => {
  const { online } = useAppStore()

  useEffect(() => {
    if (!online) return

    const sincronizar = async () => {
      try {
        const pendientes = await obtenerColaSync()
        if (pendientes.length === 0) return

        // Procesa cada operación pendiente (se implementa en Módulo 10)
        for (const op of pendientes) {
          // TODO: ejecutar operación según op.tipo (agregar, actualizar, eliminar)
          await eliminarOffline('cola_sync', op.id)
        }
      } catch (error) {
        // Silencia errores de sync para no interrumpir al usuario
        console.warn('Error en sincronización offline:', error)
      }
    }

    sincronizar()
  }, [online])
}
