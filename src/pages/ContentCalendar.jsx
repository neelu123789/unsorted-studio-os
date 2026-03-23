import { useState } from 'react'
import { useStore } from '../store/index.js'
import { Card, Btn, Modal, Input, Select, Textarea, SectionHeader, Badge, useToast, Empty } from '../components/ui.jsx'
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit2 } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay, parseISO } from 'date-fns'

const POST_TYPES = [
  { value: 'reel',     label: 'Reel',     color: '#F27B2A', bg: '#FEF3E8' },
  { value: 'carousel', label: 'Carousel', color: '#3B82F6', bg: '#EFF6FF' },
  { value: 'static',   label: 'Static',   color: '#7CDB5A', bg: '#F0FAE8' },
  { value: 'story',    label: 'Story',    color: '#14B8A6', bg: '#F0FDFA' },
  { value: 'ad',       label: 'Ad',       color: '#8B5CF6', bg: '#F5F3FF' },
]

const PILLARS = ['Teach', 'Diagnose', 'Relate', 'Show', 'DM Trigger']
const STATUSES = ['planned', 'drafted', 'ready', 'posted']

export default function ContentCalendar() {
  const { show, Toast } = useToast()
  const [calDate, setCalDate] = useState(new Date())
  const [posts, setPosts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('us_posts') || '[]') } catch { return [] }
  })
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({})
  const [editId, setEditId] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)
  const [listView, setListView] = useState(false)

  const savePosts = (next) => { setPosts(next); localStorage.setItem('us_posts', JSON.stringify(next)) }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const openAdd = (dateStr) => {
    setEditId(null)
    setForm({ date: dateStr || format(new Date(), 'yyyy-MM-dd'), type: 'reel', pillar: 'Teach', status: 'planned' })
    setModal(true)
  }

  const openEdit = (post) => {
    setEditId(post.id)
    setForm({ ...post })
    setModal(true)
  }

  const handleSave = () => {
    if (!form.date) return
    const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    if (editId) {
      savePosts(posts.map(p => p.id === editId ? { ...p, ...form } : p))
    } else {
      savePosts([...posts, { ...form, id: uid() }])
    }
    setModal(false)
    show(editId ? 'Post updated!' : 'Post added!')
  }

  const deletePost = () => {
    savePosts(posts.filter(p => p.id !== editId))
    setModal(false)
    show('Post deleted')
  }

  // Calendar grid
  const monthStart = startOfMonth(calDate)
  const monthEnd = endOfMonth(calDate)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const getPostsForDay = (day) => posts.filter(p => { try { return isSameDay(parseISO(p.date), day) } catch { return false } })
  const getTypeStyle = (type) => POST_TYPES.find(t => t.value === type) || POST_TYPES[0]

  // This week's posts
  const weekStart = startOfWeek(new Date())
  const weekEnd = endOfWeek(new Date())
  const thisWeekPosts = posts.filter(p => { try { const d = parseISO(p.date); return d >= weekStart && d <= weekEnd } catch { return false } })

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--syne)', fontSize: 22, fontWeight: 700 }}>Content Calendar</h2>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 3 }}>{posts.length} posts planned · {posts.filter(p => p.status === 'posted').length} published</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {POST_TYPES.map(t => (
              <div key={t.value} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: t.color }} />
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>{t.label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: 8, padding: 3, border: '1px solid var(--border)' }}>
            <button onClick={() => setListView(false)} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, background: !listView ? 'var(--surface)' : 'transparent', color: !listView ? 'var(--text)' : 'var(--text3)', fontWeight: !listView ? 500 : 400 }}>Month</button>
            <button onClick={() => setListView(true)} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, background: listView ? 'var(--surface)' : 'transparent', color: listView ? 'var(--text)' : 'var(--text3)', fontWeight: listView ? 500 : 400 }}>List</button>
          </div>
          <Btn onClick={() => openAdd()}><Plus size={14} /> Add Post</Btn>
        </div>
      </div>

      {/* This week strip */}
      {thisWeekPosts.length > 0 && (
        <Card style={{ padding: '14px 18px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', marginBottom: 10, fontFamily: 'var(--mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>This week</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {thisWeekPosts.map(p => {
              const ts = getTypeStyle(p.type)
              const statusColor = { planned: 'var(--text3)', drafted: 'var(--blue)', ready: 'var(--orange)', posted: 'var(--lime)' }[p.status] || 'var(--text3)'
              return (
                <div key={p.id} onClick={() => openEdit(p)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
                  borderRadius: 8, background: ts.bg, border: `1px solid ${ts.color}30`,
                  cursor: 'pointer', transition: 'opacity 0.12s',
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: ts.color, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: ts.color }}>{p.hook || p.type}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>{format(parseISO(p.date), 'EEE d')} · <span style={{ color: statusColor }}>{p.status}</span></div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {listView ? (
        /* LIST VIEW */
        <Card style={{ padding: 0 }}>
          {posts.length === 0 ? (
            <Empty icon="📝" title="No posts planned" sub="Add your first post to start planning content." action={<Btn onClick={() => openAdd()}>Add first post</Btn>} />
          ) : (
            [...posts].sort((a, b) => a.date > b.date ? 1 : -1).map((p, i) => {
              const ts = getTypeStyle(p.type)
              const statusColor = { planned: 'var(--text3)', drafted: 'var(--blue)', ready: 'var(--orange)', posted: '#2D7A1F' }[p.status] || 'var(--text3)'
              return (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px',
                  borderBottom: i < posts.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer', transition: 'background 0.1s'
                }}
                  onClick={() => openEdit(p)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: ts.color, flexShrink: 0 }} />
                  <div style={{ minWidth: 64, flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{format(parseISO(p.date), 'MMM d')}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>{format(parseISO(p.date), 'EEE')}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.hook || '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{p.pillar} · {ts.label}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500, color: statusColor, textTransform: 'capitalize', flexShrink: 0 }}>{p.status}</span>
                </div>
              )
            })
          )}
        </Card>
      ) : (
        /* CALENDAR VIEW */
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <button onClick={() => setCalDate(d => new Date(d.getFullYear(), d.getMonth() - 1))} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>
              <ChevronLeft size={15} />
            </button>
            <div style={{ fontFamily: 'var(--syne)', fontSize: 16, fontWeight: 700 }}>{format(calDate, 'MMMM yyyy')}</div>
            <button onClick={() => setCalDate(d => new Date(d.getFullYear(), d.getMonth() + 1))} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Day names */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1px solid var(--border)' }}>
            {dayNames.map(d => (
              <div key={d} style={{ padding: '8px 0', textAlign: 'center', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: '0.06em' }}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
            {days.map((day, idx) => {
              const dayPosts = getPostsForDay(day)
              const isCurrentMonth = isSameMonth(day, calDate)
              const isTodayDay = isToday(day)
              const isSelected = selectedDay && isSameDay(day, selectedDay)

              return (
                <div key={idx} onClick={() => { setSelectedDay(day); openAdd(format(day, 'yyyy-MM-dd')) }} style={{
                  minHeight: 90, padding: '8px 6px',
                  borderRight: (idx + 1) % 7 !== 0 ? '1px solid var(--border)' : 'none',
                  borderBottom: '1px solid var(--border)',
                  background: isTodayDay ? '#F0FAE8' : 'transparent',
                  cursor: 'pointer', transition: 'background 0.1s', position: 'relative',
                }}
                  onMouseEnter={e => { if (!isTodayDay) e.currentTarget.style.background = 'var(--surface2)' }}
                  onMouseLeave={e => { if (!isTodayDay) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{
                    fontSize: 12, fontWeight: isTodayDay ? 700 : 400,
                    color: isTodayDay ? '#2D7A1F' : isCurrentMonth ? 'var(--text2)' : 'var(--text3)',
                    marginBottom: 4, opacity: isCurrentMonth ? 1 : 0.4,
                    width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isTodayDay ? 'var(--lime)' : 'transparent',
                  }}>{format(day, 'd')}</div>

                  {dayPosts.map(p => {
                    const ts = getTypeStyle(p.type)
                    return (
                      <div key={p.id} onClick={e => { e.stopPropagation(); openEdit(p) }} style={{
                        display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2,
                        padding: '2px 5px', borderRadius: 4, background: ts.bg,
                        cursor: 'pointer', transition: 'opacity 0.12s',
                        overflow: 'hidden',
                      }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        <div style={{ width: 5, height: 5, borderRadius: 1, background: ts.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 10, color: ts.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, fontWeight: 500 }}>
                          {p.hook || ts.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Post modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Post' : 'Plan Post'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select label="Post Type" value={form.type || 'reel'} onChange={e => f('type', e.target.value)}
              options={POST_TYPES.map(t => ({ value: t.value, label: t.label }))} />
            <Select label="Content Pillar" value={form.pillar || 'Teach'} onChange={e => f('pillar', e.target.value)}
              options={PILLARS.map(p => ({ value: p, label: p }))} />
          </div>
          <Input label="Hook / Title" placeholder="What's the first line of this post?" value={form.hook || ''} onChange={e => f('hook', e.target.value)} />
          <Textarea label="Content notes" rows={3} placeholder="Key points, visual ideas, structure..." value={form.notes || ''} onChange={e => f('notes', e.target.value)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Date" type="date" value={form.date || ''} onChange={e => f('date', e.target.value)} />
            <Select label="Status" value={form.status || 'planned'} onChange={e => f('status', e.target.value)}
              options={STATUSES.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} />
          </div>

          {/* Type preview */}
          {form.type && (() => {
            const ts = getTypeStyle(form.type)
            return (
              <div style={{ padding: '10px 12px', borderRadius: 'var(--r-sm)', background: ts.bg, border: `1px solid ${ts.color}40` }}>
                <div style={{ fontSize: 11, color: ts.color, fontWeight: 500, marginBottom: 4 }}>{ts.label} · {form.pillar}</div>
                <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: form.hook ? 500 : 400 }}>{form.hook || 'No hook written yet'}</div>
              </div>
            )
          })()}

          <div style={{ display: 'flex', gap: 8 }}>
            <Btn onClick={handleSave} disabled={!form.date} style={{ flex: 1, justifyContent: 'center' }}>
              {editId ? 'Update Post' : 'Add to Calendar'}
            </Btn>
            {editId && <Btn variant="danger" onClick={deletePost}><Trash2 size={13} /></Btn>}
          </div>
        </div>
      </Modal>

      <Toast />
    </div>
  )
}
