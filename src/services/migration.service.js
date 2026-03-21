import { authService } from './auth.service.js'
import { postsService } from './posts.service.js'

/**
 * Migration service to move data from localStorage to Supabase
 */
export const migrationService = {
  /**
   * Check if there are posts in localStorage
   * @returns {boolean}
   */
  hasLocalStoragePosts() {
    try {
      const posts = JSON.parse(localStorage.getItem('bt_posts') || '[]')
      return posts.length > 0
    } catch {
      return false
    }
  },

  /**
   * Get posts from localStorage
   * @returns {Array}
   */
  getLocalStoragePosts() {
    try {
      return JSON.parse(localStorage.getItem('bt_posts') || '[]')
    } catch {
      return []
    }
  },

  /**
   * Migrate all posts from localStorage to Supabase
   * @returns {Promise<Object>} Migration results
   */
  async migrateToSupabase() {
    try {
      // Check if user is authenticated
      const user = await authService.getUser()
      if (!user) {
        throw new Error('Must be authenticated to migrate posts')
      }

      // Get posts from localStorage
      const localPosts = this.getLocalStoragePosts()
      
      if (localPosts.length === 0) {
        return {
          success: true,
          migrated: 0,
          failed: 0,
          message: 'No posts to migrate',
        }
      }

      const results = []
      
      // Migrate each post
      for (const post of localPosts) {
        try {
          // Transform localStorage post to Supabase format
          const supabasePost = {
            title: post.title || 'Untitled Post',
            category: post.category || 'life',
            status: post.status || 'draft',
            blocks: post.blocks || [],
            excerpt: this.generateExcerpt(post.blocks),
            tags: post.tags || [],
            featured: false,
            created_at: post.created_at || new Date().toISOString(),
            published_at: post.status === 'published' ? (post.published_at || new Date().toISOString()) : null,
          }

          // Create post in Supabase
          const newPost = await postsService.create(supabasePost)
          
          results.push({
            success: true,
            oldId: post.id,
            newId: newPost.id,
            title: post.title,
          })
        } catch (error) {
          results.push({
            success: false,
            oldId: post.id,
            title: post.title,
            error: error.message,
          })
        }
      }

      const migrated = results.filter(r => r.success).length
      const failed = results.filter(r => !r.success).length

      // If all posts migrated successfully, clear localStorage
      if (failed === 0) {
        localStorage.removeItem('bt_posts')
        localStorage.setItem('bt_migration_completed', new Date().toISOString())
      }

      return {
        success: failed === 0,
        migrated,
        failed,
        total: localPosts.length,
        results,
        message: failed === 0 
          ? `Successfully migrated ${migrated} posts to Supabase`
          : `Migrated ${migrated} posts, ${failed} failed`,
      }
    } catch (error) {
      console.error('Migration error:', error)
      throw new Error(error.message || 'Failed to migrate posts')
    }
  },

  /**
   * Generate excerpt from blocks
   * @param {Array} blocks - Post blocks
   * @returns {string}
   */
  generateExcerpt(blocks) {
    if (!blocks || blocks.length === 0) return ''
    
    // Find first text block
    const textBlock = blocks.find(b => 
      ['text', 'h1', 'h2', 'h3'].includes(b.type) && b.data?.text
    )
    
    if (!textBlock) return ''
    
    // Get text and truncate
    const text = textBlock.data.text
    return text.length > 200 ? text.substring(0, 200) + '...' : text
  },

  /**
   * Check if migration has been completed
   * @returns {boolean}
   */
  isMigrationCompleted() {
    return !!localStorage.getItem('bt_migration_completed')
  },

  /**
   * Reset migration status (for testing)
   */
  resetMigrationStatus() {
    localStorage.removeItem('bt_migration_completed')
  },

  /**
   * Create backup of localStorage posts
   * @returns {string} JSON string of posts
   */
  createBackup() {
    const posts = this.getLocalStoragePosts()
    return JSON.stringify(posts, null, 2)
  },

  /**
   * Download backup as file
   */
  downloadBackup() {
    const backup = this.createBackup()
    const blob = new Blob([backup], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `neurolojik-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },
}

