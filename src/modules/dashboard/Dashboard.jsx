import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, ShoppingBag, Users, Package, AlertTriangle, ArrowRight } from 'lucide-react'
import { usePedidosStore, ESTADOS_PEDIDO, TIPOS_PRENDA } from '../../store/pedidosStore.js'
import { useClientesStore } from '../../store/clientesStore.js'
import { useStockStore }    from '../../store/stockStore.js'
import { formatearCLP }     from '../../utils/formatters.js'
import styles from './Dashboard.module.css'

// ── Paleta de colores para gráficos ──────────────────────────────────────────
const COLORES = ['#7c3aed','#3b82f6','#10b981','#f59e0b','#ef4444','#06b6d4','#8b5cf6','#ec4899','#84cc16','#f97316']

// ── Utilidades de fechas ──────────────────────────────────────────────────────
function ultimos6Meses() {
  const ahora = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(ahora.getFullYear(), ahora.getMonth() - (5 - i), 1)
    return {
      año:  d.getFullYear(),
      mes:  d.getMonth(),
      label: d.toLocaleString('es-CL', { month: 'short' }),
    }
  })
}

function enMes(fechaStr, año, mes) {
  const d = new Date(fechaStr)
  return d.getFullYear() === año && d.getMonth() === mes
}

// ── Subcomponentes de gráficos ────────────────────────────────────────────────

function BarChart({ datos, color = '#7c3aed', formatVal }) {
  const max = Math.max(...datos.map(d => d.valor), 1)
  return (
    <div className={styles.barChart}>
      {datos.map((d, i) => (
        <div key={i} className={styles.barCol}>
          <span className={styles.barVal}>{formatVal ? formatVal(d.valor) : d.valor}</span>
          <div className={styles.barTrack}>
            <div
              className={styles.barFill}
              style={{ height: `${(d.valor / max) * 100}%`, background: color }}
            />
          </div>
          <span className={styles.barLabel}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ segmentos }) {
  if (!segmentos.length) return <div className={styles.donutVacio}>Sin datos</div>
  const total = segmentos.reduce((s, x) => s + x.valor, 0)
  if (total === 0) return <div className={styles.donutVacio}>Sin datos</div>
  let acum = 0
  const partes = segmentos.map(s => {
    const pct = (s.valor / total) * 100
    const desde = acum
    acum += pct
    return { ...s, pct, desde }
  })
  const gradiente = partes.map(p => `${p.color} ${p.desde.toFixed(1)}% ${(p.desde + p.pct).toFixed(1)}%`).join(', ')
  return (
    <div className={styles.donutWrap}>
      <div className={styles.donutAnillo} style={{ background: `conic-gradient(${gradiente})` }}>
        <div className={styles.donutCentro}>
          <span className={styles.donutTotal}>{total}</span>
          <span className={styles.donutSub}>total</span>
        </div>
      </div>
      <ul className={styles.donutLeyenda}>
        {partes.map((p, i) => (
          <li key={i} className={styles.donutItem}>
            <span className={styles.donutDot} style={{ background: p.color }} />
            <span className={styles.donutNombre}>{p.label}</span>
            <span className={styles.donutPct}>{p.pct.toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function LineChart({ datos }) {
  const W = 400; const H = 90; const PAD = 10
  const max = Math.max(...datos.map(d => d.valor), 1)
  const pts = datos.map((d, i) => [
    PAD + (i / (datos.length - 1)) * (W - PAD * 2),
    PAD + (1 - d.valor / max) * (H - PAD * 2),
  ])
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const areaD = `${pathD} L${pts[pts.length-1][0]} ${H} L${pts[0][0]} ${H} Z`
  return (
    <div className={styles.lineWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.lineSvg} preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#lineGrad)" />
        <path d={pathD} stroke="#7c3aed" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="#7c3aed" />
        ))}
      </svg>
      <div className={styles.lineLabels}>
        {datos.map((d, i) => <span key={i}>{d.label}</span>)}
      </div>
    </div>
  )
}

function HBarChart({ datos }) {
  const max = Math.max(...datos.map(d => d.valor), 1)
  return (
    <ul className={styles.hbar}>
      {datos.map((d, i) => (
        <li key={i} className={styles.hbarRow}>
          <span className={styles.hbarLabel}>{d.label}</span>
          <div className={styles.hbarTrack}>
            <div className={styles.hbarFill} style={{ width: `${(d.valor / max) * 100}%`, background: COLORES[i % COLORES.length] }} />
          </div>
          <span className={styles.hbarVal}>{d.valor}</span>
        </li>
      ))}
    </ul>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

function Dashboard() {
  const navigate    = useNavigate()
  const { pedidos } = usePedidosStore()
  const { clientes } = useClientesStore()
  const { materiales } = useStockStore()

  const meses = useMemo(() => ultimos6Meses(), [])

  const hoy   = new Date()
  const mesAct = hoy.getMonth()
  const añoAct = hoy.getFullYear()
  const mesAnt = mesAct === 0 ? 11 : mesAct - 1
  const añoAnt = mesAct === 0 ? añoAct - 1 : añoAct

  // ── Métricas ──
  const pedidosMes = useMemo(() =>
    pedidos.filter(p => enMes(p.creadoEn, añoAct, mesAct)), [pedidos, añoAct, mesAct])

  const pedidosMesAnt = useMemo(() =>
    pedidos.filter(p => enMes(p.creadoEn, añoAnt, mesAnt)), [pedidos, añoAnt, mesAnt])

  const ingresosMes = useMemo(() =>
    pedidosMes.reduce((s, p) => s + (Number(p.precio) || 0), 0), [pedidosMes])

  const ingresosMesAnt = useMemo(() =>
    pedidosMesAnt.reduce((s, p) => s + (Number(p.precio) || 0), 0), [pedidosMesAnt])

  const pedidosActivos = useMemo(() =>
    pedidos.filter(p => !['entregado','cancelado','devuelto'].includes(p.estado)).length, [pedidos])

  const valorInventario = useMemo(() =>
    materiales.reduce((s, m) => s + (m.cantidad * (m.precioUnitario || 0)), 0), [materiales])

  const stockBajo = useMemo(() =>
    materiales.filter(m => m.cantidad <= m.umbral).length, [materiales])

  const deltaIngresos = ingresosMesAnt > 0
    ? (((ingresosMes - ingresosMesAnt) / ingresosMesAnt) * 100).toFixed(0)
    : null

  // ── Datos para gráficos ──
  const pedidosPorMes = useMemo(() =>
    meses.map(m => ({
      label: m.label,
      valor: pedidos.filter(p => enMes(p.creadoEn, m.año, m.mes)).length,
    })), [pedidos, meses])

  const ingresosPorMes = useMemo(() =>
    meses.map(m => ({
      label: m.label,
      valor: pedidos.filter(p => enMes(p.creadoEn, m.año, m.mes))
                    .reduce((s, p) => s + (Number(p.precio) || 0), 0),
    })), [pedidos, meses])

  const estadosPedidos = useMemo(() => {
    const conteo = {}
    pedidos.forEach(p => { conteo[p.estado] = (conteo[p.estado] || 0) + 1 })
    return Object.entries(conteo)
      .map(([estado, valor], i) => ({
        label: ESTADOS_PEDIDO[estado]?.label || estado,
        valor,
        color: ESTADOS_PEDIDO[estado]?.color || COLORES[i % COLORES.length],
      }))
      .sort((a, b) => b.valor - a.valor)
  }, [pedidos])

  const prendasTop = useMemo(() => {
    const conteo = {}
    pedidos.forEach(p => {
      if (p.tipoPrenda) conteo[p.tipoPrenda] = (conteo[p.tipoPrenda] || 0) + 1
    })
    const etiquetas = Object.fromEntries(TIPOS_PRENDA.map(t => [t.valor, t.label]))
    return Object.entries(conteo)
      .map(([k, v]) => ({ label: etiquetas[k] || k, valor: v }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 6)
  }, [pedidos])

  const clientesFrecuentes = useMemo(() => {
    const conteo = {}
    pedidos.forEach(p => {
      if (p.clienteId) conteo[p.clienteId] = (conteo[p.clienteId] || 0) + 1
    })
    return Object.entries(conteo)
      .map(([id, cant]) => {
        const c = clientes.find(cl => cl.id === id)
        return { label: c ? `${c.nombre} ${c.apellido}`.trim() : 'Desconocido', valor: cant }
      })
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5)
  }, [pedidos, clientes])

  const hayDatos = pedidos.length > 0

  return (
    <div className={styles.pagina}>
      <div className={styles.encabezado}>
        <h1 className={styles.titulo}>Dashboard</h1>
        <p className={styles.subtitulo}>Resumen del negocio</p>
      </div>

      {/* ── Tarjetas métricas ── */}
      <div className={styles.metricas}>
        <div className={styles.metrica}>
          <div className={styles.metricaIcono} style={{ background: '#ede9fe' }}>
            <ShoppingBag size={20} color="#7c3aed" />
          </div>
          <div className={styles.metricaInfo}>
            <span className={styles.metricaLabel}>Pedidos este mes</span>
            <span className={styles.metricaValor}>{pedidosMes.length}</span>
            {deltaIngresos !== null && (
              <span className={`${styles.metricaDelta} ${Number(deltaIngresos) >= 0 ? styles.deltaPos : styles.deltaNeg}`}>
                {Number(deltaIngresos) >= 0 ? '↑' : '↓'} {Math.abs(deltaIngresos)}% vs mes anterior
              </span>
            )}
          </div>
        </div>

        <div className={styles.metrica}>
          <div className={styles.metricaIcono} style={{ background: '#d1fae5' }}>
            <TrendingUp size={20} color="#10b981" />
          </div>
          <div className={styles.metricaInfo}>
            <span className={styles.metricaLabel}>Ingresos del mes</span>
            <span className={styles.metricaValor}>{formatearCLP(ingresosMes)}</span>
            {ingresosMesAnt > 0 && (
              <span className={styles.metricaDelta}>Ant. {formatearCLP(ingresosMesAnt)}</span>
            )}
          </div>
        </div>

        <div className={styles.metrica}>
          <div className={styles.metricaIcono} style={{ background: '#dbeafe' }}>
            <Users size={20} color="#3b82f6" />
          </div>
          <div className={styles.metricaInfo}>
            <span className={styles.metricaLabel}>Clientes registrados</span>
            <span className={styles.metricaValor}>{clientes.length}</span>
            <span className={styles.metricaDelta}>{pedidosActivos} pedidos activos</span>
          </div>
        </div>

        <div className={`${styles.metrica} ${stockBajo > 0 ? styles.metricaAlerta : ''}`}>
          <div className={styles.metricaIcono} style={{ background: stockBajo > 0 ? '#fee2e2' : '#fef3c7' }}>
            {stockBajo > 0
              ? <AlertTriangle size={20} color="#ef4444" />
              : <Package size={20} color="#f59e0b" />
            }
          </div>
          <div className={styles.metricaInfo}>
            <span className={styles.metricaLabel}>Inventario</span>
            <span className={styles.metricaValor}>{formatearCLP(valorInventario)}</span>
            {stockBajo > 0 && (
              <span className={styles.metricaDeltaAlerta}>{stockBajo} material{stockBajo > 1 ? 'es' : ''} bajo stock</span>
            )}
          </div>
        </div>
      </div>

      {!hayDatos ? (
        <div className={styles.sinDatos}>
          <p>Aún no hay pedidos para mostrar estadísticas.</p>
          <button className={styles.btnIr} onClick={() => navigate('/pedidos/nuevo')}>
            Crear primer pedido <ArrowRight size={15} />
          </button>
        </div>
      ) : (
        <>
          {/* ── Fila 1: Pedidos por mes + Ingresos ── */}
          <div className={styles.fila2}>
            <div className={styles.grafico}>
              <h2 className={styles.graficoTitulo}>Pedidos por mes</h2>
              <BarChart datos={pedidosPorMes} color="#7c3aed" />
            </div>
            <div className={styles.grafico}>
              <h2 className={styles.graficoTitulo}>Ingresos por mes</h2>
              <LineChart datos={ingresosPorMes.map(d => ({
                label: d.label,
                valor: d.valor,
              }))} />
              <div className={styles.lineValores}>
                {ingresosPorMes.map((d, i) => (
                  <span key={i} className={styles.lineValor}>{formatearCLP(d.valor)}</span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Fila 2: Estado de pedidos + Prendas más pedidas ── */}
          <div className={styles.fila2}>
            <div className={styles.grafico}>
              <h2 className={styles.graficoTitulo}>Estado de pedidos</h2>
              <DonutChart segmentos={estadosPedidos} />
            </div>
            <div className={styles.grafico}>
              <h2 className={styles.graficoTitulo}>Prendas más confeccionadas</h2>
              {prendasTop.length > 0
                ? <HBarChart datos={prendasTop} />
                : <p className={styles.vacio}>Sin datos de prendas</p>
              }
            </div>
          </div>

          {/* ── Clientes frecuentes ── */}
          {clientesFrecuentes.length > 0 && (
            <div className={styles.grafico}>
              <h2 className={styles.graficoTitulo}>Clientes frecuentes</h2>
              <HBarChart datos={clientesFrecuentes} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Dashboard
