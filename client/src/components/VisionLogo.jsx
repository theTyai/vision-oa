import logoSrc from '../assets/logo.png'

const sizeMap = {
  xs: { img: 28,  text: 'text-xs',  sub: 'text-[10px]', gap: 'gap-2'   },
  sm: { img: 36,  text: 'text-sm',  sub: 'text-[10px]', gap: 'gap-2.5' },
  md: { img: 48,  text: 'text-lg',  sub: 'text-xs',     gap: 'gap-3'   },
  lg: { img: 72,  text: 'text-2xl', sub: 'text-sm',     gap: 'gap-3'   },
  xl: { img: 100, text: 'text-3xl', sub: 'text-base',   gap: 'gap-4'   },
}

const VisionLogo = ({ size = 'md', showText = true, className = '' }) => {
  const s = sizeMap[size] || sizeMap.md
  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      <img
        src={logoSrc}
        alt="Vision CSE"
        width={s.img}
        height={s.img}
        className="object-contain flex-shrink-0"
        style={{ filter: 'drop-shadow(0 2px 8px #00000080)' }}
      />
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-mono font-bold tracking-wider ${s.text}`}
            style={{ color: '#00ff88', textShadow: '0 0 14px #00ff8860' }}>
            VISION
          </span>
          <span className={`font-mono tracking-widest uppercase text-gray-400 ${s.sub}`}>
            CSE Recruitment
          </span>
        </div>
      )}
    </div>
  )
}

export default VisionLogo
