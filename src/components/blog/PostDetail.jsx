import { useEffect } from 'react'
import { usePost } from '../../hooks/usePosts.js'
import { LoadingSpinner, ErrorMessage } from '../common/LoadingSpinner.jsx'
import { PostSEO } from '../common/SEO.jsx'
import { BDEFS } from '../../data/blockDefs.js'

/**
 * Post Detail Modal/Page Component
 * Displays full post content with all blocks
 */
export default function PostDetail({ slug, onClose }) {
  const { post, loading, error } = usePost(slug)

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  if (loading) {
    return (
      <div className="post-detail-overlay">
        <div className="post-detail-container">
          <LoadingSpinner size="large" message="Loading post..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="post-detail-overlay">
        <div className="post-detail-container">
          <ErrorMessage error={error} retry={onClose} />
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="post-detail-overlay">
        <div className="post-detail-container">
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <h2>Post not found</h2>
            <button onClick={onClose} className="btn-primary" style={{ marginTop: '1rem' }}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  const categoryColors = {
    photo: 'var(--cyan)',
    food: 'var(--orange)',
    travel: 'var(--purple)',
    life: 'var(--green)',
    code: 'var(--purple)',
  }

  const categoryLabels = {
    photo: '📷 Photography',
    food: '🍜 Food',
    travel: '🌍 Travel',
    life: '🧠 Life Tips',
    code: '⌨️ Code',
  }

  return (
    <>
      <PostSEO post={post} />
      
      <div className="post-detail-overlay" onClick={onClose}>
        <div className="post-detail-container" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="post-detail-header">
            <button className="post-detail-close" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>

          {/* Content */}
          <article className="post-detail-content">
            {/* Category Badge */}
            <div className="post-detail-category" style={{ color: categoryColors[post.category] }}>
              {categoryLabels[post.category]}
            </div>

            {/* Title */}
            <h1 className="post-detail-title">{post.title}</h1>

            {/* Meta */}
            <div className="post-detail-meta">
              <span>{new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
              {post.view_count > 0 && (
                <>
                  <span>·</span>
                  <span>{post.view_count} views</span>
                </>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="post-detail-tags">
                {post.tags.map((tag, i) => (
                  <span key={i} className="post-tag">{tag}</span>
                ))}
              </div>
            )}

            {/* Blocks */}
            <div className="post-detail-blocks">
              {post.blocks && post.blocks.length > 0 ? (
                post.blocks.map((block, index) => (
                  <BlockRenderer key={block.id || index} block={block} />
                ))
              ) : (
                <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem' }}>
                  No content yet.
                </p>
              )}
            </div>
          </article>

          {/* Footer */}
          <div className="post-detail-footer">
            <button onClick={onClose} className="btn-secondary">
              ← Back to Blog
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .post-detail-overlay {
          position: fixed;
          inset: 0;
          background: rgba(3, 3, 12, 0.95);
          backdrop-filter: blur(10px);
          z-index: 9999;
          overflow-y: auto;
          padding: 2rem;
          animation: fadeIn 0.3s ease;
        }

        .post-detail-container {
          max-width: 800px;
          margin: 0 auto;
          background: var(--bg2);
          border-radius: 16px;
          border: 1px solid var(--card-border);
          position: relative;
          animation: slideUp 0.3s ease;
        }

        .post-detail-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--card-border);
          display: flex;
          justify-content: flex-end;
        }

        .post-detail-close {
          background: none;
          border: none;
          color: var(--text-dim);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          line-height: 1;
          transition: color 0.2s;
        }

        .post-detail-close:hover {
          color: var(--text);
        }

        .post-detail-content {
          padding: 2rem;
        }

        .post-detail-category {
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 1rem;
        }

        .post-detail-title {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 1rem;
          color: var(--text);
        }

        .post-detail-meta {
          display: flex;
          gap: 0.5rem;
          color: var(--text-dim);
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .post-detail-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .post-tag {
          padding: 0.25rem 0.75rem;
          background: var(--bg3);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          font-size: 0.75rem;
          color: var(--text-dim);
        }

        .post-detail-blocks {
          margin-top: 2rem;
        }

        .post-detail-footer {
          padding: 1.5rem 2rem;
          border-top: 1px solid var(--card-border);
        }

        .btn-secondary {
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: 1px solid var(--card-border);
          border-radius: 8px;
          color: var(--text);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: var(--bg3);
          border-color: var(--cyan);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 768px) {
          .post-detail-overlay {
            padding: 0;
          }

          .post-detail-container {
            border-radius: 0;
            min-height: 100vh;
          }

          .post-detail-content {
            padding: 1.5rem;
          }

          .post-detail-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </>
  )
}

/**
 * Block Renderer Component
 * Renders individual blocks based on type
 */
function BlockRenderer({ block }) {
  const blockDef = BDEFS[block.type]
  
  if (!blockDef) {
    return (
      <div style={{ padding: '1rem', background: 'var(--bg3)', borderRadius: '8px', marginBottom: '1rem' }}>
        <p style={{ color: 'var(--text-dim)' }}>Unknown block type: {block.type}</p>
      </div>
    )
  }

  // blockDef.render() returns a DOM element, we need to convert it to React
  // Use dangerouslySetInnerHTML for now (content is sanitized in validation.js)
  const domElement = blockDef.render(block.data || {})
  
  return (
    <div
      className="block-wrapper"
      style={{ marginBottom: '1.5rem' }}
      dangerouslySetInnerHTML={{ __html: domElement.outerHTML }}
    />
  )
}

