// Verifica que un valor no esté vacío
export const requerido = (valor) => {
  if (valor === null || valor === undefined) return false
  return String(valor).trim() !== ''
}

// Valida teléfono chileno (fijo o celular)
export const telefonoValido = (telefono) => {
  const limpio = String(telefono).replace(/[\s\-().]/g, '')
  return /^(\+?56)?[29]\d{8}$/.test(limpio)
}

// Valida que un porcentaje esté entre 0 y 100
export const porcentajeValido = (valor) => {
  const num = Number(valor)
  return !isNaN(num) && num >= 0 && num <= 100
}

// Valida que un número sea positivo
export const numeroPositivo = (valor) => {
  const num = Number(valor)
  return !isNaN(num) && num > 0
}

// Valida que una fecha sea válida y futura
export const fechaFutura = (fecha) => {
  const date = new Date(fecha)
  return !isNaN(date.getTime()) && date > new Date()
}

// Valida PIN de 6 dígitos
export const pinValido = (pin) => {
  return /^\d{6}$/.test(String(pin))
}
