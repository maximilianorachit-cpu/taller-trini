import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, RefreshCw, Cloud, CloudOff, RotateCw, Download } from 'lucide-react'
import { useAppStore } from '../../store/appStore.js'
import { useFirebaseSync } from '../../hooks/useFirebaseSync.js'
import { formatearFechaCorta } from '../../utils/formatters.js'
import styles from './Settings.module.css'

function Settings() {
  const navigate = useNavigate()
  const {
    tema, toggleTema,
    tamanoLetra, setTamanoLetra,
    modoTaller, toggleModoTaller,
    config, setConfig,
    notificaciones, setNotificaciones,
    syncStatus, ultimaSync,
  } = useAppStore()

  const { guardarEnFirebase, restaurarDesdeFirebase, firebaseActivo } = useFirebaseSync()

  // Estado local para editar antes de guardar
  const [conf, setConf] = useState({ ...config })
  const [notif, setNotif] = useState({ ...notificaciones })
  const [guardado, setGuardado] = useState(false)

  const handleConf = (campo, valor) => {
    setConf(prev => ({ ...prev, [campo]: Number(valor) }))
  }

  const handleNotif = (campo) => {
    setNotif(prev => ({ ...prev, [campo]: !prev[campo] }))
  }

  const guardar = () => {
    setConfig(conf)
    setNotificaciones(notif)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  const restaurar = () => {
    const defaults = {
      costosIndirectos: 15,
      recargoUrgencia: 20,
      margenGanancia: 30,
      frecuenciaAlertasMantencion: 7,
      timeoutSesion: 5,
    }
    setConf(defaults)
  }

  return (
    <div className={styles.pagina}>
      {/* Encabezado */}
      <div className={styles.encabezado}>
        <button
          className={styles.btnVolver}
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className={styles.titulo}>Configuración</h1>
        <button
          className={`${styles.btnGuardar} ${guardado ? styles.guardadoOk : ''}`}
          onClick={guardar}
        >
          <Save size={18} />
          <span>{guardado ? '¡Guardado!' : 'Guardar'}</span>
        </button>
      </div>

      <div className={styles.secciones}>
        {/* Apariencia */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Apariencia</h2>

          <div className={styles.fila}>
            <label className={styles.etiqueta}>Tema</label>
            <div className={styles.opciones}>
              <button
                className={`${styles.opcion} ${tema === 'claro' ? styles.opcionActiva : ''}`}
                onClick={() => tema !== 'claro' && toggleTema()}
              >
                ☀️ Claro
              </button>
              <button
                className={`${styles.opcion} ${tema === 'oscuro' ? styles.opcionActiva : ''}`}
                onClick={() => tema !== 'oscuro' && toggleTema()}
              >
                🌙 Oscuro
              </button>
            </div>
          </div>

          <div className={styles.fila}>
            <label className={styles.etiqueta}>Tamaño de letra</label>
            <div className={styles.opciones}>
              {[
                { valor: 'pequeno', label: 'Pequeño' },
                { valor: 'mediano', label: 'Mediano' },
                { valor: 'grande',  label: 'Grande'  },
              ].map(({ valor, label }) => (
                <button
                  key={valor}
                  className={`${styles.opcion} ${tamanoLetra === valor ? styles.opcionActiva : ''}`}
                  onClick={() => setTamanoLetra(valor)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.fila}>
            <label className={styles.etiqueta}>Modo Taller</label>
            <div className={styles.filaDetalle}>
              <span className={styles.descripcion}>Menú simplificado para trabajo diario</span>
              <button
                className={`${styles.toggle} ${modoTaller ? styles.toggleActivo : ''}`}
                onClick={toggleModoTaller}
                role="switch"
                aria-checked={modoTaller}
              >
                <span className={styles.toggleThumb} />
              </button>
            </div>
          </div>
        </section>

        {/* Costos del negocio */}
        <section className={styles.seccion}>
          <div className={styles.tituloSeccionRow}>
            <h2 className={styles.tituloSeccion}>Costos del negocio</h2>
            <button className={styles.btnRestaurar} onClick={restaurar} title="Restaurar valores por defecto">
              <RefreshCw size={14} />
              <span>Restaurar</span>
            </button>
          </div>

          {[
            { campo: 'costosIndirectos',   label: 'Costos indirectos',     unidad: '%', min: 0, max: 100 },
            { campo: 'recargoUrgencia',    label: 'Recargo por urgencia',  unidad: '%', min: 0, max: 100 },
            { campo: 'margenGanancia',     label: 'Margen de ganancia',    unidad: '%', min: 0, max: 200 },
          ].map(({ campo, label, unidad, min, max }) => (
            <div className={styles.fila} key={campo}>
              <label className={styles.etiqueta}>{label}</label>
              <div className={styles.inputNumero}>
                <input
                  type="number"
                  min={min}
                  max={max}
                  value={conf[campo]}
                  onChange={(e) => handleConf(campo, e.target.value)}
                  className={styles.input}
                  aria-label={label}
                />
                <span className={styles.unidad}>{unidad}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Mantenimiento y sesión */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Mantenimiento y sesión</h2>

          <div className={styles.fila}>
            <label className={styles.etiqueta}>Alertar mantención</label>
            <div className={styles.inputNumero}>
              <input
                type="number"
                min={1}
                max={60}
                value={conf.frecuenciaAlertasMantencion}
                onChange={(e) => handleConf('frecuenciaAlertasMantencion', e.target.value)}
                className={styles.input}
                aria-label="Días de anticipación para alertas de mantención"
              />
              <span className={styles.unidad}>días antes</span>
            </div>
          </div>

          <div className={styles.fila}>
            <label className={styles.etiqueta}>Bloqueo automático</label>
            <div className={styles.inputNumero}>
              <input
                type="number"
                min={1}
                max={60}
                value={conf.timeoutSesion}
                onChange={(e) => handleConf('timeoutSesion', e.target.value)}
                className={styles.input}
                aria-label="Minutos de inactividad para bloqueo"
              />
              <span className={styles.unidad}>min inactividad</span>
            </div>
          </div>
        </section>

        {/* Notificaciones */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Notificaciones</h2>
          {[
            { campo: 'mantencion',      label: 'Alertas de mantención de máquinas' },
            { campo: 'entregaProxima',  label: 'Entregas próximas de pedidos'      },
            { campo: 'stockBajo',       label: 'Stock de materiales bajo'          },
            { campo: 'pagoPendiente',   label: 'Pagos pendientes de clientes'      },
          ].map(({ campo, label }) => (
            <div className={styles.fila} key={campo}>
              <label className={styles.etiqueta}>{label}</label>
              <button
                className={`${styles.toggle} ${notif[campo] ? styles.toggleActivo : ''}`}
                onClick={() => handleNotif(campo)}
                role="switch"
                aria-checked={notif[campo]}
                aria-label={label}
              >
                <span className={styles.toggleThumb} />
              </button>
            </div>
          ))}
        </section>

        {/* Información del taller */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Información del taller</h2>
          <div className={styles.fila}>
            <label className={styles.etiqueta}>Nombre del taller</label>
            <input
              type="text"
              className={styles.inputTexto}
              value={conf.nombreTaller ?? 'El Taller de Trini'}
              onChange={e => setConf(p => ({ ...p, nombreTaller: e.target.value }))}
              placeholder="El Taller de Trini"
            />
          </div>
          <div className={styles.fila}>
            <label className={styles.etiqueta}>WhatsApp</label>
            <input
              type="text"
              className={styles.inputTexto}
              value={conf.whatsapp ?? ''}
              onChange={e => setConf(p => ({ ...p, whatsapp: e.target.value }))}
              placeholder="+56912345678"
            />
          </div>
          <div className={styles.fila}>
            <label className={styles.etiqueta}>Instagram</label>
            <input
              type="text"
              className={styles.inputTexto}
              value={conf.instagram ?? ''}
              onChange={e => setConf(p => ({ ...p, instagram: e.target.value }))}
              placeholder="@tallerdtrini"
            />
          </div>
        </section>

        {/* Sincronización Firebase */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Sincronización en la nube</h2>

          {!firebaseActivo ? (
            <div className={styles.syncDeshabilitado}>
              <CloudOff size={20} />
              <div>
                <strong>Firebase no configurado</strong>
                <p>Copia <code>.env.example</code> como <code>.env</code> y agrega tus claves para activar la nube.</p>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.syncEstado}>
                <Cloud size={16} className={
                  syncStatus === 'sincronizado' ? styles.syncOk
                  : syncStatus === 'error' ? styles.syncError
                  : syncStatus === 'sincronizando' ? styles.syncSpinner
                  : ''
                } />
                <span>
                  {syncStatus === 'sincronizando' && 'Sincronizando…'}
                  {syncStatus === 'sincronizado'  && `Sincronizado${ultimaSync ? ` · ${formatearFechaCorta(ultimaSync)}` : ''}`}
                  {syncStatus === 'error'         && 'Error al sincronizar'}
                  {syncStatus === 'inactivo'      && 'Listo para sincronizar'}
                  {syncStatus === 'deshabilitado' && 'Firebase activo'}
                </span>
              </div>

              <div className={styles.syncBotones}>
                <button
                  className={styles.btnSync}
                  onClick={guardarEnFirebase}
                  disabled={syncStatus === 'sincronizando'}
                >
                  <RotateCw size={15} /> Guardar en la nube
                </button>
                <button
                  className={`${styles.btnSync} ${styles.btnSyncSecundario}`}
                  onClick={restaurarDesdeFirebase}
                  disabled={syncStatus === 'sincronizando'}
                >
                  <Download size={15} /> Restaurar desde la nube
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

export default Settings
