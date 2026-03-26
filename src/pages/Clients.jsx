import{fmtINR}from'../lib/fmt.js'
import{useState}from'react'
import{useStore}from'../store/index.js'
import{Avatar,Badge,Btn,Input,Select,Textarea,Modal,Tabs,FileDropZone,ProgressBar,useToast,Empty,Card,FILE_ICONS,FILE_CATS,SectionHeader}from'../components/ui.jsx'
import{Plus,Search,Share2,Trash2,Edit2,FolderOpen,FileText,Copy,Download,PenLine,CheckCircle,ExternalLink,RefreshCw}from'lucide-react'
import{format,parseISO}from'date-fns'

// Client detail tabs — Overview, Files, Tasks, Invoices, Contracts, Notes
const CLIENT_TABS=[
  {key:'overview',  label:'Overview'},
  {key:'files',     label:'Files'},
  {key:'tasks',     label:'Tasks'},
  {key:'invoices',  label:'Invoices'},
  {key:'contracts', label:'Contracts'},
  {key:'notes',     label:'Notes'},
]
const STAGE_OPTS=[{value:'active',label:'Active'},{value:'discovery',label:'Discovery'},{value:'proposal',label:'Proposal Sent'},{value:'inactive',label:'Inactive'}]

export default function Clients(){
  const{clients,addClient,updateClient,deleteClient,activeClientId,setActiveClient,
        projects,tasks,files,invoices,notes,addNote,deleteNote,
        addFile,deleteFile,toggleFileShare,updateFile,addTask,toggleTask,
        regeneratePortalToken}=useStore()
  const{show,Toast}=useToast()
  const[search,setSearch]=useState('')
  const[filter,setFilter]=useState('all')
  const[addModal,setAddModal]=useState(false)
  const[step,setStep]=useState(0)
  const[form,setForm]=useState({})
  const[tab,setTab]=useState('overview')
  const[fileModal,setFileModal]=useState(false)
  const[ff,setFf]=useState({category:'general'})
  const[taskModal,setTaskModal]=useState(false)
  const[tf,setTf]=useState({})
  const[portalModal,setPortalModal]=useState(false)
  const[editModal,setEditModal]=useState(false)
  const[ef,setEf]=useState({})
  const[regenLoading,setRegenLoading]=useState(false)

  const upd=(k,v)=>setForm(p=>({...p,[k]:v}))
  const efu=(k,v)=>setEf(p=>({...p,[k]:v}))

  const filtered=clients.filter(c=>{
    const ms=!search||c.name.toLowerCase().includes(search.toLowerCase())||c.brand.toLowerCase().includes(search.toLowerCase())
    return ms&&(filter==='all'||c.stage===filter)
  })

  const ac=clients.find(c=>c.id===activeClientId)
  const cP=ac?projects.filter(p=>p.clientId===ac.id):[]
  const cT=ac?tasks.filter(t=>t.clientId===ac.id):[]
  const cF=ac?files.filter(f=>f.clientId===ac.id&&f.category!=='contract'):[]  // non-contract files
  const cC=ac?files.filter(f=>f.clientId===ac.id&&f.category==='contract'):[]  // contracts only
  const cI=ac?invoices.filter(i=>i.clientId===ac.id):[]
  const cN=ac?notes.filter(n=>n.clientId===ac.id):[]
  const portalUrl=ac?`${window.location.origin}${window.location.pathname}?portal=${ac.portal_token}`:''

  // Tab labels with counts
  const tabsWithCounts=CLIENT_TABS.map(t=>{
    const counts={files:cF.length, tasks:cT.filter(t=>!t.done).length, invoices:cI.length, contracts:cC.length, notes:cN.length}
    const count=counts[t.key]
    return{...t, label: count!==undefined ? `${t.label}${count>0?` (${count})`:''}` : t.label}
  })

  const STEPS=['Basic Info','Project Details','Portal Setup']
  const doOnboard=async ()=>{
    if(step<2){setStep(s=>s+1);return}
    const c=await addClient(form)
    setAddModal(false);setStep(0);setForm({})
    if(c?.id)setActiveClient(c.id)
    show('Client onboarded!')
  }
  const doUpload=({name,size,type,dataUrl})=>{
    addFile({clientId:ac.id,name,size,type,dataUrl,sharedWithClient:ff.share||false,category:ff.category||'general',signatureRequired:ff.sig&&ff.category==='contract',signedBack:false})
    setFileModal(false);setFf({category:'general'});show('File uploaded!')
  }
  const doTask=()=>{addTask({...tf,clientId:ac.id,priority:tf.priority||'med'});setTaskModal(false);setTf({});show('Task added!')}
  const doEdit=()=>{updateClient(ac.id,ef);setEditModal(false);show('Updated!')}

  // Regenerate portal token
  const doRegen=async()=>{
    if(!confirm('This will invalidate the old portal link. A new link will be created. Continue?'))return
    setRegenLoading(true)
    try{
      await regeneratePortalToken(ac.id)
      show('New portal link created!')
    }catch(e){show('Failed to regenerate','error')}
    setRegenLoading(false)
  }

  // ── LIST VIEW ──────────────────────────────────────────────
  if(!ac) return(
    <div style={{padding:'24px 28px 60px',maxWidth:1200,margin:'0 auto'}}>
      <SectionHeader title="Clients" sub={`${clients.length} clients`}
        action={
          <Btn onClick={()=>{setAddModal(true);setStep(0);setForm({})}}>
            <Plus size={14}/>Add Client
          </Btn>
        }/>
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap',alignItems:'center'}}>
        {['all','active','discovery','proposal','inactive'].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{padding:'5px 12px',borderRadius:20,border:`1px solid ${filter===s?'var(--text)':'var(--border)'}`,background:filter===s?'var(--text)':'transparent',color:filter===s?'var(--bg)':'var(--text2)',fontSize:12,cursor:'pointer',textTransform:'capitalize',transition:'all .12s'}}>{s}</button>
        ))}
        <div style={{position:'relative',marginLeft:'auto'}}>
          <Search size={12} style={{position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',color:'var(--text3)'}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{padding:'6px 10px 6px 27px',borderRadius:20,border:'1px solid var(--border)',background:'var(--surface)',fontSize:12,outline:'none',width:165,color:'var(--text)'}}/>
        </div>
      </div>
      {filtered.length===0
        ?<Empty icon="👥" title="No clients yet" sub="Onboard your first client." action={<Btn onClick={()=>setAddModal(true)}>Onboard first client</Btn>}/>
        :<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))',gap:14}}>
          {filtered.map(c=>{
            const cp=projects.filter(p=>p.clientId===c.id)
            const cf=files.filter(f=>f.clientId===c.id)
            return(<Card key={c.id} onClick={()=>setActiveClient(c.id)} style={{cursor:'pointer',padding:18}}>
              <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:14}}>
                <Avatar name={c.name} color={c.color} photo={c.photo} size={44}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:15,fontWeight:600,fontFamily:'var(--syne)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.brand}</div>
                  <div style={{fontSize:12,color:'var(--text2)',marginTop:1}}>{c.name}</div>
                </div>
                <Badge label={c.stage} type={c.stage}/>
              </div>
              <div style={{display:'flex',gap:14,fontSize:12,color:'var(--text3)',borderTop:'1px solid var(--border)',paddingTop:12}}>
                <span><FolderOpen size={11} style={{marginRight:4,verticalAlign:'middle'}}/>{cp.length}</span>
                <span><FileText size={11} style={{marginRight:4,verticalAlign:'middle'}}/>{cf.length} files</span>
                {c.budget&&<span style={{marginLeft:'auto',fontWeight:600,color:'var(--text)'}}>₹{fmtINR(c.budget)}</span>}
              </div>
            </Card>)
          })}
        </div>}
      <OnboardModal open={addModal} onClose={()=>setAddModal(false)} step={step} setStep={setStep} form={form} upd={upd} onSubmit={doOnboard} STEPS={STEPS}/>
      <Toast/>
    </div>
  )

  // ── DETAIL VIEW ───────────────────────────────────────────
  return(
    <div style={{display:'flex',height:'calc(100vh - 52px)',overflow:'hidden'}}>
      {/* Client list panel */}
      <div style={{width:215,flexShrink:0,borderRight:'1px solid var(--border)',overflowY:'auto',background:'var(--surface)'}} className="cl-panel">
        <div style={{padding:'12px 10px'}}>
          <div style={{position:'relative',marginBottom:10}}>
            <Search size={12} style={{position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',color:'var(--text3)'}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{width:'100%',padding:'6px 8px 6px 26px',borderRadius:'var(--r-sm)',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:12,color:'var(--text)',outline:'none'}}/>
          </div>
          {filtered.map(c=>(
            <div key={c.id} onClick={()=>{setActiveClient(c.id);setTab('overview')}} style={{padding:'8px 10px',borderRadius:'var(--r-sm)',cursor:'pointer',marginBottom:2,background:c.id===activeClientId?'var(--surface2)':'transparent',border:c.id===activeClientId?'1px solid var(--border2)':'1px solid transparent',transition:'all .12s'}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <Avatar name={c.name} color={c.color} photo={c.photo} size={28}/>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.brand}</div>
                  <div style={{fontSize:10,color:'var(--text3)'}}>{c.name}</div>
                </div>
              </div>
            </div>
          ))}
          {/* Add client button — always active */}
          <button onClick={()=>{setActiveClient(null);setAddModal(true);setStep(0);setForm({})}}
            style={{width:'100%',padding:'9px',borderRadius:'var(--r-sm)',border:'1px solid var(--text)',background:'var(--text)',color:'var(--bg)',fontSize:12,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:5,marginTop:10,fontWeight:500,fontFamily:'var(--body)',transition:'opacity .12s'}}
            onMouseEnter={e=>e.currentTarget.style.opacity='.85'}
            onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            <Plus size={12}/>Add Client
          </button>
        </div>
      </div>

      {/* Detail */}
      <div style={{flex:1,overflowY:'auto',padding:'22px 24px'}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:18,gap:12,flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <Avatar name={ac.name} color={ac.color} photo={ac.photo} size={54} editable
              onPhotoChange={url=>updateClient(ac.id,{photo:url})} onPhotoDelete={()=>updateClient(ac.id,{photo:null})}/>
            <div>
              <h2 style={{fontFamily:'var(--syne)',fontSize:20,fontWeight:700}}>{ac.brand}</h2>
              <div style={{display:'flex',alignItems:'center',gap:8,marginTop:4,flexWrap:'wrap'}}>
                <span style={{fontSize:13,color:'var(--text2)'}}>{ac.name}</span>
                <Badge label={ac.stage} type={ac.stage}/><Badge label={ac.type} type={ac.type}/>
              </div>
            </div>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <Btn size="sm" variant="secondary" onClick={()=>{setEf({...ac});setEditModal(true)}}><Edit2 size={13}/>Edit</Btn>
            <Btn size="sm" variant="secondary" onClick={()=>setPortalModal(true)}><Share2 size={13}/>Portal</Btn>
            <Btn size="sm" onClick={()=>setFileModal(true)}><Plus size={13}/>Upload</Btn>
          </div>
        </div>

        {/* Tabs — Overview, Files, Tasks, Invoices, Contracts, Notes */}
        <Tabs tabs={tabsWithCounts} active={tab} onChange={setTab}/>

        <div style={{marginTop:18}}>
          {/* OVERVIEW */}
          {tab==='overview'&&(
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}} className="r2">
              <Card style={{padding:18}}>
                <div style={{fontSize:13,fontWeight:600,marginBottom:14,fontFamily:'var(--syne)'}}>Contact Info</div>
                {[['Email',ac.email],['Phone',ac.phone],['Type',ac.type],['Budget',ac.budget?`₹${fmtINR(ac.budget)}`:null],['Onboarded',ac.onboarded?format(parseISO(ac.onboarded),'d MMM yyyy'):null]].map(([k,v])=>v&&(
                  <div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'6px 0',borderBottom:'1px solid var(--border)'}}><span style={{color:'var(--text3)'}}>{k}</span><span style={{fontWeight:500}}>{v}</span></div>
                ))}
              </Card>
              <Card style={{padding:18}}>
                <div style={{fontSize:13,fontWeight:600,marginBottom:14,fontFamily:'var(--syne)'}}>Projects</div>
                {cP.length===0?<div style={{fontSize:12,color:'var(--text3)',textAlign:'center',padding:'16px 0'}}>No projects yet</div>:
                  cP.map(p=>(<div key={p.id} style={{marginBottom:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{fontSize:13,fontWeight:500}}>{p.name}</span><Badge label={p.status} type={p.status}/></div>
                    <ProgressBar value={p.progress||0}/>
                  </div>))}
              </Card>
              {ac.notes&&<Card style={{padding:18,gridColumn:'1/-1'}}><div style={{fontSize:13,fontWeight:600,marginBottom:8}}>Notes</div><p style={{fontSize:13,color:'var(--text2)',lineHeight:1.7}}>{ac.notes}</p></Card>}
            </div>
          )}

          {/* FILES — design, strategy, invoices, general (not contracts) */}
          {tab==='files'&&(
            <div>
              <div style={{display:'flex',justifyContent:'flex-end',marginBottom:14}}>
                <Btn size="sm" onClick={()=>setFileModal(true)}><Plus size={13}/>Upload File</Btn>
              </div>
              {cF.length===0?<Empty icon="📂" title="No files yet" sub="Upload design files, strategy docs, invoices here. Contracts have their own tab." action={<Btn onClick={()=>setFileModal(true)}>Upload</Btn>}/>:
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(185px,1fr))',gap:10}}>
                  {cF.map(file=><FileCard key={file.id} file={file} onShare={()=>{toggleFileShare(file.id);show(file.sharedWithClient?'Unshared':'Shared!')}} onDelete={()=>{deleteFile(file.id);show('Deleted')}}/>)}
                </div>}
            </div>
          )}

          {/* TASKS */}
          {tab==='tasks'&&(
            <div>
              <div style={{marginBottom:14}}><Btn onClick={()=>setTaskModal(true)}><Plus size={14}/>Add Task</Btn></div>
              {cT.length===0?<Empty icon="✅" title="No tasks" sub="Add tasks for this client." action={<Btn onClick={()=>setTaskModal(true)}>Add task</Btn>}/>:
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  {cT.map(t=>(
                    <Card key={t.id} style={{padding:'11px 16px',display:'flex',alignItems:'center',gap:12}}>
                      <button onClick={()=>toggleTask(t.id)} style={{width:20,height:20,borderRadius:5,flexShrink:0,cursor:'pointer',border:`1.5px solid ${t.done?'var(--lime)':'var(--border2)'}`,background:t.done?'var(--lime)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#fff',transition:'all .15s'}}>{t.done?'✓':''}</button>
                      <span style={{flex:1,fontSize:13,fontWeight:500,textDecoration:t.done?'line-through':'none',color:t.done?'var(--text3)':'var(--text)'}}>{t.title}</span>
                      <Badge label={t.priority} type={t.priority}/>
                      {t.due&&<span style={{fontSize:11,color:'var(--text3)',fontFamily:'var(--mono)',flexShrink:0}}>{t.due}</span>}
                    </Card>
                  ))}
                </div>}
            </div>
          )}

          {/* INVOICES */}
          {tab==='invoices'&&(
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {cI.length===0?<Empty icon="🧾" title="No invoices" sub="Invoices for this client appear here."/>:
                cI.map(inv=>(
                  <Card key={inv.id} style={{padding:'14px 18px',display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
                    <span style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--text3)',flexShrink:0}}>{inv.number}</span>
                    <span style={{flex:1,fontSize:13,minWidth:100}}>{inv.desc}</span>
                    <span style={{fontSize:14,fontWeight:700,fontFamily:'var(--syne)',flexShrink:0}}>₹{fmtINR(inv.amount)}</span>
                    <Badge label={inv.status} type={inv.status}/>
                  </Card>
                ))}
            </div>
          )}

          {/* CONTRACTS — separate tab */}
          {tab==='contracts'&&(
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <div style={{fontSize:13,color:'var(--text3)'}}>Service agreements, NDAs, SOWs</div>
                <Btn size="sm" onClick={()=>{setFf({category:'contract',sig:true,share:true});setFileModal(true)}}><Plus size={13}/>Upload Contract</Btn>
              </div>
              {/* Pending signature alert */}
              {cC.filter(f=>f.signatureRequired&&!f.signedBack).length>0&&(
                <div style={{background:'var(--orange-bg)',border:'1px solid var(--orange-border)',borderRadius:'var(--r-sm)',padding:'11px 14px',marginBottom:14,fontSize:13,color:'var(--orange)',display:'flex',alignItems:'center',gap:8}}>
                  <PenLine size={14}/>{cC.filter(f=>f.signatureRequired&&!f.signedBack).length} contract(s) awaiting client signature
                </div>
              )}
              {cC.length===0?<Empty icon="📝" title="No contracts" sub="Upload contracts here. Clients can sign and upload back via their portal." action={<Btn onClick={()=>{setFf({category:'contract',sig:true,share:true});setFileModal(true)}}>Upload Contract</Btn>}/>:
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:10}}>
                  {cC.map(file=>(
                    <Card key={file.id} style={{padding:14,border:file.signatureRequired&&!file.signedBack?'1px solid var(--orange-border)':undefined}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><span style={{fontSize:26}}>📝</span>
                        {file.signedBack?<span style={{display:'inline-flex',alignItems:'center',gap:3,fontSize:10,color:'#1A6B0A',background:'var(--lime-bg)',border:'1px solid var(--lime-border)',padding:'2px 7px',borderRadius:20}}><CheckCircle size={9}/>Signed</span>
                          :file.signatureRequired?<span style={{display:'inline-flex',alignItems:'center',gap:3,fontSize:10,color:'var(--orange)',background:'var(--orange-bg)',border:'1px solid var(--orange-border)',padding:'2px 7px',borderRadius:20}}><PenLine size={9}/>Awaiting</span>
                          :<span style={{fontSize:10,padding:'2px 7px',borderRadius:10,background:'var(--surface2)',color:'var(--text3)',border:'1px solid var(--border)'}}>Draft</span>}
                      </div>
                      <div style={{fontSize:12,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:2}}>{file.name}</div>
                      <div style={{fontSize:11,color:'var(--text3)',marginBottom:10}}>{file.size}·{file.uploaded}</div>
                      {file.uploadedBy==='client'&&<div style={{marginBottom:8}}><span style={{fontSize:10,padding:'2px 6px',borderRadius:8,background:'var(--teal-bg)',color:'var(--teal)',border:'1px solid var(--teal-border)'}}>↑ Signed by client</span></div>}
                      <div style={{display:'flex',gap:4}}>
                        <button onClick={()=>{toggleFileShare(file.id);show(file.sharedWithClient?'Unshared':'Shared!')}} style={{flex:1,padding:'4px 5px',borderRadius:5,cursor:'pointer',border:`1px solid ${file.sharedWithClient?'var(--lime-border)':'var(--border2)'}`,background:file.sharedWithClient?'var(--lime-bg)':'transparent',fontSize:10,color:file.sharedWithClient?'#1A6B0A':'var(--text3)',display:'flex',alignItems:'center',justifyContent:'center',gap:3}}>
                          <Share2 size={9}/>{file.sharedWithClient?'Shared':'Share'}
                        </button>
                        {file.dataUrl&&<button onClick={()=>{const a=document.createElement('a');a.href=file.dataUrl;a.download=file.name;a.click()}} style={{padding:'4px 5px',borderRadius:5,border:'1px solid var(--border)',background:'transparent',cursor:'pointer',color:'var(--text3)',display:'flex',alignItems:'center'}}><Download size={11}/></button>}
                        <button onClick={()=>{deleteFile(file.id);show('Deleted')}} style={{padding:'4px 5px',borderRadius:5,border:'1px solid var(--border)',background:'transparent',cursor:'pointer',color:'var(--red)',display:'flex',alignItems:'center'}}><Trash2 size={11}/></button>
                      </div>
                      {file.signatureRequired&&!file.signedBack&&(
                        <button onClick={()=>{updateFile(file.id,{signedBack:true});show('Marked signed!')}} style={{width:'100%',marginTop:8,padding:'5px',borderRadius:5,border:'1px solid var(--lime-border)',background:'var(--lime-bg)',color:'#1A6B0A',fontSize:11,fontWeight:500,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:4}}>
                          <CheckCircle size={12}/>Mark as signed
                        </button>
                      )}
                    </Card>
                  ))}
                </div>}
            </div>
          )}

          {/* NOTES */}
          {tab==='notes'&&(
            <div>
              <NoteBox onAdd={txt=>{addNote({content:txt,clientId:ac.id});show('Note added!')}}/>
              <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:14}}>
                {cN.map(n=>(
                  <Card key={n.id} style={{padding:'13px 18px'}}>
                    <p style={{fontSize:13,lineHeight:1.7,marginBottom:8}}>{n.content}</p>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontSize:11,color:'var(--text3)',fontFamily:'var(--mono)'}}>{n.createdAt}</span>
                      <button onClick={()=>{deleteNote(n.id);show('Deleted')}} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text3)'}}><Trash2 size={13}/></button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      <Modal open={fileModal} onClose={()=>setFileModal(false)} title="Upload File">
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Select label="Category" value={ff.category||'general'} onChange={e=>setFf(p=>({...p,category:e.target.value}))} options={FILE_CATS.map(c=>({value:c,label:{design:'Design Files',strategy:'Strategy Docs',contract:'Contracts',invoice:'Invoices',general:'General'}[c]||c}))}/>
          <label style={{display:'flex',alignItems:'center',gap:10,fontSize:13,cursor:'pointer',padding:'10px 12px',borderRadius:'var(--r-sm)',border:'1px solid var(--border)',background:'var(--surface2)'}}>
            <input type="checkbox" checked={ff.share||false} onChange={e=>setFf(p=>({...p,share:e.target.checked}))} style={{width:15,height:15}}/>
            <div><div style={{fontWeight:500}}>Share with client immediately</div><div style={{fontSize:11,color:'var(--text3)'}}>Visible in their portal</div></div>
          </label>
          {ff.category==='contract'&&(
            <label style={{display:'flex',alignItems:'center',gap:10,fontSize:13,cursor:'pointer',padding:'10px 12px',borderRadius:'var(--r-sm)',border:'1px solid var(--orange-border)',background:'var(--orange-bg)'}}>
              <input type="checkbox" checked={ff.sig||false} onChange={e=>setFf(p=>({...p,sig:e.target.checked}))} style={{width:15,height:15}}/>
              <div><div style={{fontWeight:500,color:'var(--orange)'}}>Requires client signature</div><div style={{fontSize:11,color:'var(--text3)'}}>Client signs and uploads back via portal</div></div>
            </label>
          )}
          <FileDropZone onFiles={doUpload}/>
        </div>
      </Modal>

      <Modal open={taskModal} onClose={()=>setTaskModal(false)} title="Add Task">
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Input label="Task *" placeholder="What needs to be done?" value={tf.title||''} onChange={e=>setTf(p=>({...p,title:e.target.value}))}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Select label="Priority" value={tf.priority||'med'} onChange={e=>setTf(p=>({...p,priority:e.target.value}))} options={[{value:'high',label:'High'},{value:'med',label:'Medium'},{value:'low',label:'Low'}]}/>
            <Input label="Due date" type="date" value={tf.due||''} onChange={e=>setTf(p=>({...p,due:e.target.value}))}/>
          </div>
          <Btn onClick={doTask} disabled={!tf.title}>Add Task</Btn>
        </div>
      </Modal>

      {/* Portal modal — with regenerate */}
      <Modal open={portalModal} onClose={()=>setPortalModal(false)} title="Client Portal">
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{background:'var(--surface2)',borderRadius:'var(--r-sm)',padding:'14px 16px'}}>
            <div style={{fontSize:12,color:'var(--text3)',marginBottom:6}}>Current portal link for {ac.brand}</div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <code style={{flex:1,fontSize:11,fontFamily:'var(--mono)',color:'var(--text)',wordBreak:'break-all',lineHeight:1.6}}>{portalUrl}</code>
              <button onClick={()=>{navigator.clipboard.writeText(portalUrl);show('Copied!')}} style={{padding:'6px 10px',borderRadius:6,border:'1px solid var(--border2)',background:'var(--surface)',cursor:'pointer',flexShrink:0,color:'var(--text2)'}}><Copy size={13}/></button>
            </div>
          </div>

          {/* Regenerate section */}
          <div style={{background:'var(--orange-bg)',border:'1px solid var(--orange-border)',borderRadius:'var(--r-sm)',padding:'14px 16px'}}>
            <div style={{fontSize:13,fontWeight:500,color:'var(--orange)',marginBottom:4}}>Link not working?</div>
            <div style={{fontSize:12,color:'var(--orange)',lineHeight:1.7,marginBottom:12}}>If the old link shows "Invalid or expired", generate a new one. The old link will stop working.</div>
            <Btn variant="secondary" onClick={doRegen} disabled={regenLoading} style={{width:'100%',justifyContent:'center'}}>
              <RefreshCw size={13} style={{animation:regenLoading?'spin 1s linear infinite':'none'}}/>
              {regenLoading?'Generating…':'Generate New Link'}
            </Btn>
          </div>

          <p style={{fontSize:12,color:'var(--text2)',lineHeight:1.7}}>Your client sees all files you've marked as shared, project progress, and invoice summary. They can upload signed contracts back.</p>
          <div style={{display:'flex',gap:8}}>
            <Btn onClick={()=>{navigator.clipboard.writeText(portalUrl);show('Copied!')}} style={{flex:1,justifyContent:'center'}}><Copy size={14}/>Copy Link</Btn>
            <Btn variant="secondary" onClick={()=>window.open(portalUrl,'_blank')}><ExternalLink size={14}/>Preview</Btn>
          </div>
        </div>
      </Modal>

      <Modal open={editModal} onClose={()=>setEditModal(false)} title="Edit Client">
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'flex',alignItems:'center',gap:14,padding:'12px 14px',background:'var(--surface2)',borderRadius:'var(--r-sm)',border:'1px solid var(--border)'}}>
            <Avatar name={ef.name||''} color={ef.color} photo={ef.photo} size={54} editable onPhotoChange={url=>efu('photo',url)} onPhotoDelete={()=>efu('photo',null)}/>
            <div style={{fontSize:12,color:'var(--text2)',lineHeight:1.7}}>Click camera to upload.<br/>Click × to remove.</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Input label="Name" value={ef.name||''} onChange={e=>efu('name',e.target.value)}/>
            <Input label="Brand" value={ef.brand||''} onChange={e=>efu('brand',e.target.value)}/>
          </div>
          <Input label="Email" value={ef.email||''} onChange={e=>efu('email',e.target.value)}/>
          <Input label="Phone" value={ef.phone||''} onChange={e=>efu('phone',e.target.value)}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Select label="Stage" value={ef.stage||'discovery'} onChange={e=>efu('stage',e.target.value)} options={STAGE_OPTS}/>
            <Input label="Budget (₹)" type="number" value={ef.budget||''} onChange={e=>efu('budget',e.target.value)}/>
          </div>
          <Textarea label="Notes" value={ef.notes||''} onChange={e=>efu('notes',e.target.value)}/>
          <div style={{display:'flex',gap:8}}>
            <Btn onClick={doEdit} style={{flex:1,justifyContent:'center'}}>Save Changes</Btn>
            <Btn variant="danger" onClick={()=>{deleteClient(ac.id);setActiveClient(null);setEditModal(false);show('Deleted')}}><Trash2 size={13}/></Btn>
          </div>
        </div>
      </Modal>

      <Toast/>
      <style>{`
        @media(max-width:768px){.cl-panel{display:none!important}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  )
}

function FileCard({file,onShare,onDelete}){
  return(
    <Card style={{padding:13}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><span style={{fontSize:24}}>{FILE_ICONS[file.type]||'📎'}</span><span style={{fontSize:10,padding:'2px 6px',borderRadius:8,background:'var(--surface2)',color:'var(--text3)',border:'1px solid var(--border)',textTransform:'capitalize'}}>{file.category}</span></div>
      <div style={{fontSize:11,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:2}}>{file.name}</div>
      <div style={{fontSize:10,color:'var(--text3)',marginBottom:8}}>{file.size}·{file.uploaded}</div>
      {file.uploadedBy==='client'&&<div style={{marginBottom:6}}><span style={{fontSize:10,padding:'2px 6px',borderRadius:8,background:'var(--teal-bg)',color:'var(--teal)',border:'1px solid var(--teal-border)'}}>↑ From client</span></div>}
      <div style={{display:'flex',gap:4}}>
        <button onClick={onShare} style={{flex:1,padding:'4px 5px',borderRadius:5,cursor:'pointer',border:`1px solid ${file.sharedWithClient?'var(--lime-border)':'var(--border2)'}`,background:file.sharedWithClient?'var(--lime-bg)':'transparent',fontSize:10,color:file.sharedWithClient?'#1A6B0A':'var(--text3)',display:'flex',alignItems:'center',justifyContent:'center',gap:3}}>
          <Share2 size={9}/>{file.sharedWithClient?'Shared':'Share'}
        </button>
        {file.dataUrl&&<button onClick={()=>{const a=document.createElement('a');a.href=file.dataUrl;a.download=file.name;a.click()}} style={{padding:'4px 5px',borderRadius:5,border:'1px solid var(--border)',background:'transparent',cursor:'pointer',color:'var(--text3)',display:'flex',alignItems:'center'}}><Download size={11}/></button>}
        <button onClick={onDelete} style={{padding:'4px 5px',borderRadius:5,border:'1px solid var(--border)',background:'transparent',cursor:'pointer',color:'var(--red)',display:'flex',alignItems:'center'}}><Trash2 size={11}/></button>
      </div>
    </Card>
  )
}

function NoteBox({onAdd}){
  const[t,setT]=useState('')
  return(
    <div style={{display:'flex',gap:10}}>
      <textarea value={t} onChange={e=>setT(e.target.value)} placeholder="Add a note…" rows={2} style={{flex:1,padding:'8px 11px',borderRadius:'var(--r-sm)',border:'1px solid var(--border2)',background:'var(--surface)',fontSize:13,outline:'none',resize:'none',fontFamily:'var(--body)',lineHeight:1.6,color:'var(--text)'}}/>
      <Btn onClick={()=>{if(t.trim()){onAdd(t.trim());setT('')}}} disabled={!t.trim()}>Add</Btn>
    </div>
  )
}

function OnboardModal({open,onClose,step,setStep,form,upd,onSubmit,STEPS}){
  return(
    <Modal open={open} onClose={onClose} title={`New Client — ${STEPS[step]}`} width={480}>
      <div style={{display:'flex',gap:5,marginBottom:22}}>{STEPS.map((_,i)=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=step?'var(--text)':'var(--border2)',transition:'background .3s'}}/>)}</div>
      <div style={{fontSize:14,fontWeight:600,fontFamily:'var(--syne)',marginBottom:16}}>{STEPS[step]}</div>
      {step===0&&(
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'flex',alignItems:'center',gap:14,padding:'14px',background:'var(--surface2)',borderRadius:'var(--r-sm)',border:'1px solid var(--border)'}}>
            <Avatar name={form.name||'?'} color="#5CB83A" photo={form.photo} size={54} editable onPhotoChange={url=>upd('photo',url)} onPhotoDelete={()=>upd('photo',null)}/>
            <div style={{fontSize:12,color:'var(--text2)',lineHeight:1.7}}>Upload a client photo (optional).<br/>Can be added later.</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Input label="Client Name *" placeholder="Arya Mehta" value={form.name||''} onChange={e=>upd('name',e.target.value)}/>
            <Input label="Brand Name *" placeholder="Aura Skincare" value={form.brand||''} onChange={e=>upd('brand',e.target.value)}/>
          </div>
          <Input label="Email" type="email" value={form.email||''} onChange={e=>upd('email',e.target.value)}/>
          <Input label="Phone" value={form.phone||''} onChange={e=>upd('phone',e.target.value)}/>
          <Select label="Type" value={form.type||'D2C'} onChange={e=>upd('type',e.target.value)} options={[{value:'D2C',label:'D2C Brand'},{value:'SaaS',label:'SaaS / Product'},{value:'Startup',label:'Startup'},{value:'Other',label:'Other'}]}/>
        </div>
      )}
      {step===1&&(
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Select label="Initial Stage" value={form.stage||'discovery'} onChange={e=>upd('stage',e.target.value)} options={[{value:'discovery',label:'Discovery'},{value:'proposal',label:'Proposal Sent'},{value:'active',label:'Active'}]}/>
          <Input label="Budget (₹)" type="number" value={form.budget||''} onChange={e=>upd('budget',e.target.value)}/>
          <Textarea label="Notes" rows={4} placeholder="What are they building? What's the brand problem?" value={form.notes||''} onChange={e=>upd('notes',e.target.value)}/>
        </div>
      )}
      {step===2&&(
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{background:'var(--lime-bg)',border:'1px solid var(--lime-border)',borderRadius:'var(--r-sm)',padding:'14px'}}>
            <div style={{fontSize:13,fontWeight:500,color:'#1A6B0A',marginBottom:4}}>Client portal auto-created</div>
            <div style={{fontSize:12,color:'#2D7A1F',lineHeight:1.7}}>A private portal is created for <strong>{form.brand||'this client'}</strong>. They see only what you share — files, contracts, invoices.</div>
          </div>
          <div style={{background:'var(--surface2)',borderRadius:'var(--r-sm)',padding:'12px 14px'}}>
            {[['Name',form.name],['Brand',form.brand],['Email',form.email],['Type',form.type]].filter(([,v])=>v).map(([k,v])=>(
              <div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:12,padding:'3px 0',borderBottom:'1px solid var(--border)'}}><span style={{color:'var(--text3)'}}>{k}</span><span style={{fontWeight:500}}>{v}</span></div>
            ))}
          </div>
        </div>
      )}
      <div style={{display:'flex',gap:10,marginTop:18}}>
        {step>0&&<Btn variant="secondary" onClick={()=>setStep(s=>s-1)}>Back</Btn>}
        <Btn onClick={onSubmit} disabled={step===0&&(!form.name||!form.brand)} style={{flex:1,justifyContent:'center'}}>{step<2?'Continue →':'🎉 Onboard Client'}</Btn>
      </div>
    </Modal>
  )
}
