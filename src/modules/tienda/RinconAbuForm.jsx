import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Heart } from 'lucide-react'
import { useTiendaStore } from '../../store/tiendaStore.js'
import styles from './RinconAbuForm.module.css'

const INICIAL = { titulo: '', imagen: '', contenido: '' }

function RinconAbuForm() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const esEdicion = Boolean(id)
  const { agregarPost, actualizarPost, obtenerPostPorId } = useTiendaStore()
  const [form, setForm]       = useState(INICIAL)
  const [preview, setPreview] = useState('')

  useEffect(() => {
    if (esEdicion) {
      const post = obtenerPostPorId(id)
      if (post) { setForm({ ...INICIAL, ...post }); setPreview(post.imagen || '') }
      else navigate('/rincon-abu')
    }
  }, [id])

  const cambiar = (campo, valor) => {
    setForm(p => ({ ...p, [campo]: valor }))
    if (campo === 'imagen') setPreview(valor)
  }

  const guardar = () => {
    if (!form.titulo.trim()) return
    if (esEdicion) actualizarPost(id, form)
    else agregarPost(form)
    navigate('/rincon-abu')
  }

  return (
    <div className={styles.pagina}>
      <div className={styles.encabezado}>
        <button className={styles.btnVolver} onClick={() => navigate('/rincon-abu')}>
          <ArrowLeft size={20} />
        </button>
        <h1 className={styles.titulo}>
          <Heart size={18} className={styles.corazon} />
          {esEdicion ? 'Editar publicación' : 'Nueva publicación'}
        </h1>
      </div>

      {preview && (
        <div className={styles.previewWrap}>
          <img src={preview} alt="Preview" className={styles.previewImg} onError={() => setPreview('')} />
        </div>
      )}

      <div className={styles.seccion}>
        <div className={styles.grupo}>
          <label className={styles.label}>Título <span className={styles.req}>*</span></label>
          <input type="text" className={styles.input} value={form.titulo}
            onChange={e => cambiar('titulo', e.target.value)}
            placeholder="Ej: El primer vestido que cosí a los 12 años…" />
        </div>
        <div className={styles.grupo}>
          <label className={styles.label}>Imagen (URL)</label>
          <input type="url" className={styles.input} value={form.imagen}
            onChange={e => cambiar('imagen', e.target.value)} placeholder="https://…" />
        </div>
        <div className={styles.grupo}>
          <label className={styles.label}>Relato o descripción</label>
          <textarea className={styles.textarea} rows={8} value={form.contenido}
            onChange={e => cambiar('contenido', e.target.value)}
            placeholder="Escribe la historia detrás de esta pieza, un consejo de costura, un recuerdo…" />
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.btnGuardar} onClick={guardar} disabled={!form.titulo.trim()}>
          <Save size={16} /> {esEdicion ? 'Guardar cambios' : 'Publicar en el Rincón'}
        </button>
      </div>
    </div>
  )
}

export default RinconAbuForm
