import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useTiendaStore = create(
  persist(
    (set, get) => ({
      articulos: [],
      posts: [],       // Rincón de la Abu

      // ── Artículos ──
      agregarArticulo: (item) => {
        set(state => ({
          articulos: [
            { ...item, id: `articulo-${Date.now()}`, fecha: new Date().toISOString() },
            ...state.articulos,
          ],
        }))
      },
      actualizarArticulo: (id, cambios) => {
        set(state => ({
          articulos: state.articulos.map(a => a.id === id ? { ...a, ...cambios } : a),
        }))
      },
      eliminarArticulo: (id) => {
        set(state => ({ articulos: state.articulos.filter(a => a.id !== id) }))
      },
      obtenerArticuloPorId: (id) => get().articulos.find(a => a.id === id),

      // ── Posts Rincón de la Abu ──
      agregarPost: (post) => {
        set(state => ({
          posts: [
            { ...post, id: `abu-${Date.now()}`, fecha: new Date().toISOString() },
            ...state.posts,
          ],
        }))
      },
      actualizarPost: (id, cambios) => {
        set(state => ({
          posts: state.posts.map(p => p.id === id ? { ...p, ...cambios } : p),
        }))
      },
      eliminarPost: (id) => {
        set(state => ({ posts: state.posts.filter(p => p.id !== id) }))
      },
      obtenerPostPorId: (id) => get().posts.find(p => p.id === id),
    }),
    { name: 'taller-trini-tienda' }
  )
)
