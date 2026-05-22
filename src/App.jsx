import { Routes, Route } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { useAppStore } from './store/appStore.js'
import { useFirebaseSync } from './hooks/useFirebaseSync.js'
import Layout from './modules/layout/Layout.jsx'
import LockScreen from './modules/layout/LockScreen.jsx'
import Settings from './modules/layout/Settings.jsx'
import Inicio from './modules/inicio/Inicio.jsx'
import Clientes from './modules/clientes/Clientes.jsx'
import ClienteForm from './modules/clientes/ClienteForm.jsx'
import ClienteFicha from './modules/clientes/ClienteFicha.jsx'
import Pedidos from './modules/pedidos/Pedidos.jsx'
import PedidoForm from './modules/pedidos/PedidoForm.jsx'
import PedidoDetalle from './modules/pedidos/PedidoDetalle.jsx'
import Stock from './modules/stock/Stock.jsx'
import StockForm from './modules/stock/StockForm.jsx'
import StockDetalle from './modules/stock/StockDetalle.jsx'
import Maquinaria from './modules/maquinaria/Maquinaria.jsx'
import MaquinariaForm from './modules/maquinaria/MaquinariaForm.jsx'
import MaquinariaDetalle from './modules/maquinaria/MaquinariaDetalle.jsx'
import Calculadora from './modules/calculadora/Calculadora.jsx'
import Galeria from './modules/galeria/Galeria.jsx'
import GaleriaForm from './modules/galeria/GaleriaForm.jsx'
const Diseno3D = lazy(() => import('./modules/diseno3d/Diseno3D.jsx'))
import Moldes from './modules/moldes/Moldes.jsx'
import MoldesForm from './modules/moldes/MoldesForm.jsx'
import MoldesDetalle from './modules/moldes/MoldesDetalle.jsx'
import Dashboard from './modules/dashboard/Dashboard.jsx'
import Tienda from './modules/tienda/Tienda.jsx'
import TiendaForm from './modules/tienda/TiendaForm.jsx'
import RinconAbu from './modules/tienda/RinconAbu.jsx'
import RinconAbuForm from './modules/tienda/RinconAbuForm.jsx'

// Componente invisible que activa el hook de sincronización
function SyncManager() {
  useFirebaseSync()
  return null
}

function App() {
  const { tema, tamanoLetra, bloqueado, setOnline } = useAppStore()

  // Aplica tema y tamaño de letra al documento
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema)
    document.documentElement.setAttribute('data-font-size', tamanoLetra)
  }, [tema, tamanoLetra])

  // Detecta cambios de conectividad
  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnline])

  // Muestra pantalla de bloqueo si está bloqueado
  if (bloqueado) {
    return <LockScreen />
  }

  return (
    <Layout>
      <SyncManager />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/clientes/nuevo" element={<ClienteForm />} />
        <Route path="/clientes/:id" element={<ClienteFicha />} />
        <Route path="/clientes/:id/editar" element={<ClienteForm />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/pedidos/nuevo" element={<PedidoForm />} />
        <Route path="/pedidos/:id" element={<PedidoDetalle />} />
        <Route path="/pedidos/:id/editar" element={<PedidoForm />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/stock/nuevo" element={<StockForm />} />
        <Route path="/stock/:id" element={<StockDetalle />} />
        <Route path="/stock/:id/editar" element={<StockForm />} />
        <Route path="/maquinaria" element={<Maquinaria />} />
        <Route path="/maquinaria/nuevo" element={<MaquinariaForm />} />
        <Route path="/maquinaria/:id" element={<MaquinariaDetalle />} />
        <Route path="/maquinaria/:id/editar" element={<MaquinariaForm />} />
        <Route path="/calculadora" element={<Calculadora />} />
        <Route path="/galeria" element={<Galeria />} />
        <Route path="/galeria/nuevo" element={<GaleriaForm />} />
        <Route path="/galeria/:id/editar" element={<GaleriaForm />} />
        <Route path="/diseno3d" element={<Suspense fallback={<div style={{padding:'2rem',textAlign:'center'}}>Cargando diseñador 3D…</div>}><Diseno3D /></Suspense>} />
        <Route path="/moldes" element={<Moldes />} />
        <Route path="/moldes/nuevo" element={<MoldesForm />} />
        <Route path="/moldes/:id" element={<MoldesDetalle />} />
        <Route path="/moldes/:id/editar" element={<MoldesForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tienda" element={<Tienda />} />
        <Route path="/tienda/nuevo" element={<TiendaForm />} />
        <Route path="/tienda/:id/editar" element={<TiendaForm />} />
        <Route path="/rincon-abu" element={<RinconAbu />} />
        <Route path="/rincon-abu/nuevo" element={<RinconAbuForm />} />
        <Route path="/rincon-abu/:id/editar" element={<RinconAbuForm />} />
        <Route path="/configuracion" element={<Settings />} />
      </Routes>
    </Layout>
  )
}

export default App
