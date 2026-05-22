import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Edit2, Archive, RotateCcw, Phone, Smartphone,
  MapPin, Tag, ChevronDown, ChevronUp, ExternalLink, ClipboardList,
  ChevronRight, Zap
} from 'lucide-react'
import { useClientesStore, CANALES_REFERENCIA, TALLAS } from '../../store/clientesStore.js'
import { usePedidosStore, ESTADOS_PEDIDO, TIPOS_PRENDA } from '../../store/pedidosStore.js'
import { formatearFecha, formatearFechaCorta, formatearNumeroPedido, formatearCLP } from '../../utils/formatters.js'
import styles from './ClienteFicha.module.css'

// Genera el color de avatar a partir del nombre
const colorAvatar = (nombre) => {
  const colores = ['#E91E8C','#8B5CF6','#3B82F6','#10B981','#F59E0B','#EF4444','#14B8A6','#F97316']
  let hash = 0
  for (let i = 0; i < nombre.length; i++) hash = nombre.charCodeAt(i) + ((hash << 5) - hash)
  return colores[Math.abs(hash) % colores.length]
}

const iniciales = (nombre) =>
  nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

// Medidas con etiqueta legible
const CAMPOS_MEDIDAS = [
  { key: 'talla',          label: 'Talla ref.'     },
  { key: 'busto',          label: 'Busto',   cm: true },
  { key: 'cintura',        label: 'Cintura', cm: true },
  { key: 'cadera',         label: 'Cadera',  cm: true },
  { key: 'hombro',         label: 'Hombro',  cm: true },
  { key: 'manga_larga',    label: 'M. larga',cm: true },
  { key: 'manga_corta',    label: 'M. corta',cm: true },
  { key: 'largo_talle',    label: 'L. talle',cm: true },
  { key: 'tiro',           label: 'Tiro',    cm: true },
  { key: 'muslo',          label: 'Muslo',   cm: true },
  { key: 'rodilla',        label: 'Rodilla', cm: true },
  { key: 'tobillo',        label: 'Tobillo', cm: true },
  { key: 'largo_pantalon', label: 'L. pant.',cm: true },
  { key: 'largo_vestido',  label: 'L. vest.',cm: true },
]

function ClienteFicha() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { obtenerPorId, archivar, reactivar } = useClientesStore()
  const { obtenerPorCliente } = usePedidosStore()
  const [medidasAbiertas, setMedidasAbiertas] = useState(false)
  const [confirmandoArchivar, setConfirmandoArchivar] = useState(false)

  const cliente = obtenerPorId(id)
  // Pedidos vinculados a este cliente, del más reciente al más antiguo
  const pedidosCliente = obtenerPorCliente(id).sort(
    (a, b) => new Date(b.creadoEn) - new Date(a.creadoEn)
  )

  // Cliente no encontrado
  if (!cliente) {
    return (
      <div className={styles.noEncontrado}>
        <p>Cliente no encontrado.</p>
        <button className={styles.btnVolver} onClick={() => navigate('/clientes')}>
          <ArrowLeft size={18} /> Volver a clientes
        </button>
      </div>
    )
  }

  const canalLabel = CANALES_REFERENCIA.find(c => c.valor === cliente.canalReferencia)?.label

  // Medidas que tienen valor
  const medidasConValor = CAMPOS_MEDIDAS.filter(
    ({ key }) => cliente.medidas?.[key] && cliente.medidas[key] !== ''
  )

  const handleArchivar = () => {
    archivar(id)
    setConfirmandoArchivar(false)
    navigate('/clientes')
  }

  const handleReactivar = () => {
    reactivar(id)
    navigate('/clientes')
  }

  // Genera link de WhatsApp
  const linkWhatsApp = cliente.celular
    ? `https://wa.me/56${cliente.celular.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(cliente.nombre)}%2C%20te%20contactamos%20desde%20El%20Taller%20de%20Trini%20%F0%9F%A7%B5`
    : null

  return (
    <div className={styles.pagina}>
      {/* Encabezado */}
      <div className={styles.encabezado}>
        <button
          className={styles.btnVolver}
          onClick={() => navigate('/clientes')}
          aria-label="Volver a clientes"
        >
          <ArrowLeft size={20} />
        </button>
        <div className={styles.acciones}>
          <button
            className={styles.btnEditar}
            onClick={() => navigate(`/clientes/${id}/editar`)}
          >
            <Edit2 size={16} />
            <span>Editar</span>
          </button>
          {cliente.activo ? (
            <button
              className={styles.btnArchivar}
              onClick={() => setConfirmandoArchivar(true)}
              title="Archivar cliente"
            >
              <Archive size={16} />
              <span>Archivar</span>
            </button>
          ) : (
            <button
              className={styles.btnReactivar}
              onClick={handleReactivar}
              title="Reactivar cliente"
            >
              <RotateCcw size={16} />
              <span>Reactivar</span>
            </button>
          )}
        </div>
      </div>

      {/* Perfil principal */}
      <div className={styles.perfil}>
        <div
          className={styles.avatar}
          style={{ background: colorAvatar(cliente.nombre) }}
        >
          {iniciales(cliente.nombre)}
        </div>
        <div className={styles.perfilInfo}>
          <h1 className={styles.nombre}>{cliente.nombre}</h1>
          <p className={styles.fechaRegistro}>
            Cliente desde {formatearFechaCorta(cliente.creadoEn)}
          </p>
          {!cliente.activo && (
            <span className={styles.badgeArchivado}>Archivado</span>
          )}
        </div>
      </div>

      {/* Etiquetas */}
      {cliente.etiquetas.length > 0 && (
        <div className={styles.etiquetas}>
          {cliente.etiquetas.map(et => (
            <span key={et} className={styles.etiqueta}>
              <Tag size={11} /> {et}
            </span>
          ))}
        </div>
      )}

      {/* Contacto */}
      <section className={styles.seccion}>
        <h2 className={styles.tituloSeccion}>Contacto</h2>
        <div className={styles.datosContacto}>
          {cliente.telefono && (
            <div className={styles.filaContacto}>
              <Phone size={16} className={styles.iconoContacto} />
              <span className={styles.labelContacto}>Teléfono</span>
              <a href={`tel:${cliente.telefono}`} className={styles.valorContacto}>
                {cliente.telefono}
              </a>
            </div>
          )}
          {cliente.celular && (
            <div className={styles.filaContacto}>
              <Smartphone size={16} className={styles.iconoContacto} />
              <span className={styles.labelContacto}>Celular</span>
              <div className={styles.celularRow}>
                <a href={`tel:${cliente.celular}`} className={styles.valorContacto}>
                  {cliente.celular}
                </a>
                {linkWhatsApp && (
                  <a
                    href={linkWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.btnWhatsApp}
                    title="Abrir WhatsApp"
                  >
                    <ExternalLink size={14} />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          )}
          {cliente.direccion && (
            <div className={styles.filaContacto}>
              <MapPin size={16} className={styles.iconoContacto} />
              <span className={styles.labelContacto}>Dirección</span>
              <span className={styles.valorContacto}>{cliente.direccion}</span>
            </div>
          )}
          {canalLabel && (
            <div className={styles.filaContacto}>
              <Tag size={16} className={styles.iconoContacto} />
              <span className={styles.labelContacto}>Nos conoció por</span>
              <span className={styles.valorContacto}>{canalLabel}</span>
            </div>
          )}
          {!cliente.telefono && !cliente.celular && !cliente.direccion && (
            <p className={styles.sinDatos}>Sin datos de contacto registrados.</p>
          )}
        </div>
      </section>

      {/* Colores favoritos */}
      {cliente.coloresFavoritos.length > 0 && (
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Colores favoritos</h2>
          <div className={styles.colores}>
            {cliente.coloresFavoritos.map((color, i) => (
              <div key={i} className={styles.colorItem}>
                <span
                  className={styles.colorSwatch}
                  style={{ background: color }}
                  title={color}
                />
                <span className={styles.colorHex}>{color}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Medidas */}
      <section className={styles.seccion}>
        <button
          className={styles.toggleMedidas}
          onClick={() => setMedidasAbiertas(p => !p)}
        >
          <h2 className={styles.tituloSeccion}>
            Medidas {medidasConValor.length > 0 && `(${medidasConValor.length})`}
          </h2>
          {medidasAbiertas ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {medidasAbiertas && (
          medidasConValor.length > 0 ? (
            <div className={styles.gridMedidas}>
              {medidasConValor.map(({ key, label, cm }) => (
                <div key={key} className={styles.medidaItem}>
                  <span className={styles.medidaLabel}>{label}</span>
                  <span className={styles.medidaValor}>
                    {cliente.medidas[key]}{cm ? ' cm' : ''}
                  </span>
                </div>
              ))}
              {cliente.medidas?.notas_medidas && (
                <div className={`${styles.medidaItem} ${styles.medidaNotas}`}>
                  <span className={styles.medidaLabel}>Notas</span>
                  <span className={styles.medidaValor}>{cliente.medidas.notas_medidas}</span>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.sinMedidas}>
              <p>Sin medidas registradas.</p>
              <button
                className={styles.btnAgregarMedidas}
                onClick={() => navigate(`/clientes/${id}/editar`)}
              >
                <Edit2 size={14} /> Agregar medidas
              </button>
            </div>
          )
        )}
      </section>

      {/* Historial de pedidos */}
      <section className={styles.seccion}>
        <div className={styles.pedidosEncabezado}>
          <h2 className={styles.tituloSeccion}>
            <ClipboardList size={16} style={{ display: 'inline', marginRight: '0.4rem' }} />
            Pedidos ({pedidosCliente.length})
          </h2>
          <button
            className={styles.btnNuevoPedido}
            onClick={() => navigate(`/pedidos/nuevo?clienteId=${id}`)}
          >
            + Nuevo
          </button>
        </div>

        {pedidosCliente.length === 0 ? (
          <p className={styles.sinPedidos}>Sin pedidos registrados.</p>
        ) : (
          <ul className={styles.listaPedidos}>
            {pedidosCliente.map(pedido => {
              const estado = ESTADOS_PEDIDO[pedido.estado]
              const prenda = TIPOS_PRENDA.find(t => t.valor === pedido.tipoPrenda)
              return (
                <li key={pedido.id}>
                  <button
                    className={styles.pedidoItem}
                    onClick={() => navigate(`/pedidos/${pedido.id}`)}
                  >
                    <span className={styles.pedidoNumero}>
                      {formatearNumeroPedido(pedido.numero)}
                      {pedido.urgente && <Zap size={12} className={styles.iconoUrgente} />}
                    </span>
                    <span className={styles.pedidoPrenda}>
                      {prenda?.emoji} {prenda?.label ?? pedido.tipoPrenda}
                    </span>
                    <span
                      className={styles.pedidoBadge}
                      style={{ background: estado?.bg, color: estado?.color }}
                    >
                      {estado?.label ?? pedido.estado}
                    </span>
                    <span className={styles.pedidoPrecio}>
                      {formatearCLP(pedido.precioFinal ?? pedido.precio)}
                    </span>
                    <ChevronRight size={14} className={styles.pedidoFlecha} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Diálogo archivar */}
      {confirmandoArchivar && (
        <div className={styles.overlay} onClick={() => setConfirmandoArchivar(false)}>
          <div className={styles.dialogo} onClick={e => e.stopPropagation()}>
            <h3>¿Archivar a {cliente.nombre}?</h3>
            <p>
              El cliente quedará inactivo pero no se eliminará.
              Puedes reactivarlo en cualquier momento.
            </p>
            <div className={styles.dialogoAcciones}>
              <button
                className={styles.btnCancelar}
                onClick={() => setConfirmandoArchivar(false)}
              >
                Cancelar
              </button>
              <button className={styles.btnConfirmar} onClick={handleArchivar}>
                Archivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClienteFicha
