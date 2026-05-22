import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home, Users, ClipboardList, Scissors, Wrench,
  Calculator, Image, Box, FileText, BarChart2,
  Settings, Lock, X, Briefcase, ShoppingBag, Heart
} from 'lucide-react'
import { useAppStore } from '../../store/appStore.js'
import Logo from '../../components/Logo.jsx'
import styles from './Sidebar.module.css'

// Todos los módulos de la aplicación
const NAV_ITEMS = [
  { path: '/',             label: 'Inicio',       icon: Home,          enModoTaller: true  },
  { path: '/clientes',     label: 'Clientes',     icon: Users,         enModoTaller: true  },
  { path: '/pedidos',      label: 'Pedidos',      icon: ClipboardList, enModoTaller: true  },
  { path: '/stock',        label: 'Stock',        icon: Scissors,      enModoTaller: true  },
  { path: '/calculadora',  label: 'Calculadora',  icon: Calculator,    enModoTaller: true  },
  { path: '/maquinaria',   label: 'Maquinaria',   icon: Wrench,        enModoTaller: false },
  { path: '/galeria',      label: 'Galería',      icon: Image,         enModoTaller: false },
  { path: '/diseno3d',     label: 'Diseño 3D',    icon: Box,           enModoTaller: false },
  { path: '/moldes',       label: 'Moldes PDF',   icon: FileText,      enModoTaller: false },
  { path: '/dashboard',    label: 'Dashboard',    icon: BarChart2,     enModoTaller: false },
  { path: '/tienda',       label: 'Tienda',       icon: ShoppingBag,   enModoTaller: false },
  { path: '/rincon-abu',   label: 'Rincón Abu',   icon: Heart,         enModoTaller: false },
]

function Sidebar({ abierto, onCerrar }) {
  const { modoTaller, bloquear } = useAppStore()
  const navigate = useNavigate()

  // En modo taller solo muestra los módulos esenciales del día a día
  const items = modoTaller
    ? NAV_ITEMS.filter(item => item.enModoTaller)
    : NAV_ITEMS

  const handleBloquear = () => {
    bloquear()
    onCerrar()
  }

  const handleConfiguracion = () => {
    navigate('/configuracion')
    onCerrar()
  }

  return (
    <aside className={`${styles.sidebar} ${abierto ? styles.abierto : ''}`}>
      {/* Cabecera con logo */}
      <div className={styles.header}>
        <div className={styles.logoWrap}>
          <Logo size={36} />
          <div className={styles.logoTexto}>
            <span className={styles.appNombre}>El Taller de Trini</span>
          </div>
        </div>
        <button
          className={styles.btnCerrar}
          onClick={onCerrar}
          aria-label="Cerrar menú"
        >
          <X size={20} />
        </button>
      </div>

      {/* Indicador modo taller activo */}
      {modoTaller && (
        <div className={styles.badgeModoTaller}>
          <Briefcase size={13} />
          <span>Modo Taller Activo</span>
        </div>
      )}

      {/* Navegación principal */}
      <nav className={styles.nav} aria-label="Navegación principal">
        <ul className={styles.lista}>
          {items.map(({ path, label, icon: Icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                end={path === '/'}
                className={({ isActive }) =>
                  `${styles.item} ${isActive ? styles.activo : ''}`
                }
                onClick={onCerrar}
              >
                <Icon size={20} className={styles.itemIcono} />
                <span className={styles.itemLabel}>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Acciones en la parte inferior */}
      <div className={styles.footer}>
        <button className={styles.footerBtn} onClick={handleConfiguracion}>
          <Settings size={19} />
          <span>Configuración</span>
        </button>
        <button
          className={`${styles.footerBtn} ${styles.btnBloquear}`}
          onClick={handleBloquear}
        >
          <Lock size={19} />
          <span>Bloquear pantalla</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
