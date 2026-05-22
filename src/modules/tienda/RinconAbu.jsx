import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowLeft, X, Edit2, Trash2, Heart } from 'lucide-react'
import { useTiendaStore } from '../../store/tiendaStore.js'
import { formatearFechaCorta } from '../../utils/formatters.js'
import styles from './RinconAbu.module.css'

function RinconAbu() {
  const navigate    = useNavigate()
  const { posts, eliminarPost } = useTiendaStore()
  const [seleccionado, setSeleccionado] = useState(null)
  const [confirmando,  setConfirmando]  = useState(false)

  const handleEliminar = () => {
    eliminarPost(seleccionado.id)
    setSeleccionado(null)
    setConfirmando(false)
  }

  return (
    <div className={styles.pagina}>

      {/* Encabezado */}
      <div className={styles.encabezado}>
        <button className={styles.btnVolver} onClick={() => navigate('/tienda')}>
          <ArrowLeft size={20} />
        </button>
        <div className={styles.encabezadoTexto}>
          <h1 className={styles.titulo}><Heart size={20} className={styles.corazon} /> Rincón de la Abu</h1>
          <p className={styles.subtitulo}>Piezas con historia, amor y tradición</p>
        </div>
        <button className={styles.btnNuevo} onClick={() => navigate('/rincon-abu/nuevo')}>
          <Plus size={17} /> Nueva publicación
        </button>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className={styles.vacio}>
          <Heart size={48} className={styles.vacioIcono} />
          <p>Aún no hay publicaciones en el Rincón de la Abu.</p>
          <button className={styles.btnVacioNuevo} onClick={() => navigate('/rincon-abu/nuevo')}>
            <Plus size={15} /> Crear primera publicación
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {posts.map(post => (
            <button key={post.id} className={styles.card} onClick={() => setSeleccionado(post)}>
              {post.imagen && (
                <img src={post.imagen} alt={post.titulo} className={styles.cardImg} />
              )}
              <div className={styles.cardBody}>
                <span className={styles.cardFecha}>{formatearFechaCorta(post.fecha)}</span>
                <h2 className={styles.cardTitulo}>{post.titulo}</h2>
                {post.contenido && (
                  <p className={styles.cardExtracto}>{post.contenido.slice(0, 120)}{post.contenido.length > 120 ? '…' : ''}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal post */}
      {seleccionado && (
        <div className={styles.overlay} onClick={() => setSeleccionado(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalCerrar} onClick={() => setSeleccionado(null)}>
              <X size={20} />
            </button>

            {seleccionado.imagen && (
              <img src={seleccionado.imagen} alt={seleccionado.titulo} className={styles.modalImg} />
            )}

            <div className={styles.modalCuerpo}>
              <div className={styles.modalHeader}>
                <div>
                  <p className={styles.modalFecha}>{formatearFechaCorta(seleccionado.fecha)}</p>
                  <h2 className={styles.modalTitulo}>{seleccionado.titulo}</h2>
                </div>
                <div className={styles.modalAcciones}>
                  <button className={styles.btnEdit} onClick={() => { setSeleccionado(null); navigate(`/rincon-abu/${seleccionado.id}/editar`) }}>
                    <Edit2 size={14} />
                  </button>
                  <button className={styles.btnDelete} onClick={() => setConfirmando(true)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {seleccionado.contenido && (
                <p className={styles.modalContenido}>{seleccionado.contenido}</p>
              )}
              <div className={styles.modalPie}>
                <Heart size={14} className={styles.corazon} /> Con amor, El Taller de Trini
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar eliminar */}
      {confirmando && seleccionado && (
        <div className={styles.overlay} onClick={() => setConfirmando(false)}>
          <div className={styles.dialogo} onClick={e => e.stopPropagation()}>
            <h3>¿Eliminar "{seleccionado.titulo}"?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className={styles.dialogoAcciones}>
              <button className={styles.btnCancelarDialog} onClick={() => setConfirmando(false)}>Cancelar</button>
              <button className={styles.btnConfirmarEliminar} onClick={handleEliminar}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RinconAbu
