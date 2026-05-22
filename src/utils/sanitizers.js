// Sanitiza texto de entrada para prevenir XSS
export const sanitizarTexto = (texto) => {
  if (!texto || typeof texto !== 'string') return ''
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}

// Sanitiza un objeto completo recursivamente
export const sanitizarObjeto = (obj) => {
  if (!obj || typeof obj !== 'object') return obj
  const resultado = {}
  for (const [clave, valor] of Object.entries(obj)) {
    resultado[clave] = typeof valor === 'string'
      ? sanitizarTexto(valor)
      : typeof valor === 'object' && valor !== null
        ? sanitizarObjeto(valor)
        : valor
  }
  return resultado
}

// Elimina caracteres no numéricos (útil para teléfonos, precios)
export const soloNumeros = (texto) => {
  return String(texto).replace(/\D/g, '')
}
