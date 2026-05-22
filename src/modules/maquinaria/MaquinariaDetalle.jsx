import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Edit2, Trash2, Plus, Wrench,
  ExternalLink, AlertTriangle, CheckCircle, X
} from 'lucide-react'
import {
  useMaquinariaStore, ESTADOS_EQUIPO,
  proximaMantencion, diasParaFecha, nivelAlerta
} from '../../store/maquinariaStore.js'
import { formatearCLP, formatearFechaCorta } from '../../utils/formatters.js'
import styles from './MaquinariaDetalle.module.css'

function MaquinariaDetalle() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { obtenerPorId, registrarMantencion, eliminar } = useMaquinariaStore()

  const [mostrarFormMant,    setMostrarFormMant]    = useState(false)
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false)
  const [mant, setMant] = useState({ detalle: '', costo: '' })

  const equipo = obtenerPorId(id)

  if (!equipo) {
    return (
      <div className={styles.noEncontrado}>
        <Wrench size={40} />
        <p>Equipo no encontrado.</p>
        <button className={styles.btnVolverSimple} onClick={() => navigate('/maquinaria')}>
          <ArrowLeft size={16} /> Volver
        </button>
      </div>
    )
  }

  const estado   = ESTADOS_EQUIPO.find(s => s.valor === equipo.estado)
  const prox     = proximaMantencion(equipo.ultimaMantencion, equipo.frecuencia)
  const dias     = diasParaFecha(prox)
  const alerta   = nivelAlerta(equipo)

  const handleRegistrar = () => {
    if (!mant.detalle.trim()) return
    registrarMantencion(id, mant.detalle, mant.costo)
    setMant({ detalle: '', costo: '' })
    setMostrarFormMant(false)
  }

  const handleEliminar = () => { eliminar(id); navigate('/maquinaria') }

  return (
    <div className={styles.pagina}>

      {/* Encabezado */}
      <div className={styles.encabezado}>
        <button className={styles.btnVolver} onClick={() => navigate('/maquinaria')}><ArrowLeft size={20} /></button>
        <div className={styles.acciones}>
          <button className={styles.btnAccion} onClick={() => navigate(`/maquinaria/${id}/editar`)}>
            <Edit2 size={15} /><span>Editar</span>
          </button>
          <button className={`${styles.btnAccion} ${styles.btnEliminar}`} onClick={() => setConfirmandoEliminar(true)}>
            <Trash2 size={15} /><span>Eliminar</span>
          </button>
        </div>
      </div>

      {/* Perfil */}
      <div className={`${styles.perfil} ${alerta ? styles[`alerta_${alerta}`] : ''}`}>
        <div className={styles.perfilFoto}>
          {equipo.foto
            ? <img src={equipo.foto} alt={equipo.nombre} className={styles.fotoImg} />
            : <Wrench size={32} className={styles.fotoIcono} />
          }
        </div>
        <div className={styles.perfilInfo}>
          <h1 className={styles.nombre}>{equipo.nombre}</h1>
          <p className={styles.sub}>{equipo.marca} {equipo.modelo} {equipo.serie && `· ${equipo.serie}`}</p>
          {estado && (
            <span className={styles.badge} style={{ background: estado.bg, color: estado.color }}>
              {estado.label}
            </span>
          )}
        </div>
      </div>

      {/* Alerta mantención */}
      {alerta && (
        <div className={`${styles.alertaBanner} ${styles[`banner_${alerta}`]}`}>
          <AlertTriangle size={16} />
          <span>
            {alerta === 'vencida'
              ? `Mantención vencida hace ${Math.abs(dias)} días`
              : alerta === 'urgente'
              ? `Mantención en ${dias} día${dias === 1 ? '' : 's'} — urgente`
              : `Próxima mantención en ${dias} días`
            }
          </span>
        </div>
      )}

      {/* Ficha técnica */}
      <section className={styles.seccion}>
        <h2 className={styles.tituloSeccion}>Ficha técnica</h2>
        <div className={styles.fichaGrid}>
          {equipo.fechaCompra && (
            <div className={styles.fichaItem}>
              <span className={styles.fichaLabel}>Fecha compra</span>
              <span className={styles.fichaValor}>{formatearFechaCorta(equipo.fechaCompra)}</span>
            </div>
          )}
          {equipo.valor > 0 && (
            <div className={styles.fichaItem}>
              <span className={styles.fichaLabel}>Valor</span>
              <span className={styles.fichaValor}>{formatearCLP(equipo.valor)}</span>
            </div>
          )}
          {equipo.proveedor && (
            <div className={styles.fichaItem}>
              <span className={styles.fichaLabel}>Proveedor</span>
              <span className={styles.fichaValor}>{equipo.proveedor}</span>
            </div>
          )}
          {equipo.insumos && (
            <div className={`${styles.fichaItem} ${styles.fichaFull}`}>
              <span className={styles.fichaLabel}>Insumos</span>
              <span className={styles.fichaValor}>{equipo.insumos}</span>
            </div>
          )}
          {equipo.especificaciones && (
            <div className={`${styles.fichaItem} ${styles.fichaFull}`}>
              <span className={styles.fichaLabel}>Especificaciones</span>
              <span className={styles.fichaValor}>{equipo.especificaciones}</span>
            </div>
          )}
        </div>
        {equipo.manual && (
          <a href={equipo.manual} target="_blank" rel="noopener noreferrer" className={styles.btnManual}>
            <ExternalLink size={14} /> Ver manual PDF
          </a>
        )}
      </section>

      {/* Mantención */}
      <section className={styles.seccion}>
        <h2 className={styles.tituloSeccion}>Mantención</h2>
        <div className={styles.fichaGrid}>
          <div className={styles.fichaItem}>
            <span className={styles.fichaLabel}>Última mantención</span>
            <span className={styles.fichaValor}>
              {equipo.ultimaMantencion ? formatearFechaCorta(equipo.ultimaMantencion) : '—'}
            </span>
          </div>
          <div className={styles.fichaItem}>
            <span className={styles.fichaLabel}>Frecuencia</span>
            <span className={styles.fichaValor}>
              {equipo.frecuencia ? `Cada ${equipo.frecuencia} días` : '—'}
            </span>
          </div>
          <div className={styles.fichaItem}>
            <span className={styles.fichaLabel}>Próxima</span>
            <span className={`${styles.fichaValor} ${alerta ? styles[`texto_${alerta}`] : ''}`}>
              {prox ? formatearFechaCorta(prox) : '—'}
            </span>
          </div>
          {equipo.tecnico && (
            <div className={styles.fichaItem}>
              <span className={styles.fichaLabel}>Técnico</span>
              <span className={styles.fichaValor}>{equipo.tecnico}</span>
            </div>
          )}
        </div>

        {/* Formulario registrar mantención */}
        {!mostrarFormMant ? (
          <button className={styles.btnRegistrar} onClick={() => setMostrarFormMant(true)}>
            <Plus size={15} /> Registrar mantención
          </button>
        ) : (
          <div className={styles.formMant}>
            <textarea
              className={styles.inputMant}
              rows={2}
              placeholder="Detalle de la mantención…"
              value={mant.detalle}
              onChange={e => setMant(p => ({ ...p, detalle: e.target.value }))}
              autoFocus
            />
            <div className={styles.formMantRow}>
              <div className={styles.precioWrap}>
                <span className={styles.prefijo}>$</span>
                <input
                  type="number"
                  className={styles.inputMantPrecio}
                  placeholder="Costo (opcional)"
                  value={mant.costo}
                  onChange={e => setMant(p => ({ ...p, costo: e.target.value }))}
                  min="0"
                />
              </div>
              <button
                className={styles.btnConfirmar}
                onClick={handleRegistrar}
                disabled={!mant.detalle.trim()}
              >
                <CheckCircle size={15} /> Confirmar
              </button>
              <button
                className={styles.btnCancelar}
                onClick={() => { setMostrarFormMant(false); setMant({ detalle: '', costo: '' }) }}
              >
                <X size={15} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Historial de mantenciones */}
      {equipo.historial?.length > 0 && (
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Historial de mantenciones</h2>
          <ul className={styles.historialLista}>
            {[...equipo.historial].reverse().map((h, i) => (
              <li key={i} className={styles.historialItem}>
                <span className={styles.historialFecha}>{formatearFechaCorta(h.fecha)}</span>
                <span className={styles.historialDetalle}>{h.detalle}</span>
                {h.costo > 0 && (
                  <span className={styles.historialCosto}>{formatearCLP(h.costo)}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Modal eliminar */}
      {confirmandoEliminar && (
        <div className={styles.overlay} onClick={() => setConfirmandoEliminar(false)}>
          <div className={styles.dialogo} onClick={e => e.stopPropagation()}>
            <h3>¿Eliminar {equipo.nombre}?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className={styles.dialogoAcciones}>
              <button className={styles.btnCancelarDialog} onClick={() => setConfirmandoEliminar(false)}>Cancelar</button>
              <button className={styles.btnConfirmarEliminar} onClick={handleEliminar}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MaquinariaDetalle
