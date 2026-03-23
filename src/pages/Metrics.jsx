import { useState } from 'react'
import { useStore } from '../store/index.js'
import { Card, Btn, SectionHeader, useToast, StatCard } from '../components/ui.jsx'
import { TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight } from 'lucide-react'

const WEEK_TARGETS = {
  1: { dms: 2, visits: 50,  calls: 0, saves: 5  },
  2: { dms: 3, visits: 100, calls: 1, saves: 10 },
  3: { dms: 5, visits: 250, calls: 1, saves: 15 },
  4: { dms: 8, visits: 400, calls: 2, saves: 20 },
}

const METRIC_META = {
  dms:     { label: 'DMs Received',     color: '#7CDB5A', unit: '' },
  visits:  { label: 'Profile Visits',   color: '#3B82F6', unit: '' },
  calls:   { label: 'Calls Booked',     color: '#F27B2A', unit: '' },
  saves:   { label: 'Post Saves',       color: '#8B5CF6', unit: '' },
  spend:   { label: 'Ad Spend (₹)',     color: '#EF4444', unit: '₹' },
  follows: { label: 'New Followers',    color: '#14B8A6', unit: '' },
}

function Sparkline({ data, color, height = 48 }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data, 1)
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = height - (v / max) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
      <defs>
        <linearGradient id={`g-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${pts} 100,${height}`}
        fill={`url(#g-${color.replace('#','')})`}
      />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MiniBar({ value, max, color }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 6, background: 'var(--surface3)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', minWidth: 28, textAlign: 'right' }}>{pct}%</span>
    </div>
  )
}

export default function MetricsPage() {
  const { show, Toast } = useToast()
  const [sprint, setSprint] = useState(() => parseInt(localStorage.getItem('us_sprint') || '1'))
  const [metricsData, setMetricsData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('us_metrics_v2') || '{}') } catch { return {} }
  })

  const wk = `w${sprint}`
  const current = metricsData[wk] || {}
  const prev = metricsData[`w${sprint - 1}`] || {}
  const targets = WEEK_TARGETS[sprint] || WEEK_TARGETS[4]

  const update = (key, val) => {
    const next = { ...metricsData, [wk]: { ...(metricsData[wk] || {}), [key]: parseFloat(val) || 0 } }
    setMetricsData(next)
    localStorage.setItem('us_metrics_v2', JSON.stringify(next))
    localStorage.setItem('us_sprint', sprint)
  }

  const trend = (key) => {
    const c = current[key] || 0
    const p = prev[key] || 0
    if (!p) return null
    const diff = Math.round(((c - p) / p) * 100)
    return diff
  }

  // Build 4-week history for each metric
  const history = (key) => [1, 2, 3, 4].map(w => (metricsData[`w${w}`] || {})[key] || 0)

  // CPV calculation
  const cpv = (current.visits && current.spend) ? (current.spend / current.visits).toFixed(1) : null
  const convRate = (current.dms && current.calls) ? Math.round((current.calls / current.dms) * 100) : 0

  // Insights
  const insights = []
  if (current.dms >= (targets.dms || 3)) insights.push({ type: 'good', text: `DMs on target this week (${current.dms}/${targets.dms})` })
  else if (current.dms > 0) insights.push({ type: 'warn', text: `DMs below target. Post a DM-trigger piece mid-week.` })
  if (cpv) {
    if (parseFloat(cpv) <= 8) insights.push({ type: 'good', text: `Ad CPV ₹${cpv} is healthy — don't change the creative.` })
    else insights.push({ type: 'bad', text: `CPV ₹${cpv} is above ₹8. Test a sharper hook in the ad.` })
  }
  if (convRate >= 30) insights.push({ type: 'good', text: `DM→Call rate ${convRate}% — above the 30% benchmark.` })
  else if (current.dms > 0) insights.push({ type: 'warn', text: `DM→Call rate ${convRate}% — push to call by message 4.` })
  if ((current.saves || 0) > 10) insights.push({ type: 'good', text: `${current.saves} saves — strong content signal. Make more like it.` })

  const INSIGHT_COLORS = { good: { bg: 'var(--lime-bg)', border: '#A8E890', color: '#2D7A1F', icon: '✓' }, warn: { bg: 'var(--orange-bg)', border: '#FED7AA', color: '#C05621', icon: '→' }, bad: { bg: 'var(--red-bg)', border: '#FCA5A5', color: '#B91C1C', icon: '⚠' } }

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--syne)', fontSize: 22, fontWeight: 700 }}>Metrics Tracker</h2>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 3 }}>Track only what matters. Enter weekly numbers below.</p>
        </div>
        {/* Sprint switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface2)', borderRadius: 10, padding: '4px 6px', border: '1px solid var(--border)' }}>
          <button onClick={() => setSprint(s => Math.max(1, s - 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', display: 'flex', padding: 4 }}><ChevronLeft size={15} /></button>
          {[1, 2, 3, 4].map(w => (
            <button key={w} onClick={() => setSprint(w)} style={{
              padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
              background: sprint === w ? 'var(--surface)' : 'transparent',
              color: sprint === w ? 'var(--text)' : 'var(--text3)',
              boxShadow: sprint === w ? 'var(--shadow)' : 'none',
              transition: 'all 0.12s'
            }}>W{w}</button>
          ))}
          <button onClick={() => setSprint(s => Math.min(4, s + 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', display: 'flex', padding: 4 }}><ChevronRight size={15} /></button>
        </div>
      </div>

      {/* Entry cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {Object.entries(METRIC_META).map(([key, meta]) => {
          const val = current[key] || 0
          const t = trend(key)
          return (
            <Card key={key} style={{ padding: '14px 16px', cursor: 'text' }} onClick={() => document.getElementById(`inp-${key}`)?.focus()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: '0.07em', textTransform: 'uppercase', lineHeight: 1.4 }}>{meta.label}</div>
                {t !== null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 10, color: t > 0 ? '#2D7A1F' : t < 0 ? '#B91C1C' : 'var(--text3)' }}>
                    {t > 0 ? <TrendingUp size={10} /> : t < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
                    {t !== 0 && `${Math.abs(t)}%`}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 8 }}>
                {meta.unit && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>{meta.unit}</span>}
                <input
                  id={`inp-${key}`}
                  type="number" min="0" step={key === 'spend' ? '100' : '1'}
                  value={val || ''}
                  onChange={e => update(key, e.target.value)}
                  placeholder="0"
                  style={{
                    background: 'none', border: 'none', outline: 'none', width: '100%',
                    fontFamily: 'var(--syne)', fontSize: 26, fontWeight: 700, color: meta.color,
                    cursor: 'text', padding: 0,
                  }}
                />
              </div>
              {targets[key] && <MiniBar value={val} max={targets[key]} color={meta.color} />}
              <div style={{ height: 32, marginTop: 8 }}>
                <Sparkline data={history(key)} color={meta.color} height={32} />
              </div>
            </Card>
          )
        })}
      </div>

      {/* Computed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
        <Card style={{ padding: '14px 16px', background: cpv && parseFloat(cpv) <= 8 ? 'var(--lime-bg)' : cpv ? 'var(--orange-bg)' : 'var(--surface)' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>Ad CPV (₹)</div>
          <div style={{ fontFamily: 'var(--syne)', fontSize: 26, fontWeight: 700, color: cpv && parseFloat(cpv) <= 8 ? '#2D7A1F' : cpv ? '#C05621' : 'var(--text3)' }}>{cpv ? `₹${cpv}` : '—'}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Target: ₹3–8</div>
        </Card>
        <Card style={{ padding: '14px 16px', background: convRate >= 30 ? 'var(--lime-bg)' : convRate > 0 ? 'var(--orange-bg)' : 'var(--surface)' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>DM→Call Rate</div>
          <div style={{ fontFamily: 'var(--syne)', fontSize: 26, fontWeight: 700, color: convRate >= 30 ? '#2D7A1F' : convRate > 0 ? '#C05621' : 'var(--text3)' }}>{convRate ? `${convRate}%` : '—'}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Target: &gt;30%</div>
        </Card>
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {[
          { key: 'dms', label: '4-Week DM Trend' },
          { key: 'visits', label: '4-Week Profile Visits' },
        ].map(({ key, label }) => {
          const meta = METRIC_META[key]
          const hist = history(key)
          const maxH = Math.max(...hist, 1)
          return (
            <Card key={key} style={{ padding: '18px 20px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 16 }}>{label}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 80 }}>
                {hist.map((v, i) => {
                  const h = Math.max(4, Math.round((v / maxH) * 72))
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{v}</span>
                      <div style={{ width: '100%', height: h, background: i === sprint - 1 ? meta.color : 'var(--surface3)', borderRadius: '3px 3px 0 0', transition: 'height 0.4s ease' }} />
                      <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: i === sprint - 1 ? meta.color : 'var(--text3)' }}>W{i + 1}</span>
                    </div>
                  )
                })}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--syne)', marginBottom: 12 }}>Automated Insights</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {insights.map((ins, i) => {
              const s = INSIGHT_COLORS[ins.type]
              return (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 'var(--r-sm)', background: s.bg, border: `1px solid ${s.border}` }}>
                  <span style={{ fontSize: 13, color: s.color, fontWeight: 600, flexShrink: 0 }}>{s.icon}</span>
                  <span style={{ fontSize: 13, color: s.color, lineHeight: 1.6 }}>{ins.text}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
      <Toast />
    </div>
  )
}
