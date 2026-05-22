import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useMaquinariaStore, ESTADOS_EQUIPO } from '../../store/maquinariaStore.js'
import { formatearCLP } from '../../utils/formatters.js'
import styles from './MaquinariaForm.module.css'

const VACIO = {
  nombre: '', marca: '', modelo: '', serie: '',
  fechaCompra: '', proveedor: '', valor: '',
  foto: '', manual: '', especificaciones: '',
  estado: 'operativa',
  ultimaMantencion: '', frecuencia: '', costoMantencion: '',
  tecnico: '', insumos: '',
}

function MaquinariaForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { agregar, actualizar, obtenerPorId } = useMaquinariaStore()
  const esEdicion = Boolean(id)
  const [form, setForm]       = useState(VACIO)
  const [errores, setErrores] = useState({})

  useEffect(() => {
    if (!esEdicion) return
    const e = obtenerPorId(id)
    if (!e) return
    setForm({
      nombre:           e.nombre           || '',
      marca:            e.marca            || '',
      modelo:           e.modelo           || '',
      serie:            e.serie            || '',
      fechaCompra:      e.fechaCompra      || '',
      proveedor:        e.proveedor        || '',
      valor:            e.valor            !== undefined ? String(e.valor) : '',
      foto:             e.foto             || '',
      manual:           e.manual           || '',
      especificaciones: e.especificaciones || '',
      estado:           e.estado           || 'operativa',
      ultimaMantencion: e.ultimaMantencion || '',
      frecuencia:       e.frecuencia       !== undefined ? String(e.frecuencia) : '',
      costoMantencion:  e.costoMantencion  !== undefined ? String(e.costoMantencion) : '',
      tecnico:          e.tecnico          || '',
      insumos:          e.insumos          || '',
    })
  }, [id, esEdicion])

  const cambiar = (campo, valor) => {
    setForm(p => ({ ...p, [campo]: valor }))
    if (errores[campo]) setErrores(p => ({ ...p, [campo]: null }))
  }

  const validar = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handleGuardar = () => {
    if (!validar()) return
    const datos = {
      ...form,
      valor:           Number(form.valor           || 0),
      frecuencia:      Number(form.frecuencia      || 0),
      costoMantencion: Number(form.costoMantencion || 0),
    }
    if (esEdicion) actualizar(id, datos)
    else           agregar(datos)
    navigate('/maquinaria')
  }

  return (
    <div className={styles.pagina}>
      <div className={styles.encabezado}>
        <button className={styles.btnVolver} onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <h1 className={styles.titulo}>{esEdicion ? 'Editar equipo' : 'Nuevo equipo'}</h1>
        <button className={styles.btnGuardar} onClick={handleGuardar}>
          <Save size={16} /><span>Guardar</span>
        </button>
      </div>

      <div className={styles.formulario}>

        {/* Identificación */}
        <div className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Identificación</h2>
          <div className={styles.grupo}>
            <label className={styles.label}>Nombre <span className={styles.req}>*</span></label>
            <input
              className={`${styles.input} ${errores.nombre ? styles.inputError : ''}`}
              value={form.nombre} onChange={e => cambiar('nombre', e.target.value)}
              placeholder="Ej: Máquina de coser Overlock"
            />
            {errores.nombre && <p className={styles.error}>{errores.nombre}</p>}
          </div>
          <div className={styles.triple}>
            <div className={styles.grupo}>
              <label className={styles.label}>Marca</label>
              <input className={styles.input} value={form.marca} onChange={e => cambiar('marca', e.target.value)} placeholder="Singer, Brother…" />
            </div>
            <div className={styles.grupo}>
              <label className={styles.label}>Modelo</label>
              <input className={styles.input} value={form.modelo} onChange={e => cambiar('modelo', e.target.value)} placeholder="Modelo" />
            </div>
            <div className={styles.grupo}>
              <label className={styles.label}>N° Serie</label>
              <input className={styles.input} value={form.serie} onChange={e => cambiar('serie', e.target.value)} placeholder="Serie" />
            </div>
          </div>
          <div className={styles.grupo}>
            <label className={styles.label}>Estado</label>
            <select className={styles.select} value={form.estado} onChange={e => cambiar('estado', e.target.value)}>
              {ESTADOS_EQUIPO.map(s => <option key={s.valor} value={s.valor}>{s.label}</option>)}
            </select>
          </div>
          <div className={styles.grupo}>
            <label className={styles.label}>Especificaciones</label>
            <textarea className={styles.textarea} rows={3} value={form.especificaciones}
              onChange={e => cambiar('especificaciones', e.target.value)} placeholder="Detalles técnicos…" />
          </div>
          <div className={styles.grupo}>
            <label className={styles.label}>Insumos asociados</label>
            <input className={styles.input} value={form.insumos} onChange={e => cambiar('insumos', e.target.value)} placeholder="Agujas, aceite, hilo…" />
          </div>
        </div>

        {/* Compra */}
        <div className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Compra</h2>
          <div className={styles.doble}>
            <div className={styles.grupo}>
              <label className={styles.label}>Fecha de compra</label>
              <input type="date" className={styles.input} value={form.fechaCompra} onChange={e => cambiar('fechaCompra', e.target.value)} />
            </div>
            <div className={styles.grupo}>
              <label className={styles.label}>Valor (CLP)</label>
              <div className={styles.precioWrap}>
                <span className={styles.prefijo}>$</span>
                <input type="number" className={`${styles.input} ${styles.inputPrecio}`} value={form.valor}
                  onChange={e => cambiar('valor', e.target.value)} placeholder="0" min="0" />
              </div>
            </div>
          </div>
          <div className={styles.doble}>
            <div className={styles.grupo}>
              <label className={styles.label}>Proveedor</label>
              <input className={styles.input} value={form.proveedor} onChange={e => cambiar('proveedor', e.target.value)} placeholder="Nombre" />
            </div>
            <div className={styles.grupo}>
              <label className={styles.label}>URL foto</label>
              <input className={styles.input} value={form.foto} onChange={e => cambiar('foto', e.target.value)} placeholder="https://…" />
            </div>
          </div>
          <div className={styles.grupo}>
            <label className={styles.label}>URL manual PDF</label>
            <input className={styles.input} value={form.manual} onChange={e => cambiar('manual', e.target.value)} placeholder="https://…" />
          </div>
        </div>

        {/* Mantención */}
        <div className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Mantención</h2>
          <div className={styles.doble}>
            <div className={styles.grupo}>
              <label className={styles.label}>Última mantención</label>
              <input type="date" className={styles.input} value={form.ultimaMantencion} onChange={e => cambiar('ultimaMantencion', e.target.value)} />
            </div>
            <div className={styles.grupo}>
              <label className={styles.label}>Frecuencia (días)</label>
              <input type="number" className={styles.input} value={form.frecuencia}
                onChange={e => cambiar('frecuencia', e.target.value)} placeholder="30" min="1" />
            </div>
          </div>
          <div className={styles.doble}>
            <div className={styles.grupo}>
              <label className={styles.label}>Técnico</label>
              <input className={styles.input} value={form.tecnico} onChange={e => cambiar('tecnico', e.target.value)} placeholder="Nombre del técnico" />
            </div>
            <div className={styles.grupo}>
              <label className={styles.label}>Costo mantención (CLP)</label>
              <div className={styles.precioWrap}>
                <span className={styles.prefijo}>$</span>
                <input type="number" className={`${styles.input} ${styles.inputPrecio}`} value={form.costoMantencion}
                  onChange={e => cambiar('costoMantencion', e.target.value)} placeholder="0" min="0" />
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className={styles.guardarMobile}>
        <button className={styles.btnGuardarMobile} onClick={handleGuardar}>
          <Save size={18} /> {esEdicion ? 'Guardar cambios' : 'Guardar equipo'}
        </button>
      </div>
    </div>
  )
}

export default MaquinariaForm
