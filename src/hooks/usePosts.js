import { useState, useEffect } from 'react'
import { postsService } from '../services/posts.service.js'

/**
 * Hook to fetch all posts with filters
 * @param {Object} filters - Filter options
 * @returns {Object} Posts data, loading state, error, and refetch function
 */
export function usePosts(filters = {}) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await postsService.getAll(filters)
      setPosts(data)
    } catch (err) {
      setError(err.message)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [JSON.stringify(filters)])

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
  }
}

/**
 * Hook to fetch user's own posts
 * @returns {Object} Posts data, loading state, error, and refetch function
 */
export function useMyPosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await postsService.getMyPosts()
      setPosts(data)
    } catch (err) {
      setError(err.message)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
  }
}

/**
 * Hook to fetch single post by slug
 * @param {string} slug - Post slug
 * @returns {Object} Post data, loading state, error
 */
export function usePost(slug) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      return
    }

    const fetchPost = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await postsService.getBySlug(slug)
        setPost(data)
        
        // Increment view count if post exists
        if (data) {
          postsService.incrementViewCount(data.id)
        }
      } catch (err) {
        setError(err.message)
        setPost(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [slug])

  return {
    post,
    loading,
    error,
  }
}

/**
 * Hook to fetch single post by ID (for CMS editing)
 * @param {string} id - Post ID
 * @returns {Object} Post data, loading state, error
 */
export function usePostById(id) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const fetchPost = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await postsService.getById(id)
        setPost(data)
      } catch (err) {
        setError(err.message)
        setPost(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  return {
    post,
    loading,
    error,
  }
}

/**
 * Hook to fetch category statistics
 * @returns {Object} Category stats, loading state, error
 */
export function useCategoryStats() {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await postsService.getCategoryStats()
      setStats(data)
    } catch (err) {
      setError(err.message)
      setStats({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  }
}

/**
 * Hook for post mutations (create, update, delete)
 * @returns {Object} Mutation functions and loading state
 */
export function usePostMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createPost = async (post) => {
    try {
      setLoading(true)
      setError(null)
      const data = await postsService.create(post)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updatePost = async (id, updates) => {
    try {
      setLoading(true)
      setError(null)
      const data = await postsService.update(id, updates)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deletePost = async (id) => {
    try {
      setLoading(true)
      setError(null)
      await postsService.delete(id)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const publishPost = async (id) => {
    try {
      setLoading(true)
      setError(null)
      const data = await postsService.publish(id)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const unpublishPost = async (id) => {
    try {
      setLoading(true)
      setError(null)
      const data = await postsService.unpublish(id)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const setFeatured = async (id, featured) => {
    try {
      setLoading(true)
      setError(null)
      const data = await postsService.setFeatured(id, featured)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    createPost,
    updatePost,
    deletePost,
    publishPost,
    unpublishPost,
    setFeatured,
    loading,
    error,
  }
}

