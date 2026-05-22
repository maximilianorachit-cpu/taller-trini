import { useEffect, useCallback } from 'react'
import { sincronizarTodo, restaurarTodo, autenticar } from '../services/syncService.js'
import { firebaseActivo } from '../services/firebase.js'
import { useAppStore }       from '../store/appStore.js'
import { useClientesStore }  from '../store/clientesStore.js'
import { usePedidosStore }   from '../store/pedidosStore.js'
import { useStockStore }     from '../store/stockStore.js'
import { useMaquinariaStore } from '../store/maquinariaStore.js'
import { useGaleriaStore }   from '../store/galeriaStore.js'
import { useMoldesStore }    from '../store/moldesStore.js'
import { useDisenoStore }    from '../store/disenoStore.js'

const COLECCIONES = [
  'clientes', 'pedidos', 'stock', 'maquinaria', 'galeria', 'moldes', 'disenos',
]

export function useFirebaseSync() {
  const { online, syncStatus, setSyncStatus, setUltimaSync } = useAppStore()

  // Recopila el estado actual de todos los stores
  const obtenerDatosLocales = useCallback(() => ({
    clientes:   useClientesStore.getState().clientes,
    pedidos:    usePedidosStore.getState().pedidos,
    stock:      useStockStore.getState().materiales,
    maquinaria: useMaquinariaStore.getState().equipos,
    galeria:    useGaleriaStore.getState().items,
    moldes:     useMoldesStore.getState().moldes,
    disenos:    useDisenoStore.getState().disenos,
  }), [])

  // Empuja todos los datos locales a Firestore
  const guardarEnFirebase = useCallback(async () => {
    if (!firebaseActivo) {
      setSyncStatus('deshabilitado')
      return false
    }
    setSyncStatus('sincronizando')
    try {
      const ok = await sincronizarTodo(obtenerDatosLocales())
      if (ok) {
        setSyncStatus('sincronizado')
        setUltimaSync(new Date().toISOString())
      } else {
        setSyncStatus('error')
      }
      return ok
    } catch {
      setSyncStatus('error')
      return false
    }
  }, [obtenerDatosLocales, setSyncStatus, setUltimaSync])

  // Descarga Firestore y fusiona con el estado local (Firestore gana en conflicto de IDs)
  const restaurarDesdeFirebase = useCallback(async () => {
    if (!firebaseActivo) return false
    setSyncStatus('sincronizando')
    try {
      const datos = await restaurarTodo(COLECCIONES)
      if (!datos) { setSyncStatus('error'); return false }

      if (datos.clientes?.length)   useClientesStore.setState({ clientes: datos.clientes })
      if (datos.pedidos?.length)    usePedidosStore.setState({ pedidos: datos.pedidos })
      if (datos.stock?.length)      useStockStore.setState({ materiales: datos.stock })
      if (datos.maquinaria?.length) useMaquinariaStore.setState({ equipos: datos.maquinaria })
      if (datos.galeria?.length)    useGaleriaStore.setState({ items: datos.galeria })
      if (datos.moldes?.length)     useMoldesStore.setState({ moldes: datos.moldes })
      if (datos.disenos?.length)    useDisenoStore.setState({ disenos: datos.disenos })

      setSyncStatus('sincronizado')
      setUltimaSync(new Date().toISOString())
      return true
    } catch {
      setSyncStatus('error')
      return false
    }
  }, [setSyncStatus, setUltimaSync])

  // Al iniciar la app: autenticar si Firebase está activo
  useEffect(() => {
    if (!firebaseActivo) { setSyncStatus('deshabilitado'); return }
    autenticar()
  }, [setSyncStatus])

  // Al recuperar conexión: sync automático
  useEffect(() => {
    if (online && firebaseActivo) guardarEnFirebase()
  }, [online]) // eslint-disable-line

  return { guardarEnFirebase, restaurarDesdeFirebase, firebaseActivo, syncStatus }
}
