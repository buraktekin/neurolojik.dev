import { useState } from 'react'
import { authService } from '../../services/auth.service.js'

export default function Login({ onLogin, onClose }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!email || !pass) {
      setErr('// please enter email and password')
      return
    }

    setLoading(true)
    setErr('')

    try {
      await authService.signIn(email, pass)
      onLogin()
    } catch (error) {
      console.error('Login error:', error)
      setErr('// incorrect credentials or server error')
      setPass('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cms-view active" id="v-login" style={{alignItems:'center',justifyContent:'center',flexDirection:'column',position:'relative',overflow:'hidden'}}>
      <div className="login-glow"/>
      <div className="login-box">
        <div className="login-logo">neurolojik</div>
        <div className="login-tagline">// neural space · studio</div>
        <div className="login-card">
          <h2 className="login-title">Welcome back.</h2>
          <p className="login-sub">Enter your credentials to access the studio.</p>
          <div className="lfield">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
              disabled={loading}
            />
          </div>
          <div className="lfield">
            <label>Password</label>
            <input
              type="password"
              value={pass}
              onChange={e=>setPass(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              onKeyDown={e=>e.key==='Enter'&&!loading&&submit()}
              disabled={loading}
            />
          </div>
          <button className="login-btn" onClick={submit} disabled={loading}>
            {loading ? 'Signing in...' : 'Enter Studio →'}
          </button>
          <div className="login-err">{err}</div>
        </div>
        <button className="back-link btn-as-link" onClick={onClose} disabled={loading}>
          ← back to blog
        </button>
      </div>
    </div>
  )
}
