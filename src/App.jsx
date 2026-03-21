import { useState, useEffect, useRef } from 'react'
import Blog from './components/blog/Blog.jsx'
import CMSOverlay from './components/cms/CMSOverlay.jsx'

// Get CMS secret from environment variable (fallback to default for development)
const SECRET = import.meta.env.VITE_CMS_SECRET || 'neurolojik'

export default function App() {
  // Initialize CMS state from sessionStorage (persist across refreshes)
  const [cmsOpen, setCmsOpen] = useState(() => {
    return sessionStorage.getItem('cms_open') === 'true'
  })
  const [toastMsg,  setToastMsg]  = useState('')
  const [toastVis,  setToastVis]  = useState(false)
  const typedRef    = useRef('')
  const tapCountRef = useRef(0)
  const tapTimerRef = useRef(null)

  // Persist CMS open state to sessionStorage
  useEffect(() => {
    if (cmsOpen) {
      sessionStorage.setItem('cms_open', 'true')
    } else {
      sessionStorage.removeItem('cms_open')
      // Clear CMS state when closing
      sessionStorage.removeItem('cms_page')
      sessionStorage.removeItem('cms_editor_cat')
      sessionStorage.removeItem('cms_editor_id')
    }
  }, [cmsOpen])

  /* ── Secret combo ── */
  function showToast(msg, cb) {
    setToastMsg(msg); setToastVis(true)
    setTimeout(() => { setToastVis(false); if (cb) setTimeout(cb, 400) }, 1300)
  }

  useEffect(() => {
    function onKey(e) {
      const tag = document.activeElement?.tagName
      if (['INPUT','TEXTAREA'].includes(tag) || document.activeElement?.contentEditable === 'true') return
      typedRef.current += e.key.toLowerCase()
      if (typedRef.current.length > SECRET.length)
        typedRef.current = typedRef.current.slice(-SECRET.length)
      if (typedRef.current === SECRET) {
        typedRef.current = ''
        showToast('🔐 entering neural space…', () => setCmsOpen(true))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* ── Mobile tap combo (7× footer) ── */
  function handleFooterTap() {
    tapCountRef.current++
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current)
    if (tapCountRef.current === 4)
      showToast('🔐 keep going…')
    if (tapCountRef.current >= 7) {
      tapCountRef.current = 0
      showToast('🔐 entering neural space…', () => setCmsOpen(true))
      return
    }
    tapTimerRef.current = setTimeout(() => { tapCountRef.current = 0; setToastVis(false) }, 3000)
  }

  /* ── Keyboard save in editor ── */
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Function to open CMS and navigate to editor
  function openCMSEditor(postId, category) {
    // Store the post ID and category to edit
    sessionStorage.setItem('cms_page', 'editor')
    sessionStorage.setItem('cms_editor_id', postId)
    sessionStorage.setItem('cms_editor_cat', category)
    sessionStorage.setItem('cms_open', 'true')
    setCmsOpen(true)
  }

  return (
    <>
      {/* Secret toast */}
      <div id="secret-toast" className={toastVis ? 'show' : ''}>{toastMsg}</div>

      {/* Public blog */}
      <div id="blog-layer" onClick={e => {
        // footer tap target
        if (e.target.id === 'tap-target') handleFooterTap()
      }}>
        <Blog onEditPost={openCMSEditor} />
      </div>

      {/* CMS overlay */}
      {cmsOpen && <CMSOverlay onClose={() => { setCmsOpen(false); typedRef.current = '' }} />}
    </>
  )
}
