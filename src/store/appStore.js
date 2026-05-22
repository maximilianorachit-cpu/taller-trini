import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppStore = create(
  persist(
    (set) => ({
      // --- Apariencia ---
      tema: 'claro',
      tamanoLetra: 'mediano',
      modoTaller: false,

      toggleTema: () => set(state => ({
        tema: state.tema === 'claro' ? 'oscuro' : 'claro'
      })),
      setTamanoLetra: (tamano) => set({ tamanoLetra: tamano }),
      toggleModoTaller: () => set(state => ({ modoTaller: !state.modoTaller })),

      // --- Configuración del negocio ---
      config: {
        costosIndirectos: 15,
        recargoUrgencia: 20,
        margenGanancia: 30,
        frecuenciaAlertasMantencion: 7,
        timeoutSesion: 5,
        moneda: 'CLP',
        // Información del taller (para tienda y WhatsApp)
        nombreTaller: 'El Taller de Trini',
        whatsapp: '',
        instagram: '',
      },
      setConfig: (nuevaConfig) => set(state => ({
        config: { ...state.config, ...nuevaConfig }
      })),

      // --- Bloqueo de pantalla ---
      bloqueado: false,
      pinConfigurado: false,

      bloquear: () => set({ bloqueado: true }),
      desbloquear: () => set({ bloqueado: false }),
      setPinConfigurado: (valor) => set({ pinConfigurado: valor }),

      // --- Buscador global ---
      terminoBusqueda: '',
      setTerminoBusqueda: (termino) => set({ terminoBusqueda: termino }),

      // --- Conectividad ---
      online: typeof navigator !== 'undefined' ? navigator.onLine : true,
      setOnline: (estado) => set({ online: estado }),

      // --- Sincronización Firebase ---
      syncStatus: 'deshabilitado', // 'deshabilitado' | 'inactivo' | 'sincronizando' | 'sincronizado' | 'error'
      ultimaSync: null,
      setSyncStatus: (status) => set({ syncStatus: status }),
      setUltimaSync: (fecha)  => set({ ultimaSync: fecha }),

      // --- Notificaciones ---
      notificaciones: {
        mantencion: true,
        entregaProxima: true,
        stockBajo: true,
        pagoPendiente: true,
      },
      setNotificaciones: (config) => set(state => ({
        notificaciones: { ...state.notificaciones, ...config }
      })),
    }),
    {
      name: 'taller-trini-config',
      // Solo persiste configuración, no estado temporal
      partialize: (state) => ({
        tema: state.tema,
        tamanoLetra: state.tamanoLetra,
        modoTaller: state.modoTaller,
        config: state.config,
        pinConfigurado: state.pinConfigurado,
        notificaciones: state.notificaciones,
      }),
    }
  )
)
