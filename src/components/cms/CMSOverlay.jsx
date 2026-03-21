import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import Login from './Login.jsx'
import Sidebar from './Sidebar.jsx'
import Dashboard from './Dashboard.jsx'
import Editor from './Editor.jsx'
import PostsList from './PostsList.jsx'
import LoadingSpinner from '../common/LoadingSpinner.jsx'

export default function CMSOverlay({ onClose }) {
  const { user, loading: authLoading } = useAuth()
  
  // Initialize state from sessionStorage if available
  const [page, setPage] = useState(() => {
    const saved = sessionStorage.getItem('cms_page')
    return saved || 'dash'
  })
  const [editorCat, setEditorCat] = useState(() => {
    const saved = sessionStorage.getItem('cms_editor_cat')
    return saved || null
  })
  const [editorId, setEditorId] = useState(() => {
    const saved = sessionStorage.getItem('cms_editor_id')
    return saved || null
  })
  const [refreshKey, setRefresh] = useState(0)

  // Save CMS state to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('cms_page', page)
  }, [page])

  useEffect(() => {
    if (editorCat) {
      sessionStorage.setItem('cms_editor_cat', editorCat)
    } else {
      sessionStorage.removeItem('cms_editor_cat')
    }
  }, [editorCat])

  useEffect(() => {
    if (editorId) {
      sessionStorage.setItem('cms_editor_id', editorId)
    } else {
      sessionStorage.removeItem('cms_editor_id')
    }
  }, [editorId])

  // Add cms-mode class to body when CMS is open
  useEffect(() => {
    document.body.classList.add('cms-mode')
    return () => {
      document.body.classList.remove('cms-mode')
    }
  }, [])

  function handleLogin() {
    setPage('dash')
  }

  function openEditor(cat, id = null) {
    setEditorCat(cat); setEditorId(id); setPage('editor')
  }

  function handleSaved() {
    setRefresh(k => k + 1)
  }

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div id="cms-overlay" className="active">
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}>
          <LoadingSpinner size="large" message="Loading..." />
        </div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!user) {
    return (
      <div id="cms-overlay" className="active">
        <Login onLogin={handleLogin} onClose={onClose} />
      </div>
    )
  }

  // Show CMS interface if authenticated
  return (
    <div id="cms-overlay" className="active">
      <div id="v-main" className="cms-view active">
        <Sidebar
          activePage={page}
          onNav={p => setPage(p)}
          onCat={cat => openEditor(cat)}
          onClose={onClose}
        />
        <div className="cms-content">
          {page === 'dash' && (
            <Dashboard key={refreshKey} onCat={cat => openEditor(cat)} />
          )}
          {page === 'posts' && (
            <PostsList
              key={refreshKey}
              onNew={() => setPage('dash')}
              onEdit={(id, cat) => openEditor(cat, id)}
            />
          )}
          {page === 'editor' && editorCat && (
            <Editor
              key={`${editorCat}-${editorId}`}
              cat={editorCat}
              editId={editorId}
              onBack={() => setPage('dash')}
              onSaved={handleSaved}
            />
          )}
        </div>
      </div>
    </div>
  )
}
