import { useState, useMemo } from 'react'
import { Calculator, TrendingUp, Trash2 } from 'lucide-react'
import { useStockStore } from '../../store/stockStore.js'
import { useAppStore } from '../../store/appStore.js'
import { useCalculadoraStore } from '../../store/calculadoraStore.js'
import { formatearCLP, formatearFechaCorta } from '../../utils/formatters.js'
import styles from './Calculadora.module.css'

function Calculadora() {
  const { materiales }                          = useStockStore()
  const { config }                              = useAppStore()
  const { historial, guardarCalculo, limpiarHistorial } = useCalculadoraStore()

  const [form, setForm] = useState({
    materialId:    '',
    cantidad:      '',
    horas:         '',
    valorHora:     '',
    indirectos:    String(config.costosIndirectos  ?? 15),
    margen:        String(config.margenGanancia    ?? 30),
  })
  const [resultado, setResultado] = useState(null)

  const cambiar = (campo, valor) => setForm(p => ({ ...p, [campo]: valor }))

  const materialSeleccionado = useMemo(
    () => materiales.find(m => m.id === form.materialId),
    [form.materialId, materiales]
  )

  const calcular = () => {
    const cantidad    = Number(form.cantidad  || 0)
    const horas       = Number(form.horas     || 0)
    const valorHora   = Number(form.valorHora || 0)
    const indirectos  = Number(form.indirectos || 0)
    const margen      = Number(form.margen     || 0)

    const costoMaterial = materialSeleccionado
      ? cantidad * (materialSeleccionado.precioUnitario || 0)
      : 0
    const costoManoObra  = horas * valorHora
    const subtotal        = costoMaterial + costoManoObra
    const costoIndirecto  = subtotal * (indirectos / 100)
    const costoTotal      = subtotal + costoIndirecto
    const precioVenta     = costoTotal + costoTotal * (margen / 100)

    const res = {
      materialNombre: materialSeleccionado?.nombre || 'Sin material',
      cantidad, horas, valorHora,
      costoMaterial, costoManoObra,
      subtotal, costoIndirecto, costoTotal, precioVenta,
      indirectos, margen,
    }
    setResultado(res)
    guardarCalculo(res)
  }

  const puedeCalcular = form.horas || form.cantidad

  return (
    <div className={styles.pagina}>
      <div className={styles.encabezado}>
        <h1 className={styles.titulo}>Calculadora</h1>
        <p className={styles.subtitulo}>Precio de venta sugerido</p>
      </div>

      {/* Tarjetas resumen del último cálculo */}
      {resultado && (
        <div className={styles.resumen}>
          <div className={styles.resumenCard}>
            <span className={styles.resumenLabel}>Costo total</span>
            <span className={styles.resumenValor}>{formatearCLP(resultado.costoTotal)}</span>
          </div>
          <div className={`${styles.resumenCard} ${styles.resumenDestacado}`}>
            <span className={styles.resumenLabel}>Precio sugerido</span>
            <span className={styles.resumenValorGrande}>{formatearCLP(resultado.precioVenta)}</span>
          </div>
          <div className={styles.resumenCard}>
            <span className={styles.resumenLabel}>Margen aplicado</span>
            <span className={styles.resumenValor}>{resultado.margen}%</span>
          </div>
        </div>
      )}

      {/* Formulario */}
      <div className={styles.seccion}>
        <h2 className={styles.tituloSeccion}>Datos del trabajo</h2>

        {/* Material */}
        <div className={styles.grupo}>
          <label className={styles.label}>Material del stock</label>
          <select
            className={styles.select}
            value={form.materialId}
            onChange={e => cambiar('materialId', e.target.value)}
          >
            <option value="">Sin material / solo mano de obra</option>
            {materiales.map(m => (
              <option key={m.id} value={m.id}>
                {m.nombre} · {formatearCLP(m.precioUnitario)}/{m.unidad === 'metros' ? 'm' : 'u'} ({m.cantidad} {m.unidad} disponibles)
              </option>
            ))}
          </select>
        </div>

        {form.materialId && materialSeleccionado && (
          <div className={styles.doble}>
            <div className={styles.grupo}>
              <label className={styles.label}>
                Cantidad de material ({materialSeleccionado.unidad})
              </label>
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
            <div className={styles.infoMaterial}>
              <span className={styles.infoLabel}>Precio unitario</span>
              <span className={styles.infoValor}>{formatearCLP(materialSeleccionado.precioUnitario)}</span>
              {form.cantidad > 0 && (
                <>
                  <span className={styles.infoLabel}>Subtotal material</span>
                  <span className={styles.infoValor}>
                    {formatearCLP(Number(form.cantidad) * materialSeleccionado.precioUnitario)}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Mano de obra */}
        <div className={styles.doble}>
          <div className={styles.grupo}>
            <label className={styles.label}>Horas de trabajo</label>
            <input
              type="number"
              className={styles.input}
              value={form.horas}
              onChange={e => cambiar('horas', e.target.value)}
              placeholder="0"
              min="0"
              step="0.5"
            />
          </div>
          <div className={styles.grupo}>
            <label className={styles.label}>Valor hora (CLP)</label>
            <div className={styles.precioWrap}>
              <span className={styles.prefijo}>$</span>
              <input
                type="number"
                className={`${styles.input} ${styles.inputPrecio}`}
                value={form.valorHora}
                onChange={e => cambiar('valorHora', e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Porcentajes */}
        <div className={styles.doble}>
          <div className={styles.grupo}>
            <label className={styles.label}>
              Costos indirectos <span className={styles.ayuda}>(desde configuración)</span>
            </label>
            <div className={styles.porcentajeWrap}>
              <input
                type="number"
                className={`${styles.input} ${styles.inputPorcentaje}`}
                value={form.indirectos}
                onChange={e => cambiar('indirectos', e.target.value)}
                min="0"
                max="100"
              />
              <span className={styles.sufijo}>%</span>
            </div>
          </div>
          <div className={styles.grupo}>
            <label className={styles.label}>
              Margen de ganancia <span className={styles.ayuda}>(desde configuración)</span>
            </label>
            <div className={styles.porcentajeWrap}>
              <input
                type="number"
                className={`${styles.input} ${styles.inputPorcentaje}`}
                value={form.margen}
                onChange={e => cambiar('margen', e.target.value)}
                min="0"
                max="100"
              />
              <span className={styles.sufijo}>%</span>
            </div>
          </div>
        </div>

        <button
          className={styles.btnCalcular}
          onClick={calcular}
          disabled={!puedeCalcular}
        >
          <Calculator size={17} /> Calcular precio
        </button>
      </div>

      {/* Desglose del último cálculo */}
      {resultado && (
        <div className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Desglose</h2>
          <div className={styles.desglose}>
            <div className={styles.desgloseRow}>
              <span>Material ({resultado.materialNombre})</span>
              <span>{formatearCLP(resultado.costoMaterial)}</span>
            </div>
            <div className={styles.desgloseRow}>
              <span>Mano de obra ({resultado.horas}h × {formatearCLP(resultado.valorHora)})</span>
              <span>{formatearCLP(resultado.costoManoObra)}</span>
            </div>
            <div className={`${styles.desgloseRow} ${styles.desgloseSubtotal}`}>
              <span>Subtotal</span>
              <span>{formatearCLP(resultado.subtotal)}</span>
            </div>
            <div className={styles.desgloseRow}>
              <span>Costos indirectos ({resultado.indirectos}%)</span>
              <span>{formatearCLP(resultado.costoIndirecto)}</span>
            </div>
            <div className={`${styles.desgloseRow} ${styles.desgloseCosto}`}>
              <span>Costo total</span>
              <span>{formatearCLP(resultado.costoTotal)}</span>
            </div>
            <div className={`${styles.desgloseRow} ${styles.desglosePrecio}`}>
              <span>+ Margen ({resultado.margen}%)</span>
              <span className={styles.precioFinal}>{formatearCLP(resultado.precioVenta)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Historial comparativo */}
      {historial.length > 0 && (
        <div className={styles.seccion}>
          <div className={styles.historialEncabezado}>
            <h2 className={styles.tituloSeccion}>
              <TrendingUp size={13} style={{ display: 'inline', marginRight: '0.4rem' }} />
              Últimos cálculos
            </h2>
            <button className={styles.btnLimpiar} onClick={limpiarHistorial}>
              <Trash2 size={13} /> Limpiar
            </button>
          </div>
          <ul className={styles.historialLista}>
            {historial.map(h => (
              <li key={h.id} className={styles.historialItem}>
                <div className={styles.historialInfo}>
                  <span className={styles.historialMaterial}>{h.materialNombre}</span>
                  <span className={styles.historialFecha}>{formatearFechaCorta(h.fecha)}</span>
                </div>
                <div className={styles.historialPrecios}>
                  <span className={styles.historialCosto}>{formatearCLP(h.costoTotal)} costo</span>
                  <span className={styles.historialVenta}>{formatearCLP(h.precioVenta)} venta</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default Calculadora
