export const Logo = ({ size = 'md', admin = false }) => {
  const sizeClasses = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-11 h-11';
  
  const mainColor = '#4979a4';
  const secondaryColor = '#6fa3d1';
  
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={sizeClasses}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={mainColor} />
          <stop offset="100%" stopColor={secondaryColor} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={secondaryColor} />
          <stop offset="100%" stopColor={mainColor} />
        </linearGradient>
      </defs>
      
      {/* Main house shape */}
      <path 
        d="M50 15 L85 42 L85 88 L15 88 L15 42 Z" 
        fill="url(#logoGrad)"
        filter="url(#glow)"
      />
      
      {/* Roof */}
      <path 
        d="M50 15 L80 38 L80 42 L50 22 L20 42 L20 38 Z" 
        fill="url(#roofGrad)"
      />
      
      {/* Door */}
      <rect 
        x="40" 
        y="58" 
        width="20" 
        height="30" 
        rx="3" 
        fill={admin ? '#1f2937' : 'white'}
      />
      
      {/* Door handle */}
      <circle cx="54" cy="73" r="2.5" fill={mainColor} />
      
      {/* Window left */}
      <rect x="22" y="52" width="14" height="14" rx="3" fill={admin ? '#1f2937' : 'white'} opacity="0.9" />
      
      {/* Window right */}
      <rect x="64" y="52" width="14" height="14" rx="3" fill={admin ? '#1f2937' : 'white'} opacity="0.9" />
    </svg>
  );
};

export default Logo;