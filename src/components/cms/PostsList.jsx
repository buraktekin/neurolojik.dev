import { useMyPosts } from '../../hooks/usePosts.js'
import { usePostMutations } from '../../hooks/usePosts.js'
import LoadingSpinner from '../common/LoadingSpinner.jsx'

const CAT_ICONS = { photo:'📷', food:'🍜', travel:'🌍', life:'🧠', code:'⌨️' }

export default function PostsList({ onNew, onEdit }) {
  const { posts, loading, error, refetch } = useMyPosts()
  const { deletePost: deletePostMutation, updatePost, publishPost, unpublishPost } = usePostMutations()

  async function deletePost(id) {
    if (!confirm('Delete this post permanently?')) return
    
    try {
      await deletePostMutation(id)
      refetch() // Refresh the list
    } catch (err) {
      console.error('Failed to delete post:', err)
      alert('Failed to delete post. Please try again.')
    }
  }

  async function changeStatus(post, newStatus) {
    try {
      if (newStatus === 'published') {
        await publishPost(post.id)
      } else if (newStatus === 'draft') {
        await unpublishPost(post.id)
      } else {
        // For 'hidden' status, update the post
        await updatePost(post.id, { status: 'hidden' })
      }
      refetch() // Refresh the list
    } catch (err) {
      console.error('Failed to change status:', err)
      alert('Failed to change status. Please try again.')
    }
  }

  if (loading) {
    return (
      <div id="p-posts" className="active" style={{padding:'52px',display:'flex',alignItems:'center',justifyContent:'center',minHeight:'400px'}}>
        <LoadingSpinner size="large" message="Loading posts..." />
      </div>
    )
  }

  if (error) {
    return (
      <div id="p-posts" className="active" style={{padding:'52px'}}>
        <div className="pl-header">
          <h2 className="pl-title">All Posts</h2>
          <button className="pl-new" onClick={onNew}>+ New Post</button>
        </div>
        <div style={{textAlign:'center',padding:'60px 20px',color:'var(--text-dim)'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>⚠️</div>
          <p style={{fontSize:'16px',marginBottom:'12px'}}>Failed to load posts</p>
          <p style={{fontSize:'14px',marginBottom:'20px',color:'var(--text-dimmer)'}}>{error}</p>
          <button className="btn-draft" onClick={refetch}>Try Again</button>
        </div>
      </div>
    )
  }

  return (
    <div id="p-posts" className="active" style={{padding:'52px'}}>
      <div className="pl-header">
        <h2 className="pl-title">All Posts</h2>
        <button className="pl-new" onClick={onNew}>+ New Post</button>
      </div>
      {posts.length===0 ? (
        <div className="pl-empty"><div className="pe-big">📝</div>No posts yet. Start creating!</div>
      ) : (
        <table className="pl-table">
          <thead>
            <tr>
              <th>Title</th><th>Category</th><th>Status</th><th>Date</th><th/>
            </tr>
          </thead>
          <tbody>
            {posts.map(p=>(
              <tr key={p.id}>
                <td style={{maxWidth:260,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontWeight:500}}>
                  {p.title||'Untitled'}
                </td>
                <td style={{fontFamily:'JetBrains Mono,monospace',fontSize:11}}>{CAT_ICONS[p.category]||'📄'} {p.category}</td>
                <td>
                  <select
                    value={p.status}
                    onChange={(e) => changeStatus(p, e.target.value)}
                    className="status-select"
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--card-border)',
                      background: p.status === 'published' ? 'var(--green)' : p.status === 'hidden' ? 'var(--orange)' : 'var(--text-dim)',
                      color: 'white',
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono, monospace',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="draft">draft</option>
                    <option value="published">published</option>
                    <option value="hidden">hidden</option>
                  </select>
                </td>
                <td style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,color:'var(--text-dim)'}}>
                  {new Date(p.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
                </td>
                <td>
                  <div className="pl-acts">
                    <button className="pl-act" onClick={()=>onEdit(p.id,p.category)}>Edit</button>
                    <button className="pl-act del" onClick={()=>deletePost(p.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
