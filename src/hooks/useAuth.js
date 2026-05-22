import { useCallback } from 'react'
import { useAppStore } from '../store/appStore.js'
import { hashPin, verificarPin } from '../utils/crypto.js'

const STORAGE_KEY = 'trini_pin_hash'

// Maneja el PIN de bloqueo de pantalla
export const useAuth = () => {
  const { setPinConfigurado, desbloquear } = useAppStore()

  // Guarda un PIN nuevo (hasheado)
  const guardarPin = useCallback(async (pin) => {
    const hash = await hashPin(pin)
    localStorage.setItem(STORAGE_KEY, hash)
    setPinConfigurado(true)
  }, [setPinConfigurado])

  // Valida el PIN ingresado
  const validarPin = useCallback(async (pin) => {
    const hashGuardado = localStorage.getItem(STORAGE_KEY)
    if (!hashGuardado) return false
    const correcto = await verificarPin(pin, hashGuardado)
    if (correcto) desbloquear()
    return correcto
  }, [desbloquear])

  // Comprueba si el PIN ya fue configurado
  const verificarPinConfigurado = useCallback(() => {
    return Boolean(localStorage.getItem(STORAGE_KEY))
  }, [])

  // Verifica si el dispositivo soporta autenticación biométrica
  const soportaBiometria = useCallback(async () => {
    if (!window.PublicKeyCredential) return false
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    } catch {
      return false
    }
  }, [])

  return { guardarPin, validarPin, verificarPinConfigurado, soportaBiometria }
}
