import { useState, useEffect, createContext, useContext } from 'react'
import { authService } from '../services/auth.service.js'

// Create Auth Context
const AuthContext = createContext(null)

/**
 * Auth Provider Component
 * Wrap your app with this to provide auth state
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    authService.getSession().then(session => {
      setSession(session)
      setUser(session?.user || null)
      setLoading(false)
    })

    // Listen for auth changes
    const subscription = authService.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signIn: authService.signIn.bind(authService),
    signOut: authService.signOut.bind(authService),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to use auth context
 * @returns {Object} Auth state and methods
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth() {
  const { user, loading } = useAuth()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!loading) {
      setIsReady(true)
    }
  }, [loading])

  return {
    user,
    loading,
    isReady,
    isAuthenticated: !!user,
  }
}

