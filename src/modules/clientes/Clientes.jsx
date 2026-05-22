import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, ChevronRight, Archive, RotateCcw, UserX } from 'lucide-react'
import { useClientesStore } from '../../store/clientesStore.js'
import { useAppStore } from '../../store/appStore.js'
import { formatearFechaCorta } from '../../utils/formatters.js'
import styles from './Clientes.module.css'

// Genera un color consistente para el avatar según el nombre
const colorAvatar = (nombre) => {
  const colores = ['#E91E8C','#8B5CF6','#3B82F6','#10B981','#F59E0B','#EF4444','#14B8A6','#F97316']
  let hash = 0
  for (let i = 0; i < nombre.length; i++) hash = nombre.charCodeAt(i) + ((hash << 5) - hash)
  return colores[Math.abs(hash) % colores.length]
}

// Obtiene las iniciales del nombre (máx. 2 letras)
const iniciales = (nombre) =>
  nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

function Clientes() {
  const navigate = useNavigate()
  const { clientes, archivar, reactivar, eliminar } = useClientesStore()
  const { terminoBusqueda } = useAppStore()
  // 'activos' | 'archivados'
  const [vista, setVista] = useState('activos')
  const [confirmando, setConfirmando] = useState(null) // id del cliente a eliminar

  // Filtra y ordena la lista según vista y búsqueda
  const clientesFiltrados = useMemo(() => {
    const estaActivo = vista === 'activos'
    return clientes
      .filter(c => c.activo === estaActivo)
      .filter(c => {
        if (!terminoBusqueda) return true
        const t = terminoBusqueda.toLowerCase()
        return (
          c.nombre.toLowerCase().includes(t) ||
          c.celular.includes(t) ||
          c.telefono.includes(t) ||
          c.etiquetas.some(e => e.toLowerCase().includes(t))
        )
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }, [clientes, vista, terminoBusqueda])

  const totalActivos    = clientes.filter(c => c.activo).length
  const totalArchivados = clientes.filter(c => !c.activo).length

  const handleArchivar = (e, id) => {
    e.stopPropagation()
    archivar(id)
  }

  const handleReactivar = (e, id) => {
    e.stopPropagation()
    reactivar(id)
  }

  const handleEliminar = (e, id) => {
    e.stopPropagation()
    setConfirmando(id)
  }

  const confirmarEliminar = () => {
    eliminar(confirmando)
    setConfirmando(null)
  }

  return (
    <div className={styles.pagina}>
      {/* Encabezado */}
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Clientes</h1>
          <p className={styles.subtitulo}>
            {totalActivos} activo{totalActivos !== 1 ? 's' : ''}
            {totalArchivados > 0 && ` · ${totalArchivados} archivado${totalArchivados !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          className={styles.btnNuevo}
          onClick={() => navigate('/clientes/nuevo')}
        >
          <UserPlus size={18} />
          <span>Nuevo</span>
        </button>
      </div>

      {/* Filtros de vista */}
      <div className={styles.filtros}>
        <button
          className={`${styles.filtroBtn} ${vista === 'activos' ? styles.filtroActivo : ''}`}
          onClick={() => setVista('activos')}
        >
          Activos ({totalActivos})
        </button>
        <button
          className={`${styles.filtroBtn} ${vista === 'archivados' ? styles.filtroActivo : ''}`}
          onClick={() => setVista('archivados')}
        >
          Archivados ({totalArchivados})
        </button>
      </div>

      {/* Lista de clientes */}
      {clientesFiltrados.length === 0 ? (
        <div className={styles.vacio}>
          <span className={styles.vacioIcono}>👥</span>
          <p className={styles.vacioTexto}>
            {terminoBusqueda
              ? `Sin resultados para "${terminoBusqueda}"`
              : vista === 'activos'
                ? 'No hay clientes aún. ¡Agrega el primero!'
                : 'No hay clientes archivados.'}
          </p>
          {!terminoBusqueda && vista === 'activos' && (
            <button
              className={styles.btnNuevoVacio}
              onClick={() => navigate('/clientes/nuevo')}
            >
              <UserPlus size={16} /> Agregar cliente
            </button>
          )}
        </div>
      ) : (
        <ul className={styles.lista}>
          {clientesFiltrados.map(cliente => (
            <li key={cliente.id}>
              <button
                className={styles.tarjeta}
                onClick={() => navigate(`/clientes/${cliente.id}`)}
                aria-label={`Ver ficha de ${cliente.nombre}`}
              >
                {/* Avatar */}
                <div
                  className={styles.avatar}
                  style={{ background: colorAvatar(cliente.nombre) }}
                >
                  {iniciales(cliente.nombre)}
                </div>

                {/* Info */}
                <div className={styles.info}>
                  <p className={styles.nombre}>{cliente.nombre}</p>
                  <p className={styles.contacto}>
                    {cliente.celular || cliente.telefono || 'Sin teléfono'}
                  </p>
                  {cliente.etiquetas.length > 0 && (
                    <div className={styles.etiquetas}>
                      {cliente.etiquetas.slice(0, 3).map(et => (
                        <span key={et} className={styles.etiqueta}>{et}</span>
                      ))}
                      {cliente.etiquetas.length > 3 && (
                        <span className={styles.etiquetaMas}>+{cliente.etiquetas.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Colores favoritos */}
                {cliente.coloresFavoritos.length > 0 && (
                  <div className={styles.colores}>
                    {cliente.coloresFavoritos.slice(0, 4).map((color, i) => (
                      <span
                        key={i}
                        className={styles.colorDot}
                        style={{ background: color }}
                        title={color}
                      />
                    ))}
                  </div>
                )}

                {/* Acciones */}
                <div className={styles.acciones} onClick={e => e.stopPropagation()}>
                  {vista === 'activos' ? (
                    <button
                      className={styles.btnAccion}
                      onClick={e => handleArchivar(e, cliente.id)}
                      title="Archivar cliente"
                      aria-label="Archivar"
                    >
                      <Archive size={16} />
                    </button>
                  ) : (
                    <>
                      <button
                        className={styles.btnAccion}
                        onClick={e => handleReactivar(e, cliente.id)}
                        title="Reactivar cliente"
                        aria-label="Reactivar"
                      >
                        <RotateCcw size={16} />
                      </button>
                      <button
                        className={`${styles.btnAccion} ${styles.btnEliminar}`}
                        onClick={e => handleEliminar(e, cliente.id)}
                        title="Eliminar cliente"
                        aria-label="Eliminar"
                      >
                        <UserX size={16} />
                      </button>
                    </>
                  )}
                </div>

                <ChevronRight size={18} className={styles.flecha} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Diálogo de confirmación de eliminación */}
      {confirmando && (
        <div className={styles.overlay} onClick={() => setConfirmando(null)}>
          <div className={styles.dialogo} onClick={e => e.stopPropagation()}>
            <h3>¿Eliminar cliente?</h3>
            <p>Esta acción no se puede deshacer. Los clientes con pedidos se archivan en lugar de eliminarse.</p>
            <div className={styles.dialogoAcciones}>
              <button className={styles.btnCancelar} onClick={() => setConfirmando(null)}>
                Cancelar
              </button>
              <button className={styles.btnConfirmar} onClick={confirmarEliminar}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Clientes
