/**
 * Loading Spinner Component
 * Reusable loading indicator
 */
export function LoadingSpinner({ size = 'medium', message = '' }) {
  const sizes = {
    small: '24px',
    medium: '48px',
    large: '64px',
  }

  return (
    <div className="loading-spinner-container">
      <div 
        className="loading-spinner"
        style={{
          width: sizes[size],
          height: sizes[size],
          border: '3px solid var(--card-border)',
          borderTop: '3px solid var(--cyan)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      {message && (
        <p style={{
          marginTop: '1rem',
          color: 'var(--text-dim)',
          fontSize: '0.875rem',
        }}>
          {message}
        </p>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .loading-spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
      `}</style>
    </div>
  )
}

/**
 * Full Page Loading Component
 */
export function PageLoader({ message = 'Loading...' }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <LoadingSpinner size="large" message={message} />
    </div>
  )
}

/**
 * Skeleton Loader for content
 */
export function SkeletonLoader({ type = 'text', count = 1 }) {
  const skeletons = Array.from({ length: count }, (_, i) => i)

  const getSkeletonStyle = () => {
    const base = {
      background: 'linear-gradient(90deg, var(--bg2) 25%, var(--bg3) 50%, var(--bg2) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: '4px',
      marginBottom: '0.5rem',
    }

    switch (type) {
      case 'title':
        return { ...base, height: '2rem', width: '60%' }
      case 'text':
        return { ...base, height: '1rem', width: '100%' }
      case 'card':
        return { ...base, height: '200px', width: '100%', marginBottom: '1rem' }
      case 'avatar':
        return { ...base, height: '48px', width: '48px', borderRadius: '50%' }
      default:
        return base
    }
  }

  return (
    <>
      {skeletons.map(i => (
        <div key={i} style={getSkeletonStyle()} />
      ))}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  )
}

/**
 * Error Message Component
 */
export function ErrorMessage({ error, retry }) {
  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      color: 'var(--text)',
    }}>
      <div style={{
        fontSize: '3rem',
        marginBottom: '1rem',
      }}>⚠️</div>
      
      <h3 style={{
        fontSize: '1.5rem',
        marginBottom: '0.5rem',
        color: 'var(--orange)',
      }}>
        Oops! Something went wrong
      </h3>
      
      <p style={{
        color: 'var(--text-dim)',
        marginBottom: '1.5rem',
      }}>
        {error || 'An unexpected error occurred'}
      </p>
      
      {retry && (
        <button
          onClick={retry}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--grad)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          Try Again
        </button>
      )}
    </div>
  )
}

/**
 * Empty State Component
 */
export function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div style={{
      padding: '4rem 2rem',
      textAlign: 'center',
      color: 'var(--text)',
    }}>
      <div style={{
        fontSize: '4rem',
        marginBottom: '1rem',
      }}>
        {icon}
      </div>
      
      <h3 style={{
        fontSize: '1.5rem',
        marginBottom: '0.5rem',
      }}>
        {title}
      </h3>
      
      {message && (
        <p style={{
          color: 'var(--text-dim)',
          marginBottom: '1.5rem',
          maxWidth: '400px',
          margin: '0 auto 1.5rem',
        }}>
          {message}
        </p>
      )}
      
      {action && action}
    </div>
  )
}

// Default export for convenience
export default LoadingSpinner

