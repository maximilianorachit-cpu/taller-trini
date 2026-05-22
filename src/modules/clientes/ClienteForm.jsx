import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, ChevronDown, ChevronUp, Plus, X } from 'lucide-react'
import {
  useClientesStore,
  CANALES_REFERENCIA,
  ETIQUETAS_PREDEFINIDAS,
  TALLAS,
  MEDIDAS_VACIAS,
} from '../../store/clientesStore.js'
import { telefonoValido } from '../../utils/validators.js'
import styles from './ClienteForm.module.css'

// Campos de medidas agrupados por sección
const CAMPOS_MEDIDAS = [
  {
    seccion: 'Tren superior',
    campos: [
      { key: 'busto',       label: 'Busto'          },
      { key: 'cintura',     label: 'Cintura'        },
      { key: 'cadera',      label: 'Cadera'         },
      { key: 'hombro',      label: 'Hombro'         },
      { key: 'manga_larga', label: 'Manga larga'    },
      { key: 'manga_corta', label: 'Manga corta'    },
      { key: 'largo_talle', label: 'Largo de talle' },
    ]
  },
  {
    seccion: 'Tren inferior',
    campos: [
      { key: 'tiro',           label: 'Tiro'           },
      { key: 'muslo',          label: 'Muslo'          },
      { key: 'rodilla',        label: 'Rodilla'        },
      { key: 'tobillo',        label: 'Tobillo'        },
      { key: 'largo_pantalon', label: 'Largo pantalón' },
      { key: 'largo_vestido',  label: 'Largo vestido'  },
    ]
  },
]

const FORM_INICIAL = {
  nombre: '', telefono: '', celular: '',
  direccion: '', canalReferencia: '',
  etiquetas: [], coloresFavoritos: [],
  medidas: { ...MEDIDAS_VACIAS },
}

function ClienteForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { obtenerPorId, agregar, actualizar } = useClientesStore()

  const esEdicion = Boolean(id)
  const [form, setForm] = useState(FORM_INICIAL)
  const [errores, setErrores] = useState({})
  const [medidasAbiertas, setMedidasAbiertas] = useState(false)
  const [tagPersonalizado, setTagPersonalizado] = useState('')

  // Carga los datos del cliente si es edición
  useEffect(() => {
    if (esEdicion) {
      const cliente = obtenerPorId(id)
      if (cliente) {
        setForm({
          nombre:           cliente.nombre,
          telefono:         cliente.telefono,
          celular:          cliente.celular,
          direccion:        cliente.direccion,
          canalReferencia:  cliente.canalReferencia,
          etiquetas:        [...cliente.etiquetas],
          coloresFavoritos: [...cliente.coloresFavoritos],
          medidas:          { ...MEDIDAS_VACIAS, ...cliente.medidas },
        })
      }
    }
  }, [id, esEdicion, obtenerPorId])

  const set = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }))
    setErrores(prev => ({ ...prev, [campo]: '' }))
  }

  const setMedida = (campo, valor) => {
    setForm(prev => ({
      ...prev,
      medidas: { ...prev.medidas, [campo]: valor }
    }))
  }

  // Valida el formulario antes de guardar
  const validar = () => {
    const nuevos = {}
    if (!form.nombre.trim()) {
      nuevos.nombre = 'El nombre es requerido'
    } else if (form.nombre.trim().length < 2) {
      nuevos.nombre = 'Mínimo 2 caracteres'
    }
    if (form.telefono && !telefonoValido(form.telefono)) {
      nuevos.telefono = 'Formato no válido (ej: 222345678)'
    }
    if (form.celular && !telefonoValido(form.celular)) {
      nuevos.celular = 'Formato no válido (ej: 912345678)'
    }
    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  const guardar = () => {
    if (!validar()) return
    if (esEdicion) {
      actualizar(id, form)
      navigate(`/clientes/${id}`)
    } else {
      const nuevoId = agregar(form)
      navigate(`/clientes/${nuevoId}`)
    }
  }

  // Manejo de etiquetas
  const toggleEtiqueta = (et) => {
    const ya = form.etiquetas.includes(et)
    set('etiquetas', ya
      ? form.etiquetas.filter(e => e !== et)
      : [...form.etiquetas, et]
    )
  }

  const agregarTagPersonalizado = () => {
    const nuevo = tagPersonalizado.trim()
    if (nuevo && !form.etiquetas.includes(nuevo)) {
      set('etiquetas', [...form.etiquetas, nuevo])
    }
    setTagPersonalizado('')
  }

  // Manejo de colores favoritos
  const agregarColor = () => {
    if (form.coloresFavoritos.length < 8) {
      set('coloresFavoritos', [...form.coloresFavoritos, '#E91E8C'])
    }
  }

  const cambiarColor = (i, color) => {
    const nuevos = [...form.coloresFavoritos]
    nuevos[i] = color
    set('coloresFavoritos', nuevos)
  }

  const removerColor = (i) => {
    set('coloresFavoritos', form.coloresFavoritos.filter((_, idx) => idx !== i))
  }

  return (
    <div className={styles.pagina}>
      {/* Encabezado */}
      <div className={styles.encabezado}>
        <button
          className={styles.btnVolver}
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className={styles.titulo}>
          {esEdicion ? 'Editar cliente' : 'Nuevo cliente'}
        </h1>
        <button
          className={styles.btnGuardar}
          onClick={guardar}
        >
          <Save size={18} />
          <span>Guardar</span>
        </button>
      </div>

      <div className={styles.formulario}>
        {/* DATOS PERSONALES */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Datos personales</h2>

          <div className={styles.grupo}>
            <label className={styles.label} htmlFor="nombre">
              Nombre <span className={styles.requerido}>*</span>
            </label>
            <input
              id="nombre"
              type="text"
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Nombre completo del cliente"
              className={`${styles.input} ${errores.nombre ? styles.inputError : ''}`}
              autoComplete="off"
            />
            {errores.nombre && <p className={styles.error}>{errores.nombre}</p>}
          </div>

          <div className={styles.doble}>
            <div className={styles.grupo}>
              <label className={styles.label} htmlFor="telefono">Teléfono</label>
              <input
                id="telefono"
                type="tel"
                value={form.telefono}
                onChange={e => set('telefono', e.target.value)}
                placeholder="Ej: 222345678"
                className={`${styles.input} ${errores.telefono ? styles.inputError : ''}`}
              />
              {errores.telefono && <p className={styles.error}>{errores.telefono}</p>}
            </div>

            <div className={styles.grupo}>
              <label className={styles.label} htmlFor="celular">Celular</label>
              <input
                id="celular"
                type="tel"
                value={form.celular}
                onChange={e => set('celular', e.target.value)}
                placeholder="Ej: 912345678"
                className={`${styles.input} ${errores.celular ? styles.inputError : ''}`}
              />
              {errores.celular && <p className={styles.error}>{errores.celular}</p>}
            </div>
          </div>

          <div className={styles.grupo}>
            <label className={styles.label} htmlFor="direccion">Dirección</label>
            <input
              id="direccion"
              type="text"
              value={form.direccion}
              onChange={e => set('direccion', e.target.value)}
              placeholder="Dirección del cliente"
              className={styles.input}
            />
          </div>

          <div className={styles.grupo}>
            <label className={styles.label} htmlFor="canal">¿Cómo nos conoció?</label>
            <select
              id="canal"
              value={form.canalReferencia}
              onChange={e => set('canalReferencia', e.target.value)}
              className={styles.select}
            >
              <option value="">Seleccionar canal...</option>
              {CANALES_REFERENCIA.map(c => (
                <option key={c.valor} value={c.valor}>{c.label}</option>
              ))}
            </select>
          </div>
        </section>

        {/* ETIQUETAS */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Etiquetas</h2>

          <div className={styles.chipsPredefinidos}>
            {ETIQUETAS_PREDEFINIDAS.map(et => (
              <button
                key={et}
                type="button"
                className={`${styles.chip} ${form.etiquetas.includes(et) ? styles.chipActivo : ''}`}
                onClick={() => toggleEtiqueta(et)}
              >
                {et}
              </button>
            ))}
          </div>

          <div className={styles.tagInput}>
            <input
              type="text"
              value={tagPersonalizado}
              onChange={e => setTagPersonalizado(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); agregarTagPersonalizado() }
              }}
              placeholder="Etiqueta personalizada (Enter para agregar)"
              className={styles.input}
            />
            {tagPersonalizado && (
              <button
                type="button"
                className={styles.btnAgregarTag}
                onClick={agregarTagPersonalizado}
              >
                <Plus size={16} />
              </button>
            )}
          </div>

          {form.etiquetas.length > 0 && (
            <div className={styles.etiquetasActivas}>
              {form.etiquetas.map(et => (
                <span key={et} className={styles.etiquetaActiva}>
                  {et}
                  <button
                    type="button"
                    onClick={() => set('etiquetas', form.etiquetas.filter(e => e !== et))}
                    aria-label={`Quitar etiqueta ${et}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* COLORES FAVORITOS */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Colores favoritos</h2>
          <p className={styles.ayuda}>Colores que la cliente prefiere para sus prendas (máx. 8)</p>

          <div className={styles.colores}>
            {form.coloresFavoritos.map((color, i) => (
              <div key={i} className={styles.colorWrap}>
                <label
                  className={styles.colorSwatch}
                  style={{ background: color }}
                  title={`Color: ${color}`}
                >
                  <input
                    type="color"
                    value={color}
                    onChange={e => cambiarColor(i, e.target.value)}
                    className={styles.colorInput}
                    aria-label={`Cambiar color ${i + 1}`}
                  />
                </label>
                <button
                  type="button"
                  className={styles.btnRemoverColor}
                  onClick={() => removerColor(i)}
                  aria-label={`Quitar color ${i + 1}`}
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            {form.coloresFavoritos.length < 8 && (
              <button
                type="button"
                className={styles.btnAgregarColor}
                onClick={agregarColor}
                aria-label="Agregar color favorito"
              >
                <Plus size={20} />
              </button>
            )}
          </div>
        </section>

        {/* MEDIDAS */}
        <section className={styles.seccion}>
          <button
            type="button"
            className={styles.toggleMedidas}
            onClick={() => setMedidasAbiertas(p => !p)}
          >
            <h2 className={styles.tituloSeccion}>Medidas del cuerpo</h2>
            <span className={styles.toggleHint}>
              {medidasAbiertas ? 'Ocultar' : 'Agregar / editar'}
            </span>
            {medidasAbiertas ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {medidasAbiertas && (
            <div className={styles.medidasContenido}>
              {/* Talla de referencia */}
              <div className={styles.grupo}>
                <label className={styles.label}>Talla de referencia</label>
                <div className={styles.tallasOpciones}>
                  {TALLAS.map(t => (
                    <button
                      key={t}
                      type="button"
                      className={`${styles.tallaBtn} ${form.medidas.talla === t ? styles.tallaActiva : ''}`}
                      onClick={() => setMedida('talla', t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {CAMPOS_MEDIDAS.map(({ seccion, campos }) => (
                <div key={seccion}>
                  <p className={styles.subtituloMedidas}>{seccion}</p>
                  <div className={styles.gridMedidas}>
                    {campos.map(({ key, label }) => (
                      <div key={key} className={styles.campoMedida}>
                        <label className={styles.labelMedida}>{label}</label>
                        <div className={styles.inputMedidaWrap}>
                          <input
                            type="number"
                            min="0"
                            max="300"
                            step="0.5"
                            value={form.medidas[key]}
                            onChange={e => setMedida(key, e.target.value)}
                            placeholder="—"
                            className={styles.inputMedida}
                            aria-label={`${label} en centímetros`}
                          />
                          <span className={styles.unidad}>cm</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className={styles.grupo}>
                <label className={styles.label}>Notas de medidas</label>
                <textarea
                  value={form.medidas.notas_medidas}
                  onChange={e => setMedida('notas_medidas', e.target.value)}
                  placeholder="Ej: Espalda ancha, cadera pronunciada, asimetría en hombros..."
                  className={styles.textarea}
                  rows={3}
                />
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Botón guardar flotante en mobile */}
      <div className={styles.guardarMobile}>
        <button className={styles.btnGuardarMobile} onClick={guardar}>
          <Save size={18} />
          {esEdicion ? 'Guardar cambios' : 'Crear cliente'}
        </button>
      </div>
    </div>
  )
}

export default ClienteForm
