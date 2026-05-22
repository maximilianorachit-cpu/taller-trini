import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Zap, Plus, X } from 'lucide-react'
import {
  usePedidosStore,
  TIPOS_SERVICIO, TIPOS_PRENDA, FORMAS_PAGO,
  ESTADOS_PEDIDO, MEDIDAS_POR_PRENDA,
} from '../../store/pedidosStore.js'
import { useClientesStore, TALLAS } from '../../store/clientesStore.js'
import { useAppStore } from '../../store/appStore.js'
import { formatearNumeroPedido, formatearCLP } from '../../utils/formatters.js'
import styles from './PedidoForm.module.css'

const FORM_INICIAL = {
  clienteId: '',
  fechaEntrega: '',
  tipoServicio: 'costura',
  tipoPrenda: '',
  descripcion: '',
  talla: '',
  medidas: {},
  material: { origen: 'comprado', detalle: '', costo: '' },
  urgente: false,
  precio: '',
  formaPago: '',
  estado: 'pendiente',
  abonos: [],
  notas: '',
}

function PedidoForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { ultimoNumero, obtenerPorId, agregar, actualizar } = usePedidosStore()
  const { clientes } = useClientesStore()
  const { config } = useAppStore()

  const esEdicion = Boolean(id)
  const [form, setForm] = useState(FORM_INICIAL)
  const [errores, setErrores] = useState({})
  // Control de nuevo abono temporal
  const [nuevoAbono, setNuevoAbono] = useState({ fecha: '', monto: '', nota: '' })

  const clientesActivos = useMemo(() =>
    clientes.filter(c => c.activo).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    [clientes]
  )

  // Carga los datos del pedido si es edición
  useEffect(() => {
    if (esEdicion) {
      const pedido = obtenerPorId(id)
      if (pedido) {
        setForm({
          clienteId:    pedido.clienteId || '',
          fechaEntrega: pedido.fechaEntrega ? pedido.fechaEntrega.split('T')[0] : '',
          tipoServicio: pedido.tipoServicio,
          tipoPrenda:   pedido.tipoPrenda,
          descripcion:  pedido.descripcion,
          talla:        pedido.talla,
          medidas:      { ...pedido.medidas },
          material:     { ...pedido.material, costo: pedido.material.costo || '' },
          urgente:      pedido.urgente,
          precio:       pedido.precio || '',
          formaPago:    pedido.formaPago,
          estado:       pedido.estado,
          abonos:       [...pedido.abonos],
          notas:        pedido.notas,
        })
      }
    }
  }, [id, esEdicion, obtenerPorId])

  const set = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }))
    setErrores(prev => ({ ...prev, [campo]: '' }))
  }

  const setMaterial = (campo, valor) => {
    setForm(prev => ({ ...prev, material: { ...prev.material, [campo]: valor } }))
  }

  const setMedida = (campo, valor) => {
    setForm(prev => ({ ...prev, medidas: { ...prev.medidas, [campo]: valor } }))
  }

  // Al cambiar prenda, resetea las medidas
  const cambiarPrenda = (valor) => {
    set('tipoPrenda', valor)
    set('medidas', {})
  }

  // Al seleccionar cliente, pre-carga sus medidas si tiene
  const seleccionarCliente = (clienteId) => {
    set('clienteId', clienteId)
    if (!clienteId) return
    const cliente = clientes.find(c => c.id === clienteId)
    if (cliente?.medidas && Object.values(cliente.medidas).some(v => v !== '')) {
      const pregunta = confirm(`¿Deseas cargar las medidas guardadas de ${cliente.nombre}?`)
      if (pregunta) {
        setForm(prev => ({ ...prev, clienteId, talla: cliente.medidas.talla || prev.talla, medidas: { ...prev.medidas, ...cliente.medidas } }))
      }
    }
  }

  // Recargo de urgencia calculado
  const recargoMonto = form.urgente && form.precio
    ? Math.round(Number(form.precio) * config.recargoUrgencia / 100)
    : 0

  const precioTotal = form.precio ? Number(form.precio) + recargoMonto : 0
  const totalAbonado = form.abonos.reduce((s, a) => s + Number(a.monto), 0)

  const agregarAbono = () => {
    if (!nuevoAbono.monto) return
    const abono = {
      id:    crypto.randomUUID(),
      fecha: nuevoAbono.fecha || new Date().toISOString().split('T')[0],
      monto: Number(nuevoAbono.monto),
      nota:  nuevoAbono.nota,
    }
    set('abonos', [...form.abonos, abono])
    setNuevoAbono({ fecha: '', monto: '', nota: '' })
  }

  const eliminarAbono = (abonoId) => {
    set('abonos', form.abonos.filter(a => a.id !== abonoId))
  }

  const validar = () => {
    const nuevos = {}
    if (!form.tipoPrenda) nuevos.tipoPrenda = 'Selecciona el tipo de prenda'
    if (!form.precio || Number(form.precio) <= 0) nuevos.precio = 'Ingresa un precio válido'
    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  const guardar = () => {
    if (!validar()) return
    const datos = {
      ...form,
      precio: Number(form.precio),
      material: { ...form.material, costo: Number(form.material.costo) || 0 },
    }
    if (esEdicion) {
      actualizar(id, datos)
      navigate(`/pedidos/${id}`)
    } else {
      const nuevoId = agregar(datos)
      navigate(`/pedidos/${nuevoId}`)
    }
  }

  const camposMedidas = form.tipoPrenda ? (MEDIDAS_POR_PRENDA[form.tipoPrenda] || []) : []

  return (
    <div className={styles.pagina}>
      {/* Encabezado */}
      <div className={styles.encabezado}>
        <button className={styles.btnVolver} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div className={styles.tituloWrap}>
          <h1 className={styles.titulo}>
            {esEdicion ? 'Editar pedido' : 'Nuevo pedido'}
          </h1>
          {!esEdicion && (
            <span className={styles.numeroPreview}>
              {formatearNumeroPedido(ultimoNumero + 1)}
            </span>
          )}
        </div>
        <button className={styles.btnGuardar} onClick={guardar}>
          <Save size={18} />
          <span>Guardar</span>
        </button>
      </div>

      <div className={styles.formulario}>
        {/* SECCIÓN 1: Básicos */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Información básica</h2>

          <div className={styles.grupo}>
            <label className={styles.label}>Cliente</label>
            {clientesActivos.length === 0 ? (
              <p className={styles.advertencia}>
                No hay clientes activos.{' '}
                <button className={styles.linkBtn} onClick={() => navigate('/clientes/nuevo')}>
                  Crear cliente primero →
                </button>
              </p>
            ) : (
              <select
                value={form.clienteId}
                onChange={e => seleccionarCliente(e.target.value)}
                className={styles.select}
              >
                <option value="">Sin cliente asignado</option>
                {clientesActivos.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            )}
          </div>

          <div className={styles.doble}>
            <div className={styles.grupo}>
              <label className={styles.label}>Fecha de entrega</label>
              <input
                type="date"
                value={form.fechaEntrega}
                onChange={e => set('fechaEntrega', e.target.value)}
                className={styles.input}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className={styles.grupo}>
              <label className={styles.label}>Estado inicial</label>
              <select
                value={form.estado}
                onChange={e => set('estado', e.target.value)}
                className={styles.select}
              >
                {Object.entries(ESTADOS_PEDIDO).map(([valor, { label }]) => (
                  <option key={valor} value={valor}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Urgente */}
          <div className={styles.filaUrgente}>
            <div className={styles.urgenteInfo}>
              <Zap size={18} className={`${styles.iconoUrgente} ${form.urgente ? styles.urgenteActivo : ''}`} />
              <div>
                <p className={styles.label}>Pedido urgente</p>
                <p className={styles.ayuda}>
                  Aplica recargo de {config.recargoUrgencia}% sobre el precio base
                </p>
              </div>
            </div>
            <button
              className={`${styles.toggle} ${form.urgente ? styles.toggleActivo : ''}`}
              onClick={() => set('urgente', !form.urgente)}
              role="switch"
              aria-checked={form.urgente}
            >
              <span className={styles.toggleThumb} />
            </button>
          </div>
        </section>

        {/* SECCIÓN 2: Prenda */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Prenda y servicio</h2>

          <div className={styles.doble}>
            <div className={styles.grupo}>
              <label className={styles.label}>
                Tipo de prenda <span className={styles.requerido}>*</span>
              </label>
              <select
                value={form.tipoPrenda}
                onChange={e => cambiarPrenda(e.target.value)}
                className={`${styles.select} ${errores.tipoPrenda ? styles.inputError : ''}`}
              >
                <option value="">Seleccionar...</option>
                {TIPOS_PRENDA.map(t => (
                  <option key={t.valor} value={t.valor}>{t.emoji} {t.label}</option>
                ))}
              </select>
              {errores.tipoPrenda && <p className={styles.error}>{errores.tipoPrenda}</p>}
            </div>

            <div className={styles.grupo}>
              <label className={styles.label}>Tipo de servicio</label>
              <select
                value={form.tipoServicio}
                onChange={e => set('tipoServicio', e.target.value)}
                className={styles.select}
              >
                {TIPOS_SERVICIO.map(t => (
                  <option key={t.valor} value={t.valor}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.grupo}>
            <label className={styles.label}>Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              placeholder="Describe las características del pedido..."
              className={styles.textarea}
              rows={3}
            />
          </div>

          {/* Talla de referencia */}
          <div className={styles.grupo}>
            <label className={styles.label}>Talla de referencia</label>
            <div className={styles.tallasOpciones}>
              {TALLAS.map(t => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.tallaBtn} ${form.talla === t ? styles.tallaActiva : ''}`}
                  onClick={() => set('talla', form.talla === t ? '' : t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Medidas según prenda */}
          {camposMedidas.length > 0 && (
            <div className={styles.grupo}>
              <label className={styles.label}>Medidas (cm)</label>
              <div className={styles.gridMedidas}>
                {camposMedidas.map(({ key, label }) => (
                  <div key={key} className={styles.campoMedida}>
                    <label className={styles.labelMedida}>{label}</label>
                    <div className={styles.inputMedidaWrap}>
                      <input
                        type="number"
                        min="0"
                        max="500"
                        step="0.5"
                        value={form.medidas[key] || ''}
                        onChange={e => setMedida(key, e.target.value)}
                        placeholder="—"
                        className={styles.inputMedida}
                      />
                      <span className={styles.unidad}>cm</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* SECCIÓN 3: Material */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Material</h2>

          <div className={styles.origenOpciones}>
            {[
              { valor: 'comprado', label: '🛒 Lo compramos nosotros' },
              { valor: 'cliente',  label: '👜 Lo trae el cliente' },
            ].map(({ valor, label }) => (
              <button
                key={valor}
                type="button"
                className={`${styles.origenBtn} ${form.material.origen === valor ? styles.origenActivo : ''}`}
                onClick={() => setMaterial('origen', valor)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className={styles.doble}>
            <div className={styles.grupo}>
              <label className={styles.label}>Detalle del material</label>
              <input
                type="text"
                value={form.material.detalle}
                onChange={e => setMaterial('detalle', e.target.value)}
                placeholder="Ej: Gasa azul, algodón pima..."
                className={styles.input}
              />
            </div>
            <div className={styles.grupo}>
              <label className={styles.label}>
                Costo del material{' '}
                <span className={styles.ayuda}>(solo si lo compramos)</span>
              </label>
              <div className={styles.inputPrecioWrap}>
                <span className={styles.prefijo}>$</span>
                <input
                  type="number"
                  min="0"
                  value={form.material.costo}
                  onChange={e => setMaterial('costo', e.target.value)}
                  placeholder="0"
                  className={`${styles.input} ${styles.inputPrecio}`}
                  disabled={form.material.origen === 'cliente'}
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 4: Precio y pago */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Precio y forma de pago</h2>

          <div className={styles.doble}>
            <div className={styles.grupo}>
              <label className={styles.label}>
                Precio base <span className={styles.requerido}>*</span>
              </label>
              <div className={styles.inputPrecioWrap}>
                <span className={styles.prefijo}>$</span>
                <input
                  type="number"
                  min="0"
                  value={form.precio}
                  onChange={e => set('precio', e.target.value)}
                  placeholder="0"
                  className={`${styles.input} ${styles.inputPrecio} ${errores.precio ? styles.inputError : ''}`}
                />
              </div>
              {errores.precio && <p className={styles.error}>{errores.precio}</p>}
            </div>

            <div className={styles.grupo}>
              <label className={styles.label}>Forma de pago</label>
              <select
                value={form.formaPago}
                onChange={e => set('formaPago', e.target.value)}
                className={styles.select}
              >
                <option value="">Seleccionar...</option>
                {FORMAS_PAGO.map(f => (
                  <option key={f.valor} value={f.valor}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Resumen de precio */}
          {precioTotal > 0 && (
            <div className={styles.resumenPrecio}>
              {form.urgente && (
                <div className={styles.filaResumen}>
                  <span>⚡ Recargo urgencia ({config.recargoUrgencia}%)</span>
                  <span className={styles.recargoMonto}>+ {formatearCLP(recargoMonto)}</span>
                </div>
              )}
              <div className={`${styles.filaResumen} ${styles.totalFila}`}>
                <span>Total</span>
                <span className={styles.totalMonto}>{formatearCLP(precioTotal)}</span>
              </div>
            </div>
          )}

          {/* Abonos */}
          <div className={styles.grupo}>
            <label className={styles.label}>Abonos recibidos</label>
            {form.abonos.length > 0 && (
              <div className={styles.listaAbonos}>
                {form.abonos.map(a => (
                  <div key={a.id} className={styles.abonoItem}>
                    <span className={styles.abonoFecha}>{a.fecha}</span>
                    <span className={styles.abonoNota}>{a.nota || '—'}</span>
                    <span className={styles.abonoMonto}>{formatearCLP(a.monto)}</span>
                    <button
                      type="button"
                      className={styles.btnEliminarAbono}
                      onClick={() => eliminarAbono(a.id)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <div className={styles.totalAbonado}>
                  <span>Total abonado</span>
                  <span>{formatearCLP(totalAbonado)}</span>
                </div>
              </div>
            )}

            {/* Formulario nuevo abono */}
            <div className={styles.nuevoAbono}>
              <input
                type="date"
                value={nuevoAbono.fecha}
                onChange={e => setNuevoAbono(p => ({ ...p, fecha: e.target.value }))}
                className={styles.inputAbono}
              />
              <input
                type="text"
                value={nuevoAbono.nota}
                onChange={e => setNuevoAbono(p => ({ ...p, nota: e.target.value }))}
                placeholder="Concepto (opcional)"
                className={`${styles.inputAbono} ${styles.inputAbonoNota}`}
              />
              <div className={styles.inputPrecioWrap}>
                <span className={styles.prefijo}>$</span>
                <input
                  type="number"
                  min="0"
                  value={nuevoAbono.monto}
                  onChange={e => setNuevoAbono(p => ({ ...p, monto: e.target.value }))}
                  placeholder="Monto"
                  className={`${styles.input} ${styles.inputPrecio} ${styles.inputAbonoMonto}`}
                />
              </div>
              <button
                type="button"
                className={styles.btnAgregarAbono}
                onClick={agregarAbono}
                disabled={!nuevoAbono.monto}
              >
                <Plus size={16} /> Agregar
              </button>
            </div>
          </div>
        </section>

        {/* SECCIÓN 5: Notas */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Notas internas</h2>
          <textarea
            value={form.notas}
            onChange={e => set('notas', e.target.value)}
            placeholder="Indicaciones especiales, colores preferidos, detalles importantes..."
            className={styles.textarea}
            rows={3}
          />
        </section>
      </div>

      {/* Botón guardar mobile */}
      <div className={styles.guardarMobile}>
        <button className={styles.btnGuardarMobile} onClick={guardar}>
          <Save size={18} />
          {esEdicion ? 'Guardar cambios' : 'Crear pedido'}
        </button>
      </div>
    </div>
  )
}

export default PedidoForm
