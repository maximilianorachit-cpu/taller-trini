import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { sanitizarTexto } from '../utils/sanitizers.js'

// Equipos iniciales del taller
const EQUIPOS_INICIALES = [
  {
    id: 'maq-inicial-1',
    nombre: 'Máquina de coser',
    marca: 'Singer', modelo: 'Classic', serie: 'MC-001',
    fechaCompra: '', proveedor: '', valor: 0,
    foto: '', manual: '',
    especificaciones: 'Máquina de coser de uso general.',
    estado: 'operativa',
    ultimaMantencion: '', frecuencia: 30,
    costoMantencion: 0, tecnico: '',
    insumos: 'Agujas, hilo',
    historial: [],
    creadoEn: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'maq-inicial-2',
    nombre: 'Sublimadora',
    marca: 'Genérica', modelo: 'SUB-01', serie: 'SUB-001',
    fechaCompra: '', proveedor: '', valor: 0,
    foto: '', manual: '',
    especificaciones: 'Plancha de sublimación.',
    estado: 'operativa',
    ultimaMantencion: '', frecuencia: 60,
    costoMantencion: 0, tecnico: '',
    insumos: 'Papel sublimación',
    historial: [],
    creadoEn: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'maq-inicial-3',
    nombre: 'Plastificadora',
    marca: 'Genérica', modelo: 'PL-01', serie: 'PL-001',
    fechaCompra: '', proveedor: '', valor: 0,
    foto: '', manual: '',
    especificaciones: 'Plastificadora de documentos.',
    estado: 'operativa',
    ultimaMantencion: '', frecuencia: 90,
    costoMantencion: 0, tecnico: '',
    insumos: 'Láminas',
    historial: [],
    creadoEn: '2024-01-01T00:00:00.000Z',
  },
]

export const ESTADOS_EQUIPO = [
  { valor: 'operativa',        label: 'Operativa',        color: '#10B981', bg: '#D1FAE5' },
  { valor: 'mantencion',       label: 'En mantención',    color: '#F59E0B', bg: '#FEF3C7' },
  { valor: 'fuera-de-servicio', label: 'Fuera de servicio', color: '#EF4444', bg: '#FEE2E2' },
]

// Calcula la fecha de próxima mantención
export const proximaMantencion = (ultimaMantencion, frecuencia) => {
  if (!ultimaMantencion || !frecuencia) return null
  const base = new Date(ultimaMantencion)
  base.setDate(base.getDate() + Number(frecuencia))
  return base.toISOString().slice(0, 10)
}

// Días restantes para una fecha (negativo = vencida)
export const diasParaFecha = (fecha) => {
  if (!fecha) return null
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
  const objetivo = new Date(fecha)
  return Math.ceil((objetivo - hoy) / (1000 * 60 * 60 * 24))
}

// Retorna nivel de alerta: null | 'proxima' | 'urgente' | 'vencida'
export const nivelAlerta = (equipo) => {
  const prox = proximaMantencion(equipo.ultimaMantencion, equipo.frecuencia)
  const dias = diasParaFecha(prox)
  if (dias === null) return null
  if (dias < 0)  return 'vencida'
  if (dias <= 1) return 'urgente'
  if (dias <= 7) return 'proxima'
  return null
}

export const useMaquinariaStore = create(
  persist(
    (set, get) => ({
      equipos: EQUIPOS_INICIALES,

      agregar: (datos) => {
        const id = `maq-${Date.now()}`
        const equipo = {
          id,
          nombre:          sanitizarTexto(datos.nombre),
          marca:           sanitizarTexto(datos.marca           || ''),
          modelo:          sanitizarTexto(datos.modelo          || ''),
          serie:           sanitizarTexto(datos.serie           || ''),
          fechaCompra:     datos.fechaCompra                    || '',
          proveedor:       sanitizarTexto(datos.proveedor       || ''),
          valor:           Number(datos.valor                   || 0),
          foto:            sanitizarTexto(datos.foto            || ''),
          manual:          sanitizarTexto(datos.manual          || ''),
          especificaciones: sanitizarTexto(datos.especificaciones || ''),
          estado:          datos.estado                         || 'operativa',
          ultimaMantencion: datos.ultimaMantencion              || '',
          frecuencia:      Number(datos.frecuencia              || 0),
          costoMantencion: Number(datos.costoMantencion         || 0),
          tecnico:         sanitizarTexto(datos.tecnico         || ''),
          insumos:         sanitizarTexto(datos.insumos         || ''),
          historial:       [],
          creadoEn:        new Date().toISOString(),
        }
        set(state => ({ equipos: [...state.equipos, equipo] }))
        return id
      },

      actualizar: (id, cambios) => {
        set(state => ({
          equipos: state.equipos.map(e =>
            e.id === id
              ? { ...e, ...cambios,
                  nombre: sanitizarTexto(cambios.nombre ?? e.nombre),
                  marca:  sanitizarTexto(cambios.marca  ?? e.marca),
                  modelo: sanitizarTexto(cambios.modelo ?? e.modelo),
                }
              : e
          ),
        }))
      },

      eliminar: (id) => {
        set(state => ({ equipos: state.equipos.filter(e => e.id !== id) }))
      },

      // Registra una mantención en el historial y actualiza ultimaMantencion
      registrarMantencion: (id, detalle, costo) => {
        const hoy = new Date().toISOString().slice(0, 10)
        set(state => ({
          equipos: state.equipos.map(e =>
            e.id === id
              ? {
                  ...e,
                  ultimaMantencion: hoy,
                  historial: [
                    ...(e.historial || []),
                    { fecha: hoy, detalle: sanitizarTexto(detalle), costo: Number(costo || 0) },
                  ],
                }
              : e
          ),
        }))
      },

      obtenerPorId: (id) => get().equipos.find(e => e.id === id),

      buscar: (texto) => {
        const q = (texto || '').toLowerCase()
        return get().equipos.filter(e =>
          e.nombre.toLowerCase().includes(q) ||
          e.marca.toLowerCase().includes(q)  ||
          e.modelo.toLowerCase().includes(q)
        )
      },
    }),
    { name: 'taller-trini-maquinaria' }
  )
)
