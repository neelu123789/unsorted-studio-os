import{fmtINR}from'../lib/fmt.js'
import{useState,useEffect}from'react'
import{useStore,computeInvoiceStatus}from'../store/index.js'
import{Card,Btn,Input,Select,Textarea,Modal,SectionHeader,ProgressBar,Empty,useToast,Tabs}from'../components/ui.jsx'
import{Plus,Trash2,Edit2,ExternalLink,Bell,AlertTriangle,CheckCircle}from'lucide-react'
import{format,parseISO,isPast}from'date-fns'

/* ── PROJECTS ── */
export function Projects(){
  const{projects,addProject,updateProject,deleteProject,addDeliverable,updateDeliverable,clients}=useStore()
  const{show,Toast}=useToast()
  const[modal,setModal]=useState(false)
  const[form,setForm]=useState({})
  const[editId,setEditId]=useState(null)
  const[activeId,setActiveId]=useState(null)
  const f=(k,v)=>setForm(p=>({...p,[k]:v}))
  const gc=id=>clients.find(c=>c.id===id)
  const save=()=>{
    if(editId)updateProject(editId,form)
    else addProject({...form,status:form.status||'not-started',progress:parseInt(form.progress)||0,deliverables:[]})
    setModal(false);setForm({});setEditId(null);show('Saved!')
  }
  const active=projects.find(p=>p.id===activeId)
  const SC={'in-progress':'var(--blue)',done:'var(--lime)','not-started':'var(--text3)'}
  return(
    <div style={{padding:'24px 28px 60px',maxWidth:1200,margin:'0 auto'}}>
      <SectionHeader title="Projects" sub={`${projects.length} total`} action={<Btn onClick={()=>{setForm({});setEditId(null);setModal(true)}}><Plus size={14}/>New Project</Btn>}/>
      <div style={{display:'grid',gridTemplateColumns:activeId?'1fr 370px':'repeat(auto-fill,minmax(290px,1fr))',gap:14,alignItems:'start'}}>
        {!activeId&&projects.map(p=>{
          const cl=gc(p.clientId)
          return(<Card key={p.id} onClick={()=>setActiveId(p.id)} style={{cursor:'pointer',padding:18}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:12,gap:8}}>
              <div><div style={{fontSize:14,fontWeight:600,fontFamily:'var(--syne)'}}>{p.name}</div>{cl&&<div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>{cl.brand}</div>}</div>
              <span style={{fontSize:10,fontFamily:'var(--mono)',padding:'2px 8px',borderRadius:20,background:'var(--surface2)',color:'var(--text3)',border:'1px solid var(--border)',textTransform:'capitalize',whiteSpace:'nowrap'}}>{(p.status||'').replace(/-/g,' ')}</span>
            </div>
            <ProgressBar value={p.progress||0} label={`${p.progress||0}%`}/>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:12,fontSize:12,color:'var(--text3)'}}><span>{(p.deliverables||[]).length} deliverables</span>{p.value&&<span style={{fontWeight:600,color:'var(--text)'}}>₹{fmtINR(p.value)}</span>}</div>
          </Card>)
        })}
        {activeId&&<>
          <div style={{display:'flex',flexDirection:'column',gap:9}}>
            {projects.map(p=>{const cl=gc(p.clientId);return(
              <Card key={p.id} onClick={()=>setActiveId(p.id)} style={{cursor:'pointer',padding:'13px 16px',border:p.id===activeId?'1.5px solid var(--text)':undefined}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,marginBottom:5}}><div><div style={{fontSize:13,fontWeight:500}}>{p.name}</div>{cl&&<div style={{fontSize:10,color:'var(--text3)'}}>{cl.brand}</div>}</div><span style={{fontSize:10,padding:'2px 7px',borderRadius:10,background:'var(--surface2)',color:'var(--text3)',border:'1px solid var(--border)',textTransform:'capitalize'}}>{(p.status||'').replace(/-/g,' ')}</span></div>
                <ProgressBar value={p.progress||0} height={3}/>
              </Card>
            )})}
            <button onClick={()=>{setForm({});setEditId(null);setModal(true)}} style={{padding:'10px',borderRadius:'var(--r-sm)',border:'1px dashed var(--border2)',background:'transparent',color:'var(--text3)',fontSize:12,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}><Plus size={13}/>New project</button>
          </div>
          {active&&<Card style={{padding:0,position:'sticky',top:76}}>
            <div style={{padding:'15px 18px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div><div style={{fontSize:15,fontWeight:600,fontFamily:'var(--syne)'}}>{active.name}</div>{gc(active.clientId)&&<div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>{gc(active.clientId).brand}</div>}</div>
              <div style={{display:'flex',gap:5}}>
                <Btn size="sm" variant="ghost" onClick={()=>{setForm({...active});setEditId(active.id);setModal(true)}}><Edit2 size={13}/></Btn>
                <Btn size="sm" variant="ghost" onClick={()=>setActiveId(null)}>×</Btn>
              </div>
            </div>
            <div style={{padding:'15px 18px'}}>
              <ProgressBar value={active.progress||0} label={`${active.progress||0}%`}/>
              {active.description&&<p style={{fontSize:12,color:'var(--text2)',marginTop:12,lineHeight:1.7}}>{active.description}</p>}
              <div style={{marginTop:16}}>
                <div style={{fontSize:12,fontWeight:600,marginBottom:10,display:'flex',justifyContent:'space-between'}}>Deliverables<button onClick={()=>{const n=prompt('Deliverable name:');if(n){addDeliverable(active.id,{name:n,status:'not-started'});show('Added!')}}} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text3)',fontSize:11}}>+ Add</button></div>
                {(active.deliverables||[]).map(d=>(
                  <div key={d.id} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 0',borderBottom:'1px solid var(--border)'}}>
                    <div style={{width:7,height:7,borderRadius:2,background:SC[d.status]||'var(--text3)',flexShrink:0}}/>
                    <span style={{flex:1,fontSize:12}}>{d.name}</span>
                    <select value={d.status} onChange={e=>{updateDeliverable(active.id,d.id,{status:e.target.value});show('Updated!')}} style={{fontSize:11,border:'1px solid var(--border)',borderRadius:4,padding:'2px 6px',background:'var(--surface)',color:'var(--text)',cursor:'pointer'}}>
                      <option value="not-started">Not started</option><option value="in-progress">In progress</option><option value="done">Done</option>
                    </select>
                  </div>
                ))}
              </div>
              {active.due&&<div style={{marginTop:14,fontSize:12,color:'var(--text3)'}}>Due {active.due}</div>}
            </div>
          </Card>}
        </>}
      </div>
      <Modal open={modal} onClose={()=>setModal(false)} title={editId?'Edit Project':'New Project'}>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Input label="Project Name" value={form.name||''} onChange={e=>f('name',e.target.value)}/>
          <Select label="Client" value={form.clientId||''} onChange={e=>f('clientId',e.target.value)} options={[{value:'',label:'Select client...'},...clients.map(c=>({value:c.id,label:c.brand}))]}/>
          <Textarea label="Description" rows={3} value={form.description||''} onChange={e=>f('description',e.target.value)}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Select label="Status" value={form.status||'not-started'} onChange={e=>f('status',e.target.value)} options={[{value:'not-started',label:'Not started'},{value:'in-progress',label:'In progress'},{value:'done',label:'Done'}]}/>
            <Input label="Progress %" type="number" min="0" max="100" value={form.progress||''} onChange={e=>f('progress',e.target.value)}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Input label="Due date" type="date" value={form.due||''} onChange={e=>f('due',e.target.value)}/>
            <Input label="Value (₹)" type="number" value={form.value||''} onChange={e=>f('value',e.target.value)}/>
          </div>
          <div style={{display:'flex',gap:8}}>
            <Btn onClick={save} disabled={!form.name} style={{flex:1,justifyContent:'center'}}>Save</Btn>
            {editId&&<Btn variant="danger" onClick={()=>{deleteProject(editId);setModal(false);setActiveId(null);show('Deleted')}}><Trash2 size={13}/></Btn>}
          </div>
        </div>
      </Modal>
      <Toast/>
    </div>
  )
}

/* ── TASKS ── */
export function Tasks(){
  const{tasks,addTask,toggleTask,deleteTask,clients}=useStore()
  const{show,Toast}=useToast()
  const[modal,setModal]=useState(false)
  const[form,setForm]=useState({})
  const[filter,setFilter]=useState('all')
  const f=(k,v)=>setForm(p=>({...p,[k]:v}))
  const gc=id=>clients.find(c=>c.id===id)
  const filtered=tasks.filter(t=>filter==='all'?true:filter==='pending'?!t.done:filter==='done'?t.done:!t.done&&t.priority===filter)
  return(
    <div style={{padding:'24px 28px 60px',maxWidth:900,margin:'0 auto'}}>
      <SectionHeader title="Tasks" sub={`${tasks.filter(t=>!t.done).length} open`} action={<Btn onClick={()=>{setForm({});setModal(true)}}><Plus size={14}/>Add Task</Btn>}/>
      <Tabs tabs={[{key:'all',label:'All'},{key:'pending',label:'Pending'},{key:'high',label:'High priority'},{key:'done',label:'Done'}]} active={filter} onChange={setFilter}/>
      <div style={{marginTop:16,display:'flex',flexDirection:'column',gap:6}}>
        {filtered.length===0?<Empty icon="✅" title="All clear!" sub="No tasks here."/>:
          filtered.map(t=>{const cl=gc(t.clientId);return(
            <Card key={t.id} style={{padding:'11px 16px',display:'flex',alignItems:'center',gap:12}}>
              <button onClick={()=>toggleTask(t.id)} style={{width:20,height:20,borderRadius:5,flexShrink:0,cursor:'pointer',border:`1.5px solid ${t.done?'var(--lime)':'var(--border2)'}`,background:t.done?'var(--lime)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#fff',transition:'all .15s'}}>{t.done?'✓':''}</button>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500,textDecoration:t.done?'line-through':'none',color:t.done?'var(--text3)':'var(--text)'}}>{t.title}</div>{cl&&<div style={{fontSize:11,color:'var(--text3)',marginTop:1}}>{cl.brand}</div>}</div>
              <span style={{fontSize:10,padding:'2px 7px',borderRadius:10,background:t.priority==='high'?'var(--red-bg)':t.priority==='med'?'var(--orange-bg)':'var(--surface2)',color:t.priority==='high'?'var(--red)':t.priority==='med'?'var(--orange)':'var(--text3)',border:`1px solid ${t.priority==='high'?'var(--red-border)':t.priority==='med'?'var(--orange-border)':'var(--border)'}`,flexShrink:0}}>{t.priority}</span>
              {t.due&&<span style={{fontSize:11,color:'var(--text3)',fontFamily:'var(--mono)',flexShrink:0}}>{t.due}</span>}
              <button onClick={()=>{deleteTask(t.id);show('Deleted')}} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text3)',padding:3}}><Trash2 size={13}/></button>
            </Card>
          )})}
      </div>
      <Modal open={modal} onClose={()=>setModal(false)} title="Add Task">
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Input label="Task *" placeholder="What needs to be done?" value={form.title||''} onChange={e=>f('title',e.target.value)}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Select label="Priority" value={form.priority||'med'} onChange={e=>f('priority',e.target.value)} options={[{value:'high',label:'High'},{value:'med',label:'Medium'},{value:'low',label:'Low'}]}/>
            <Input label="Due date" type="date" value={form.due||''} onChange={e=>f('due',e.target.value)}/>
          </div>
          <Select label="Client" value={form.clientId||''} onChange={e=>f('clientId',e.target.value)} options={[{value:'',label:'No client'},...clients.map(c=>({value:c.id,label:c.brand}))]}/>
          <Btn onClick={()=>{addTask(form);setModal(false);setForm({});show('Added!')}} disabled={!form.title}>Add Task</Btn>
        </div>
      </Modal>
      <Toast/>
    </div>
  )
}

/* ── MEETINGS ── with link + 15-min browser alert */
export function Meetings(){
  const{meetings,addMeeting,updateMeeting,deleteMeeting,clients}=useStore()
  const{show,Toast}=useToast()
  const[modal,setModal]=useState(false)
  const[form,setForm]=useState({})
  const[editId,setEditId]=useState(null)
  const[alerted,setAlerted]=useState(new Set())
  const f=(k,v)=>setForm(p=>({...p,[k]:v}))
  const gc=id=>clients.find(c=>c.id===id)

  // ⑤ Alert 15 min before
  useEffect(()=>{
    const check=()=>{
      const now=new Date()
      meetings.forEach(m=>{
        if(!m.date||!m.time||alerted.has(m.id))return
        try{
          const mt=new Date(`${m.date}T${m.time}`)
          const diff=(mt-now)/60000
          if(diff>0&&diff<=15){
            setAlerted(s=>new Set([...s,m.id]))
            if(Notification.permission==='granted'){new Notification(`⏰ ${m.title} in ${Math.round(diff)} min`,{body:m.link||'No meeting link added'})}
            else show(`⏰ ${m.title} starts in ${Math.round(diff)} minutes!`,'info')
          }
        }catch(e){}
      })
    }
    check(); const t=setInterval(check,60000); return()=>clearInterval(t)
  },[meetings])

  const reqNotif=()=>{
    if('Notification'in window&&Notification.permission==='default'){Notification.requestPermission().then(p=>{if(p==='granted')show('Browser notifications enabled!')})}
  }

  const save=()=>{if(editId)updateMeeting(editId,form);else addMeeting(form);setModal(false);setForm({});setEditId(null)}
  const sorted=[...meetings].sort((a,b)=>a.date>b.date?1:-1)
  const TC={onboarding:'var(--lime)',feedback:'var(--blue)',review:'var(--orange)',general:'var(--text3)'}

  return(
    <div style={{padding:'24px 28px 60px',maxWidth:900,margin:'0 auto'}}>
      <SectionHeader title="Meetings" sub={`${meetings.length} scheduled`}
        action={<div style={{display:'flex',gap:8}}>
          {'Notification'in window&&Notification.permission==='default'&&<Btn size="sm" variant="secondary" onClick={reqNotif}><Bell size={13}/>Enable alerts</Btn>}
          <Btn onClick={()=>{setForm({});setEditId(null);setModal(true)}}><Plus size={14}/>Schedule</Btn>
        </div>}/>
      {'Notification'in window&&Notification.permission==='default'&&(
        <div style={{background:'var(--blue-bg)',border:'1px solid var(--blue-border)',borderRadius:'var(--r-sm)',padding:'11px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
          <Bell size={14} style={{color:'var(--blue)',flexShrink:0}}/>
          <span style={{fontSize:13,color:'var(--blue)'}}>Enable browser notifications to get alerted 15 minutes before each meeting.</span>
          <button onClick={reqNotif} style={{marginLeft:'auto',fontSize:12,color:'var(--blue)',background:'none',border:'none',cursor:'pointer',fontWeight:500,textDecoration:'underline',whiteSpace:'nowrap'}}>Enable →</button>
        </div>
      )}
      {sorted.length===0?<Empty icon="📅" title="No meetings scheduled" sub="Schedule calls and get reminded 15 min before." action={<Btn onClick={()=>setModal(true)}>Schedule meeting</Btn>}/>:
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {sorted.map(m=>{
            const cl=gc(m.clientId)
            const upcoming=m.date&&m.time&&!isPast(new Date(`${m.date}T${m.time}`))
            return(<Card key={m.id} style={{padding:'15px 20px',display:'flex',alignItems:'center',gap:16,flexWrap:'wrap',border:upcoming?`1.5px solid ${TC[m.type]||'var(--border)'}40`:'1px solid var(--border)'}}>
              <div style={{background:'var(--surface2)',borderRadius:10,padding:'8px 12px',textAlign:'center',flexShrink:0,minWidth:52,borderLeft:`3px solid ${TC[m.type]||'var(--text3)'}`}}>
                <div style={{fontSize:18,fontWeight:700,fontFamily:'var(--syne)',lineHeight:1}}>{m.date?m.date.split('-')[2]:'?'}</div>
                <div style={{fontSize:10,color:'var(--text3)',textTransform:'uppercase',fontFamily:'var(--mono)'}}>{m.date?format(parseISO(m.date),'MMM'):''}</div>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:500}}>{m.title}</div>
                <div style={{fontSize:12,color:'var(--text3)',marginTop:2}}>{cl?.brand}{cl&&'·'}{m.time}·{m.duration} min</div>
                {m.notes&&<div style={{fontSize:12,color:'var(--text2)',marginTop:3}}>{m.notes}</div>}
                {/* ⑤ Clickable meeting link */}
                {m.link&&<a href={m.link} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:12,color:'var(--blue)',marginTop:6,fontWeight:500,padding:'4px 10px',borderRadius:6,background:'var(--blue-bg)',border:'1px solid var(--blue-border)'}}><ExternalLink size={12}/>Join meeting</a>}
              </div>
              {upcoming&&<span style={{fontSize:10,padding:'3px 8px',borderRadius:10,background:'var(--lime-bg)',color:'#1A6B0A',border:'1px solid var(--lime-border)',fontWeight:500,flexShrink:0}}>Upcoming</span>}
              <div style={{display:'flex',gap:5}}>
                <Btn size="sm" variant="ghost" onClick={()=>{setForm({...m});setEditId(m.id);setModal(true)}}><Edit2 size={13}/></Btn>
                <Btn size="sm" variant="ghost" onClick={()=>{deleteMeeting(m.id);show('Deleted')}}><Trash2 size={13}/></Btn>
              </div>
            </Card>)
          })}
        </div>}
      <Modal open={modal} onClose={()=>setModal(false)} title={editId?'Edit Meeting':'Schedule Meeting'}>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Input label="Title *" placeholder="Logo Feedback Call" value={form.title||''} onChange={e=>f('title',e.target.value)}/>
          <Select label="Client" value={form.clientId||''} onChange={e=>f('clientId',e.target.value)} options={[{value:'',label:'Select client...'},...clients.map(c=>({value:c.id,label:c.brand}))]}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}} className="r3m">
            <Input label="Date" type="date" value={form.date||''} onChange={e=>f('date',e.target.value)}/>
            <Input label="Time" type="time" value={form.time||''} onChange={e=>f('time',e.target.value)}/>
            <Input label="Duration (min)" type="number" value={form.duration||''} onChange={e=>f('duration',e.target.value)}/>
          </div>
          {/* ⑤ Meeting link field */}
          <Input label="Meeting Link (Zoom / Google Meet)" type="url" placeholder="https://meet.google.com/abc-xyz or https://zoom.us/j/123…" value={form.link||''} onChange={e=>f('link',e.target.value)} hint="Paste your Zoom or Google Meet link — it will appear as a clickable button"/>
          <Select label="Type" value={form.type||'general'} onChange={e=>f('type',e.target.value)} options={[{value:'onboarding',label:'Onboarding'},{value:'feedback',label:'Feedback'},{value:'review',label:'Review'},{value:'general',label:'General'}]}/>
          <Textarea label="Notes" value={form.notes||''} onChange={e=>f('notes',e.target.value)}/>
          <div style={{background:'var(--blue-bg)',border:'1px solid var(--blue-border)',borderRadius:'var(--r-sm)',padding:'10px 12px',fontSize:12,color:'var(--blue)',display:'flex',alignItems:'center',gap:8}}>
            <Bell size={13}/>You'll be alerted 15 min before this meeting (enable browser notifications above)
          </div>
          <div style={{display:'flex',gap:8}}>
            <Btn onClick={save} disabled={!form.title} style={{flex:1,justifyContent:'center'}}>Save Meeting</Btn>
            {editId&&<Btn variant="danger" onClick={()=>{deleteMeeting(editId);setModal(false);show('Deleted')}}><Trash2 size={13}/></Btn>}
          </div>
        </div>
      </Modal>
      <Toast/>
    </div>
  )
}

/* ── INVOICES ── paid/pending only, auto overdue */
export function Invoices(){
  const{invoices,addInvoice,updateInvoice,markInvoicePaid,deleteInvoice,clients}=useStore()
  const{show,Toast}=useToast()
  const[modal,setModal]=useState(false)
  const[form,setForm]=useState({status:'pending'})
  const[editId,setEditId]=useState(null)
  const f=(k,v)=>setForm(p=>({...p,[k]:v}))
  const gc=id=>clients.find(c=>c.id===id)
  // overdue computed inline

  // Compute live statuses
  const live=invoices.map(i=>({...i,status:computeInvoiceStatus(i)}))
  const total=live.reduce((a,i)=>a+parseInt(i.amount||0),0)
  const paid=live.filter(i=>i.status==='paid').reduce((a,i)=>a+parseInt(i.amount||0),0)
  const pending=live.filter(i=>i.status!=='paid').reduce((a,i)=>a+parseInt(i.amount||0),0)
  const overdue=live.filter(i=>i.status==='overdue')

  const save=()=>{
    const d={...form,number:form.number||`INV-${String(invoices.length+1).padStart(3,'0')}`}
    if(editId)updateInvoice(editId,d);else addInvoice(d)
    setModal(false);setForm({status:'pending'});setEditId(null);show('Saved!')
  }

  return(
    <div style={{padding:'24px 28px 60px',maxWidth:1000,margin:'0 auto'}}>
      <SectionHeader title="Invoices" sub={`₹${fmtINR(total)} total`} action={<Btn onClick={()=>{setForm({status:'pending'});setEditId(null);setModal(true)}}><Plus size={14}/>New Invoice</Btn>}/>
      {/* ⑥ Overdue alert */}
      {overdue.length>0&&(
        <div style={{background:'var(--red-bg)',border:'1px solid var(--red-border)',borderRadius:'var(--r-sm)',padding:'12px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
          <AlertTriangle size={15} style={{color:'var(--red)',flexShrink:0}}/>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:'var(--red)'}}>{overdue.length} overdue invoice{overdue.length>1?'s':''}</div>
            <div style={{fontSize:12,color:'var(--red)',opacity:.8,marginTop:1}}>{overdue.map(i=>gc(i.clientId)?.brand||i.number).join(', ')}</div>
          </div>
        </div>
      )}
      {/* Summary */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:24}} className="r3">
        {[{l:'Total',v:`₹${fmtINR(total)}`,c:'var(--text)'},{l:'Collected',v:`₹${fmtINR(paid)}`,c:'var(--lime)'},{l:'Outstanding',v:`₹${fmtINR(pending)}`,c:'var(--orange)'}].map(s=>(
          <Card key={s.l} style={{padding:'14px 18px'}}><div style={{fontSize:10,color:'var(--text3)',fontFamily:'var(--mono)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:6}}>{s.l}</div><div style={{fontSize:22,fontWeight:700,fontFamily:'var(--syne)',color:s.c}}>{s.v}</div></Card>
        ))}
      </div>
      {live.length===0?<Empty icon="🧾" title="No invoices" sub="Create invoices and track payments." action={<Btn onClick={()=>setModal(true)}>Create invoice</Btn>}/>:
        <Card style={{padding:0,overflow:'hidden'}}>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:560}}>
              <thead><tr style={{borderBottom:'1px solid var(--border)'}}>
                {['Number','Client','Description','Amount','Status',''].map(h=><th key={h} style={{padding:'10px 16px',textAlign:'left',fontSize:10,fontFamily:'var(--mono)',color:'var(--text3)',letterSpacing:'.06em',textTransform:'uppercase',fontWeight:400}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {live.map(inv=>{
                  const cl=gc(inv.clientId)
                  return(<tr key={inv.id} style={{borderBottom:'1px solid var(--border)'}}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{padding:'12px 16px',fontFamily:'var(--mono)',fontSize:12,color:'var(--text3)'}}>{inv.number}</td>
                    <td style={{padding:'12px 16px',fontSize:13,fontWeight:500}}>{cl?.brand||'—'}</td>
                    <td style={{padding:'12px 16px',fontSize:12,color:'var(--text2)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{inv.desc}</td>
                    <td style={{padding:'12px 16px',fontSize:14,fontWeight:700,fontFamily:'var(--syne)'}}>₹{fmtINR(inv.amount||0)}</td>
                    <td style={{padding:'12px 16px'}}>
                      {inv.status==='paid'?<span style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:11,color:'#1A6B0A',background:'var(--lime-bg)',border:'1px solid var(--lime-border)',padding:'3px 10px',borderRadius:20,fontWeight:500}}><CheckCircle size={10}/>Paid</span>
                        :inv.status==='overdue'?<span style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:11,color:'var(--red)',background:'var(--red-bg)',border:'1px solid var(--red-border)',padding:'3px 10px',borderRadius:20,fontWeight:500}}><AlertTriangle size={10}/>Overdue</span>
                        :<span style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:11,color:'var(--orange)',background:'var(--orange-bg)',border:'1px solid var(--orange-border)',padding:'3px 10px',borderRadius:20,fontWeight:500}}>⏳ Pending</span>}
                    </td>
                    <td style={{padding:'12px 16px'}}>
                      <div style={{display:'flex',gap:4}}>
                        {inv.status!=='paid'&&<Btn size="sm" variant="lime" onClick={()=>{markInvoicePaid(inv.id);show('Marked paid!')}}>Mark paid</Btn>}
                        <Btn size="sm" variant="ghost" onClick={()=>{setForm({...inv,status:inv.status==='paid'?'paid':'pending'});setEditId(inv.id);setModal(true)}}><Edit2 size={12}/></Btn>
                        <Btn size="sm" variant="ghost" onClick={()=>{deleteInvoice(inv.id);show('Deleted')}}><Trash2 size={12}/></Btn>
                      </div>
                    </td>
                  </tr>)
                })}
              </tbody>
            </table>
          </div>
        </Card>}
      <Modal open={modal} onClose={()=>setModal(false)} title={editId?'Edit Invoice':'New Invoice'}>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Input label="Invoice #" placeholder="INV-001" value={form.number||''} onChange={e=>f('number',e.target.value)}/>
            <Select label="Client" value={form.clientId||''} onChange={e=>f('clientId',e.target.value)} options={[{value:'',label:'Select client...'},...clients.map(c=>({value:c.id,label:c.brand}))]}/>
          </div>
          <Input label="Description" value={form.desc||''} onChange={e=>f('desc',e.target.value)}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}} className="r3m">
            <Input label="Amount (₹)" type="number" value={form.amount||''} onChange={e=>f('amount',e.target.value)}/>
            <Input label="Invoice date" type="date" value={form.date||''} onChange={e=>f('date',e.target.value)}/>
            <Input label="Due date" type="date" value={form.due||''} onChange={e=>f('due',e.target.value)}/>
          </div>
          {/* ⑥ Only paid / pending — overdue auto-set */}
          <div style={{background:'var(--surface2)',borderRadius:'var(--r-sm)',padding:'12px 14px',border:'1px solid var(--border)'}}>
            <div style={{fontSize:12,fontWeight:500,color:'var(--text2)',marginBottom:10}}>Status</div>
            <div style={{display:'flex',gap:8}}>
              {['pending','paid'].map(s=>(
                <button key={s} onClick={()=>f('status',s)} style={{flex:1,padding:'8px 12px',borderRadius:6,border:`1.5px solid ${form.status===s?(s==='paid'?'var(--lime)':'var(--orange)'):'var(--border)'}`,background:form.status===s?(s==='paid'?'var(--lime-bg)':'var(--orange-bg)'):'transparent',color:form.status===s?(s==='paid'?'#1A6B0A':'var(--orange)'):'var(--text3)',cursor:'pointer',fontSize:13,fontWeight:form.status===s?600:400,transition:'all .12s'}}>
                  {s==='paid'?'✓ Paid':'⏳ Pending'}
                </button>
              ))}
            </div>
            <div style={{fontSize:11,color:'var(--text3)',marginTop:8}}>Status becomes <strong>Overdue</strong> automatically once the due date passes without payment.</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <Btn onClick={save} disabled={!form.amount} style={{flex:1,justifyContent:'center'}}>Save Invoice</Btn>
            {editId&&<Btn variant="danger" onClick={()=>{deleteInvoice(editId);setModal(false);show('Deleted')}}><Trash2 size={13}/></Btn>}
          </div>
        </div>
      </Modal>
      <Toast/>
    </div>
  )
}
