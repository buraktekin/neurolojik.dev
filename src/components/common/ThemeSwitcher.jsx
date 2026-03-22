import { useState, useEffect, useRef } from 'react'

const THEMES = [
  {
    id: 'dark',
    name: 'Dark',
    icon: '🌙',
    desc: 'Deep space vibes with neon accents'
  },
  {
    id: 'light',
    name: 'Light',
    icon: '☀️',
    desc: 'Clean and bright for daytime reading'
  },
  {
    id: 'sepia',
    name: 'Sepia',
    icon: '📜',
    desc: 'Warm paper tones, easy on the eyes'
  },
  {
    id: 'nord',
    name: 'Nord',
    icon: '❄️',
    desc: 'Arctic-inspired cool color palette'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    icon: '🌃',
    desc: 'Neon-soaked dystopian future aesthetic'
  },
  {
    id: 'forest',
    name: 'Forest',
    icon: '🌲',
    desc: 'Deep woods with natural earth tones'
  },
  {
    id: 'sunset',
    name: 'Sunset',
    icon: '🌅',
    desc: 'Warm golden hour gradient vibes'
  }
]

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    // Apply theme using data-theme attribute
    const root = document.documentElement
    if (theme === 'dark') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleThemeChange = (themeId) => {
    setTheme(themeId)
    setIsOpen(false)
  }

  const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0]

  return (
    <div className="theme-switcher" ref={dropdownRef}>
      <button 
        className="theme-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change theme"
        title="Change theme"
      >
        <span className="theme-icon">{currentTheme.icon}</span>
      </button>
      
      {isOpen && (
        <div className="theme-menu">
          {THEMES.map(t => (
            <button
              key={t.id}
              className={`theme-option ${theme === t.id ? 'active' : ''}`}
              onClick={() => handleThemeChange(t.id)}
            >
              <div className="theme-option-content">
                <div className="theme-option-header">
                  <span className="theme-option-icon">{t.icon}</span>
                  <span className="theme-option-name">{t.name}</span>
                  {theme === t.id && <span className="theme-check">✓</span>}
                </div>
                <div className="theme-option-desc">{t.desc}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Made with Bob
