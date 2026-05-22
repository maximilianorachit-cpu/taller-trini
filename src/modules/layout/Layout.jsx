import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '../../store/appStore.js'
import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'
import { useSync } from '../../hooks/useSync.js'
import styles from './Layout.module.css'

function Layout({ children }) {
  const [sidebarAbierto, setSidebarAbierto] = useState(false)
  const { config, bloquear } = useAppStore()

  // Activa sincronización offline → online
  useSync()

  // En desktop cierra el sidebar al redimensionar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarAbierto(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Auto-bloqueo por inactividad según timeoutSesion configurado
  useEffect(() => {
    const minutos = config.timeoutSesion ?? 5
    let timer

    const resetTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(() => bloquear(), minutos * 60 * 1000)
    }

    const eventos = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']
    eventos.forEach(ev => window.addEventListener(ev, resetTimer, { passive: true }))
    resetTimer()

    return () => {
      clearTimeout(timer)
      eventos.forEach(ev => window.removeEventListener(ev, resetTimer))
    }
  }, [config.timeoutSesion, bloquear])

  const toggleSidebar = useCallback(() => setSidebarAbierto(p => !p), [])
  const cerrarSidebar = useCallback(() => setSidebarAbierto(false), [])

  return (
    <div className={styles.shell}>
      <Sidebar abierto={sidebarAbierto} onCerrar={cerrarSidebar} />

      {sidebarAbierto && (
        <div
          className={styles.overlay}
          onClick={cerrarSidebar}
          aria-hidden="true"
        />
      )}

      <div className={`${styles.contenido} ${sidebarAbierto ? styles.desplazado : ''}`}>
        <Navbar onToggleSidebar={toggleSidebar} />
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
