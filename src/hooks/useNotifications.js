import { useCallback } from 'react'
import { useAppStore } from '../store/appStore.js'

// Maneja las notificaciones Web Push de la aplicación
export const useNotifications = () => {
  const { notificaciones } = useAppStore()

  // Solicita permiso al usuario para enviar notificaciones
  const solicitarPermiso = useCallback(async () => {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    const permiso = await Notification.requestPermission()
    return permiso === 'granted'
  }, [])

  // Envía una notificación local si tiene permiso y el tipo está habilitado
  const notificar = useCallback((tipo, titulo, cuerpo, opciones = {}) => {
    if (!notificaciones[tipo]) return
    if (Notification.permission !== 'granted') return

    new Notification(titulo, {
      body: cuerpo,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      ...opciones,
    })
  }, [notificaciones])

  return { solicitarPermiso, notificar }
}
