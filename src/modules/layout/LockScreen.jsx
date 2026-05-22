import { useState, useEffect, useCallback } from 'react'
import { Delete, Fingerprint, AlertCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import Logo from '../../components/Logo.jsx'
import styles from './LockScreen.module.css'

const LONGITUD_PIN = 6
const MAX_INTENTOS = 5
const ESPERA_BLOQUEO_SEG = 30

function LockScreen() {
  const { guardarPin, validarPin, verificarPinConfigurado, soportaBiometria } = useAuth()

  const pinYaConfigurado = verificarPinConfigurado()
  // fase: 'ingresar' | 'crear' | 'confirmar'
  const [fase, setFase] = useState(pinYaConfigurado ? 'ingresar' : 'crear')
  const [pin, setPin] = useState('')
  const [pinConfirmacion, setPinConfirmacion] = useState('')
  const [error, setError] = useState('')
  const [intentos, setIntentos] = useState(0)
  const [bloqueadoHasta, setBloqueadoHasta] = useState(null)
  const [tiempoRestante, setTiempoRestante] = useState(0)
  const [tieneBiometria, setTieneBiometria] = useState(false)

  // Detecta si el dispositivo soporta biometría
  useEffect(() => {
    soportaBiometria().then(setTieneBiometria)
  }, [soportaBiometria])

  // Contador regresivo cuando la pantalla está bloqueada por intentos fallidos
  useEffect(() => {
    if (!bloqueadoHasta) return
    const interval = setInterval(() => {
      const restante = Math.ceil((bloqueadoHasta - Date.now()) / 1000)
      if (restante <= 0) {
        setBloqueadoHasta(null)
        setIntentos(0)
        setTiempoRestante(0)
        clearInterval(interval)
      } else {
        setTiempoRestante(restante)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [bloqueadoHasta])

  const pinActual = fase === 'confirmar' ? pinConfirmacion : pin

  // Presionar un dígito del teclado
  const presionarDigito = useCallback((digito) => {
    if (bloqueadoHasta) return
    const setter = fase === 'confirmar' ? setPinConfirmacion : setPin
    setter(prev => {
      if (prev.length >= LONGITUD_PIN) return prev
      const nuevo = prev + digito
      if (nuevo.length === LONGITUD_PIN) {
        // Procesamos en el siguiente tick para que el estado se actualice
        setTimeout(() => procesarPin(nuevo), 50)
      }
      return nuevo
    })
    setError('')
  }, [fase, bloqueadoHasta]) // eslint-disable-line

  // Borrar último dígito
  const borrarDigito = useCallback(() => {
    if (bloqueadoHasta) return
    const setter = fase === 'confirmar' ? setPinConfirmacion : setPin
    setter(prev => prev.slice(0, -1))
    setError('')
  }, [fase, bloqueadoHasta])

  // Procesa el PIN completo según la fase actual
  const procesarPin = useCallback(async (pinCompleto) => {
    if (fase === 'crear') {
      // Pasa a confirmar el PIN
      setPin(pinCompleto)
      setPinConfirmacion('')
      setFase('confirmar')
      return
    }

    if (fase === 'confirmar') {
      if (pinCompleto !== pin) {
        setError('Los PIN no coinciden. Intenta de nuevo.')
        setPinConfirmacion('')
        setPin('')
        setFase('crear')
        return
      }
      await guardarPin(pin)
      // El store se desbloquea dentro de guardarPin → desbloquear()
      return
    }

    if (fase === 'ingresar') {
      const correcto = await validarPin(pinCompleto)
      if (!correcto) {
        const nuevosIntentos = intentos + 1
        setIntentos(nuevosIntentos)
        setPin('')
        if (nuevosIntentos >= MAX_INTENTOS) {
          const hasta = Date.now() + ESPERA_BLOQUEO_SEG * 1000
          setBloqueadoHasta(hasta)
          setIntentos(0)
          setError(`Demasiados intentos. Espera ${ESPERA_BLOQUEO_SEG} segundos.`)
        } else {
          setError(`PIN incorrecto. ${MAX_INTENTOS - nuevosIntentos} intentos restantes.`)
        }
      }
    }
  }, [fase, pin, intentos, guardarPin, validarPin])

  // Autenticación biométrica
  const usarBiometria = useCallback(async () => {
    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          userVerification: 'required',
          timeout: 60000,
        }
      })
      if (credential) {
        // Si la autenticación biométrica fue exitosa, desbloquear directamente
        const { desbloquear } = await import('../../store/appStore.js').then(m => m.useAppStore.getState())
        desbloquear()
      }
    } catch {
      setError('Biometría no disponible. Usa tu PIN.')
    }
  }, [])

  const titulo = fase === 'ingresar'
    ? 'Ingresa tu PIN'
    : fase === 'crear'
      ? 'Crea tu PIN de acceso'
      : 'Confirma tu PIN'

  const subtitulo = fase === 'crear'
    ? 'Elige un PIN de 6 dígitos para proteger el taller'
    : fase === 'confirmar'
      ? 'Ingresa el mismo PIN nuevamente'
      : null

  return (
    <div className={styles.pantalla}>
      <div className={styles.tarjeta}>
        {/* Logo y título */}
        <div className={styles.encabezado}>
          <Logo size={64} />
          <h1 className={styles.appNombre}>El Taller de Trini</h1>
          <h2 className={styles.titulo}>{titulo}</h2>
          {subtitulo && <p className={styles.subtitulo}>{subtitulo}</p>}
        </div>

        {/* Puntos del PIN */}
        <div className={styles.puntos} aria-label={`PIN: ${pinActual.length} de ${LONGITUD_PIN} dígitos`}>
          {Array.from({ length: LONGITUD_PIN }).map((_, i) => (
            <div
              key={i}
              className={`${styles.punto} ${i < pinActual.length ? styles.lleno : ''}`}
            />
          ))}
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className={styles.error} role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Bloqueado temporalmente */}
        {bloqueadoHasta && (
          <div className={styles.bloqueadoTimer}>
            Espera {tiempoRestante}s para intentar de nuevo
          </div>
        )}

        {/* Teclado numérico */}
        <div className={styles.teclado} aria-label="Teclado numérico">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button
              key={n}
              className={styles.tecla}
              onClick={() => presionarDigito(String(n))}
              disabled={!!bloqueadoHasta}
              aria-label={`Dígito ${n}`}
            >
              {n}
            </button>
          ))}
          {/* Fila inferior: biometría, 0, borrar */}
          {tieneBiometria && fase === 'ingresar' ? (
            <button
              className={`${styles.tecla} ${styles.teclaEspecial}`}
              onClick={usarBiometria}
              disabled={!!bloqueadoHasta}
              aria-label="Usar biometría"
              title="Face ID / Touch ID"
            >
              <Fingerprint size={24} />
            </button>
          ) : (
            <div className={styles.teclaVacia} />
          )}
          <button
            className={styles.tecla}
            onClick={() => presionarDigito('0')}
            disabled={!!bloqueadoHasta}
            aria-label="Dígito 0"
          >
            0
          </button>
          <button
            className={`${styles.tecla} ${styles.teclaEspecial}`}
            onClick={borrarDigito}
            disabled={!!bloqueadoHasta}
            aria-label="Borrar último dígito"
          >
            <Delete size={22} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default LockScreen
