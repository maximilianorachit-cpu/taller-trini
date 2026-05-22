import styles from './PlaceholderModulo.module.css'

// Placeholder genérico mientras el módulo está en desarrollo
function PlaceholderModulo({ icono, titulo, descripcion, bloque }) {
  return (
    <div className={styles.contenedor}>
      <div className={styles.icono}>{icono}</div>
      <h1 className={styles.titulo}>{titulo}</h1>
      <p className={styles.descripcion}>{descripcion || 'Este módulo se desarrollará próximamente.'}</p>
      {bloque && (
        <span className={styles.bloque}>Bloque {bloque}</span>
      )}
    </div>
  )
}

export default PlaceholderModulo
