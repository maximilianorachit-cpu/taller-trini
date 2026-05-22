import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Heart } from 'lucide-react'
import { useTiendaStore } from '../../store/tiendaStore.js'
import styles from './TiendaForm.module.css'

const TIPOS_PRENDA = [
  { valor: 'vestido', label: 'Vestido' }, { valor: 'polera', label: 'Polera' },
  { valor: 'jeans', label: 'Jeans' }, { valor: 'cartera', label: 'Cartera' },
  { valor: 'bolso', label: 'Bolso' }, { valor: 'mochila', label: 'Mochila' },
  { valor: 'sabanas', label: 'Sábanas' }, { valor: 'cortinas', label: 'Cortinas' },
  { valor: 'traje-baile', label: 'Traje de baile' }, { valor: 'delantal', label: 'Delantal' },
]

const INICIAL = {
  titulo: '', imagen: '', prenda: '', tela: '',
  descripcion: '', precio: '', disponible: true, esAbu: false,
}

function TiendaForm() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const esEdicion  = Boolean(id)
  const { agregarArticulo, actualizarArticulo, obtenerArticuloPorId } = useTiendaStore()
  const [form, setForm] = useState(INICIAL)
  const [preview, setPreview] = useState('')

  useEffect(() => {
    if (esEdicion) {
      const art = obtenerArticuloPorId(id)
      if (art) { setForm({ ...INICIAL, ...art }); setPreview(art.imagen || '') }
      else navigate('/tienda')
    }
  }, [id])

  const cambiar = (campo, valor) => {
    setForm(p => ({ ...p, [campo]: valor }))
    if (campo === 'imagen') setPreview(valor)
  }

  const guardar = () => {
    if (!form.titulo.trim()) return
    const data = { ...form, precio: Number(form.precio) || 0 }
    if (esEdicion) actualizarArticulo(id, data)
    else agregarArticulo(data)
    navigate('/tienda')
  }

  return (
    <div className={styles.pagina}>
      <div className={styles.encabezado}>
        <button className={styles.btnVolver} onClick={() => navigate('/tienda')}>
          <ArrowLeft size={20} />
        </button>
        <h1 className={styles.titulo}>{esEdicion ? 'Editar artículo' : 'Nuevo artículo'}</h1>
      </div>

      {/* Preview */}
      {preview && (
        <div className={styles.previewWrap}>
          <img src={preview} alt="Preview" className={styles.previewImg} onError={() => setPreview('')} />
        </div>
      )}

      <div className={styles.seccion}>
        <h2 className={styles.tituloSeccion}>Información</h2>

        <div className={styles.grupo}>
          <label className={styles.label}>Título <span className={styles.req}>*</span></label>
          <input type="text" className={styles.input} value={form.titulo}
            onChange={e => cambiar('titulo', e.target.value)} placeholder="Ej: Vestido floral verano" />
        </div>

        <div className={styles.grupo}>
          <label className={styles.label}>URL de imagen</label>
          <input type="url" className={styles.input} value={form.imagen}
            onChange={e => cambiar('imagen', e.target.value)} placeholder="https://…" />
        </div>

        <div className={styles.doble}>
          <div className={styles.grupo}>
            <label className={styles.label}>Tipo de prenda</label>
            <select className={styles.select} value={form.prenda} onChange={e => cambiar('prenda', e.target.value)}>
              <option value="">Sin categoría</option>
              {TIPOS_PRENDA.map(t => <option key={t.valor} value={t.valor}>{t.label}</option>)}
            </select>
          </div>
          <div className={styles.grupo}>
            <label className={styles.label}>Tela / Material</label>
            <input type="text" className={styles.input} value={form.tela}
              onChange={e => cambiar('tela', e.target.value)} placeholder="Ej: Algodón 100%" />
          </div>
        </div>

        <div className={styles.grupo}>
          <label className={styles.label}>Descripción</label>
          <textarea className={styles.textarea} rows={3} value={form.descripcion}
            onChange={e => cambiar('descripcion', e.target.value)}
            placeholder="Describe el artículo: características, cuidados, medidas…" />
        </div>

        <div className={styles.doble}>
          <div className={styles.grupo}>
            <label className={styles.label}>Precio (CLP)</label>
            <div className={styles.precioWrap}>
              <span className={styles.prefijo}>$</span>
              <input type="number" className={`${styles.input} ${styles.inputPrecio}`}
                value={form.precio} onChange={e => cambiar('precio', e.target.value)}
                placeholder="0 = consultar" min="0" />
            </div>
          </div>
          <div className={styles.grupo}>
            <label className={styles.label}>Estado</label>
            <div className={styles.toggleGroup}>
              <button
                className={`${styles.toggleBtn} ${form.disponible ? styles.toggleOn : ''}`}
                onClick={() => cambiar('disponible', !form.disponible)}
              >
                {form.disponible ? 'Disponible' : 'Agotado'}
              </button>
              <button
                className={`${styles.toggleBtnAbu} ${form.esAbu ? styles.toggleAbuOn : ''}`}
                onClick={() => cambiar('esAbu', !form.esAbu)}
              >
                <Heart size={13} /> {form.esAbu ? 'Es de la Abu' : 'Rincón de la Abu'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.btnGuardar} onClick={guardar} disabled={!form.titulo.trim()}>
          <Save size={16} /> {esEdicion ? 'Guardar cambios' : 'Publicar artículo'}
        </button>
      </div>
    </div>
  )
}

export default TiendaForm
