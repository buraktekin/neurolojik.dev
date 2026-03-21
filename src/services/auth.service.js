import { supabase } from '../config/supabase.js'

/**
 * Authentication service for Supabase
 * Handles sign in, sign out, session management
 */
export const authService = {
  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{user, session}>}
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Sign in error:', error)
      throw new Error(error.message || 'Failed to sign in')
    }
  },

  /**
   * Sign out current user
   * @returns {Promise<void>}
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Sign out error:', error)
      throw new Error(error.message || 'Failed to sign out')
    }
  },

  /**
   * Get current session
   * @returns {Promise<Session|null>}
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('Get session error:', error)
      return null
    }
  },

  /**
   * Get current user
   * @returns {Promise<User|null>}
   */
  async getUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('Get user error:', error)
      return null
    }
  },

  /**
   * Subscribe to auth state changes
   * @param {Function} callback - Called when auth state changes
   * @returns {Object} Subscription object with unsubscribe method
   */
  onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        callback(event, session)
      }
    )
    return subscription
  },

  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>}
   */
  async isAuthenticated() {
    const session = await this.getSession()
    return !!session
  },

  /**
   * Sign up new user (for future use)
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{user, session}>}
   */
  async signUp(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Sign up error:', error)
      throw new Error(error.message || 'Failed to sign up')
    }
  },

  /**
   * Reset password (for future use)
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      
      if (error) throw error
    } catch (error) {
      console.error('Reset password error:', error)
      throw new Error(error.message || 'Failed to reset password')
    }
  },

  /**
   * Update password (for future use)
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      
      if (error) throw error
    } catch (error) {
      console.error('Update password error:', error)
      throw new Error(error.message || 'Failed to update password')
    }
  },
}

