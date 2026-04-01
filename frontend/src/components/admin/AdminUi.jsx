export function GlowButton({
  children,
  onClick,
  loading = false,
  disabled = false,
  variant = 'default',
  style = {},
  type = 'button',
}) {
  const variants = {
    default: {
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      border: '1px solid rgba(96,165,250,0.45)',
      color: 'white',
      boxShadow: '0 0 18px rgba(59,130,246,0.25)',
    },
    ghost: {
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.12)',
      color: 'var(--text-secondary)',
      boxShadow: 'none',
    },
    green: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      border: '1px solid rgba(16,185,129,0.4)',
      color: 'white',
      boxShadow: '0 0 18px rgba(16,185,129,0.2)',
    },
  };

  const palette = variants[variant] || variants.default;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '10px 14px',
        borderRadius: 10,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        fontWeight: 700,
        fontSize: '0.84rem',
        opacity: disabled || loading ? 0.65 : 1,
        transition: 'all 0.2s ease',
        ...palette,
        ...style,
      }}
    >
      {loading ? 'Please wait...' : children}
    </button>
  );
}

export function TableRowSkeleton({ cols = 1 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, idx) => (
        <td key={idx}>
          <div
            className="skeleton"
            style={{ height: 14, borderRadius: 6, opacity: 0.7 }}
          />
        </td>
      ))}
    </tr>
  );
}
