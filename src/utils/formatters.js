// Formatea un número como precio CLP sin decimales con separador de miles
export const formatearCLP = (numero) => {
  if (numero === null || numero === undefined || isNaN(numero)) return '$0'
  const entero = Math.round(Number(numero))
  return '$' + entero.toLocaleString('es-CL')
}

// Formatea fecha larga en español: "lunes 21 de mayo de 2026"
export const formatearFecha = (fecha) => {
  const date = fecha instanceof Date ? fecha : new Date(fecha)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Formatea fecha corta: "21/05/2026"
export const formatearFechaCorta = (fecha) => {
  const date = fecha instanceof Date ? fecha : new Date(fecha)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('es-CL')
}

// Formatea fecha relativa: "hace 2 días", "en 3 días"
export const formatearFechaRelativa = (fecha) => {
  const date = fecha instanceof Date ? fecha : new Date(fecha)
  const ahora = new Date()
  const diffMs = date.getTime() - ahora.getTime()
  const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDias === 0) return 'hoy'
  if (diffDias === 1) return 'mañana'
  if (diffDias === -1) return 'ayer'
  if (diffDias > 1) return `en ${diffDias} días`
  return `hace ${Math.abs(diffDias)} días`
}

// Formatea número de pedido: 42 → "#0042"
export const formatearNumeroPedido = (numero) => {
  return '#' + String(numero).padStart(4, '0')
}

// Retorna saludo según hora del día
export const obtenerSaludo = () => {
  const hora = new Date().getHours()
  if (hora < 12) return '¡Buenos días'
  if (hora < 19) return '¡Buenas tardes'
  return '¡Buenas noches'
}
