import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { sanitizarTexto } from '../utils/sanitizers.js'

export const ESTADOS_PEDIDO = {
  'pendiente':  { label: 'Pendiente',  color: '#6B7280', bg: '#F3F4F6' },
  'en-proceso': { label: 'En proceso', color: '#3B82F6', bg: '#DBEAFE' },
  'listo':      { label: 'Listo',      color: '#10B981', bg: '#D1FAE5' },
  'entregado':  { label: 'Entregado',  color: '#14B8A6', bg: '#CCFBF1' },
  'pagado':     { label: 'Pagado',     color: '#059669', bg: '#A7F3D0' },
  'cancelado':  { label: 'Cancelado',  color: '#EF4444', bg: '#FEE2E2' },
  'devuelto':   { label: 'Devuelto',   color: '#F59E0B', bg: '#FEF3C7' },
}

export const TIPOS_SERVICIO = [
  { valor: 'costura',     label: 'Costura'     },
  { valor: 'confeccion',  label: 'Confección'  },
  { valor: 'bordado',     label: 'Bordado'     },
  { valor: 'otro',        label: 'Otro'        },
]

export const TIPOS_PRENDA = [
  { valor: 'polera',      label: 'Polera / Camiseta', emoji: '👕' },
  { valor: 'jeans',       label: 'Jeans / Pantalón',  emoji: '👖' },
  { valor: 'vestido',     label: 'Vestido',            emoji: '👗' },
  { valor: 'cartera',     label: 'Cartera',            emoji: '👜' },
  { valor: 'bolso',       label: 'Bolso',              emoji: '🛍️' },
  { valor: 'mochila',     label: 'Mochila',            emoji: '🎒' },
  { valor: 'sabanas',     label: 'Sábanas',            emoji: '🛏️' },
  { valor: 'cortinas',    label: 'Cortinas',           emoji: '🪟' },
  { valor: 'traje-baile', label: 'Traje de baile',     emoji: '💃' },
  { valor: 'delantal',    label: 'Delantal',           emoji: '🧑‍🍳' },
]

export const FORMAS_PAGO = [
  { valor: 'efectivo',      label: 'Efectivo'      },
  { valor: 'transferencia', label: 'Transferencia' },
  { valor: 'debito',        label: 'Débito'        },
  { valor: 'credito',       label: 'Crédito'       },
  { valor: 'otro',          label: 'Otro'          },
]

// Medidas relevantes por tipo de prenda
export const MEDIDAS_POR_PRENDA = {
  'polera':      [
    { key: 'busto', label: 'Busto' }, { key: 'cintura', label: 'Cintura' },
    { key: 'hombro', label: 'Hombro' }, { key: 'manga_larga', label: 'Manga larga' },
    { key: 'manga_corta', label: 'Manga corta' }, { key: 'largo_total', label: 'Largo total' },
  ],
  'jeans':       [
    { key: 'cintura', label: 'Cintura' }, { key: 'cadera', label: 'Cadera' },
    { key: 'tiro', label: 'Tiro' }, { key: 'muslo', label: 'Muslo' },
    { key: 'rodilla', label: 'Rodilla' }, { key: 'tobillo', label: 'Tobillo' },
    { key: 'largo_pantalon', label: 'Largo pantalón' },
  ],
  'vestido':     [
    { key: 'busto', label: 'Busto' }, { key: 'cintura', label: 'Cintura' },
    { key: 'cadera', label: 'Cadera' }, { key: 'hombro', label: 'Hombro' },
    { key: 'manga_corta', label: 'Manga corta' }, { key: 'manga_larga', label: 'Manga larga' },
    { key: 'largo_vestido', label: 'Largo vestido' },
  ],
  'cartera':     [
    { key: 'ancho', label: 'Ancho' }, { key: 'alto', label: 'Alto' },
    { key: 'profundidad', label: 'Profundidad' },
  ],
  'bolso':       [
    { key: 'ancho', label: 'Ancho' }, { key: 'alto', label: 'Alto' },
    { key: 'profundidad', label: 'Profundidad' }, { key: 'largo_asa', label: 'Largo de asa' },
  ],
  'mochila':     [
    { key: 'ancho', label: 'Ancho' }, { key: 'alto', label: 'Alto' },
    { key: 'profundidad', label: 'Profundidad' },
  ],
  'sabanas':     [
    { key: 'ancho_cama', label: 'Ancho cama' }, { key: 'largo_cama', label: 'Largo cama' },
  ],
  'cortinas':    [
    { key: 'ancho', label: 'Ancho ventana' }, { key: 'largo', label: 'Largo caída' },
  ],
  'traje-baile': [
    { key: 'busto', label: 'Busto' }, { key: 'cintura', label: 'Cintura' },
    { key: 'cadera', label: 'Cadera' }, { key: 'largo_vestido', label: 'Largo vestido' },
    { key: 'manga_larga', label: 'Manga larga' },
  ],
  'delantal':    [
    { key: 'busto', label: 'Busto' }, { key: 'cintura', label: 'Cintura' },
    { key: 'largo_total', label: 'Largo total' },
  ],
}

export const usePedidosStore = create(
  persist(
    (set, get) => ({
      pedidos: [],
      ultimoNumero: 0,

      // Crea un pedido nuevo con número correlativo
      agregar: (datos) => {
        const nuevoNumero = get().ultimoNumero + 1
        const pedido = {
          id:            crypto.randomUUID(),
          numero:        nuevoNumero,
          fechaPedido:   new Date().toISOString(),
          fechaEntrega:  datos.fechaEntrega || null,
          clienteId:     datos.clienteId || null,
          tipoServicio:  datos.tipoServicio || 'costura',
          tipoPrenda:    datos.tipoPrenda || '',
          descripcion:   sanitizarTexto(datos.descripcion || ''),
          medidas:       datos.medidas || {},
          talla:         datos.talla || '',
          material: {
            origen:  datos.material?.origen || 'comprado',
            detalle: sanitizarTexto(datos.material?.detalle || ''),
            costo:   Number(datos.material?.costo) || 0,
          },
          estado:     datos.estado || 'pendiente',
          urgente:    Boolean(datos.urgente),
          precio:     Number(datos.precio) || 0,
          formaPago:  datos.formaPago || '',
          abonos:     datos.abonos || [],
          notas:      sanitizarTexto(datos.notas || ''),
          creadoEn:   new Date().toISOString(),
          actualizadoEn: new Date().toISOString(),
        }
        set(state => ({
          pedidos: [pedido, ...state.pedidos],
          ultimoNumero: nuevoNumero,
        }))
        return pedido.id
      },

      // Actualiza los datos de un pedido
      actualizar: (id, datos) => {
        set(state => ({
          pedidos: state.pedidos.map(p =>
            p.id === id
              ? {
                  ...p,
                  fechaEntrega:  datos.fechaEntrega  ?? p.fechaEntrega,
                  clienteId:     datos.clienteId     ?? p.clienteId,
                  tipoServicio:  datos.tipoServicio  ?? p.tipoServicio,
                  tipoPrenda:    datos.tipoPrenda    ?? p.tipoPrenda,
                  descripcion:   datos.descripcion !== undefined ? sanitizarTexto(datos.descripcion) : p.descripcion,
                  medidas:       datos.medidas       ?? p.medidas,
                  talla:         datos.talla         ?? p.talla,
                  material:      datos.material      ? {
                    origen:  datos.material.origen,
                    detalle: sanitizarTexto(datos.material.detalle || ''),
                    costo:   Number(datos.material.costo) || 0,
                  } : p.material,
                  urgente:    datos.urgente    !== undefined ? datos.urgente    : p.urgente,
                  precio:     datos.precio     !== undefined ? Number(datos.precio) : p.precio,
                  formaPago:  datos.formaPago  ?? p.formaPago,
                  abonos:     datos.abonos     ?? p.abonos,
                  notas:      datos.notas      !== undefined ? sanitizarTexto(datos.notas) : p.notas,
                  actualizadoEn: new Date().toISOString(),
                }
              : p
          )
        }))
      },

      // Cambia el estado del pedido
      cambiarEstado: (id, estado) => {
        set(state => ({
          pedidos: state.pedidos.map(p =>
            p.id === id
              ? { ...p, estado, actualizadoEn: new Date().toISOString() }
              : p
          )
        }))
      },

      // Agrega un abono parcial
      agregarAbono: (id, abono) => {
        const nuevoAbono = {
          id:    crypto.randomUUID(),
          fecha: abono.fecha || new Date().toISOString().split('T')[0],
          monto: Number(abono.monto) || 0,
          nota:  sanitizarTexto(abono.nota || ''),
        }
        set(state => ({
          pedidos: state.pedidos.map(p =>
            p.id === id
              ? { ...p, abonos: [...p.abonos, nuevoAbono], actualizadoEn: new Date().toISOString() }
              : p
          )
        }))
      },

      // Elimina un abono por su ID
      eliminarAbono: (pedidoId, abonoId) => {
        set(state => ({
          pedidos: state.pedidos.map(p =>
            p.id === pedidoId
              ? { ...p, abonos: p.abonos.filter(a => a.id !== abonoId), actualizadoEn: new Date().toISOString() }
              : p
          )
        }))
      },

      // Obtiene un pedido por ID
      obtenerPorId: (id) => get().pedidos.find(p => p.id === id) ?? null,

      // Obtiene todos los pedidos de un cliente
      obtenerPorCliente: (clienteId) => get().pedidos.filter(p => p.clienteId === clienteId),
    }),
    { name: 'taller-trini-pedidos' }
  )
)
