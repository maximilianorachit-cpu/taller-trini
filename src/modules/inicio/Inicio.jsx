import { useNavigate } from 'react-router-dom'
import {
  Users, ClipboardList, Scissors, Wrench,
  Calculator, Image, Box, FileText, BarChart2,
  Wifi, WifiOff, ChevronRight
} from 'lucide-react'
import { useAppStore } from '../../store/appStore.js'
import { obtenerSaludo, formatearFecha } from '../../utils/formatters.js'
import styles from './Inicio.module.css'

// Tarjetas de acceso rápido a cada módulo
const MODULOS = [
  {
    path: '/clientes',    label: 'Clientes',    icono: Users,          color: '#8B5CF6',
    desc: 'Fichas y medidas', bloque: 1
  },
  {
    path: '/pedidos',     label: 'Pedidos',     icono: ClipboardList,  color: '#E91E8C',
    desc: 'Toma de pedidos', bloque: 1
  },
  {
    path: '/stock',       label: 'Stock',       icono: Scissors,       color: '#10B981',
    desc: 'Materiales y telas', bloque: 2
  },
  {
    path: '/maquinaria',  label: 'Maquinaria',  icono: Wrench,         color: '#F59E0B',
    desc: 'Equipos y mantención', bloque: 2
  },
  {
    path: '/calculadora', label: 'Calculadora', icono: Calculator,     color: '#3B82F6',
    desc: 'Costos y precios', bloque: 2
  },
  {
    path: '/galeria',     label: 'Galería',     icono: Image,          color: '#EC4899',
    desc: 'Fotos y renders', bloque: 2
  },
  {
    path: '/diseno3d',    label: 'Diseño 3D',   icono: Box,            color: '#6366F1',
    desc: 'Visualizador 3D', bloque: 3
  },
  {
    path: '/moldes',      label: 'Moldes PDF',  icono: FileText,       color: '#14B8A6',
    desc: 'Generador de patrones', bloque: 3
  },
  {
    path: '/dashboard',   label: 'Dashboard',   icono: BarChart2,      color: '#F97316',
    desc: 'Tendencias y finanzas', bloque: 4
  },
]

// Estados de pedidos con colores
const ESTADOS = [
  { label: 'Pendientes',  color: '#F59E0B', cantidad: 0 },
  { label: 'En proceso',  color: '#3B82F6', cantidad: 0 },
  { label: 'Listos',      color: '#10B981', cantidad: 0 },
]

function Inicio() {
  const navigate = useNavigate()
  const { online } = useAppStore()
  const hoy = new Date()

  return (
    <div className={styles.pagina}>
      {/* Encabezado de bienvenida */}
      <div className={styles.bienvenida}>
        <div className={styles.bienvenidaTexto}>
          <h1 className={styles.saludo}>
            {obtenerSaludo()}, Gabriela! ✂️
          </h1>
          <p className={styles.fecha}>{formatearFecha(hoy)}</p>
        </div>
        <div className={`${styles.badgeOnline} ${online ? styles.online : styles.offline}`}>
          {online ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{online ? 'Conectada' : 'Offline'}</span>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className={styles.resumen}>
        {ESTADOS.map(({ label, color, cantidad }) => (
          <div key={label} className={styles.tarjetaResumen}>
            <span
              className={styles.indicador}
              style={{ background: color }}
            />
            <div>
              <p className={styles.cantidadResumen}>{cantidad}</p>
              <p className={styles.labelResumen}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Acceso rápido a módulos */}
      <section className={styles.seccion}>
        <h2 className={styles.tituloSeccion}>Acceso rápido</h2>
        <div className={styles.grilla}>
          {MODULOS.map(({ path, label, icono: Icono, color, desc, bloque }) => (
            <button
              key={path}
              className={styles.tarjetaModulo}
              onClick={() => navigate(path)}
              aria-label={`Ir a ${label}`}
            >
              <div
                className={styles.moduloIcono}
                style={{ background: color + '1A', color }}
              >
                <Icono size={26} />
              </div>
              <div className={styles.moduloInfo}>
                <span className={styles.moduloLabel}>{label}</span>
                <span className={styles.moduloDesc}>{desc}</span>
              </div>
              <ChevronRight size={16} className={styles.moduloFlecha} />
            </button>
          ))}
        </div>
      </section>

      {/* Nota de versión */}
      <p className={styles.notaVersion}>
        El Taller de Trini v0.1 — Bloque 1 en desarrollo
      </p>
    </div>
  )
}

export default Inicio
