import { useState, useEffect } from 'react'
import NeuralCanvas from './NeuralCanvas.jsx'
import PostDetail from './PostDetail.jsx'
import ThemeSwitcher from '../common/ThemeSwitcher.jsx'
import { SHAPES, LABELS } from '../../data/shapes.js'
import { usePosts, useCategoryStats } from '../../hooks/usePosts.js'
import { LoadingSpinner, ErrorMessage, EmptyState } from '../common/LoadingSpinner.jsx'
import { SEO } from '../common/SEO.jsx'

const CAT_META = {
  photo:  { color:'var(--cyan)',   hoverClass:'c-photo', icon:'📷', label:'Photography', desc:'Visual stories from city streets, golden hours, and quiet moments.' },
  food:   { color:'var(--orange)', hoverClass:'c-food', icon:'🍜', label:'Food', desc:'Recipes that broke me, restaurants that moved me.' },
  travel: { color:'var(--purple)', hoverClass:'c-travel', icon:'🌍', label:'Travel', desc:'Not guides. Dispatches. Jet lag to epiphany.' },
  life:   { color:'var(--green)',  hoverClass:'c-life', icon:'🧠', label:'Life Tips', desc:'Hard-won lessons and habits that actually stuck.' },
  code:   { color:'var(--purple)', hoverClass:'c-code', icon:'⌨️', label:'Code', desc:'Architecture and things I learned the expensive way.' },
}

export default function Blog() {
  const [navScrolled, setNavScrolled] = useState(false)
  const [mobOpen, setMobOpen] = useState(false)
  const [activeShape, setActiveShape] = useState('photo')
  const [shapeLbl, setShapeLbl] = useState(LABELS[0])
  const [shapeVis, setShapeVis] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)

  // Fetch posts and category stats
  const { posts, loading: postsLoading, error: postsError } = usePosts({ 
    category: selectedCategory,
    status: 'published' 
  })
  const { stats, loading: statsLoading } = useCategoryStats()

  // Featured posts (limit 5)
  const featuredPosts = posts.filter(p => p.featured).slice(0, 5)
  const latestPosts = posts.slice(0, 5)

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Listen for shape changes from neural animation
  useEffect(() => {
    const handleShapeChangeEvent = (e) => {
      const shapeName = e.detail.shape
      setActiveShape(shapeName)
      setShapeLbl(LABELS[SHAPES.indexOf(shapeName)])
    }
    
    window.addEventListener('neuralShapeChange', handleShapeChangeEvent)
    return () => window.removeEventListener('neuralShapeChange', handleShapeChangeEvent)
  }, [])

  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { 
        if (e.isIntersecting) { 
          e.target.classList.add('vis')
          obs.unobserve(e.target) 
        } 
      })
    }, { threshold: 0.1 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [posts]) // Re-run when posts change

  function handlePillClick(e, shape) {
    e.preventDefault()
    setActiveShape(shape)
    setShapeLbl(LABELS[SHAPES.indexOf(shape)])
    setShapeVis(true)
    
    // Dispatch custom event to tell neural animation to change shape immediately
    window.dispatchEvent(new CustomEvent('forceShapeChange', {
      detail: { shape }
    }))
  }

  function handleShapeChange(name) {
    setActiveShape(name)
    setShapeLbl(LABELS[SHAPES.indexOf(name)])
  }

  function handleCategoryClick(category) {
    setSelectedCategory(selectedCategory === category ? null : category)
    // Scroll to blog section
    document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })
  }

  function handlePostClick(post) {
    setSelectedPost(post.slug)
  }

  function handleNavClick(e, section) {
    e.preventDefault()
    const element = document.getElementById(section)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setMobOpen(false)
    }
  }

  const pills = ['photo', 'food', 'travel', 'life', 'code']

  return (
    <>
      <SEO />
      
      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetail 
          slug={selectedPost} 
          onClose={() => setSelectedPost(null)} 
        />
      )}

      {/* NAV */}
      <nav id="nav" className={navScrolled ? 'scrolled' : ''}>
        <a href="#hero" onClick={(e) => handleNavClick(e, 'hero')} className="nav-logo">BT</a>
        <ul className="nav-links">
          {['About', 'Topics', 'Blog', 'Connect'].map(s => (
            <li key={s}>
              <a href={`#${s.toLowerCase()}`} onClick={(e) => handleNavClick(e, s === 'Blog' ? 'featured' : s.toLowerCase())}>
                {s}
              </a>
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ThemeSwitcher />
          <button
            className={`hamburger${mobOpen ? ' open' : ''}`}
            id="ham"
            aria-label="Menu"
            onClick={() => setMobOpen(v => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`mobile-nav${mobOpen ? ' open' : ''}`} id="mob-nav">
        {['About', 'Topics', 'Blog', 'Connect'].map(s => (
          <a 
            key={s} 
            href={`#${s.toLowerCase()}`} 
            className="mob-link" 
            onClick={(e) => handleNavClick(e, s === 'Blog' ? 'featured' : s.toLowerCase())}
          >
            {s}
          </a>
        ))}
      </div>

      {/* HERO */}
      <section id="hero">
        {/* Plain JavaScript neural animation (primary) */}
        <canvas id="neural-canvas" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
          pointerEvents: 'auto',
          display: 'block'
        }} />
        
        {/* React fallback (commented out - uncomment if plain JS fails) */}
        {/* <NeuralCanvas activeShape={activeShape} onShapeChange={handleShapeChange} /> */}
        
        <div className="hero-inner">
          <p className="hero-tag">// neurolojik.dev</p>
          <h1 className="hero-name">
            <span className="glitch" data-text="BURAK">BURAK</span><br />
            <span className="hero-accent">TEKİN</span>
          </h1>
          <p className="hero-sub">
            <span className="hl">Software Engineer</span> at IBM · Explorer of<br />
            food, frames, frontiers & code
          </p>
          <div className="hero-pills">
            {pills.map(shape => (
              <a 
                key={shape} 
                href="#" 
                className={`pill${activeShape === shape ? ' active-pill' : ''}`}
                data-shape={shape} 
                onClick={e => handlePillClick(e, shape)}
              >
                {shape.charAt(0).toUpperCase() + shape.slice(1)}
              </a>
            ))}
          </div>
        </div>
        <div className={`shape-label${shapeVis ? ' vis' : ''}`} id="shape-label">{shapeLbl}</div>
        <div className="scroll-hint">
          <span>scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker-wrap">
        <div className="ticker">
          {['RECORD', 'EAT', 'TRAVEL', 'CREATE', 'CODE', 'REPEAT',
            'RECORD', 'EAT', 'TRAVEL', 'CREATE', 'CODE', 'REPEAT'].map((s, i) => (
              <span key={i} className="ticker-item">{s} ·</span>
            ))}
        </div>
      </div>

      {/* ABOUT */}
      <section id="about">
        <div className="about-left reveal">
          <div className="big-text">
            <div><span className="fl">HU</span><span className="ol">MAN</span></div>
            <div><span className="ol">BE</span><span className="fl">ING</span></div>
            <div><span className="fl">+</span></div>
            <div><span className="ol">EN</span><span className="fl">GI</span></div>
            <div><span className="fl">NE</span><span className="ol">ER</span></div>
          </div>
        </div>
        <div className="about-right reveal rd2">
          <p className="section-label">About</p>
          <p>I'm <strong>Burak Tekin</strong> — a software engineer at IBM who refuses to be defined by a job title.</p>
          <p>This blog is my <strong>neural archive</strong> — where half-eaten street food in Tokyo sits next to architecture rants, where a travel essay bleeds into a React deep-dive.</p>
          <div className="terminal">
            <div className="tl">whoami</div>
            <div className="to"><span className="th">burak.tekin</span> // engineer · photographer · traveller</div>
            <div className="tl">cat interests.txt</div>
            <div className="to"><span className="th">food</span>, <span className="th">photography</span>, <span className="th">travel</span>, <span className="th">life</span>, <span className="th">code</span></div>
            <div className="tl">_<span className="tcur" /></div>
          </div>
          <div className="social-row">
            {[
              { href: 'https://github.com/buraktekin', icon: 'github', label: 'GitHub' },
              { href: 'https://instagram.com/neurolojik', icon: 'instagram', label: 'neurolojik' },
              { href: 'https://linkedin.com/in/tekinburak', icon: 'linkedin', label: 'LinkedIn' },
            ].map(s => (
              <a key={s.label} href={s.href} className="social-btn" target="_blank" rel="noreferrer">
                <SocialIcon name={s.icon} /> {s.label}
              </a>
            ))}
          </div>
          <div className="stat-row">
            <div className="stat-item"><div className="stat-num">5+</div><div className="stat-label">Years IBM</div></div>
            <div className="stat-item"><div className="stat-num">42</div><div className="stat-label">Countries</div></div>
            <div className="stat-item"><div className="stat-num">∞</div><div className="stat-label">Curiosities</div></div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories">
        <p className="section-label reveal">Topics</p>
        <h2 className="section-title reveal rd1">What I write about</h2>
        {selectedCategory && (
          <p className="reveal rd2" style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: '1rem' }}>
            Filtering by: <strong style={{ color: 'var(--cyan)' }}>{CAT_META[selectedCategory].label}</strong>
            {' '}
            <button 
              onClick={() => setSelectedCategory(null)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--cyan)', 
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              (clear)
            </button>
          </p>
        )}
        <div className="cats-grid">
          {statsLoading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
              <LoadingSpinner message="Loading categories..." />
            </div>
          ) : (
            Object.entries(CAT_META).map(([key, meta], i) => {
              const count = stats[key]?.published || 0
              return (
                <div 
                  key={key} 
                  className={`cat-card ${meta.hoverClass} reveal rd${i + 1}${selectedCategory === key ? ' active' : ''}`}
                  onClick={() => handleCategoryClick(key)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="cat-count">{count} post{count !== 1 ? 's' : ''}</span>
                  <span className="cat-icon">{meta.icon}</span>
                  <div className="cat-name">{meta.label}</div>
                  <p className="cat-desc">{meta.desc}</p>
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* FEATURED POSTS */}
      <section id="featured">
        <div className="posts-header">
          <div>
            <p className="section-label reveal">Latest</p>
            <h2 className="section-title reveal rd1">
              {selectedCategory ? `${CAT_META[selectedCategory].label} Posts` : 'Featured posts'}
            </h2>
          </div>
        </div>

        {postsLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <LoadingSpinner size="large" message="Loading posts..." />
          </div>
        ) : postsError ? (
          <ErrorMessage error={postsError} />
        ) : posts.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No posts yet"
            message={selectedCategory 
              ? `No posts in ${CAT_META[selectedCategory].label} category yet.`
              : "Start creating posts in the CMS to see them here!"
            }
            action={selectedCategory && (
              <button 
                onClick={() => setSelectedCategory(null)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'var(--grad)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                View All Posts
              </button>
            )}
          />
        ) : (
          <div className="posts-grid">
            {(featuredPosts.length > 0 ? featuredPosts : posts.slice(0, 5)).map((post, index) => (
              <PostCard 
                key={post.id}
                post={post}
                featured={post.featured}
                onClick={() => handlePostClick(post)}
              />
            ))}
          </div>
        )}
      </section>

      {/* PHILOSOPHY */}
      <section id="philosophy">
        <div className="connect-glow" />
        <p className="philosophy-text reveal">
          &ldquo;The best engineers I know are also the best <em>travelers</em> —<br />
          both know when to follow the map<br />and when to throw it away.&rdquo;
        </p>
        <p className="philosophy-sig reveal rd2">— Burak Tekin, probably at an airport</p>
      </section>

      {/* LATEST */}
      {!selectedCategory && latestPosts.length > 0 && (
        <section id="latest">
          <p className="section-label reveal">Archive</p>
          <h2 className="section-title reveal rd1">More reading</h2>
          <div className="latest-list">
            {latestPosts.map((post, index) => (
              <a 
                key={post.id} 
                href="#" 
                className="latest-item reveal"
                onClick={(e) => {
                  e.preventDefault()
                  handlePostClick(post)
                }}
              >
                <span className="latest-num">{String(index + 1).padStart(2, '0')}</span>
                <div className="latest-title-row">
                  <span className="latest-title">{post.title}</span>
                  <div className="latest-meta">
                    <span className={`post-tag tag-${post.category}`} style={{ margin: 0 }}>
                      {CAT_META[post.category].label}
                    </span>
                    <span>·</span>
                    <span>{new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                </div>
                <span className="latest-arrow">→</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* CONNECT */}
      <section id="connect">
        <div className="connect-glow" />
        <p className="section-label" style={{ justifyContent: 'center' }}>Get in touch</p>
        <h2 className="connect-title reveal">LET'S<br /><span className="connect-grad">TALK</span></h2>
        <p className="connect-sub reveal rd1">Always up for interesting conversations — about code, travel, good food, or whatever's on your mind.</p>
        <div className="connect-links reveal rd2">
          <a href="mailto:hello@buraktekin.dev" className="connect-btn primary">Say Hello →</a>
          <a href="https://github.com/buraktekin" className="connect-btn secondary" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://instagram.com/neurolojik" className="connect-btn secondary" target="_blank" rel="noreferrer">Instagram</a>
        </div>
      </section>

      <footer>
        <span className="footer-logo">neurolojik</span>
        <span className="footer-copy" id="tap-target">© 2026 Burak Tekin · Built with curiosity</span>
        <span className="footer-copy">Regensburg, DE</span>
      </footer>
    </>
  )
}

function PostCard({ post, featured, onClick }) {
  const categoryGradients = {
    photo: 'radial-gradient(ellipse at 20% 80%, rgba(0,212,255,.45), #03030c)',
    food: 'radial-gradient(ellipse at 70% 30%, rgba(255,94,44,.55), #03030c)',
    travel: 'radial-gradient(ellipse at 30% 40%, rgba(168,85,247,.6), #03030c 60%, rgba(0,212,255,.25))',
    life: 'radial-gradient(ellipse at 50% 50%, rgba(0,245,160,.38), #03030c)',
    code: 'linear-gradient(135deg, rgba(0,212,255,.3), rgba(168,85,247,.4))',
  }

  const excerpt = post.excerpt || (post.blocks && post.blocks.length > 0 
    ? post.blocks.find(b => b.data?.text)?.data?.text?.substring(0, 120) + '...'
    : 'No excerpt available')

  const readTime = post.blocks ? Math.max(1, Math.ceil(post.blocks.length * 0.5)) : 3

  return (
    <div 
      className={`post-card${featured ? ' featured' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="post-thumb">
        <svg className="post-thumb-bg" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" style={{ fill: categoryGradients[post.category] }} />
        </svg>
      </div>
      <div className="post-body">
        <span className={`post-tag tag-${post.category}`}>{CAT_META[post.category].label}</span>
        <h3 className="post-title">{post.title}</h3>
        <p className="post-excerpt">{excerpt}</p>
        <div className="post-meta">
          <span>{new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}</span>
          <span className="dot" />
          <span>{readTime} min read</span>
        </div>
      </div>
    </div>
  )
}

function SocialIcon({ name }) {
  const paths = {
    github: 'M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.3-3.2-.2-.4-.6-1.6.1-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.4-1.5 3.4-1.2 3.4-1.2.7 1.6.3 2.8.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3',
    instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
    linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  }
  return <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'currentColor', flexShrink: 0 }}><path d={paths[name]} /></svg>
}

