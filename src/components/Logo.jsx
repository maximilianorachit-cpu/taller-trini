import { Scissors } from 'lucide-react'

// Logo circular rosa con tijera blanca
function Logo({ size = 40, className }) {
  const iconSize = Math.round(size * 0.52)
  return (
    <div
      className={className}
      aria-label="El Taller de Trini"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: 'var(--shadow-primary)',
      }}
    >
      <Scissors size={iconSize} color="white" strokeWidth={2.5} />
    </div>
  )
}

export default Logo
