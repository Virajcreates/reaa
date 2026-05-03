interface ReaaLogoProps {
  size?: number;
  className?: string;
}

export function ReaaLogo({ size = 40, className = '' }: ReaaLogoProps) {
  const iconSize = size * 0.52;

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: '#1E40AF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 28 28"
        fill="none"
      >
        {/* Base plate */}
        <rect x="2" y="23" width="24" height="2.5" rx="1" fill="#93C5FD" />

        {/* Left column */}
        <rect x="4" y="11" width="3.5" height="12" rx="0.6" fill="white" opacity="0.85" />

        {/* Right column */}
        <rect x="20.5" y="11" width="3.5" height="12" rx="0.6" fill="white" opacity="0.85" />

        {/* Center block — taller */}
        <rect x="10" y="7" width="8" height="16" rx="0.8" fill="white" />

        {/* Pediment / triangle top */}
        <polygon points="14,2 24,9 4,9" fill="white" opacity="0.9" />

        {/* Inner window detail */}
        <rect x="12" y="12" width="4" height="4" rx="0.5" fill="#1E40AF" />
        <rect x="12" y="18" width="4" height="3" rx="0.5" fill="#1E40AF" />
      </svg>
    </div>
  );
}
