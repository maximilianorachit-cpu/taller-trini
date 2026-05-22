import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, Package, DollarSign, AlertTriangle, ChevronRight, Shirt
} from 'lucide-react'
import { useStockStore } from '../../store/stockStore.js'
import { TIPOS_PRENDA } from '../../store/pedidosStore.js'
import { formatearCLP } from '../../utils/formatters.js'
import telasPorPrenda from '../../assets/data/telas_por_prenda.json'
import styles from './Stock.module.css'

const FILTROS = [
  { valor: 'todos',   label: 'Todos'    },
  { valor: 'comprar', label: 'Comprar'  },
  { valor: 'ok',      label: 'Stock OK' },
]

function Stock() {
  const navigate = useNavigate()
  const { materiales, buscar } = useStockStore()
  const [busqueda, setBusqueda]             = useState('')
  const [filtro, setFiltro]                 = useState('todos')
  const [prendaSugerida, setPrendaSugerida] = useState('')

  // Totales derivados del stock completo
  const totalValor = useMemo(
    () => materiales.reduce((s, m) => s + m.cantidad * m.precioUnitario, 0),
    [materiales]
  )
  const totalAlertas = useMemo(
    () => materiales.filter(m => m.cantidad <= m.umbral).length,
    [materiales]
  )

  // Lista filtrada según búsqueda y filtro activo
  const lista = useMemo(
    () => buscar(busqueda, filtro),
    [busqueda, filtro, materiales]
  )

  // Telas sugeridas para la prenda seleccionada (máx 5, sin repetir)
  const telasSugeridas = useMemo(() => {
    if (!prendaSugerida) return []
    const datos = telasPorPrenda[prendaSugerida]
    if (!datos) return []
    const vistas = new Set()
    const resultado = []
    for (const [estacion, telas] of Object.entries(datos)) {
      for (const nombre of telas) {
        if (!vistas.has(nombre)) {
          vistas.add(nombre)
          resultado.push({ nombre, estacion })
          if (resultado.length === 5) return resultado
        }
      }
    }
    return resultado
  }, [prendaSugerida])

  return (
    <div className={styles.pagina}>

      {/* Encabezado */}
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Stock</h1>
          <p className={styles.subtitulo}>Materiales y telas del taller</p>
        </div>
        <button className={styles.btnNuevo} onClick={() => navigate('/stock/nuevo')}>
          <Plus size={16} />
          <span>Nuevo</span>
        </button>
      </div>

      {/* Tarjetas resumen */}
      <div className={styles.resumen}>
        <div className={styles.resumenCard}>
          <Package size={15} className={styles.resumenIcono} />
          <span className={styles.resumenValor}>{materiales.length}</span>
          <span className={styles.resumenLabel}>Materiales</span>
        </div>
        <div className={styles.resumenCard}>
          <DollarSign size={15} className={styles.resumenIcono} />
          <span className={styles.resumenValor}>{formatearCLP(totalValor)}</span>
          <span className={styles.resumenLabel}>Valor en stock</span>
        </div>
        <div className={`${styles.resumenCard} ${totalAlertas > 0 ? styles.resumenAlerta : ''}`}>
          <AlertTriangle size={15} className={styles.resumenIcono} />
          <span className={styles.resumenValor}>{totalAlertas}</span>
          <span className={styles.resumenLabel}>Bajo stock</span>
        </div>
      </div>

      {/* Sugerencias de telas por prenda */}
      <div className={styles.sugerenciasWrap}>
        <div className={styles.sugerenciasHeader}>
          <Shirt size={14} className={styles.sugerenciasIcono} />
          <select
            className={styles.selectPrenda}
            value={prendaSugerida}
            onChange={e => setPrendaSugerida(e.target.value)}
          >
            <option value="">Telas sugeridas por prenda…</option>
            {TIPOS_PRENDA.map(t => (
              <option key={t.valor} value={t.valor}>
                {t.emoji} {t.label}
              </option>
            ))}
          </select>
        </div>
        {telasSugeridas.length > 0 && (
          <div className={styles.chipsSugeridos}>
            {telasSugeridas.map((t, i) => (
              <span key={i} className={styles.chipTela}>
                {t.nombre}
                <span className={styles.chipEstacion}>{t.estacion}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Búsqueda */}
      <div className={styles.busquedaWrap}>
        <Search size={14} className={styles.iconoBusqueda} />
        <input
          type="search"
          className={styles.inputBusqueda}
          placeholder="Buscar material, proveedor…"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* Filtros */}
      <div className={styles.filtros}>
        {FILTROS.map(f => (
          <button
            key={f.valor}
            className={`${styles.filtroBtn} ${filtro === f.valor ? styles.filtroActivo : ''}`}
            onClick={() => setFiltro(f.valor)}
          >
            {f.label}
            {f.valor === 'comprar' && totalAlertas > 0 && (
              <span className={styles.filtroBadge}>{totalAlertas}</span>
            )}
          </button>
        ))}
      </div>

      {/* Lista de materiales */}
      {lista.length === 0 ? (
        <div className={styles.vacio}>
          <span className={styles.vacioIcono}><Package size={40} /></span>
          <p className={styles.vacioTexto}>
            {busqueda || filtro !== 'todos'
              ? 'No hay materiales con ese criterio.'
              : 'Aún no hay materiales registrados.'}
          </p>
          {!busqueda && filtro === 'todos' && (
            <button className={styles.btnNuevoVacio} onClick={() => navigate('/stock/nuevo')}>
              <Plus size={15} /> Agregar material
            </button>
          )}
        </div>
      ) : (
        <ul className={styles.lista}>
          {lista.map(m => {
            const bajoStock = m.cantidad <= m.umbral
            return (
              <li key={m.id}>
                <button
                  className={`${styles.tarjeta} ${bajoStock ? styles.tarjetaAlerta : ''}`}
                  onClick={() => navigate(`/stock/${m.id}`)}
                >
                  {/* Miniatura */}
                  <div className={styles.foto}>
                    {m.foto
                      ? <img src={m.foto} alt={m.nombre} className={styles.fotoImg} />
                      : <span className={styles.fotoPlaceholder}>
                          {m.nombre.charAt(0).toUpperCase()}
                        </span>
                    }
                  </div>

                  {/* Información */}
                  <div className={styles.info}>
                    <div className={styles.infoTop}>
                      <span className={styles.nombre}>{m.nombre}</span>
                      <span className={`${styles.badge} ${bajoStock ? styles.badgeComprar : styles.badgeOk}`}>
                        {bajoStock ? 'Comprar' : 'Stock OK'}
                      </span>
                    </div>
                    {m.descripcion && (
                      <p className={styles.descripcion}>{m.descripcion}</p>
                    )}
                    <div className={styles.infoBottom}>
                      <span className={styles.cantidad}>
                        {m.cantidad} {m.unidad}
                      </span>
                      {m.precioUnitario > 0 && (
                        <span className={styles.precio}>
                          {formatearCLP(m.precioUnitario)}/{m.unidad === 'metros' ? 'm' : 'u'}
                        </span>
                      )}
                      {m.proveedor && (
                        <span className={styles.proveedor}>{m.proveedor}</span>
                      )}
                    </div>
                  </div>

                  <ChevronRight size={15} className={styles.flecha} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default Stock
