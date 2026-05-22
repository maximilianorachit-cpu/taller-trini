import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Moon, Sun, Lock, X, Wifi, WifiOff } from 'lucide-react'
import { useAppStore } from '../../store/appStore.js'
import Logo from '../../components/Logo.jsx'
import styles from './Navbar.module.css'

function Navbar({ onToggleSidebar }) {
  const [buscandoMobile, setBuscandoMobile] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { tema, toggleTema, terminoBusqueda, setTerminoBusqueda, bloquear, online } = useAppStore()

  // Enfoca el input cuando se abre la búsqueda en mobile
  useEffect(() => {
    if (buscandoMobile && inputRef.current) {
      inputRef.current.focus()
    }
  }, [buscandoMobile])

  const handleBuscar = (e) => {
    setTerminoBusqueda(e.target.value)
  }

  const handleBloquear = () => bloquear()

  return (
    <header className={styles.navbar}>
      {/* Izquierda: hamburguesa + logo */}
      <div className={styles.izquierda}>
        <button
          className={styles.btnIcono}
          onClick={onToggleSidebar}
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>
        <button
          className={styles.logoBtn}
          onClick={() => navigate('/')}
          aria-label="Ir al inicio"
        >
          <Logo size={34} />
          <span className={styles.appNombre}>El Taller de Trini</span>
        </button>
      </div>

      {/* Centro: buscador desktop */}
      <div className={styles.buscadorDesktop}>
        <Search size={16} className={styles.iconoBusqueda} />
        <input
          type="search"
          placeholder="Buscar cliente, pedido, prenda..."
          value={terminoBusqueda}
          onChange={handleBuscar}
          className={styles.inputBusqueda}
          aria-label="Buscador general"
        />
        {terminoBusqueda && (
          <button
            className={styles.btnLimpiar}
            onClick={() => setTerminoBusqueda('')}
            aria-label="Limpiar búsqueda"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Derecha: acciones */}
      <div className={styles.derecha}>
        {/* Indicador de conexión */}
        <span
          className={`${styles.indicadorOnline} ${online ? styles.online : styles.offline}`}
          title={online ? 'Conectado' : 'Sin conexión — modo offline'}
        >
          {online ? <Wifi size={16} /> : <WifiOff size={16} />}
        </span>

        {/* Búsqueda mobile */}
        <button
          className={`${styles.btnIcono} ${styles.soloBuscadorMobile}`}
          onClick={() => setBuscandoMobile(true)}
          aria-label="Buscar"
        >
          <Search size={20} />
        </button>

        {/* Modo oscuro/claro */}
        <button
          className={styles.btnIcono}
          onClick={toggleTema}
          aria-label={tema === 'claro' ? 'Activar modo oscuro' : 'Activar modo claro'}
          title={tema === 'claro' ? 'Modo oscuro' : 'Modo claro'}
        >
          {tema === 'claro' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Bloquear pantalla */}
        <button
          className={styles.btnIcono}
          onClick={handleBloquear}
          aria-label="Bloquear pantalla"
          title="Bloquear"
        >
          <Lock size={20} />
        </button>
      </div>

      {/* Búsqueda mobile expandida */}
      {buscandoMobile && (
        <div className={styles.buscadorMobileOverlay}>
          <Search size={16} className={styles.iconoBusqueda} />
          <input
            ref={inputRef}
            type="search"
            placeholder="Buscar..."
            value={terminoBusqueda}
            onChange={handleBuscar}
            className={styles.inputBusqueda}
            aria-label="Buscador"
          />
          <button
            className={styles.btnIcono}
            onClick={() => setBuscandoMobile(false)}
            aria-label="Cerrar búsqueda"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </header>
  )
}

export default Navbar
