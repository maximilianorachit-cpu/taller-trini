import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Image, Plus, X, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useGaleriaStore } from '../../store/galeriaStore.js'
import { formatearFechaCorta } from '../../utils/formatters.js'
import styles from './Galeria.module.css'

const ETIQUETAS_PRENDA = {
  polera: 'Polera', jeans: 'Jeans', vestido: 'Vestido',
  cartera: 'Cartera', bolso: 'Bolso', mochila: 'Mochila',
  sabanas: 'Sábanas', cortinas: 'Cortinas',
  'traje-baile': 'Traje de baile', delantal: 'Delantal',
}

function Galeria() {
  const navigate                      = useNavigate()
  const { items, eliminar }           = useGaleriaStore()
  const [filtro, setFiltro]           = useState('todos')
  const [lightbox, setLightbox]       = useState(null)
  const [confirmando, setConfirmando] = useState(false)

  const filtrados = filtro === 'todos'
    ? items
    : items.filter(i => i.prenda === filtro)

  const idxActual   = lightbox ? filtrados.findIndex(i => i.id === lightbox.id) : -1
  const irAnterior  = () => idxActual > 0 && setLightbox(filtrados[idxActual - 1])
  const irSiguiente = () => idxActual < filtrados.length - 1 && setLightbox(filtrados[idxActual + 1])

  const handleEliminar = () => {
    eliminar(lightbox.id)
    setLightbox(null)
    setConfirmando(false)
  }

  const prendasEnUso = ['todos', ...new Set(items.map(i => i.prenda).filter(Boolean))]

  return (
    <div className={styles.pagina}>
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Galería</h1>
          <p className={styles.subtitulo}>{items.length} {items.length === 1 ? 'trabajo' : 'trabajos'}</p>
        </div>
        <button className={styles.btnNuevo} onClick={() => navigate('/galeria/nuevo')}>
          <Plus size={17} /> Nueva foto
        </button>
      </div>

      {/* Filtros por tipo de prenda */}
      {items.length > 0 && (
        <div className={styles.filtros}>
          {prendasEnUso.map(p => (
            <button
              key={p}
              className={`${styles.filtroBtn} ${filtro === p ? styles.filtroActivo : ''}`}
              onClick={() => setFiltro(p)}
            >
              {p === 'todos' ? 'Todos' : (ETIQUETAS_PRENDA[p] || p)}
            </button>
          ))}
        </div>
      )}

      {/* Grid de fotos */}
      {filtrados.length === 0 ? (
        <div className={styles.vacio}>
          <Image size={48} />
          <p>{items.length === 0 ? 'Aún no hay fotos en la galería.' : 'Sin resultados para este filtro.'}</p>
          {items.length === 0 && (
            <button className={styles.btnVacioNuevo} onClick={() => navigate('/galeria/nuevo')}>
              <Plus size={15} /> Agregar primera foto
            </button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filtrados.map(item => (
            <button key={item.id} className={styles.card} onClick={() => setLightbox(item)}>
              {item.imagen
                ? <img src={item.imagen} alt={item.titulo} className={styles.cardImg} />
                : <div className={styles.cardSinFoto}><Image size={32} /></div>
              }
              <div className={styles.cardInfo}>
                <span className={styles.cardTitulo}>{item.titulo}</span>
                {item.prenda && (
                  <span className={styles.cardBadge}>{ETIQUETAS_PRENDA[item.prenda] || item.prenda}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className={styles.overlay} onClick={() => setLightbox(null)}>
          <div className={styles.lightbox} onClick={e => e.stopPropagation()}>

            {idxActual > 0 && (
              <button className={`${styles.navBtn} ${styles.navPrev}`} onClick={irAnterior}>
                <ChevronLeft size={22} />
              </button>
            )}
            {idxActual < filtrados.length - 1 && (
              <button className={`${styles.navBtn} ${styles.navNext}`} onClick={irSiguiente}>
                <ChevronRight size={22} />
              </button>
            )}

            <button className={styles.btnCerrar} onClick={() => setLightbox(null)}>
              <X size={20} />
            </button>

            <div className={styles.lbImagen}>
              {lightbox.imagen
                ? <img src={lightbox.imagen} alt={lightbox.titulo} className={styles.lbImg} />
                : <div className={styles.lbSinFoto}><Image size={48} /></div>
              }
            </div>

            <div className={styles.lbInfo}>
              <div className={styles.lbEncabezado}>
                <div>
                  <h2 className={styles.lbTitulo}>{lightbox.titulo}</h2>
                  {lightbox.fecha && (
                    <span className={styles.lbFecha}>{formatearFechaCorta(lightbox.fecha)}</span>
                  )}
                </div>
                <div className={styles.lbAcciones}>
                  <button
                    className={styles.lbBtnEdit}
                    onClick={() => { setLightbox(null); navigate(`/galeria/${lightbox.id}/editar`) }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button className={styles.lbBtnDelete} onClick={() => setConfirmando(true)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className={styles.lbMeta}>
                {lightbox.prenda && (
                  <div className={styles.lbMetaItem}>
                    <span className={styles.lbMetaLabel}>Prenda</span>
                    <span className={styles.lbMetaValor}>{ETIQUETAS_PRENDA[lightbox.prenda] || lightbox.prenda}</span>
                  </div>
                )}
                {lightbox.tela && (
                  <div className={styles.lbMetaItem}>
                    <span className={styles.lbMetaLabel}>Tela / Material</span>
                    <span className={styles.lbMetaValor}>{lightbox.tela}</span>
                  </div>
                )}
                {lightbox.cliente && (
                  <div className={styles.lbMetaItem}>
                    <span className={styles.lbMetaLabel}>Cliente</span>
                    <span className={styles.lbMetaValor}>{lightbox.cliente}</span>
                  </div>
                )}
                {lightbox.modeloBase && (
                  <div className={styles.lbMetaItem}>
                    <span className={styles.lbMetaLabel}>Molde base</span>
                    <span className={styles.lbMetaValor}>{lightbox.modeloBase}</span>
                  </div>
                )}
                {lightbox.descripcion && (
                  <div className={`${styles.lbMetaItem} ${styles.lbMetaFull}`}>
                    <span className={styles.lbMetaLabel}>Descripción</span>
                    <span className={styles.lbMetaValor}>{lightbox.descripcion}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar */}
      {confirmando && lightbox && (
        <div className={styles.overlay} onClick={() => setConfirmando(false)}>
          <div className={styles.dialogo} onClick={e => e.stopPropagation()}>
            <h3>¿Eliminar "{lightbox.titulo}"?</h3>
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

export default Galeria
