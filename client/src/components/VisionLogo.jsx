/**
 * VisionLogo — Uses your real logo from /src/assets/logo.png (or .svg / .jpg)
 *
 * HOW TO ADD YOUR LOGO:
 *   1. Copy your logo file into:  client/src/assets/logo.png
 *      (supports .png  .svg  .jpg  .webp)
 *   2. Uncomment the correct import line below and delete the `const logoSrc = null` line
 *   3. Done — logo appears everywhere automatically.
 */

// import logoSrc from '../assets/logo.png'   ← uncomment after adding your file
// import logoSrc from '../assets/logo.svg'
// import logoSrc from '../assets/logo.jpg'
const logoSrc = null   // ← remove this line once you uncomment the import above

const FallbackIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="32,2 58,17 58,47 32,62 6,47 6,17"
      fill="none" stroke="#00ff88" strokeWidth="2"
      style={{ filter: 'drop-shadow(0 0 6px #00ff88)' }} />
    <ellipse cx="32" cy="32" rx="16" ry="10" fill="none" stroke="#00ff88" strokeWidth="1.5"
      style={{ filter: 'drop-shadow(0 0 4px #00ff88)' }} />
    <circle cx="32" cy="32" r="5" fill="#00ff88"
      style={{ filter: 'drop-shadow(0 0 8px #00ff88)' }} />
    <line x1="6" y1="32" x2="16" y2="32" stroke="#00ff8860" strokeWidth="1" />
    <line x1="48" y1="32" x2="58" y2="32" stroke="#00ff8860" strokeWidth="1" />
  </svg>
)

const sizeMap = {
  xs: { img: 24, text: 'text-xs',  sub: 'text-[10px]', gap: 'gap-1.5' },
  sm: { img: 32, text: 'text-sm',  sub: 'text-[10px]', gap: 'gap-2'   },
  md: { img: 44, text: 'text-lg',  sub: 'text-xs',     gap: 'gap-3'   },
  lg: { img: 64, text: 'text-2xl', sub: 'text-sm',     gap: 'gap-3'   },
  xl: { img: 88, text: 'text-3xl', sub: 'text-sm',     gap: 'gap-4'   },
}

const VisionLogo = ({ size = 'md', showText = true, className = '' }) => {
  const s = sizeMap[size] || sizeMap.md
  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      <div className="flex-shrink-0">
        {logoSrc ? (
          <img src={logoSrc} alt="Vision CSE" width={s.img} height={s.img}
            className="object-contain drop-shadow-[0_0_8px_#00ff8860]" />
        ) : (
          <FallbackIcon size={s.img} />
        )}
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-mono font-bold tracking-wider ${s.text}`}
            style={{ color: '#00ff88', textShadow: '0 0 12px #00ff8860' }}>
            VISION
          </span>
          <span className={`font-mono text-gray-400 tracking-widest uppercase ${s.sub}`}>
            CSE Recruitment
          </span>
        </div>
      )}
    </div>
  )
}

export default VisionLogo
