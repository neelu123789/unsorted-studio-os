import { useState } from 'react'
import { Card, Btn, Modal, Input, Select, Textarea, Badge, Avatar, useToast, Empty } from '../components/ui.jsx'
import { Plus, Trash2, Edit2, Phone, Mail, DollarSign } from 'lucide-react'

const STAGES = [
  { key: 'new',      label: 'New Lead',        color: '#9B978F', bg: 'var(--surface2)' },
  { key: 'dms',      label: 'In DMs',          color: '#3B82F6', bg: '#EFF6FF' },
  { key: 'call',     label: 'Call Scheduled',  color: '#F27B2A', bg: '#FEF3E8' },
  { key: 'proposal', label: 'Proposal Sent',   color: '#8B5CF6', bg: '#F5F3FF' },
  { key: 'won',      label: 'Won',             color: '#7CDB5A', bg: '#F0FAE8' },
  { key: 'lost',     label: 'Not a fit',       color: '#EF4444', bg: '#FEF2F2' },
]

const SOURCES = ['Instagram DM', 'Ad', 'Referral', 'Comment', 'Story Reply', 'Other']
const TYPES = ['D2C', 'SaaS', 'Startup', 'Agency', 'Other']

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

const AVATARCOLORS = ['#7CDB5A', '#3B82F6', '#F27B2A', '#8B5CF6', '#14B8A6', '#F59E0B', '#EF4444']

export default function Pipeline() {
  const { show, Toast } = useToast()
  const [leads, setLeads] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('us_leads') || JSON.stringify([
        { id: 'l1', name: 'Ananya Sharma', brand: 'Glow Naturals', type: 'D2C', source: 'Instagram DM', stage: 'dms', value: '85000', notes: 'Wants full rebrand. Currently using Canva.', date: '2025-03-10', color: '#7CDB5A' },
        { id: 'l2', name: 'Karan Mehta', brand: 'ShipFast', type: 'SaaS', source: 'Ad', stage: 'call', value: '60000', notes: 'Logistics SaaS. Needs brand identity + UI guidelines.', date: '2025-03-14', color: '#3B82F6' },
        { id: 'l3', name: 'Deepa Iyer', brand: 'Nourish Co', type: 'D2C', source: 'Referral', stage: 'new', value: '100000', notes: 'Friend of Arya. Ayurvedic food brand.', date: '2025-03-18', color: '#F27B2A' },
      ]))
    } catch { return [] }
  })
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({})
  const [editId, setEditId] = useState(null)
  const [dragId, setDragId] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const [filter, setFilter] = useState('all')

  const save = (next) => { setLeads(next); localStorage.setItem('us_leads', JSON.stringify(next)) }
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const openAdd = (stage = 'new') => {
    setEditId(null)
    setForm({ stage, type: 'D2C', source: 'Instagram DM' })
    setModal(true)
  }

  const openEdit = (lead) => {
    setEditId(lead.id)
    setForm({ ...lead })
    setModal(true)
  }

  const handleSave = () => {
    if (!form.name) return
    const color = AVATARCOLORS[Math.floor(Math.random() * AVATARCOLORS.length)]
    if (editId) {
      save(leads.map(l => l.id === editId ? { ...l, ...form } : l))
    } else {
      const today = new Date().toISOString().split('T')[0]
      save([...leads, { ...form, id: uid(), date: today, color }])
    }
    setModal(false)
    show(editId ? 'Lead updated!' : 'Lead added!')
  }

  const moveLead = (id, stage) => {
    save(leads.map(l => l.id === id ? { ...l, stage } : l))
    show(`Moved to ${STAGES.find(s => s.key === stage)?.label}`)
  }

  const deleteLead = () => {
    save(leads.filter(l => l.id !== editId))
    setModal(false)
    show('Lead removed')
  }

  // Stats
  const total = leads.length
  const won = leads.filter(l => l.stage === 'won').length
  const pipeline = leads.filter(l => l.stage !== 'lost').reduce((a, l) => a + parseInt(l.value || 0), 0)
  const wonValue = leads.filter(l => l.stage === 'won').reduce((a, l) => a + parseInt(l.value || 0), 0)

  const filtered = leads.filter(l => filter === 'all' || l.stage === filter)

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 1300, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--syne)', fontSize: 22, fontWeight: 700 }}>Lead Pipeline</h2>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 3 }}>
            {total} leads · ₹{(pipeline / 1000).toFixed(0)}K pipeline · ₹{(wonValue / 1000).toFixed(0)}K won
          </p>
        </div>
        <Btn onClick={() => openAdd()}><Plus size={14} /> Add Lead</Btn>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total Leads', value: total, color: 'var(--text)' },
          { label: 'Won', value: won, color: '#2D7A1F' },
          { label: 'Pipeline', value: `₹${(pipeline / 1000).toFixed(0)}K`, color: 'var(--blue)' },
          { label: 'Win Rate', value: total ? `${Math.round((won / total) * 100)}%` : '—', color: 'var(--orange)' },
        ].map(s => (
          <Card key={s.label} style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--syne)', fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
          </Card>
        ))}
      </div>

      {/* Kanban */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(180px, 1fr))', gap: 12, overflowX: 'auto', paddingBottom: 8 }} className="kanban-grid">
        {STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.stage === stage.key)
          const stageValue = stageLeads.reduce((a, l) => a + parseInt(l.value || 0), 0)

          return (
            <div key={stage.key}
              onDragOver={e => { e.preventDefault(); setDragOver(stage.key) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => { e.preventDefault(); if (dragId) moveLead(dragId, stage.key); setDragOver(null); setDragId(null) }}
              style={{ minWidth: 180 }}
            >
              {/* Column header */}
              <div style={{
                padding: '10px 12px', borderRadius: 'var(--r-sm)',
                background: dragOver === stage.key ? stage.bg : 'transparent',
                border: `1px solid ${dragOver === stage.key ? stage.color + '50' : 'transparent'}`,
                marginBottom: 10, transition: 'all 0.15s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: stage.color }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>{stage.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', background: 'var(--surface2)', padding: '1px 6px', borderRadius: 10, border: '1px solid var(--border)' }}>{stageLeads.length}</span>
                    <button onClick={() => openAdd(stage.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', padding: 2, borderRadius: 4 }}>
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
                {stageValue > 0 && <div style={{ fontSize: 10, color: stage.color, fontFamily: 'var(--mono)', marginTop: 4 }}>₹{(stageValue / 1000).toFixed(0)}K</div>}
              </div>

              {/* Cards */}
              {stageLeads.length === 0 ? (
                <div style={{
                  border: `1.5px dashed ${dragOver === stage.key ? stage.color : 'var(--border2)'}`,
                  borderRadius: 'var(--r-sm)', padding: '20px 12px', textAlign: 'center',
                  transition: 'border-color 0.15s'
                }}>
                  <p style={{ fontSize: 11, color: 'var(--text3)' }}>Drop here</p>
                </div>
              ) : (
                stageLeads.map(lead => (
                  <div key={lead.id}
                    draggable
                    onDragStart={() => setDragId(lead.id)}
                    onDragEnd={() => setDragId(null)}
                    onClick={() => openEdit(lead)}
                    style={{
                      background: 'var(--surface)', border: `1px solid ${dragId === lead.id ? stage.color : 'var(--border)'}`,
                      borderRadius: 'var(--r-sm)', padding: '12px 13px', marginBottom: 8,
                      cursor: 'grab', transition: 'all 0.15s', opacity: dragId === lead.id ? 0.5 : 1,
                      boxShadow: dragId === lead.id ? 'var(--shadow-md)' : 'var(--shadow)',
                    }}
                    onMouseEnter={e => { if (dragId !== lead.id) e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                    onMouseLeave={e => { if (dragId !== lead.id) e.currentTarget.style.boxShadow = 'var(--shadow)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 6 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', minWidth: 0 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: lead.color || stage.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>
                          {lead.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.brand}</div>
                        </div>
                      </div>
                    </div>
                    {lead.notes && (
                      <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5, marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {lead.notes}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10, background: 'var(--surface2)', padding: '1px 6px', borderRadius: 4, color: 'var(--text3)', border: '1px solid var(--border)' }}>{lead.source}</span>
                      {lead.value && <span style={{ fontSize: 11, fontFamily: 'var(--mono)', fontWeight: 600, color: stage.color }}>₹{(parseInt(lead.value) / 1000).toFixed(0)}K</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )
        })}
      </div>

      {/* Lead modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Lead' : 'Add Lead'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Name *" placeholder="Ananya Sharma" value={form.name || ''} onChange={e => f('name', e.target.value)} />
            <Input label="Brand / Company" placeholder="Glow Naturals" value={form.brand || ''} onChange={e => f('brand', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select label="Type" value={form.type || 'D2C'} onChange={e => f('type', e.target.value)}
              options={TYPES.map(t => ({ value: t, label: t }))} />
            <Select label="Source" value={form.source || 'Instagram DM'} onChange={e => f('source', e.target.value)}
              options={SOURCES.map(s => ({ value: s, label: s }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Est. Value (₹)" type="number" placeholder="80000" value={form.value || ''} onChange={e => f('value', e.target.value)} />
            <Select label="Stage" value={form.stage || 'new'} onChange={e => f('stage', e.target.value)}
              options={STAGES.map(s => ({ value: s.key, label: s.label }))} />
          </div>
          <Input label="Email" type="email" placeholder="ananya@brand.com" value={form.email || ''} onChange={e => f('email', e.target.value)} />
          <Textarea label="Notes" rows={3} placeholder="What's their problem? What did they say in the DM?" value={form.notes || ''} onChange={e => f('notes', e.target.value)} />

          {/* Quick move buttons */}
          {editId && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8, fontWeight: 500 }}>Quick move to stage</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {STAGES.map(s => (
                  <button key={s.key} onClick={() => { f('stage', s.key) }} style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                    border: `1px solid ${form.stage === s.key ? s.color : 'var(--border)'}`,
                    background: form.stage === s.key ? s.bg : 'transparent',
                    color: form.stage === s.key ? s.color : 'var(--text3)',
                    fontWeight: form.stage === s.key ? 600 : 400, transition: 'all 0.12s'
                  }}>{s.label}</button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <Btn onClick={handleSave} disabled={!form.name} style={{ flex: 1, justifyContent: 'center' }}>
              {editId ? 'Update Lead' : 'Add Lead'}
            </Btn>
            {editId && <Btn variant="danger" onClick={deleteLead}><Trash2 size={13} /></Btn>}
          </div>
        </div>
      </Modal>

      <Toast />
      <style>{`
        @media (max-width: 900px) {
          .kanban-grid { grid-template-columns: repeat(3, minmax(160px, 1fr)) !important; }
        }
        @media (max-width: 600px) {
          .kanban-grid { grid-template-columns: repeat(2, minmax(160px, 1fr)) !important; }
        }
      `}</style>
    </div>
  )
}
