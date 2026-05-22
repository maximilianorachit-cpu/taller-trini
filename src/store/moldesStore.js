import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useMoldesStore = create(
  persist(
    (set, get) => ({
      moldes: [],

      agregar: (molde) => {
        set(state => ({
          moldes: [
            { ...molde, id: `molde-${Date.now()}`, fecha: new Date().toISOString() },
            ...state.moldes,
          ],
        }))
      },

      actualizar: (id, cambios) => {
        set(state => ({
          moldes: state.moldes.map(m => m.id === id ? { ...m, ...cambios } : m),
        }))
      },

      eliminar: (id) => {
        set(state => ({ moldes: state.moldes.filter(m => m.id !== id) }))
      },

      obtenerPorId: (id) => get().moldes.find(m => m.id === id),
    }),
    { name: 'taller-trini-moldes' }
  )
)
