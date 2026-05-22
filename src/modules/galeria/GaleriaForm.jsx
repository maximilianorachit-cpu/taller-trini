import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Image } from 'lucide-react'
import { useGaleriaStore } from '../../store/galeriaStore.js'
import { useClientesStore } from '../../store/clientesStore.js'
import styles from './GaleriaForm.module.css'

const TIPOS_PRENDA = [
  { valor: 'polera',      label: 'Polera' },
  { valor: 'jeans',       label: 'Jeans' },
  { valor: 'vestido',     label: 'Vestido' },
  { valor: 'cartera',     label: 'Cartera' },
  { valor: 'bolso',       label: 'Bolso' },
  { valor: 'mochila',     label: 'Mochila' },
  { valor: 'sabanas',     label: 'Sábanas' },
  { valor: 'cortinas',    label: 'Cortinas' },
  { valor: 'traje-baile', label: 'Traje de baile' },
  { valor: 'delantal',    label: 'Delantal' },
]

const FORM_INICIAL = {
  titulo: '', imagen: '', prenda: '', tela: '',
  cliente: '', modeloBase: '', descripcion: '',
}

function GaleriaForm() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const esEdicion    = Boolean(id)
  const { agregar, actualizar, obtenerPorId } = useGaleriaStore()
  const { clientes } = useClientesStore()

  const [form, setForm]       = useState(FORM_INICIAL)
  const [preview, setPreview] = useState('')

  useEffect(() => {
    if (esEdicion) {
      const item = obtenerPorId(id)
      if (item) { setForm({ ...FORM_INICIAL, ...item }); setPreview(item.imagen || '') }
      else navigate('/galeria')
    }
  }, [id])

  const cambiar = (campo, valor) => {
    setForm(p => ({ ...p, [campo]: valor }))
    if (campo === 'imagen') setPreview(valor)
  }

  const guardar = () => {
    if (!form.titulo.trim()) return
    if (esEdicion) actualizar(id, form)
    else agregar(form)
    navigate('/galeria')
  }

  return (
    <div className={styles.pagina}>

      <div className={styles.encabezado}>
        <button className={styles.btnVolver} onClick={() => navigate('/galeria')}>
          <ArrowLeft size={20} />
        </button>
        <h1 className={styles.titulo}>{esEdicion ? 'Editar foto' : 'Nueva foto'}</h1>
      </div>

      {/* Preview imagen */}
      <div className={styles.previewWrap}>
        {preview
          ? <img src={preview} alt="Preview" className={styles.previewImg} onError={() => setPreview('')} />
          : <div className={styles.previewVacio}><Image size={40} /><span>Vista previa</span></div>
        }
      </div>

      {/* Formulario */}
      <div className={styles.seccion}>
        <h2 className={styles.tituloSeccion}>Información</h2>

        <div className={styles.grupo}>
          <label className={styles.label}>Título <span className={styles.req}>*</span></label>
          <input
            type="text"
            className={styles.input}
            value={form.titulo}
            onChange={e => cambiar('titulo', e.target.value)}
            placeholder="Ej: Vestido de noche azul"
          />
        </div>

        <div className={styles.grupo}>
          <label className={styles.label}>URL de la imagen</label>
          <input
            type="url"
            className={styles.input}
            value={form.imagen}
            onChange={e => cambiar('imagen', e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className={styles.doble}>
          <div className={styles.grupo}>
            <label className={styles.label}>Tipo de prenda</label>
            <select
              className={styles.select}
              value={form.prenda}
              onChange={e => cambiar('prenda', e.target.value)}
            >
              <option value="">Sin categoría</option>
              {TIPOS_PRENDA.map(t => (
                <option key={t.valor} value={t.valor}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className={styles.grupo}>
            <label className={styles.label}>Tela / Material</label>
            <input
              type="text"
              className={styles.input}
              value={form.tela}
              onChange={e => cambiar('tela', e.target.value)}
              placeholder="Ej: Algodón pima"
            />
          </div>
        </div>

        <div className={styles.doble}>
          <div className={styles.grupo}>
            <label className={styles.label}>Cliente</label>
            {clientes.length > 0
              ? (
                <select
                  className={styles.select}
                  value={form.cliente}
                  onChange={e => cambiar('cliente', e.target.value)}
                >
                  <option value="">Sin cliente</option>
                  {clientes.map(c => (
                    <option key={c.id} value={`${c.nombre} ${c.apellido}`.trim()}>
                      {c.nombre} {c.apellido}
                    </option>
                  ))}
                </select>
              )
              : (
                <input
                  type="text"
                  className={styles.input}
                  value={form.cliente}
                  onChange={e => cambiar('cliente', e.target.value)}
                  placeholder="Nombre del cliente"
                />
              )
            }
          </div>
          <div className={styles.grupo}>
            <label className={styles.label}>Molde base</label>
            <input
              type="text"
              className={styles.input}
              value={form.modeloBase}
              onChange={e => cambiar('modeloBase', e.target.value)}
              placeholder="Ej: Molde A-3"
            />
          </div>
        </div>

        <div className={styles.grupo}>
          <label className={styles.label}>Descripción</label>
          <textarea
            className={styles.textarea}
            rows={3}
            value={form.descripcion}
            onChange={e => cambiar('descripcion', e.target.value)}
            placeholder="Notas adicionales sobre este trabajo…"
          />
        </div>
      </div>

      {/* Botón guardar fijo */}
      <div className={styles.footer}>
        <button
          className={styles.btnGuardar}
          onClick={guardar}
          disabled={!form.titulo.trim()}
        >
          <Save size={16} /> {esEdicion ? 'Guardar cambios' : 'Agregar a galería'}
        </button>
      </div>
    </div>
  )
}

export default GaleriaForm
