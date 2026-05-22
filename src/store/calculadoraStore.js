import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Historial de los últimos 10 cálculos realizados
export const useCalculadoraStore = create(
  persist(
    (set) => ({
      historial: [],

      // Guarda un cálculo al historial (mantiene solo los últimos 10)
      guardarCalculo: (calculo) => {
        set(state => ({
          historial: [
            { ...calculo, id: Date.now(), fecha: new Date().toISOString() },
            ...state.historial,
          ].slice(0, 10),
        }))
      },

      limpiarHistorial: () => set({ historial: [] }),
    }),
    { name: 'taller-trini-calculadora' }
  )
)
