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
  const [curPos,    setCurPos]    = useState({ x:0, y:0 })
  const [ringPos,   setRingPos]   = useState({ x:0, y:0 })
  const [ringBig,   setRingBig]   = useState(false)
  const typedRef    = useRef('')
  const tapCountRef = useRef(0)
  const tapTimerRef = useRef(null)
  const ringRef     = useRef({ x:0, y:0 })
  const rafRef      = useRef(null)

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

  /* ── Custom cursor ── */
  useEffect(() => {
    function onMove(e) { setCurPos({ x:e.clientX, y:e.clientY }) }
    window.addEventListener('mousemove', onMove)

    function animRing() {
      ringRef.current.x += (curPos.x - ringRef.current.x) * 0.13
      ringRef.current.y += (curPos.y - ringRef.current.y) * 0.13
      setRingPos({ x: ringRef.current.x, y: ringRef.current.y })
      rafRef.current = requestAnimationFrame(animRing)
    }
    rafRef.current = requestAnimationFrame(animRing)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [curPos.x, curPos.y])

  /* ── Hover expand ring ── */
  useEffect(() => {
    const targets = 'a,button,.cat-card,.post-card,.latest-item,.connect-btn,.cat-tile,.picker-item'
    function expand()  { setRingBig(true)  }
    function shrink()  { setRingBig(false) }
    function attach() {
      document.querySelectorAll(targets).forEach(el => {
        el.addEventListener('mouseenter', expand)
        el.addEventListener('mouseleave', shrink)
      })
    }
    attach()
    const mo = new MutationObserver(attach)
    mo.observe(document.body, { childList:true, subtree:true })
    return () => mo.disconnect()
  }, [])

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

  return (
    <>
      {/* Custom cursor — hidden on touch */}
      <div id="cur-dot"  style={{ left:curPos.x,   top:curPos.y   }}/>
      <div id="cur-ring" style={{ left:ringPos.x, top:ringPos.y, ...(ringBig?{width:60,height:60,borderColor:'rgba(168,85,247,.6)'}:{}) }}/>

      {/* Secret toast */}
      <div id="secret-toast" className={toastVis ? 'show' : ''}>{toastMsg}</div>

      {/* Public blog */}
      <div id="blog-layer" onClick={e => {
        // footer tap target
        if (e.target.id === 'tap-target') handleFooterTap()
      }}>
        <Blog />
      </div>

      {/* CMS overlay */}
      {cmsOpen && <CMSOverlay onClose={() => { setCmsOpen(false); typedRef.current = '' }} />}
    </>
  )
}
