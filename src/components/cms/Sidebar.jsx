import { authService } from '../../services/auth.service.js'
import { useAuth } from '../../hooks/useAuth.jsx'

const NAV = [
  { page:'dash',  icon:'🏠', label:'Dashboard' },
  { page:'posts', icon:'📋', label:'All Posts'  },
]
const CATS = [
  { cat:'photo',  icon:'📷', label:'Photography' },
  { cat:'food',   icon:'🍜', label:'Food'         },
  { cat:'travel', icon:'🌍', label:'Travel'       },
  { cat:'life',   icon:'🧠', label:'Life Tips'    },
  { cat:'code',   icon:'⌨️', label:'Code'         },
]

export default function Sidebar({ activePage, onNav, onCat, onClose }) {
  const { user } = useAuth()

  async function handleSignOut() {
    try {
      await authService.signOut()
      onClose()
    } catch (error) {
      console.error('Sign out error:', error)
      // Still close on error
      onClose()
    }
  }
  // Get user initials for avatar
  const userEmail = user?.email || 'user@example.com'
  const initials = userEmail.split('@')[0].substring(0, 2).toUpperCase()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">neurolojik</div>
      <div className="sidebar-user">
        <div className="user-avatar">{initials}</div>
        <div>
          <div className="user-name">{userEmail.split('@')[0]}</div>
          <div className="user-role">Admin</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <span className="nav-section">Studio</span>
        {NAV.map(n=>(
          <div key={n.page} className={`nav-item${activePage===n.page?' active':''}`} onClick={()=>onNav(n.page)}>
            <span className="ni">{n.icon}</span> {n.label}
          </div>
        ))}
        <span className="nav-section">Create</span>
        {CATS.map(c=>(
          <div key={c.cat} className="nav-item" onClick={()=>onCat(c.cat)}>
            <span className="ni">{c.icon}</span> {c.label}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button className="view-blog-btn" onClick={onClose}>← View Blog</button>
        <button className="logout-btn" onClick={handleSignOut}>⏻ &nbsp;Sign Out</button>
      </div>
    </aside>
  )
}
