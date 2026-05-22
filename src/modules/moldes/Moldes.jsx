import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Plus, Search } from 'lucide-react'
import { useMoldesStore } from '../../store/moldesStore.js'
import styles from './Moldes.module.css'

const ETIQUETAS_PRENDA = {
  polera: 'Polera', jeans: 'Jeans', vestido: 'Vestido',
  cartera: 'Cartera', bolso: 'Bolso', mochila: 'Mochila',
  sabanas: 'Sábanas', cortinas: 'Cortinas',
  'traje-baile': 'Traje de baile', delantal: 'Delantal',
}

function Moldes() {
  const navigate       = useNavigate()
  const { moldes }     = useMoldesStore()
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro]     = useState('todos')

  const prendasEnUso = ['todos', ...new Set(moldes.map(m => m.prenda).filter(Boolean))]

  const filtrados = moldes.filter(m => {
    const coincideBusqueda = !busqueda
      || m.nombre.toLowerCase().includes(busqueda.toLowerCase())
      || (m.descripcion || '').toLowerCase().includes(busqueda.toLowerCase())
    const coincideFiltro = filtro === 'todos' || m.prenda === filtro
    return coincideBusqueda && coincideFiltro
  })

  return (
    <div className={styles.pagina}>
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Moldes</h1>
          <p className={styles.subtitulo}>{moldes.length} {moldes.length === 1 ? 'molde' : 'moldes'} guardados</p>
        </div>
        <button className={styles.btnNuevo} onClick={() => navigate('/moldes/nuevo')}>
          <Plus size={17} /> Nuevo molde
        </button>
      </div>

      {moldes.length > 0 && (
        <>
          {/* Buscador */}
          <div className={styles.buscadorWrap}>
            <Search size={16} className={styles.buscadorIcono} />
            <input
              type="search"
              className={styles.buscador}
              placeholder="Buscar molde…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>

          {/* Filtros por prenda */}
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
        </>
      )}

      {/* Lista de moldes */}
      {filtrados.length === 0 ? (
        <div className={styles.vacio}>
          <FileText size={48} />
          <p>{moldes.length === 0 ? 'Aún no hay moldes guardados.' : 'Sin resultados.'}</p>
          {moldes.length === 0 && (
            <button className={styles.btnVacioNuevo} onClick={() => navigate('/moldes/nuevo')}>
              <Plus size={15} /> Crear primer molde
            </button>
          )}
        </div>
      ) : (
        <div className={styles.lista}>
          {filtrados.map(m => (
            <button
              key={m.id}
              className={styles.card}
              onClick={() => navigate(`/moldes/${m.id}`)}
            >
              {/* Miniatura */}
              <div className={styles.cardMiniatura}>
                {m.imagen
                  ? <img src={m.imagen} alt={m.nombre} className={styles.cardImg} />
                  : <FileText size={28} className={styles.cardIcono} />
                }
              </div>

              {/* Info */}
              <div className={styles.cardInfo}>
                <span className={styles.cardNombre}>{m.nombre}</span>
                <div className={styles.cardMeta}>
                  {m.prenda && (
                    <span className={styles.cardBadge}>{ETIQUETAS_PRENDA[m.prenda] || m.prenda}</span>
                  )}
                  {m.talla && <span className={styles.cardTalla}>Talla {m.talla}</span>}
                </div>
                {m.descripcion && (
                  <span className={styles.cardDesc}>{m.descripcion}</span>
                )}
              </div>

              {/* Indicador de medidas */}
              {(m.pecho || m.cintura || m.cadera) && (
                <div className={styles.cardMedidas}>
                  {m.pecho   && <span><em>P</em>{m.pecho}</span>}
                  {m.cintura && <span><em>C</em>{m.cintura}</span>}
                  {m.cadera  && <span><em>Ca</em>{m.cadera}</span>}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Moldes
