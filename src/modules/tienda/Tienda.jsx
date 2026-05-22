import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, Edit2, Trash2, MessageCircle, ShoppingBag, Heart, Instagram } from 'lucide-react'
import { useTiendaStore } from '../../store/tiendaStore.js'
import { useAppStore }    from '../../store/appStore.js'
import { formatearCLP }   from '../../utils/formatters.js'
import styles from './Tienda.module.css'

const ETIQUETAS_PRENDA = {
  polera: 'Polera', jeans: 'Jeans', vestido: 'Vestido',
  cartera: 'Cartera', bolso: 'Bolso', mochila: 'Mochila',
  sabanas: 'Sábanas', cortinas: 'Cortinas',
  'traje-baile': 'Traje de baile', delantal: 'Delantal',
}

function whatsappUrl(numero, texto) {
  const num = numero.replace(/\D/g, '')
  if (!num) return null
  return `https://wa.me/${num}?text=${encodeURIComponent(texto)}`
}

function Tienda() {
  const navigate    = useNavigate()
  const { articulos, eliminarArticulo } = useTiendaStore()
  const { config }  = useAppStore()

  const [filtro,      setFiltro]      = useState('todos')
  const [lightbox,    setLightbox]    = useState(null)
  const [confirmando, setConfirmando] = useState(false)

  const filtrados = articulos.filter(a => {
    if (filtro === 'disponibles') return a.disponible
    if (filtro === 'abu')        return a.esAbu
    return true
  })

  const handleEliminar = () => {
    eliminarArticulo(lightbox.id)
    setLightbox(null)
    setConfirmando(false)
  }

  const linkWA = lightbox
    ? whatsappUrl(
        config.whatsapp || '',
        `Hola! Me interesa "${lightbox.titulo}". ¿Está disponible?`
      )
    : null

  return (
    <div className={styles.pagina}>

      {/* Encabezado */}
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>{config.nombreTaller || 'El Taller de Trini'}</h1>
          <p className={styles.subtitulo}>Tienda de confección a medida</p>
          {config.instagram && (
            <a
              href={`https://instagram.com/${config.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.instagram}
            >
              <Instagram size={14} /> {config.instagram}
            </a>
          )}
        </div>
        <div className={styles.encabezadoAcciones}>
          <button className={styles.btnRincon} onClick={() => navigate('/rincon-abu')}>
            <Heart size={15} /> Rincón de la Abu
          </button>
          <button className={styles.btnNuevo} onClick={() => navigate('/tienda/nuevo')}>
            <Plus size={17} /> Agregar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.filtros}>
        {[
          { id: 'todos',       label: `Todos (${articulos.length})` },
          { id: 'disponibles', label: 'Disponibles' },
          { id: 'abu',         label: 'Rincón de la Abu' },
        ].map(f => (
          <button
            key={f.id}
            className={`${styles.filtroBtn} ${filtro === f.id ? styles.filtroActivo : ''}`}
            onClick={() => setFiltro(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid de artículos */}
      {filtrados.length === 0 ? (
        <div className={styles.vacio}>
          <ShoppingBag size={48} />
          <p>{articulos.length === 0 ? 'Aún no hay artículos en la tienda.' : 'Sin artículos para este filtro.'}</p>
          {articulos.length === 0 && (
            <button className={styles.btnVacioNuevo} onClick={() => navigate('/tienda/nuevo')}>
              <Plus size={15} /> Agregar primer artículo
            </button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filtrados.map(item => (
            <button key={item.id} className={styles.card} onClick={() => setLightbox(item)}>
              <div className={styles.cardImgWrap}>
                {item.imagen
                  ? <img src={item.imagen} alt={item.titulo} className={styles.cardImg} />
                  : <div className={styles.cardSinImg}><ShoppingBag size={32} /></div>
                }
                {!item.disponible && <div className={styles.cardAgotado}>Agotado</div>}
                {item.esAbu && <div className={styles.cardAbu}><Heart size={11} /> Abu</div>}
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.cardTitulo}>{item.titulo}</span>
                {item.prenda && (
                  <span className={styles.cardBadge}>{ETIQUETAS_PRENDA[item.prenda] || item.prenda}</span>
                )}
                <span className={styles.cardPrecio}>
                  {item.precio > 0 ? formatearCLP(item.precio) : 'Consultar precio'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className={styles.overlay} onClick={() => setLightbox(null)}>
          <div className={styles.lightbox} onClick={e => e.stopPropagation()}>

            <button className={styles.btnCerrar} onClick={() => setLightbox(null)}>
              <X size={20} />
            </button>

            <div className={styles.lbImagen}>
              {lightbox.imagen
                ? <img src={lightbox.imagen} alt={lightbox.titulo} className={styles.lbImg} />
                : <div className={styles.lbSinImg}><ShoppingBag size={48} /></div>
              }
              {lightbox.esAbu && (
                <div className={styles.lbAbuBadge}><Heart size={13} /> Rincón de la Abu</div>
              )}
            </div>

            <div className={styles.lbInfo}>
              <div className={styles.lbEncabezado}>
                <div>
                  <h2 className={styles.lbTitulo}>{lightbox.titulo}</h2>
                  <div className={styles.lbMeta}>
                    {lightbox.prenda && (
                      <span className={styles.lbBadge}>{ETIQUETAS_PRENDA[lightbox.prenda] || lightbox.prenda}</span>
                    )}
                    {lightbox.tela && <span className={styles.lbTela}>{lightbox.tela}</span>}
                  </div>
                </div>
                <div className={styles.lbAcciones}>
                  <button
                    className={styles.lbBtnEdit}
                    onClick={() => { setLightbox(null); navigate(`/tienda/${lightbox.id}/editar`) }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button className={styles.lbBtnDelete} onClick={() => setConfirmando(true)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className={styles.lbPrecioRow}>
                <span className={styles.lbPrecio}>
                  {lightbox.precio > 0 ? formatearCLP(lightbox.precio) : 'Consultar precio'}
                </span>
                <span className={`${styles.lbDisponible} ${lightbox.disponible ? styles.disponibleSi : styles.disponibleNo}`}>
                  {lightbox.disponible ? 'Disponible' : 'Agotado'}
                </span>
              </div>

              {lightbox.descripcion && (
                <p className={styles.lbDesc}>{lightbox.descripcion}</p>
              )}

              {linkWA ? (
                <a
                  href={linkWA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.btnWhatsapp}
                >
                  <MessageCircle size={18} /> Consultar por WhatsApp
                </a>
              ) : (
                <p className={styles.lbSinWA}>
                  Configura tu número de WhatsApp en Configuración para habilitar este botón.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmar eliminar */}
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

export default Tienda
