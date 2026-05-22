import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useDisenoStore = create(
  persist(
    (set) => ({
      disenos: [],

      guardarDiseno: (diseno) => {
        set(state => ({
          disenos: [
            { ...diseno, id: `diseno-${Date.now()}`, fecha: new Date().toISOString() },
            ...state.disenos,
          ].slice(0, 20),
        }))
      },

      eliminar: (id) => {
        set(state => ({ disenos: state.disenos.filter(d => d.id !== id) }))
      },
    }),
    { name: 'taller-trini-disenos' }
  )
)
