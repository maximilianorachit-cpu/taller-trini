import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { sanitizarTexto } from '../utils/sanitizers.js'

// Materiales iniciales del taller
const MATERIALES_INICIALES = [
  {
    id: 'stock-inicial-1',
    foto: '',
    nombre: 'Algodón crea',
    descripcion: 'Tela para delantales y trabajos generales.',
    unidad: 'metros',
    cantidad: 0,
    precioUnitario: 0,
    proveedor: '',
    contacto: '',
    umbral: 1,
    historialPrecios: [],
    creadoEn: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'stock-inicial-2',
    foto: '',
    nombre: 'Micropolar',
    descripcion: 'Tela para prendas de invierno.',
    unidad: 'metros',
    cantidad: 0,
    precioUnitario: 0,
    proveedor: '',
    contacto: '',
    umbral: 1,
    historialPrecios: [],
    creadoEn: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'stock-inicial-3',
    foto: '',
    nombre: 'Strech',
    descripcion: 'Tela para prendas flexibles y elásticas.',
    unidad: 'metros',
    cantidad: 0,
    precioUnitario: 0,
    proveedor: '',
    contacto: '',
    umbral: 1,
    historialPrecios: [],
    creadoEn: '2024-01-01T00:00:00.000Z',
  },
]

export const UNIDADES = [
  { valor: 'metros',   label: 'Metros'   },
  { valor: 'unidades', label: 'Unidades' },
  { valor: 'kilos',    label: 'Kilos'    },
  { valor: 'rollos',   label: 'Rollos'   },
]

export const useStockStore = create(
  persist(
    (set, get) => ({
      materiales: MATERIALES_INICIALES,

      // Agrega un nuevo material al stock
      agregar: (datos) => {
        const id = `mat-${Date.now()}`
        const precio = Number(datos.precioUnitario || 0)
        const material = {
          id,
          foto:          sanitizarTexto(datos.foto || ''),
          nombre:        sanitizarTexto(datos.nombre),
          descripcion:   sanitizarTexto(datos.descripcion || ''),
          unidad:        datos.unidad || 'metros',
          cantidad:      Number(datos.cantidad || 0),
          precioUnitario: precio,
          proveedor:     sanitizarTexto(datos.proveedor || ''),
          contacto:      sanitizarTexto(datos.contacto || ''),
          umbral:        Number(datos.umbral || 0),
          historialPrecios: precio > 0
            ? [{ fecha: new Date().toISOString().slice(0, 10), precio }]
            : [],
          creadoEn: new Date().toISOString(),
        }
        set(state => ({ materiales: [...state.materiales, material] }))
        return id
      },

      // Actualiza campos de un material existente
      actualizar: (id, cambios) => {
        set(state => ({
          materiales: state.materiales.map(m => {
            if (m.id !== id) return m
            const nuevoPrecio = Number(cambios.precioUnitario ?? m.precioUnitario)
            const precioDistinto = nuevoPrecio > 0 && nuevoPrecio !== m.precioUnitario
            return {
              ...m,
              ...cambios,
              nombre:         sanitizarTexto(cambios.nombre        ?? m.nombre),
              descripcion:    sanitizarTexto(cambios.descripcion   ?? m.descripcion),
              proveedor:      sanitizarTexto(cambios.proveedor     ?? m.proveedor),
              contacto:       sanitizarTexto(cambios.contacto      ?? m.contacto),
              foto:           sanitizarTexto(cambios.foto          ?? m.foto),
              precioUnitario: nuevoPrecio,
              // Solo agrega al historial si el precio cambió
              historialPrecios: precioDistinto
                ? [...(m.historialPrecios || []), { fecha: new Date().toISOString().slice(0, 10), precio: nuevoPrecio }]
                : m.historialPrecios,
            }
          }),
        }))
      },

      // Elimina un material del stock
      eliminar: (id) => {
        set(state => ({ materiales: state.materiales.filter(m => m.id !== id) }))
      },

      // Suma cantidad al stock y opcionalmente actualiza el precio unitario
      agregarCompra: (id, cantidad, nuevoPrecio) => {
        set(state => ({
          materiales: state.materiales.map(m => {
            if (m.id !== id) return m
            const cantNum   = Number(cantidad || 0)
            const precioNum = Number(nuevoPrecio || 0)
            const actualizado = { ...m, cantidad: m.cantidad + cantNum }
            if (precioNum > 0 && precioNum !== m.precioUnitario) {
              actualizado.precioUnitario  = precioNum
              actualizado.historialPrecios = [
                ...(m.historialPrecios || []),
                { fecha: new Date().toISOString().slice(0, 10), precio: precioNum },
              ]
            }
            return actualizado
          }),
        }))
      },

      // Descuenta cantidad al usar material en un pedido
      descontarPorPedido: (id, cantidad) => {
        set(state => ({
          materiales: state.materiales.map(m =>
            m.id === id
              ? { ...m, cantidad: Math.max(0, m.cantidad - Number(cantidad || 0)) }
              : m
          ),
        }))
      },

      // Retorna un material por su ID
      obtenerPorId: (id) => get().materiales.find(m => m.id === id),

      // Filtra materiales por texto y estado de stock
      buscar: (texto, filtro) => {
        const { materiales } = get()
        const q = (texto || '').toLowerCase()
        let lista = materiales.filter(m =>
          m.nombre.toLowerCase().includes(q) ||
          m.descripcion.toLowerCase().includes(q) ||
          m.proveedor.toLowerCase().includes(q)
        )
        if (filtro === 'comprar') lista = lista.filter(m => m.cantidad <= m.umbral)
        if (filtro === 'ok')      lista = lista.filter(m => m.cantidad >  m.umbral)
        return lista
      },
    }),
    { name: 'taller-trini-stock' }
  )
)
