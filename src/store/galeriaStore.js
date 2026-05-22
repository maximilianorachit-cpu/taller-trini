import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useGaleriaStore = create(
  persist(
    (set, get) => ({
      items: [],

      agregar: (item) => {
        set(state => ({
          items: [
            { ...item, id: `galeria-${Date.now()}`, fecha: new Date().toISOString() },
            ...state.items,
          ],
        }))
      },

      actualizar: (id, cambios) => {
        set(state => ({
          items: state.items.map(i => i.id === id ? { ...i, ...cambios } : i),
        }))
      },

      eliminar: (id) => {
        set(state => ({ items: state.items.filter(i => i.id !== id) }))
      },

      obtenerPorId: (id) => get().items.find(i => i.id === id),
    }),
    { name: 'taller-trini-galeria' }
  )
)
