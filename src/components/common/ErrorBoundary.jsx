import React from 'react'

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })

    // Send to error tracking service (e.g., Sentry)
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      })
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
          color: 'var(--text)',
          padding: '2rem',
        }}>
          <div style={{
            maxWidth: '600px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '1rem',
            }}>⚠️</div>
            
            <h1 style={{
              fontSize: '2rem',
              marginBottom: '1rem',
              background: 'var(--grad)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Something went wrong
            </h1>
            
            <p style={{
              color: 'var(--text-dim)',
              marginBottom: '2rem',
              lineHeight: '1.6',
            }}>
              We encountered an unexpected error. Don't worry, your data is safe.
              Try refreshing the page or contact support if the problem persists.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details style={{
                marginBottom: '2rem',
                textAlign: 'left',
                background: 'var(--bg2)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--card-border)',
              }}>
                <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                  Error Details (Dev Only)
                </summary>
                <pre style={{
                  fontSize: '0.875rem',
                  overflow: 'auto',
                  color: 'var(--orange)',
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
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
                Refresh Page
              </button>
              
              <button
                onClick={this.handleReset}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  border: '1px solid var(--card-border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Fallback component for Suspense boundaries
 */
export function SuspenseFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <LoadingSpinner />
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div style={{
      width: '48px',
      height: '48px',
      border: '3px solid var(--card-border)',
      borderTop: '3px solid var(--cyan)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }} />
  )
}

