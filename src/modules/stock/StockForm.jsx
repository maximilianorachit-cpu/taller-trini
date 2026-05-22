import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useStockStore, UNIDADES } from '../../store/stockStore.js'
import styles from './StockForm.module.css'

function StockForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { agregar, actualizar, obtenerPorId } = useStockStore()
  const esEdicion = Boolean(id)

  const [form, setForm] = useState({
    foto:           '',
    nombre:         '',
    descripcion:    '',
    unidad:         'metros',
    cantidad:       '',
    precioUnitario: '',
    proveedor:      '',
    contacto:       '',
    umbral:         '',
  })
  const [errores, setErrores] = useState({})

  // Carga los datos del material en modo edición
  useEffect(() => {
    if (!esEdicion) return
    const m = obtenerPorId(id)
    if (!m) return
    setForm({
      foto:           m.foto           || '',
      nombre:         m.nombre         || '',
      descripcion:    m.descripcion    || '',
      unidad:         m.unidad         || 'metros',
      cantidad:       m.cantidad       !== undefined ? String(m.cantidad)       : '',
      precioUnitario: m.precioUnitario !== undefined ? String(m.precioUnitario) : '',
      proveedor:      m.proveedor      || '',
      contacto:       m.contacto       || '',
      umbral:         m.umbral         !== undefined ? String(m.umbral)         : '',
    })
  }, [id, esEdicion])

  // Actualiza un campo del formulario y limpia su error
  const cambiar = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores(prev => ({ ...prev, [campo]: null }))
  }

  const validar = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handleGuardar = () => {
    if (!validar()) return
    const datos = {
      ...form,
      cantidad:       Number(form.cantidad       || 0),
      precioUnitario: Number(form.precioUnitario || 0),
      umbral:         Number(form.umbral         || 0),
    }
    if (esEdicion) {
      actualizar(id, datos)
    } else {
      agregar(datos)
    }
    navigate('/stock')
  }

  return (
    <div className={styles.pagina}>

      {/* Encabezado fijo */}
      <div className={styles.encabezado}>
        <button className={styles.btnVolver} onClick={() => navigate(-1)} aria-label="Volver">
          <ArrowLeft size={20} />
        </button>
        <div className={styles.tituloWrap}>
          <h1 className={styles.titulo}>
            {esEdicion ? 'Editar material' : 'Nuevo material'}
          </h1>
        </div>
        <button className={styles.btnGuardar} onClick={handleGuardar}>
          <Save size={16} />
          <span>Guardar</span>
        </button>
      </div>

      <div className={styles.formulario}>

        {/* Sección: Información básica */}
        <div className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Información básica</h2>

          <div className={styles.grupo}>
            <label className={styles.label}>
              Nombre <span className={styles.requerido}>*</span>
            </label>
            <input
              className={`${styles.input} ${errores.nombre ? styles.inputError : ''}`}
              value={form.nombre}
              onChange={e => cambiar('nombre', e.target.value)}
              placeholder="Ej: Algodón pima, Polar, Cordura…"
            />
            {errores.nombre && <p className={styles.error}>{errores.nombre}</p>}
          </div>

          <div className={styles.grupo}>
            <label className={styles.label}>Descripción</label>
            <textarea
              className={styles.textarea}
              value={form.descripcion}
              onChange={e => cambiar('descripcion', e.target.value)}
              placeholder="Características, usos, temporada…"
              rows={3}
            />
          </div>

          <div className={styles.grupo}>
            <label className={styles.label}>
              URL de foto
              <span className={styles.ayuda}> (opcional, hasta tener Firebase)</span>
            </label>
            <input
              className={styles.input}
              value={form.foto}
              onChange={e => cambiar('foto', e.target.value)}
              placeholder="https://…"
            />
          </div>
        </div>

        {/* Sección: Stock */}
        <div className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Stock</h2>

          <div className={styles.grupo}>
            <label className={styles.label}>Unidad de medida</label>
            <select
              className={styles.select}
              value={form.unidad}
              onChange={e => cambiar('unidad', e.target.value)}
            >
              {UNIDADES.map(u => (
                <option key={u.valor} value={u.valor}>{u.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.doble}>
            <div className={styles.grupo}>
              <label className={styles.label}>Cantidad disponible</label>
              <input
                type="number"
                className={styles.input}
                value={form.cantidad}
                onChange={e => cambiar('cantidad', e.target.value)}
                placeholder="0"
                min="0"
                step="0.1"
              />
            </div>
            <div className={styles.grupo}>
              <label className={styles.label}>
                Umbral de alerta
                <span className={styles.ayuda}> (avisar si baja de)</span>
              </label>
              <input
                type="number"
                className={styles.input}
                value={form.umbral}
                onChange={e => cambiar('umbral', e.target.value)}
                placeholder="0"
                min="0"
                step="0.1"
              />
            </div>
          </div>
        </div>

        {/* Sección: Precio y proveedor */}
        <div className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Precio y proveedor</h2>

          <div className={styles.grupo}>
            <label className={styles.label}>Precio unitario (CLP)</label>
            <div className={styles.inputPrecioWrap}>
              <span className={styles.prefijo}>$</span>
              <input
                type="number"
                className={`${styles.input} ${styles.inputPrecio}`}
                value={form.precioUnitario}
                onChange={e => cambiar('precioUnitario', e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className={styles.doble}>
            <div className={styles.grupo}>
              <label className={styles.label}>Proveedor</label>
              <input
                className={styles.input}
                value={form.proveedor}
                onChange={e => cambiar('proveedor', e.target.value)}
                placeholder="Nombre del proveedor"
              />
            </div>
            <div className={styles.grupo}>
              <label className={styles.label}>Contacto proveedor</label>
              <input
                className={styles.input}
                value={form.contacto}
                onChange={e => cambiar('contacto', e.target.value)}
                placeholder="Teléfono o email"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Botón guardar flotante en mobile */}
      <div className={styles.guardarMobile}>
        <button className={styles.btnGuardarMobile} onClick={handleGuardar}>
          <Save size={18} />
          {esEdicion ? 'Guardar cambios' : 'Guardar material'}
        </button>
      </div>

    </div>
  )
}

export default StockForm
