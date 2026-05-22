import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Edit2, Trash2, Plus, Package,
  TrendingUp, ShoppingCart, AlertTriangle, CheckCircle, X
} from 'lucide-react'
import { useStockStore } from '../../store/stockStore.js'
import { formatearCLP, formatearFechaCorta } from '../../utils/formatters.js'
import styles from './StockDetalle.module.css'

function StockDetalle() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { obtenerPorId, agregarCompra, eliminar } = useStockStore()

  const [mostrarFormCompra,   setMostrarFormCompra]   = useState(false)
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false)
  const [compra, setCompra] = useState({ cantidad: '', precio: '' })

  const material = obtenerPorId(id)

  if (!material) {
    return (
      <div className={styles.noEncontrado}>
        <Package size={40} />
        <p>Material no encontrado.</p>
        <button className={styles.btnVolverSimple} onClick={() => navigate('/stock')}>
          <ArrowLeft size={16} /> Volver al stock
        </button>
      </div>
    )
  }

  const bajoStock  = material.cantidad <= material.umbral
  const valorTotal = material.cantidad * material.precioUnitario

  // Registra la compra y cierra el formulario
  const handleAgregarCompra = () => {
    const cant = Number(compra.cantidad)
    if (!cant || cant <= 0) return
    const precio = Number(compra.precio || 0)
    agregarCompra(id, cant, precio || null)
    setCompra({ cantidad: '', precio: '' })
    setMostrarFormCompra(false)
  }

  const handleEliminar = () => {
    eliminar(id)
    navigate('/stock')
  }

  return (
    <div className={styles.pagina}>

      {/* Encabezado */}
      <div className={styles.encabezado}>
        <button className={styles.btnVolver} onClick={() => navigate('/stock')} aria-label="Volver">
          <ArrowLeft size={20} />
        </button>
        <div className={styles.acciones}>
          <button className={styles.btnAccion} onClick={() => navigate(`/stock/${id}/editar`)}>
            <Edit2 size={15} /> <span>Editar</span>
          </button>
          <button
            className={`${styles.btnAccion} ${styles.btnEliminar}`}
            onClick={() => setConfirmandoEliminar(true)}
          >
            <Trash2 size={15} /> <span>Eliminar</span>
          </button>
        </div>
      </div>

      {/* Perfil del material */}
      <div className={styles.perfil}>
        <div className={styles.foto}>
          {material.foto
            ? <img src={material.foto} alt={material.nombre} className={styles.fotoImg} />
            : <span className={styles.fotoPlaceholder}>
                {material.nombre.charAt(0).toUpperCase()}
              </span>
          }
        </div>
        <div className={styles.perfilInfo}>
          <h1 className={styles.nombre}>{material.nombre}</h1>
          {material.descripcion && (
            <p className={styles.descripcion}>{material.descripcion}</p>
          )}
          <span className={`${styles.badge} ${bajoStock ? styles.badgeComprar : styles.badgeOk}`}>
            {bajoStock
              ? <><AlertTriangle size={12} /> Comprar</>
              : <><CheckCircle size={12} /> Stock OK</>
            }
          </span>
        </div>
      </div>

      {/* Inventario */}
      <section className={styles.seccion}>
        <h2 className={styles.tituloSeccion}>Inventario</h2>
        <div className={styles.fichaGrid}>
          <div className={styles.fichaItem}>
            <span className={styles.fichaLabel}>Cantidad actual</span>
            <span className={styles.fichaValor}>{material.cantidad} {material.unidad}</span>
          </div>
          <div className={styles.fichaItem}>
            <span className={styles.fichaLabel}>Umbral de alerta</span>
            <span className={styles.fichaValor}>{material.umbral} {material.unidad}</span>
          </div>
          <div className={styles.fichaItem}>
            <span className={styles.fichaLabel}>Precio unitario</span>
            <span className={styles.fichaValor}>
              {material.precioUnitario > 0 ? formatearCLP(material.precioUnitario) : '—'}
            </span>
          </div>
          <div className={styles.fichaItem}>
            <span className={styles.fichaLabel}>Valor en stock</span>
            <span className={`${styles.fichaValor} ${styles.valorDestacado}`}>
              {formatearCLP(valorTotal)}
            </span>
          </div>
        </div>
      </section>

      {/* Proveedor */}
      {(material.proveedor || material.contacto) && (
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Proveedor</h2>
          <div className={styles.fichaGrid}>
            {material.proveedor && (
              <div className={styles.fichaItem}>
                <span className={styles.fichaLabel}>Nombre</span>
                <span className={styles.fichaValor}>{material.proveedor}</span>
              </div>
            )}
            {material.contacto && (
              <div className={styles.fichaItem}>
                <span className={styles.fichaLabel}>Contacto</span>
                <span className={styles.fichaValor}>{material.contacto}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Registrar compra */}
      <section className={styles.seccion}>
        <div className={styles.compraEncabezado}>
          <h2 className={styles.tituloSeccion}>
            <ShoppingCart size={13} style={{ display: 'inline', marginRight: '0.4rem' }} />
            Agregar compra
          </h2>
        </div>

        {!mostrarFormCompra ? (
          <button className={styles.btnAgregarCompra} onClick={() => setMostrarFormCompra(true)}>
            <Plus size={15} /> Registrar compra
          </button>
        ) : (
          <div className={styles.formCompra}>
            <div className={styles.formCompraRow}>
              <div className={styles.grupoCompra}>
                <label className={styles.labelCompra}>
                  Cantidad a sumar
                </label>
                <div className={styles.inputUnidadWrap}>
                  <input
                    type="number"
                    className={styles.inputCompra}
                    value={compra.cantidad}
                    onChange={e => setCompra(p => ({ ...p, cantidad: e.target.value }))}
                    placeholder="0"
                    min="0.1"
                    step="0.1"
                    autoFocus
                  />
                  <span className={styles.unidadLabel}>{material.unidad}</span>
                </div>
              </div>
              <div className={styles.grupoCompra}>
                <label className={styles.labelCompra}>
                  Nuevo precio <span className={styles.ayudaLabel}>(opcional)</span>
                </label>
                <div className={styles.inputPrecioWrap}>
                  <span className={styles.prefijo}>$</span>
                  <input
                    type="number"
                    className={styles.inputCompra}
                    value={compra.precio}
                    onChange={e => setCompra(p => ({ ...p, precio: e.target.value }))}
                    placeholder={String(material.precioUnitario || '0')}
                    min="0"
                  />
                </div>
              </div>
            </div>
            <div className={styles.botonesCompra}>
              <button
                className={styles.btnConfirmarCompra}
                onClick={handleAgregarCompra}
                disabled={!compra.cantidad || Number(compra.cantidad) <= 0}
              >
                <Plus size={15} /> Confirmar
              </button>
              <button
                className={styles.btnCancelarCompra}
                onClick={() => { setMostrarFormCompra(false); setCompra({ cantidad: '', precio: '' }) }}
              >
                <X size={15} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Historial de precios */}
      {material.historialPrecios?.length > 0 && (
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>
            <TrendingUp size={13} style={{ display: 'inline', marginRight: '0.4rem' }} />
            Historial de precios
          </h2>
          <ul className={styles.historialLista}>
            {[...material.historialPrecios].reverse().map((h, i) => (
              <li key={i} className={styles.historialItem}>
                <span className={styles.historialFecha}>{formatearFechaCorta(h.fecha)}</span>
                <span className={styles.historialPrecio}>{formatearCLP(h.precio)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Diálogo confirmar eliminación */}
      {confirmandoEliminar && (
        <div className={styles.overlay} onClick={() => setConfirmandoEliminar(false)}>
          <div className={styles.dialogo} onClick={e => e.stopPropagation()}>
            <h3>¿Eliminar {material.nombre}?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className={styles.dialogoAcciones}>
              <button className={styles.btnCancelar} onClick={() => setConfirmandoEliminar(false)}>
                Cancelar
              </button>
              <button className={styles.btnConfirmarEliminar} onClick={handleEliminar}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default StockDetalle
