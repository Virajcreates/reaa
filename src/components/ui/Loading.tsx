
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-2 border-white/[0.15] border-t-primary-400`}
      />
    </div>
  );
}

export function LoadingDots() {
  return (
    <div className="flex items-center space-x-1">
      <div className="h-2 w-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="h-2 w-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="h-2 w-2 bg-accent-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}
