import { supabase } from '../config/supabase.js'

/**
 * Posts service for Supabase
 * Handles all post CRUD operations
 */
export const postsService = {
  /**
   * Get all posts with optional filters
   * @param {Object} filters - Filter options
   * @param {string} filters.category - Filter by category
   * @param {string} filters.status - Filter by status (default: 'published')
   * @param {boolean} filters.featured - Filter featured posts
   * @param {number} filters.limit - Limit number of results
   * @returns {Promise<Array>}
   */
  async getAll(filters = {}) {
    try {
      let query = supabase
        .from('posts')
        .select('*')
      
      // Apply filters
      if (filters.status !== undefined) {
        query = query.eq('status', filters.status)
      } else {
        // Default to published posts for public view
        query = query.eq('status', 'published')
      }
      
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      
      if (filters.featured !== undefined) {
        query = query.eq('featured', filters.featured)
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit)
      }
      
      // Order by published date (newest first)
      query = query.order('published_at', { ascending: false, nullsFirst: false })
      
      const { data, error } = await query
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get posts error:', error)
      throw new Error(error.message || 'Failed to fetch posts')
    }
  },

  /**
   * Get posts for authenticated user (all statuses)
   * @returns {Promise<Array>}
   */
  async getMyPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('updated_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get my posts error:', error)
      throw new Error(error.message || 'Failed to fetch your posts')
    }
  },

  /**
   * Get single post by slug
   * @param {string} slug - Post slug
   * @returns {Promise<Object|null>}
   */
  async getBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return null
        }
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Get post by slug error:', error)
      throw new Error(error.message || 'Failed to fetch post')
    }
  },

  /**
   * Get single post by ID
   * @param {string} id - Post ID
   * @returns {Promise<Object|null>}
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Get post by ID error:', error)
      throw new Error(error.message || 'Failed to fetch post')
    }
  },

  /**
   * Create new post
   * @param {Object} post - Post data
   * @returns {Promise<Object>}
   */
  async create(post) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          ...post,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Create post error:', error)
      throw new Error(error.message || 'Failed to create post')
    }
  },

  /**
   * Update existing post
   * @param {string} id - Post ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>}
   */
  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Update post error:', error)
      throw new Error(error.message || 'Failed to update post')
    }
  },

  /**
   * Delete post
   * @param {string} id - Post ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.error('Delete post error:', error)
      throw new Error(error.message || 'Failed to delete post')
    }
  },

  /**
   * Publish post (set status to published and set published_at)
   * @param {string} id - Post ID
   * @returns {Promise<Object>}
   */
  async publish(id) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Publish post error:', error)
      throw new Error(error.message || 'Failed to publish post')
    }
  },

  /**
   * Unpublish post (set status to draft)
   * @param {string} id - Post ID
   * @returns {Promise<Object>}
   */
  async unpublish(id) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update({
          status: 'draft',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Unpublish post error:', error)
      throw new Error(error.message || 'Failed to unpublish post')
    }
  },

  /**
   * Toggle featured status
   * @param {string} id - Post ID
   * @param {boolean} featured - Featured status
   * @returns {Promise<Object>}
   */
  async setFeatured(id, featured) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update({
          featured,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Set featured error:', error)
      throw new Error(error.message || 'Failed to update featured status')
    }
  },

  /**
   * Get category statistics
   * @returns {Promise<Array>}
   */
  async getCategoryStats() {
    try {
      const { data, error } = await supabase
        .from('category_stats')
        .select('*')
      
      if (error) throw error
      
      // Transform to object for easier access
      const stats = {}
      data.forEach(stat => {
        stats[stat.category] = {
          total: stat.total_count || 0,
          published: stat.published_count || 0,
          draft: stat.draft_count || 0,
          featured: stat.featured_count || 0,
          latestPublished: stat.latest_published_at,
          latestUpdated: stat.latest_updated_at,
        }
      })
      
      return stats
    } catch (error) {
      console.error('Get category stats error:', error)
      // Return empty stats on error
      return {
        photo: { total: 0, published: 0, draft: 0, featured: 0 },
        food: { total: 0, published: 0, draft: 0, featured: 0 },
        travel: { total: 0, published: 0, draft: 0, featured: 0 },
        life: { total: 0, published: 0, draft: 0, featured: 0 },
        code: { total: 0, published: 0, draft: 0, featured: 0 },
      }
    }
  },

  /**
   * Increment view count
   * @param {string} id - Post ID
   * @returns {Promise<void>}
   */
  async incrementViewCount(id) {
    try {
      // Get current view count
      const { data: post } = await supabase
        .from('posts')
        .select('view_count')
        .eq('id', id)
        .single()
      
      if (!post) return
      
      // Increment
      await supabase
        .from('posts')
        .update({ view_count: (post.view_count || 0) + 1 })
        .eq('id', id)
    } catch (error) {
      // Silently fail - view count is not critical
      console.warn('Increment view count error:', error)
    }
  },

  /**
   * Search posts by title or excerpt
   * @param {string} query - Search query
   * @returns {Promise<Array>}
   */
  async search(query) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .textSearch('search_vector', query)
        .order('published_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Search posts error:', error)
      throw new Error(error.message || 'Failed to search posts')
    }
  },
}

