import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, ChevronRight, Zap, Calendar } from 'lucide-react'
import { usePedidosStore, ESTADOS_PEDIDO, TIPOS_PRENDA } from '../../store/pedidosStore.js'
import { useClientesStore } from '../../store/clientesStore.js'
import { useAppStore } from '../../store/appStore.js'
import { formatearNumeroPedido, formatearFechaCorta, formatearFechaRelativa, formatearCLP } from '../../utils/formatters.js'
import styles from './Pedidos.module.css'

// Grupos de filtro por estado
const GRUPOS = [
  { key: 'todos',      label: 'Todos',      estados: null },
  { key: 'activos',    label: 'Activos',    estados: ['pendiente','en-proceso','listo'] },
  { key: 'terminados', label: 'Terminados', estados: ['entregado','pagado'] },
  { key: 'otros',      label: 'Otros',      estados: ['cancelado','devuelto'] },
]

function Pedidos() {
  const navigate = useNavigate()
  const { pedidos } = usePedidosStore()
  const { clientes } = useClientesStore()
  const { terminoBusqueda } = useAppStore()
  const [grupo, setGrupo] = useState('activos')

  // Mapa rápido de clientes por ID
  const clientesMap = useMemo(() =>
    Object.fromEntries(clientes.map(c => [c.id, c])),
    [clientes]
  )

  const pedidosFiltrados = useMemo(() => {
    const estadosFiltro = GRUPOS.find(g => g.key === grupo)?.estados
    return pedidos
      .filter(p => !estadosFiltro || estadosFiltro.includes(p.estado))
      .filter(p => {
        if (!terminoBusqueda) return true
        const t = terminoBusqueda.toLowerCase()
        const cliente = clientesMap[p.clienteId]
        return (
          formatearNumeroPedido(p.numero).toLowerCase().includes(t) ||
          cliente?.nombre?.toLowerCase().includes(t) ||
          p.tipoPrenda?.toLowerCase().includes(t) ||
          p.descripcion?.toLowerCase().includes(t)
        )
      })
      .sort((a, b) => b.numero - a.numero)
  }, [pedidos, grupo, terminoBusqueda, clientesMap])

  const contarGrupo = (g) => {
    const estados = GRUPOS.find(x => x.key === g)?.estados
    if (!estados) return pedidos.length
    return pedidos.filter(p => estados.includes(p.estado)).length
  }

  const getPrendaInfo = (valor) =>
    TIPOS_PRENDA.find(t => t.valor === valor)

  // Determina si la fecha de entrega está próxima o vencida
  const alertaFecha = (p) => {
    if (!p.fechaEntrega || ['pagado','cancelado','devuelto'].includes(p.estado)) return null
    const diff = (new Date(p.fechaEntrega) - new Date()) / (1000 * 60 * 60 * 24)
    if (diff < 0) return 'vencida'
    if (diff <= 3) return 'proxima'
    return null
  }

  return (
    <div className={styles.pagina}>
      {/* Encabezado */}
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Pedidos</h1>
          <p className={styles.subtitulo}>{pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} en total</p>
        </div>
        <button className={styles.btnNuevo} onClick={() => navigate('/pedidos/nuevo')}>
          <PlusCircle size={18} />
          <span>Nuevo</span>
        </button>
      </div>

      {/* Filtros por grupo */}
      <div className={styles.filtros}>
        {GRUPOS.map(g => (
          <button
            key={g.key}
            className={`${styles.filtroBtn} ${grupo === g.key ? styles.filtroActivo : ''}`}
            onClick={() => setGrupo(g.key)}
          >
            {g.label} ({contarGrupo(g.key)})
          </button>
        ))}
      </div>

      {/* Lista de pedidos */}
      {pedidosFiltrados.length === 0 ? (
        <div className={styles.vacio}>
          <span className={styles.vacioIcono}>📋</span>
          <p className={styles.vacioTexto}>
            {terminoBusqueda
              ? `Sin resultados para "${terminoBusqueda}"`
              : 'No hay pedidos en esta categoría.'}
          </p>
          {grupo === 'activos' && !terminoBusqueda && (
            <button className={styles.btnNuevoVacio} onClick={() => navigate('/pedidos/nuevo')}>
              <PlusCircle size={16} /> Crear primer pedido
            </button>
          )}
        </div>
      ) : (
        <ul className={styles.lista}>
          {pedidosFiltrados.map(pedido => {
            const cliente = clientesMap[pedido.clienteId]
            const prenda = getPrendaInfo(pedido.tipoPrenda)
            const alerta = alertaFecha(pedido)
            const estado = ESTADOS_PEDIDO[pedido.estado]
            const totalAbonado = pedido.abonos.reduce((s, a) => s + a.monto, 0)
            const saldo = pedido.precio - totalAbonado

            return (
              <li key={pedido.id}>
                <button
                  className={`${styles.tarjeta} ${alerta ? styles[`alerta_${alerta}`] : ''}`}
                  onClick={() => navigate(`/pedidos/${pedido.id}`)}
                >
                  {/* Número y prenda */}
                  <div className={styles.izquierda}>
                    <div className={styles.numero}>
                      {formatearNumeroPedido(pedido.numero)}
                      {pedido.urgente && <Zap size={13} className={styles.iconoUrgente} />}
                    </div>
                    <div className={styles.prendaRow}>
                      <span className={styles.prendaEmoji}>{prenda?.emoji || '📦'}</span>
                      <span className={styles.prendaLabel}>{prenda?.label || pedido.tipoPrenda}</span>
                    </div>
                    <div className={styles.clienteNombre}>
                      {cliente?.nombre || <span className={styles.sinCliente}>Sin cliente</span>}
                    </div>
                  </div>

                  {/* Centro: fecha entrega */}
                  {pedido.fechaEntrega && (
                    <div className={`${styles.fecha} ${alerta ? styles[`fechaAlerta_${alerta}`] : ''}`}>
                      <Calendar size={13} />
                      <span>{formatearFechaRelativa(pedido.fechaEntrega)}</span>
                    </div>
                  )}

                  {/* Derecha: estado + precio */}
                  <div className={styles.derecha}>
                    <span
                      className={styles.badge}
                      style={{ color: estado?.color, background: estado?.bg }}
                    >
                      {estado?.label}
                    </span>
                    {pedido.precio > 0 && (
                      <div className={styles.precio}>
                        <span className={styles.precioTotal}>{formatearCLP(pedido.precio)}</span>
                        {saldo > 0 && saldo < pedido.precio && (
                          <span className={styles.saldo}>Saldo: {formatearCLP(saldo)}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <ChevronRight size={18} className={styles.flecha} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default Pedidos
