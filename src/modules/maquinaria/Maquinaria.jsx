import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Wrench, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { useMaquinariaStore, nivelAlerta, proximaMantencion, diasParaFecha, ESTADOS_EQUIPO } from '../../store/maquinariaStore.js'
import { formatearFechaCorta } from '../../utils/formatters.js'
import styles from './Maquinaria.module.css'

function Maquinaria() {
  const navigate = useNavigate()
  const { equipos, buscar } = useMaquinariaStore()
  const [busqueda, setBusqueda] = useState('')

  const lista = useMemo(() => buscar(busqueda), [busqueda, equipos])

  // Contadores resumen
  const alertas  = useMemo(() => equipos.filter(e => nivelAlerta(e) !== null).length, [equipos])
  const pendientes = useMemo(() => equipos.filter(e => ['urgente','vencida'].includes(nivelAlerta(e))).length, [equipos])

  return (
    <div className={styles.pagina}>

      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Maquinaria</h1>
          <p className={styles.subtitulo}>Equipos y mantenciones</p>
        </div>
        <button className={styles.btnNuevo} onClick={() => navigate('/maquinaria/nuevo')}>
          <Plus size={16} /><span>Nuevo</span>
        </button>
      </div>

      {/* Resumen */}
      <div className={styles.resumen}>
        <div className={styles.resumenCard}>
          <Wrench size={15} className={styles.resumenIcono} />
          <span className={styles.resumenValor}>{equipos.length}</span>
          <span className={styles.resumenLabel}>Equipos</span>
        </div>
        <div className={`${styles.resumenCard} ${pendientes > 0 ? styles.resumenDanger : ''}`}>
          <AlertTriangle size={15} className={styles.resumenIcono} />
          <span className={styles.resumenValor}>{pendientes}</span>
          <span className={styles.resumenLabel}>Urgentes</span>
        </div>
        <div className={`${styles.resumenCard} ${alertas > 0 ? styles.resumenWarn : ''}`}>
          <Clock size={15} className={styles.resumenIcono} />
          <span className={styles.resumenValor}>{alertas}</span>
          <span className={styles.resumenLabel}>Con alerta</span>
        </div>
      </div>

      {/* Búsqueda */}
      <div className={styles.busquedaWrap}>
        <Search size={14} className={styles.iconoBusqueda} />
        <input
          type="search"
          className={styles.inputBusqueda}
          placeholder="Buscar equipo…"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* Lista */}
      {lista.length === 0 ? (
        <div className={styles.vacio}>
          <Wrench size={40} className={styles.vacioIcono} />
          <p className={styles.vacioTexto}>
            {busqueda ? 'Sin resultados.' : 'No hay equipos registrados.'}
          </p>
          {!busqueda && (
            <button className={styles.btnNuevoVacio} onClick={() => navigate('/maquinaria/nuevo')}>
              <Plus size={15} /> Agregar equipo
            </button>
          )}
        </div>
      ) : (
        <ul className={styles.lista}>
          {lista.map(e => {
            const alerta = nivelAlerta(e)
            const prox   = proximaMantencion(e.ultimaMantencion, e.frecuencia)
            const dias   = diasParaFecha(prox)
            const estado = ESTADOS_EQUIPO.find(s => s.valor === e.estado)
            return (
              <li key={e.id}>
                <button
                  className={`${styles.tarjeta} ${alerta ? styles[`alerta_${alerta}`] : ''}`}
                  onClick={() => navigate(`/maquinaria/${e.id}`)}
                >
                  <div className={styles.info}>
                    <div className={styles.infoTop}>
                      <span className={styles.nombre}>{e.nombre}</span>
                      {estado && (
                        <span
                          className={styles.badge}
                          style={{ background: estado.bg, color: estado.color }}
                        >
                          {estado.label}
                        </span>
                      )}
                    </div>
                    <p className={styles.sub}>{e.marca} {e.modelo}</p>
                    <div className={styles.infoBottom}>
                      {prox ? (
                        <span className={`${styles.mantChip} ${alerta ? styles[`chip_${alerta}`] : ''}`}>
                          {alerta === 'vencida'
                            ? `Mantención vencida hace ${Math.abs(dias)} días`
                            : alerta === 'urgente'
                            ? `Mantención en ${dias} día${dias === 1 ? '' : 's'}`
                            : alerta === 'proxima'
                            ? `Mantención en ${dias} días`
                            : `Próxima: ${formatearFechaCorta(prox)}`
                          }
                        </span>
                      ) : (
                        <span className={styles.sinMant}>Sin mantención programada</span>
                      )}
                    </div>
                  </div>
                  <CheckCircle
                    size={16}
                    className={`${styles.flecha} ${alerta ? styles.flechaAlerta : ''}`}
                  />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default Maquinaria
