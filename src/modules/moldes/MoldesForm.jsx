import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import { useMoldesStore } from '../../store/moldesStore.js'
import styles from './MoldesForm.module.css'

const TIPOS_PRENDA = [
  { valor: 'vestido',     label: 'Vestido' },
  { valor: 'polera',      label: 'Polera' },
  { valor: 'jeans',       label: 'Jeans' },
  { valor: 'cartera',     label: 'Cartera' },
  { valor: 'bolso',       label: 'Bolso' },
  { valor: 'mochila',     label: 'Mochila' },
  { valor: 'sabanas',     label: 'Sábanas' },
  { valor: 'cortinas',    label: 'Cortinas' },
  { valor: 'traje-baile', label: 'Traje de baile' },
  { valor: 'delantal',    label: 'Delantal' },
]

const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'A medida']

const FORM_INICIAL = {
  nombre: '', prenda: '', talla: '', descripcion: '', imagen: '',
  pecho: '', cintura: '', cadera: '', largo: '', hombros: '', manga: '',
  medidasExtra: [],
  materiales: '', instrucciones: '',
}

function MoldesForm() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const esEdicion   = Boolean(id)
  const { agregar, actualizar, obtenerPorId } = useMoldesStore()

  const [form, setForm] = useState(FORM_INICIAL)

  useEffect(() => {
    if (esEdicion) {
      const molde = obtenerPorId(id)
      if (molde) setForm({ ...FORM_INICIAL, ...molde })
      else navigate('/moldes')
    }
  }, [id])

  const cambiar = (campo, valor) => setForm(p => ({ ...p, [campo]: valor }))

  // Medidas adicionales
  const agregarMedidaExtra = () =>
    setForm(p => ({ ...p, medidasExtra: [...p.medidasExtra, { clave: '', valor: '' }] }))

  const cambiarMedidaExtra = (idx, campo, valor) =>
    setForm(p => ({
      ...p,
      medidasExtra: p.medidasExtra.map((m, i) => i === idx ? { ...m, [campo]: valor } : m),
    }))

  const quitarMedidaExtra = (idx) =>
    setForm(p => ({ ...p, medidasExtra: p.medidasExtra.filter((_, i) => i !== idx) }))

  const guardar = () => {
    if (!form.nombre.trim()) return
    if (esEdicion) actualizar(id, form)
    else agregar(form)
    navigate('/moldes')
  }

  return (
    <div className={styles.pagina}>

      <div className={styles.encabezado}>
        <button className={styles.btnVolver} onClick={() => navigate('/moldes')}>
          <ArrowLeft size={20} />
        </button>
        <h1 className={styles.titulo}>{esEdicion ? 'Editar molde' : 'Nuevo molde'}</h1>
      </div>

      {/* ── Información básica ── */}
      <div className={styles.seccion}>
        <h2 className={styles.tituloSeccion}>Información básica</h2>

        <div className={styles.grupo}>
          <label className={styles.label}>Nombre del molde <span className={styles.req}>*</span></label>
          <input
            type="text"
            className={styles.input}
            value={form.nombre}
            onChange={e => cambiar('nombre', e.target.value)}
            placeholder="Ej: Vestido A-Line temporada verano"
          />
        </div>

        <div className={styles.triple}>
          <div className={styles.grupo}>
            <label className={styles.label}>Tipo de prenda</label>
            <select className={styles.select} value={form.prenda} onChange={e => cambiar('prenda', e.target.value)}>
              <option value="">Sin categoría</option>
              {TIPOS_PRENDA.map(t => <option key={t.valor} value={t.valor}>{t.label}</option>)}
            </select>
          </div>
          <div className={styles.grupo}>
            <label className={styles.label}>Talla</label>
            <select className={styles.select} value={form.talla} onChange={e => cambiar('talla', e.target.value)}>
              <option value="">Sin talla</option>
              {TALLAS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className={styles.grupo}>
            <label className={styles.label}>Imagen (URL)</label>
            <input
              type="url"
              className={styles.input}
              value={form.imagen}
              onChange={e => cambiar('imagen', e.target.value)}
              placeholder="https://…"
            />
          </div>
        </div>

        <div className={styles.grupo}>
          <label className={styles.label}>Descripción / Notas generales</label>
          <textarea
            className={styles.textarea}
            rows={2}
            value={form.descripcion}
            onChange={e => cambiar('descripcion', e.target.value)}
            placeholder="Descripción breve del molde…"
          />
        </div>
      </div>

      {/* ── Medidas principales ── */}
      <div className={styles.seccion}>
        <h2 className={styles.tituloSeccion}>Medidas principales (cm)</h2>
        <div className={styles.grid3}>
          {[
            { campo: 'pecho',    label: 'Pecho' },
            { campo: 'cintura',  label: 'Cintura' },
            { campo: 'cadera',   label: 'Cadera' },
            { campo: 'largo',    label: 'Largo total' },
            { campo: 'hombros',  label: 'Hombros' },
            { campo: 'manga',    label: 'Manga' },
          ].map(({ campo, label }) => (
            <div key={campo} className={styles.grupo}>
              <label className={styles.label}>{label}</label>
              <div className={styles.medidaWrap}>
                <input
                  type="number"
                  className={`${styles.input} ${styles.inputMedida}`}
                  value={form[campo]}
                  onChange={e => cambiar(campo, e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.5"
                />
                <span className={styles.unidad}>cm</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Medidas adicionales ── */}
      <div className={styles.seccion}>
        <div className={styles.seccionHeader}>
          <h2 className={styles.tituloSeccion}>Medidas adicionales</h2>
          <button className={styles.btnAgregar} onClick={agregarMedidaExtra}>
            <Plus size={14} /> Agregar
          </button>
        </div>

        {form.medidasExtra.length === 0 ? (
          <p className={styles.medidasVacio}>Sin medidas adicionales.</p>
        ) : (
          <div className={styles.medidasLista}>
            {form.medidasExtra.map((m, i) => (
              <div key={i} className={styles.medidaRow}>
                <input
                  type="text"
                  className={styles.input}
                  value={m.clave}
                  onChange={e => cambiarMedidaExtra(i, 'clave', e.target.value)}
                  placeholder="Nombre (ej: Tiro)"
                />
                <div className={styles.medidaWrap}>
                  <input
                    type="text"
                    className={`${styles.input} ${styles.inputMedida}`}
                    value={m.valor}
                    onChange={e => cambiarMedidaExtra(i, 'valor', e.target.value)}
                    placeholder="Valor"
                  />
                </div>
                <button className={styles.btnQuitarMedida} onClick={() => quitarMedidaExtra(i)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Notas ── */}
      <div className={styles.seccion}>
        <h2 className={styles.tituloSeccion}>Materiales e instrucciones</h2>
        <div className={styles.grupo}>
          <label className={styles.label}>Materiales recomendados</label>
          <textarea
            className={styles.textarea}
            rows={2}
            value={form.materiales}
            onChange={e => cambiar('materiales', e.target.value)}
            placeholder="Ej: Tela woven 1.5m, entretela 0.5m, cierre invisible 20cm…"
          />
        </div>
        <div className={styles.grupo}>
          <label className={styles.label}>Instrucciones de armado</label>
          <textarea
            className={styles.textarea}
            rows={4}
            value={form.instrucciones}
            onChange={e => cambiar('instrucciones', e.target.value)}
            placeholder="Pasos para confeccionar la prenda…"
          />
        </div>
      </div>

      {/* Footer fijo */}
      <div className={styles.footer}>
        <button className={styles.btnGuardar} onClick={guardar} disabled={!form.nombre.trim()}>
          <Save size={16} /> {esEdicion ? 'Guardar cambios' : 'Guardar molde'}
        </button>
      </div>
    </div>
  )
}

export default MoldesForm
