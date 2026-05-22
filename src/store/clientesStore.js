import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { sanitizarTexto } from '../utils/sanitizers.js'

// Medidas vacías por defecto
export const MEDIDAS_VACIAS = {
  talla: '',
  busto: '', cintura: '', cadera: '',
  hombro: '', manga_larga: '', manga_corta: '', largo_talle: '',
  tiro: '', muslo: '', rodilla: '', tobillo: '',
  largo_pantalon: '', largo_vestido: '',
  notas_medidas: '',
}

export const CANALES_REFERENCIA = [
  { valor: 'instagram',      label: 'Instagram'       },
  { valor: 'facebook',       label: 'Facebook'        },
  { valor: 'boca-a-boca',    label: 'Boca a boca'     },
  { valor: 'amiga-familiar', label: 'Amiga / familiar'},
  { valor: 'otro',           label: 'Otro'            },
]

export const ETIQUETAS_PREDEFINIDAS = ['VIP', 'Frecuente', 'Nueva', 'Urgente', 'Pago pendiente']

export const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export const useClientesStore = create(
  persist(
    (set, get) => ({
      clientes: [],

      // Agrega un cliente nuevo con ID único
      agregar: (datos) => {
        const cliente = {
          id: crypto.randomUUID(),
          nombre:           sanitizarTexto(datos.nombre || ''),
          telefono:         sanitizarTexto(datos.telefono || ''),
          celular:          sanitizarTexto(datos.celular || ''),
          direccion:        sanitizarTexto(datos.direccion || ''),
          canalReferencia:  datos.canalReferencia || '',
          etiquetas:        datos.etiquetas || [],
          coloresFavoritos: datos.coloresFavoritos || [],
          medidas:          { ...MEDIDAS_VACIAS, ...(datos.medidas || {}) },
          activo:           true,
          creadoEn:         new Date().toISOString(),
          actualizadoEn:    new Date().toISOString(),
        }
        set(state => ({ clientes: [cliente, ...state.clientes] }))
        return cliente.id
      },

      // Actualiza los datos de un cliente existente
      actualizar: (id, datos) => {
        set(state => ({
          clientes: state.clientes.map(c =>
            c.id === id
              ? {
                  ...c,
                  nombre:           sanitizarTexto(datos.nombre ?? c.nombre),
                  telefono:         sanitizarTexto(datos.telefono ?? c.telefono),
                  celular:          sanitizarTexto(datos.celular ?? c.celular),
                  direccion:        sanitizarTexto(datos.direccion ?? c.direccion),
                  canalReferencia:  datos.canalReferencia ?? c.canalReferencia,
                  etiquetas:        datos.etiquetas ?? c.etiquetas,
                  coloresFavoritos: datos.coloresFavoritos ?? c.coloresFavoritos,
                  medidas:          datos.medidas ? { ...c.medidas, ...datos.medidas } : c.medidas,
                  actualizadoEn:    new Date().toISOString(),
                }
              : c
          )
        }))
      },

      // Archiva un cliente (activo: false). Nunca elimina si tiene pedidos.
      archivar: (id) => {
        set(state => ({
          clientes: state.clientes.map(c =>
            c.id === id
              ? { ...c, activo: false, actualizadoEn: new Date().toISOString() }
              : c
          )
        }))
      },

      // Reactiva un cliente archivado
      reactivar: (id) => {
        set(state => ({
          clientes: state.clientes.map(c =>
            c.id === id
              ? { ...c, activo: true, actualizadoEn: new Date().toISOString() }
              : c
          )
        }))
      },

      // Elimina un cliente (solo si no tiene pedidos — se valida en Módulo 3)
      eliminar: (id) => {
        set(state => ({ clientes: state.clientes.filter(c => c.id !== id) }))
      },

      // Retorna un cliente por su ID
      obtenerPorId: (id) => get().clientes.find(c => c.id === id) ?? null,

      // Filtra clientes por término de búsqueda
      buscar: (termino) => {
        if (!termino) return get().clientes
        const t = termino.toLowerCase()
        return get().clientes.filter(c =>
          c.nombre.toLowerCase().includes(t) ||
          c.celular.includes(t) ||
          c.telefono.includes(t) ||
          c.etiquetas.some(e => e.toLowerCase().includes(t))
        )
      },
    }),
    { name: 'taller-trini-clientes' }
  )
)
