import{fmtINR}from'../lib/fmt.js'
import { useStore } from '../store/index.js'
import { Card, Badge, Avatar, StatCard, ProgressBar, Btn } from '../components/ui.jsx'
import { CheckSquare, Users, FolderKanban, Receipt, Calendar, ArrowRight, Clock, AlertCircle } from 'lucide-react'
import { format, isToday, isPast, parseISO } from 'date-fns'

export default function Dashboard() {
  const { clients, projects, tasks, invoices, meetings, setView, setActiveClient, toggleTask } = useStore()

  const today = new Date()
  const todayTasks = tasks.filter(t => !t.done)
  const doneTasks = tasks.filter(t => t.done)
  const pendingInvoices = invoices.filter(i => i.status === 'pending')
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((a, i) => a + parseInt(i.amount || 0), 0)
  const pipeline = invoices.reduce((a, i) => a + parseInt(i.amount || 0), 0)
  const activeProjects = projects.filter(p => p.status === 'in-progress')
  const upcomingMeetings = meetings.filter(m => !isPast(parseISO(m.date + 'T' + m.time))).slice(0, 3)
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening'

  const getClient = id => clients.find(c => c.id === id)

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--syne)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
          {greeting} 👋
        </h1>
        <p style={{ color: 'var(--text3)', marginTop: 4, fontSize: 13 }}>
          {format(today, 'EEEE, d MMMM yyyy')} · {clients.length} clients · {activeProjects.length} active projects
        </p>
      </div>

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard label="Clients" value={clients.length} sub={`${clients.filter(c=>c.stage==='active').length} active`} color="var(--text)" icon={<Users size={18}/>} />
        <StatCard label="Active Projects" value={activeProjects.length} sub={`${projects.length} total`} color="var(--blue)" icon={<FolderKanban size={18}/>} />
        <StatCard label="Pending Invoices" value={pendingInvoices.length} sub={`₹${(pendingInvoices.reduce((a,i)=>a+parseInt(i.amount||0),0)/1000).toFixed(0)}K outstanding`} color="var(--orange)" icon={<Receipt size={18}/>} />
        <StatCard label="Revenue Collected" value={`₹${(totalRevenue/1000).toFixed(0)}K`} sub={`₹${(pipeline/1000).toFixed(0)}K total pipeline`} color="var(--lime)" icon={<CheckSquare size={18}/>} />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Today's tasks */}
          <Card style={{ padding: 0 }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--syne)' }}>Today's Tasks</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{doneTasks.length} done · {todayTasks.length} remaining</div>
              </div>
              <Btn size="sm" variant="secondary" onClick={() => setView('tasks')}>All tasks <ArrowRight size={12}/></Btn>
            </div>
            <div style={{ padding: '8px 0' }}>
              {todayTasks.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
                  🎉 All tasks done for today!
                </div>
              ) : (
                todayTasks.slice(0, 6).map(task => {
                  const client = getClient(task.clientId)
                  return (
                    <div key={task.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px',
                      borderBottom: '1px solid var(--border)', cursor: 'pointer',
                      transition: 'background 0.1s'
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <button onClick={() => toggleTask(task.id)} style={{
                        width: 18, height: 18, borderRadius: 4, border: '1.5px solid var(--border2)',
                        background: 'transparent', cursor: 'pointer', flexShrink: 0, display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
                        {client && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{client.brand}</div>}
                      </div>
                      <Badge label={task.priority} type={task.priority} />
                    </div>
                  )
                })
              )}
            </div>
          </Card>

          {/* Active projects */}
          <Card style={{ padding: 0 }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--syne)' }}>Active Projects</div>
              <Btn size="sm" variant="secondary" onClick={() => setView('projects')}>View all <ArrowRight size={12}/></Btn>
            </div>
            <div style={{ padding: '8px 0' }}>
              {activeProjects.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No active projects</div>
              ) : (
                activeProjects.map(p => {
                  const client = getClient(p.clientId)
                  return (
                    <div key={p.id} style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          {client && <Avatar name={client.name} color={client.color} size={28} />}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                            {client && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{client.brand}</div>}
                          </div>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          <Badge label="in-progress" type="in-progress" />
                        </div>
                      </div>
                      <ProgressBar value={p.progress || 0} label={`${p.progress || 0}% complete`} />
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Client pipeline */}
          <Card style={{ padding: 0 }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--syne)' }}>Client Pipeline</div>
              <Btn size="sm" variant="secondary" onClick={() => setView('clients')}>View <ArrowRight size={12}/></Btn>
            </div>
            <div>
              {['active', 'proposal', 'discovery', 'inactive'].map(stage => {
                const count = clients.filter(c => c.stage === stage).length
                if (!count) return null
                return (
                  <div key={stage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', borderBottom: '1px solid var(--border)' }}>
                    <Badge label={stage} type={stage} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{count} client{count !== 1 ? 's' : ''}</span>
                  </div>
                )
              })}
              <div style={{ padding: '14px 18px' }}>
                {clients.slice(0, 4).map(c => (
                  <div key={c.id} onClick={() => { setView('clients'); setActiveClient(c.id) }} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                    borderBottom: '1px solid var(--border)', cursor: 'pointer',
                    transition: 'opacity 0.12s'
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    <Avatar name={c.name} color={c.color} size={28} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{c.brand}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{c.name}</div>
                    </div>
                    <Badge label={c.stage} type={c.stage} />
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Upcoming meetings */}
          <Card style={{ padding: 0 }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--syne)' }}>Upcoming Meetings</div>
            </div>
            <div style={{ padding: '8px 0' }}>
              {upcomingMeetings.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No upcoming meetings</div>
              ) : (
                upcomingMeetings.map(m => {
                  const client = getClient(m.clientId)
                  return (
                    <div key={m.id} style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{
                        background: 'var(--surface2)', borderRadius: 8, padding: '6px 10px',
                        textAlign: 'center', flexShrink: 0, minWidth: 44
                      }}>
                        <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--syne)' }}>{m.date.split('-')[2]}</div>
                        <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>
                          {format(parseISO(m.date), 'MMM')}
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{m.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                          {client?.brand} · {m.time}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Card>

          {/* Pending invoices */}
          {pendingInvoices.length > 0 && (
            <Card style={{ background: 'var(--orange-bg)', border: '1px solid #FED7AA', padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <AlertCircle size={16} style={{ color: 'var(--orange)' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#C05621' }}>{pendingInvoices.length} pending invoice{pendingInvoices.length > 1 ? 's' : ''}</span>
              </div>
              {pendingInvoices.map(inv => {
                const c = getClient(inv.clientId)
                return (
                  <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', color: '#92400E' }}>
                    <span>{c?.brand} — {inv.number}</span>
                    <span style={{ fontWeight: 600 }}>₹{fmtINR(inv.amount)}</span>
                  </div>
                )
              })}
              <Btn size="sm" variant="secondary" onClick={() => setView('invoices')} style={{ marginTop: 10, width: '100%', justifyContent: 'center' }}>
                Manage invoices
              </Btn>
            </Card>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dash-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
