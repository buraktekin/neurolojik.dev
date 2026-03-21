import { useMyPosts } from '../../hooks/usePosts.js'
import { useCategoryStats } from '../../hooks/usePosts.js'
import LoadingSpinner from '../common/LoadingSpinner.jsx'

const TILES = [
  { cat:'photo',  cls:'ct-photo',  icon:'📷', name:'Photography', desc:'Frame a moment, tell a visual story.' },
  { cat:'food',   cls:'ct-food',   icon:'🍜', name:'Food',         desc:'That dish, that place, that memory.' },
  { cat:'travel', cls:'ct-travel', icon:'🌍', name:'Travel',       desc:'A dispatch from somewhere new.' },
  { cat:'life',   cls:'ct-life',   icon:'🧠', name:'Life Tips',    desc:'A hard-won lesson, distilled.' },
  { cat:'code',   cls:'ct-code',   icon:'⌨️', name:'Code',         desc:'The problem, the solution, the scars.' },
]

export default function Dashboard({ onCat }) {
  const { posts, loading: postsLoading } = useMyPosts()
  const { stats: categoryStats, loading: statsLoading } = useCategoryStats()
  
  const h = new Date().getHours()
  const greet = h<12?'Good morning':h<17?'Hey':'Good evening'

  // Calculate stats from posts
  const stats = {
    total: posts.length,
    pub: posts.filter(p => p.status === 'published').length,
    draft: posts.filter(p => p.status === 'draft').length,
  }

  // Get counts per category
  const counts = {}
  TILES.forEach(t => {
    const stat = Array.isArray(categoryStats)
      ? categoryStats.find(s => s.category === t.cat)
      : null
    counts[t.cat] = stat?.count || 0
  })

  const loading = postsLoading || statsLoading

  if (loading) {
    return (
      <div id="p-dash" className="active" style={{padding:'52px',display:'flex',alignItems:'center',justifyContent:'center',minHeight:'400px'}}>
        <LoadingSpinner size="large" message="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div id="p-dash" className="active" style={{padding:'52px 52px 80px',display:'flex',flexDirection:'column'}}>
      <div className="dash-hey">// good to have you back</div>
      <h1 className="dash-h1">{greet}, Burak.</h1>
      <p className="dash-sub">What do you want to <span>create</span> today?</p>
      <div className="cat-grid">
        {TILES.map(t=>(
          <div key={t.cat} className={`cat-tile ${t.cls}`} onClick={()=>onCat(t.cat)}>
            <span className="ct-count" id={`cnt-${t.cat}`}>{counts[t.cat]||0} posts</span>
            <span className="ct-icon">{t.icon}</span>
            <div className="ct-name">{t.name}</div>
            <p className="ct-desc">{t.desc}</p>
          </div>
        ))}
      </div>
      <div className="dash-stats">
        <div className="ds-tile"><div className="ds-n">{stats.total}</div><div className="ds-l">Total Posts</div></div>
        <div className="ds-tile"><div className="ds-n">{stats.pub}</div><div className="ds-l">Published</div></div>
        <div className="ds-tile"><div className="ds-n">{stats.draft}</div><div className="ds-l">Drafts</div></div>
        <div className="ds-tile"><div className="ds-n">5</div><div className="ds-l">Categories</div></div>
      </div>
    </div>
  )
}
