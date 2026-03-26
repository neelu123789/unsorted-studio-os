// src/pages/Auth.jsx
// Local team authentication — no Supabase Auth required.
// Users/passwords stored in localStorage (studio-os-team).
// Founder can add/remove team members from Settings.

import { useState } from 'react'
import { Eye, EyeOff, Lock, User } from 'lucide-react'

// ── Default team (can be managed in Settings) ─────────────
const DEFAULT_TEAM = [
  { id: 'u1', name: 'Yashvanth', role: 'founder', username: 'yashvanth', password: 'unsorted2024', color: '#5CB83A' },
  { id: 'u2', name: 'Neelamma', role: 'team',     username: 'neelamma',  password: 'studio2024',   color: '#2563EB' },
]

export function getTeam() {
  try { return JSON.parse(localStorage.getItem('us_team') || 'null') || DEFAULT_TEAM } catch { return DEFAULT_TEAM }
}
export function saveTeam(team) { localStorage.setItem('us_team', JSON.stringify(team)) }
export function getCurrentUser() {
  try { return JSON.parse(sessionStorage.getItem('us_user') || 'null') } catch { return null }
}
export function setCurrentUser(user) {
  if (user) sessionStorage.setItem('us_user', JSON.stringify(user))
  else sessionStorage.removeItem('us_user')
}

export default function Auth({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      const team = getTeam()
      const user = team.find(u =>
        u.username.toLowerCase() === username.trim().toLowerCase() &&
        u.password === password
      )
      if (user) {
        setCurrentUser(user)
        onLogin(user)
      } else {
        setError('Wrong username or password.')
        setLoading(false)
      }
    }, 400)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:24 }}>
      <div style={{ width:'100%', maxWidth:380 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontFamily:'var(--syne)', fontSize:28, fontWeight:800, letterSpacing:'-0.02em' }}>
            Unsorted<span style={{ color:'var(--text3)' }}>.</span>
          </div>
          <div style={{ fontSize:11, fontFamily:'var(--mono)', color:'var(--text3)', letterSpacing:'.08em', marginTop:4 }}>STUDIO OS v3.0</div>
        </div>

        {/* Card */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'28px 28px 24px', boxShadow:'var(--shadow-lg)' }}>
          <div style={{ fontFamily:'var(--syne)', fontSize:18, fontWeight:700, marginBottom:4 }}>Welcome back</div>
          <div style={{ fontSize:13, color:'var(--text3)', marginBottom:24 }}>Sign in to your workspace</div>

          <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {/* Username */}
            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              <label style={{ fontSize:12, fontWeight:500, color:'var(--text2)' }}>Username</label>
              <div style={{ position:'relative' }}>
                <User size={14} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }}/>
                <input
                  type="text" value={username} onChange={e=>setUsername(e.target.value)}
                  placeholder="yashvanth" autoFocus autoComplete="username"
                  style={{ width:'100%', padding:'9px 11px 9px 32px', borderRadius:'var(--r-sm)', border:'1px solid var(--border2)', background:'var(--surface)', color:'var(--text)', fontSize:13, outline:'none', transition:'border-color .15s' }}
                  onFocus={e=>e.target.style.borderColor='var(--blue)'}
                  onBlur={e=>e.target.style.borderColor='var(--border2)'}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              <label style={{ fontSize:12, fontWeight:500, color:'var(--text2)' }}>Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={14} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }}/>
                <input
                  type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  style={{ width:'100%', padding:'9px 36px 9px 32px', borderRadius:'var(--r-sm)', border:'1px solid var(--border2)', background:'var(--surface)', color:'var(--text)', fontSize:13, outline:'none', transition:'border-color .15s' }}
                  onFocus={e=>e.target.style.borderColor='var(--blue)'}
                  onBlur={e=>e.target.style.borderColor='var(--border2)'}
                />
                <button type="button" onClick={()=>setShowPass(p=>!p)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text3)', display:'flex' }}>
                  {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ fontSize:12, color:'var(--red)', background:'var(--red-bg)', border:'1px solid var(--red-border)', borderRadius:'var(--r-sm)', padding:'8px 12px' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading || !username || !password} style={{
              padding:'10px', borderRadius:'var(--r-sm)', border:'none',
              background: loading || !username || !password ? 'var(--surface3)' : 'var(--text)',
              color: loading || !username || !password ? 'var(--text3)' : 'var(--bg)',
              fontSize:13, fontWeight:600, cursor: loading || !username || !password ? 'not-allowed' : 'pointer',
              fontFamily:'var(--body)', transition:'all .15s', marginTop:4
            }}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
        </div>

        <div style={{ textAlign:'center', fontSize:11, color:'var(--text3)', marginTop:16, lineHeight:1.6 }}>
          Unsorted Studio · Private workspace<br/>
          Contact Yashvanth to get access
        </div>
      </div>
    </div>
  )
}
