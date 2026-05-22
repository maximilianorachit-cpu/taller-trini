import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Edit2, Printer, ExternalLink, Plus, X,
  Zap, Calendar, ChevronDown, Package
} from 'lucide-react'
import {
  usePedidosStore, ESTADOS_PEDIDO, TIPOS_PRENDA,
  TIPOS_SERVICIO, FORMAS_PAGO, MEDIDAS_POR_PRENDA,
} from '../../store/pedidosStore.js'
import { useClientesStore } from '../../store/clientesStore.js'
import { useAppStore } from '../../store/appStore.js'
import {
  formatearNumeroPedido, formatearFechaCorta, formatearFechaRelativa, formatearCLP
} from '../../utils/formatters.js'
import styles from './PedidoDetalle.module.css'

// Genera el HTML de la impresión/PDF del pedido
const generarHTMLPedido = (pedido, cliente, totalAbonado, saldo) => {
  const prenda = TIPOS_PRENDA.find(t => t.valor === pedido.tipoPrenda)
  const estadoInfo = ESTADOS_PEDIDO[pedido.estado]
  const camposMedidas = (MEDIDAS_POR_PRENDA[pedido.tipoPrenda] || [])
    .filter(({ key }) => pedido.medidas?.[key])

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Pedido ${formatearNumeroPedido(pedido.numero)} — El Taller de Trini</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;padding:2rem;color:#1a1a2e;font-size:13px}
.cabecera{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:1rem;border-bottom:2px solid #E91E8C;margin-bottom:1.5rem}
.logo{font-size:1.25rem;font-weight:bold;color:#E91E8C}.subtitulo{font-size:0.75rem;color:#6b5b6e;margin-top:0.2rem}
.numero{font-size:1.75rem;font-weight:bold;color:#1a1a2e}
.seccion{margin-bottom:1.25rem}
.sec-titulo{font-size:0.65rem;font-weight:bold;color:#E91E8C;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #e8d5e1;padding-bottom:0.25rem;margin-bottom:0.625rem}
.fila{display:flex;gap:0.75rem;margin-bottom:0.35rem}
.lbl{font-weight:bold;min-width:130px;color:#6b5b6e;font-size:0.85rem;flex-shrink:0}
.val{color:#1a1a2e}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0.4rem;margin-top:0.4rem}
.medida{background:#fdf0f7;padding:0.4rem;border-radius:4px;text-align:center}
.ml{font-size:0.6rem;color:#6b5b6e;text-transform:uppercase}
.mv{font-weight:bold;font-size:0.95rem}
.badge{display:inline-block;padding:0.2rem 0.6rem;border-radius:999px;font-size:0.75rem;font-weight:bold;background:${estadoInfo?.bg};color:${estadoInfo?.color}}
.urgente{color:#F59E0B;font-weight:bold}
.tabla-abonos{width:100%;border-collapse:collapse;margin-top:0.5rem}
.tabla-abonos th,.tabla-abonos td{padding:0.4rem 0.5rem;text-align:left;border-bottom:1px solid #e8d5e1;font-size:0.85rem}
.tabla-abonos th{color:#6b5b6e;font-weight:bold;font-size:0.7rem;text-transform:uppercase}
.totales{display:flex;justify-content:flex-end;gap:2rem;margin-top:0.75rem;font-size:0.9rem}
.t-lbl{color:#6b5b6e}.t-val{font-weight:bold}
.precio-total{font-size:1.2rem;color:#E91E8C}
.footer{margin-top:2rem;text-align:center;font-size:0.7rem;color:#b8a8c0;border-top:1px solid #e8d5e1;padding-top:1rem}
@media print{body{padding:1rem}}
</style>
</head>
<body>
<div class="cabecera">
  <div>
    <div class="logo">✂️ El Taller de Trini</div>
    <div class="subtitulo">Emitido el ${formatearFechaCorta(new Date())}</div>
  </div>
  <div class="numero">${formatearNumeroPedido(pedido.numero)}</div>
</div>

<div class="seccion">
  <div class="sec-titulo">Cliente</div>
  <div class="fila"><span class="lbl">Nombre</span><span class="val">${cliente?.nombre || 'Sin cliente'}</span></div>
  ${cliente?.celular ? `<div class="fila"><span class="lbl">Celular</span><span class="val">${cliente.celular}</span></div>` : ''}
</div>

<div class="seccion">
  <div class="sec-titulo">Pedido</div>
  <div class="fila"><span class="lbl">Prenda</span><span class="val">${prenda?.emoji || ''} ${prenda?.label || pedido.tipoPrenda}</span></div>
  <div class="fila"><span class="lbl">Servicio</span><span class="val">${TIPOS_SERVICIO.find(t => t.valor === pedido.tipoServicio)?.label || pedido.tipoServicio}</span></div>
  <div class="fila"><span class="lbl">Estado</span><span class="val"><span class="badge">${estadoInfo?.label || pedido.estado}</span></span></div>
  <div class="fila"><span class="lbl">Fecha pedido</span><span class="val">${formatearFechaCorta(pedido.fechaPedido)}</span></div>
  ${pedido.fechaEntrega ? `<div class="fila"><span class="lbl">Fecha entrega</span><span class="val">${formatearFechaCorta(pedido.fechaEntrega)}</span></div>` : ''}
  ${pedido.urgente ? `<div class="fila"><span class="lbl">Urgencia</span><span class="val urgente">⚡ Pedido urgente — recargo aplicado</span></div>` : ''}
  ${pedido.talla ? `<div class="fila"><span class="lbl">Talla</span><span class="val">${pedido.talla}</span></div>` : ''}
  ${pedido.descripcion ? `<div class="fila"><span class="lbl">Descripción</span><span class="val">${pedido.descripcion}</span></div>` : ''}
</div>

${camposMedidas.length > 0 ? `
<div class="seccion">
  <div class="sec-titulo">Medidas</div>
  <div class="grid">
    ${camposMedidas.map(({ key, label }) => `
      <div class="medida">
        <div class="ml">${label}</div>
        <div class="mv">${pedido.medidas[key]} cm</div>
      </div>
    `).join('')}
  </div>
</div>` : ''}

<div class="seccion">
  <div class="sec-titulo">Material</div>
  <div class="fila"><span class="lbl">Origen</span><span class="val">${pedido.material?.origen === 'cliente' ? 'Lo trae el cliente' : 'Comprado'}</span></div>
  ${pedido.material?.detalle ? `<div class="fila"><span class="lbl">Detalle</span><span class="val">${pedido.material.detalle}</span></div>` : ''}
</div>

<div class="seccion">
  <div class="sec-titulo">Pago</div>
  <div class="fila"><span class="lbl">Precio total</span><span class="val precio-total">${formatearCLP(pedido.precio)}</span></div>
  ${pedido.formaPago ? `<div class="fila"><span class="lbl">Forma de pago</span><span class="val">${FORMAS_PAGO.find(f => f.valor === pedido.formaPago)?.label || pedido.formaPago}</span></div>` : ''}
  ${pedido.abonos?.length > 0 ? `
    <table class="tabla-abonos">
      <tr><th>Fecha</th><th>Concepto</th><th>Monto</th></tr>
      ${pedido.abonos.map(a => `<tr><td>${a.fecha}</td><td>${a.nota || '—'}</td><td>${formatearCLP(a.monto)}</td></tr>`).join('')}
    </table>
    <div class="totales">
      <div><span class="t-lbl">Total abonado: </span><span class="t-val" style="color:#10B981">${formatearCLP(totalAbonado)}</span></div>
      <div><span class="t-lbl">Saldo: </span><span class="t-val" style="color:#EF4444">${formatearCLP(Math.max(0, saldo))}</span></div>
    </div>
  ` : ''}
</div>

${pedido.notas ? `
<div class="seccion">
  <div class="sec-titulo">Notas</div>
  <p>${pedido.notas}</p>
</div>` : ''}

<div class="footer">El Taller de Trini · Pedido ${formatearNumeroPedido(pedido.numero)} · ${formatearFechaCorta(new Date())}</div>
<script>window.onload=()=>window.print()</script>
</body></html>`
}

function PedidoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { obtenerPorId, cambiarEstado, agregarAbono, eliminarAbono } = usePedidosStore()
  const { clientes } = useClientesStore()
  const { config } = useAppStore()

  const [mostrarCambiarEstado, setMostrarCambiarEstado] = useState(false)
  const [nuevoAbono, setNuevoAbono] = useState({ fecha: '', monto: '', nota: '' })
  const [mostrarFormAbono, setMostrarFormAbono] = useState(false)

  const pedido = obtenerPorId(id)

  if (!pedido) {
    return (
      <div className={styles.noEncontrado}>
        <p>Pedido no encontrado.</p>
        <button className={styles.btnVolver} onClick={() => navigate('/pedidos')}>
          <ArrowLeft size={18} /> Volver a pedidos
        </button>
      </div>
    )
  }

  const cliente = clientes.find(c => c.id === pedido.clienteId)
  const prenda = TIPOS_PRENDA.find(t => t.valor === pedido.tipoPrenda)
  const estado = ESTADOS_PEDIDO[pedido.estado]
  const totalAbonado = pedido.abonos.reduce((s, a) => s + a.monto, 0)
  const saldo = pedido.precio - totalAbonado
  const camposMedidas = (MEDIDAS_POR_PRENDA[pedido.tipoPrenda] || [])
    .filter(({ key }) => pedido.medidas?.[key])

  const diferenciaDias = pedido.fechaEntrega
    ? Math.ceil((new Date(pedido.fechaEntrega) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  // Genera el link de WhatsApp según el estado del pedido
  const generarMensajeWhatsApp = () => {
    if (!cliente?.celular) return null
    const num = '56' + cliente.celular.replace(/\D/g, '')
    let msg = `Hola ${cliente.nombre}! `
    if (pedido.estado === 'listo') {
      msg += `Tu pedido ${formatearNumeroPedido(pedido.numero)} (${prenda?.label}) está *listo para retirar* 🎉`
    } else if (pedido.estado === 'entregado') {
      msg += `Muchas gracias por retirar tu pedido ${formatearNumeroPedido(pedido.numero)}. Esperamos que lo disfrutes! El Taller de Trini ✂️`
    } else {
      msg += `Te contactamos por tu pedido ${formatearNumeroPedido(pedido.numero)} (${prenda?.label}). Estado: *${estado?.label}*`
      if (pedido.fechaEntrega) msg += `. Fecha entrega: ${formatearFechaCorta(pedido.fechaEntrega)}`
      if (saldo > 0) msg += `. Saldo pendiente: ${formatearCLP(saldo)}`
      msg += `. El Taller de Trini ✂️`
    }
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`
  }

  const exportarPDF = () => {
    const ventana = window.open('', '_blank', 'width=800,height=1100')
    if (!ventana) {
      alert('Activa las ventanas emergentes para exportar el PDF.')
      return
    }
    ventana.document.write(generarHTMLPedido(pedido, cliente, totalAbonado, saldo))
    ventana.document.close()
  }

  const handleCambiarEstado = (nuevoEstado) => {
    cambiarEstado(id, nuevoEstado)
    setMostrarCambiarEstado(false)
  }

  const handleAgregarAbono = () => {
    if (!nuevoAbono.monto) return
    agregarAbono(id, nuevoAbono)
    setNuevoAbono({ fecha: '', monto: '', nota: '' })
    setMostrarFormAbono(false)
  }

  const linkWA = generarMensajeWhatsApp()

  return (
    <div className={styles.pagina}>
      {/* Encabezado */}
      <div className={styles.encabezado}>
        <button className={styles.btnVolver} onClick={() => navigate('/pedidos')}>
          <ArrowLeft size={20} />
        </button>
        <h1 className={styles.numero}>
          {formatearNumeroPedido(pedido.numero)}
          {pedido.urgente && <Zap size={16} className={styles.iconoUrgente} title="Urgente" />}
        </h1>
        <div className={styles.acciones}>
          <button className={styles.btnAccion} onClick={() => navigate(`/pedidos/${id}/editar`)} title="Editar">
            <Edit2 size={16} /> <span>Editar</span>
          </button>
          {linkWA && (
            <a href={linkWA} target="_blank" rel="noopener noreferrer" className={`${styles.btnAccion} ${styles.btnWA}`} title="WhatsApp">
              <ExternalLink size={16} /> <span>WhatsApp</span>
            </a>
          )}
          <button className={styles.btnAccion} onClick={exportarPDF} title="Exportar PDF">
            <Printer size={16} /> <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Estado + cambiar estado */}
      <div className={styles.estadoRow}>
        <div className={styles.estadoActual}>
          <span className={styles.badge} style={{ color: estado?.color, background: estado?.bg }}>
            {estado?.label}
          </span>
          {pedido.fechaEntrega && (
            <span className={`${styles.fechaChip} ${diferenciaDias !== null && diferenciaDias < 0 ? styles.vencida : diferenciaDias !== null && diferenciaDias <= 3 ? styles.proxima : ''}`}>
              <Calendar size={13} />
              {formatearFechaRelativa(pedido.fechaEntrega)} · {formatearFechaCorta(pedido.fechaEntrega)}
            </span>
          )}
        </div>
        <div className={styles.cambiarEstadoWrap}>
          <button
            className={styles.btnCambiarEstado}
            onClick={() => setMostrarCambiarEstado(p => !p)}
          >
            Cambiar estado <ChevronDown size={14} />
          </button>
          {mostrarCambiarEstado && (
            <div className={styles.dropdownEstado}>
              {Object.entries(ESTADOS_PEDIDO).map(([valor, info]) => (
                <button
                  key={valor}
                  className={`${styles.dropdownItem} ${pedido.estado === valor ? styles.dropdownActivo : ''}`}
                  onClick={() => handleCambiarEstado(valor)}
                >
                  <span className={styles.dotEstado} style={{ background: info.color }} />
                  {info.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info del pedido */}
      <section className={styles.seccion}>
        <h2 className={styles.tituloSeccion}>Pedido</h2>
        <div className={styles.infoGrid}>
          {prenda && (
            <div className={styles.prendaDestacada}>
              <span className={styles.prendaEmoji}>{prenda.emoji}</span>
              <div>
                <p className={styles.prendaNombre}>{prenda.label}</p>
                <p className={styles.servicioLabel}>
                  {TIPOS_SERVICIO.find(s => s.valor === pedido.tipoServicio)?.label}
                </p>
              </div>
            </div>
          )}
          {cliente && (
            <button className={styles.clienteChip} onClick={() => navigate(`/clientes/${cliente.id}`)}>
              <Package size={14} />
              <span>Cliente: <strong>{cliente.nombre}</strong></span>
              <ExternalLink size={12} />
            </button>
          )}
          {pedido.talla && (
            <p className={styles.fichaFila}><span>Talla:</span> <strong>{pedido.talla}</strong></p>
          )}
          {pedido.descripcion && (
            <p className={`${styles.fichaFila} ${styles.descripcion}`}>{pedido.descripcion}</p>
          )}
        </div>
      </section>

      {/* Medidas */}
      {camposMedidas.length > 0 && (
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Medidas</h2>
          <div className={styles.gridMedidas}>
            {camposMedidas.map(({ key, label }) => (
              <div key={key} className={styles.medidaItem}>
                <span className={styles.medidaLabel}>{label}</span>
                <span className={styles.medidaValor}>{pedido.medidas[key]} cm</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Material */}
      <section className={styles.seccion}>
        <h2 className={styles.tituloSeccion}>Material</h2>
        <div className={styles.fichaFila}>
          <span>Origen:</span>
          <strong>{pedido.material?.origen === 'cliente' ? '👜 Lo trae el cliente' : '🛒 Comprado'}</strong>
        </div>
        {pedido.material?.detalle && (
          <div className={styles.fichaFila}><span>Detalle:</span> <strong>{pedido.material.detalle}</strong></div>
        )}
        {pedido.material?.costo > 0 && (
          <div className={styles.fichaFila}><span>Costo material:</span> <strong>{formatearCLP(pedido.material.costo)}</strong></div>
        )}
      </section>

      {/* Pago */}
      <section className={styles.seccion}>
        <h2 className={styles.tituloSeccion}>Pago</h2>
        <div className={styles.resumenPago}>
          <div className={styles.pagoFila}>
            <span>Precio total</span>
            <span className={styles.precioTotal}>{formatearCLP(pedido.precio)}</span>
          </div>
          {pedido.urgente && (
            <div className={`${styles.pagoFila} ${styles.recargoFila}`}>
              <span>⚡ Incluye recargo urgencia ({config.recargoUrgencia}%)</span>
            </div>
          )}
          {pedido.formaPago && (
            <div className={styles.pagoFila}>
              <span>Forma de pago</span>
              <span>{FORMAS_PAGO.find(f => f.valor === pedido.formaPago)?.label || pedido.formaPago}</span>
            </div>
          )}
        </div>

        {/* Abonos */}
        {pedido.abonos.length > 0 && (
          <div className={styles.abonosLista}>
            <p className={styles.subtituloAbonos}>Abonos recibidos</p>
            {pedido.abonos.map(a => (
              <div key={a.id} className={styles.abonoItem}>
                <span className={styles.abonoFecha}>{a.fecha}</span>
                <span className={styles.abonoNota}>{a.nota || '—'}</span>
                <span className={styles.abonoMonto}>{formatearCLP(a.monto)}</span>
                <button
                  className={styles.btnEliminarAbono}
                  onClick={() => eliminarAbono(id, a.id)}
                  title="Eliminar abono"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <div className={styles.resumenAbonos}>
              <div className={styles.pagoFila}>
                <span>Total abonado</span>
                <span className={styles.montoAbonado}>{formatearCLP(totalAbonado)}</span>
              </div>
              <div className={styles.pagoFila}>
                <span>Saldo pendiente</span>
                <span className={saldo > 0 ? styles.saldoPendiente : styles.saldoCero}>
                  {formatearCLP(Math.max(0, saldo))}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Agregar abono */}
        {!mostrarFormAbono ? (
          <button className={styles.btnAgregarAbono} onClick={() => setMostrarFormAbono(true)}>
            <Plus size={16} /> Registrar abono
          </button>
        ) : (
          <div className={styles.formAbono}>
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
                className={`${styles.inputAbono} ${styles.inputAbonoMonto}`}
                style={{ border: 'none', outline: 'none', borderRadius: 0 }}
              />
            </div>
            <button className={styles.btnConfirmarAbono} onClick={handleAgregarAbono} disabled={!nuevoAbono.monto}>
              <Plus size={16} /> Agregar
            </button>
            <button className={styles.btnCancelarAbono} onClick={() => setMostrarFormAbono(false)}>
              <X size={16} />
            </button>
          </div>
        )}
      </section>

      {/* Notas */}
      {pedido.notas && (
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Notas internas</h2>
          <p className={styles.notasTexto}>{pedido.notas}</p>
        </section>
      )}
    </div>
  )
}

export default PedidoDetalle
