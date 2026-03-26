import{fmtINR}from'../lib/fmt.js'
import{useState}from'react'
import{useStore}from'../store/index.js'
import{Card,Btn,Input,Textarea,SectionHeader,useToast,Modal}from'../components/ui.jsx'
import{User,Palette,Download,Trash2,Sun,Moon,Plus,Edit2,Shield,LogOut}from'lucide-react'
import{getTeam,saveTeam,getCurrentUser,setCurrentUser}from'./Auth.jsx'

const ROLES=[{value:'founder',label:'Founder',desc:'Full access + team management'},{value:'team',label:'Team',desc:'Full access, cannot manage team'},{value:'employee',label:'Employee',desc:'View and edit, no delete'}]
const COLORS=['#5CB83A','#2563EB','#E8670D','#7C3AED','#0D9488','#D97706','#EC4899','#EF4444']

export default function Settings({onLogout}){
  const{show,Toast}=useToast()
  const{theme,setTheme}=useStore()
  const[tab,setTab]=useState('profile')
  const[profile,setProfile]=useState(()=>{try{return JSON.parse(localStorage.getItem('us_profile')||'{}')}catch{return{}}})
  const[team,setTeam]=useState(()=>getTeam())
  const[memberModal,setMemberModal]=useState(false)
  const[editMember,setEditMember]=useState(null)
  const[mForm,setMForm]=useState({})
  const currentUser=getCurrentUser()
  const isFounder=currentUser?.role==='founder'

  const saveProfile=()=>{localStorage.setItem('us_profile',JSON.stringify(profile));show('Profile saved!')}

  const exportData=()=>{
    const d={clients:JSON.parse(localStorage.getItem('studio-os-v2')||'{}'),posts:JSON.parse(localStorage.getItem('us_posts')||'[]'),leads:JSON.parse(localStorage.getItem('us_leads')||'[]'),metrics:JSON.parse(localStorage.getItem('us_metrics_v2')||'{}')}
    const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'})
    const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`studio-os-backup-${new Date().toISOString().split('T')[0]}.json`;a.click()
    show('Data exported!')
  }

  const clearAll=()=>{
    if(!confirm('Delete ALL data? This cannot be undone.'))return
    ;['studio-os-v2','us_posts','us_leads','us_metrics_v2','us_profile','us_sprint'].forEach(k=>localStorage.removeItem(k))
    show('Cleared. Reloading…');setTimeout(()=>window.location.reload(),1500)
  }

  const openAddMember=()=>{ setEditMember(null); setMForm({role:'employee',color:COLORS[Math.floor(Math.random()*COLORS.length)]}); setMemberModal(true) }
  const openEditMember=m=>{ setEditMember(m); setMForm({...m}); setMemberModal(true) }

  const saveMember=()=>{
    if(!mForm.name||!mForm.username||!mForm.password)return
    let next
    if(editMember){ next=team.map(m=>m.id===editMember.id?{...m,...mForm}:m) }
    else { next=[...team,{...mForm,id:'u'+Date.now()}] }
    saveTeam(next); setTeam(next); setMemberModal(false); show(editMember?'Member updated!':'Member added!')
  }

  const deleteMember=id=>{
    if(id===currentUser?.id){show('Cannot delete yourself','error');return}
    const next=team.filter(m=>m.id!==id); saveTeam(next); setTeam(next); show('Removed')
  }

  const TABS=[
    {k:'profile',l:'Studio Profile',i:User},
    {k:'team',l:'Team Members',i:Shield},
    {k:'appearance',l:'Appearance',i:Palette},
    {k:'data',l:'Data & Export',i:Download},
  ]

  const roleColor={founder:'var(--lime)',team:'var(--blue)',employee:'var(--orange)'}

  return(
    <div style={{padding:'24px 28px 60px',maxWidth:780,margin:'0 auto'}}>
      <SectionHeader title="Settings"/>
      <div style={{display:'flex',gap:24,alignItems:'flex-start',flexWrap:'wrap'}}>
        {/* Sidebar */}
        <div style={{width:190,flexShrink:0}}>
          {TABS.filter(t=>t.k!=='team'||isFounder).map(t=>{const Icon=t.i;return(
            <button key={t.k} onClick={()=>setTab(t.k)} style={{display:'flex',alignItems:'center',gap:9,padding:'9px 12px',borderRadius:'var(--r-sm)',border:'none',cursor:'pointer',width:'100%',background:tab===t.k?'var(--surface2)':'transparent',color:tab===t.k?'var(--text)':'var(--text2)',fontWeight:tab===t.k?500:400,fontSize:13,marginBottom:2,borderLeft:`2px solid ${tab===t.k?'var(--text)':'transparent'}`,transition:'all .12s',fontFamily:'var(--body)'}}>
              <Icon size={14}/>{t.l}
            </button>
          )})}
          {/* Logged in user + logout */}
          <div style={{marginTop:20,padding:'12px',background:'var(--surface2)',borderRadius:'var(--r-sm)',border:'1px solid var(--border)'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
              <div style={{width:28,height:28,borderRadius:'50%',background:currentUser?.color||'var(--lime)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff',fontFamily:'var(--syne)',flexShrink:0}}>
                {currentUser?.name?.charAt(0)||'?'}
              </div>
              <div style={{minWidth:0}}>
                <div style={{fontSize:12,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{currentUser?.name}</div>
                <div style={{fontSize:10,color:'var(--text3)',textTransform:'capitalize'}}>{currentUser?.role}</div>
              </div>
            </div>
            <button onClick={()=>{setCurrentUser(null);onLogout()}} style={{width:'100%',padding:'6px 8px',borderRadius:6,border:'1px solid var(--border)',background:'transparent',cursor:'pointer',fontSize:12,color:'var(--text2)',display:'flex',alignItems:'center',justifyContent:'center',gap:5,fontFamily:'var(--body)'}}>
              <LogOut size={12}/>Sign out
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{flex:1,minWidth:260}}>

          {/* PROFILE */}
          {tab==='profile'&&(
            <Card style={{padding:'20px 22px'}}>
              <div style={{fontSize:14,fontWeight:600,fontFamily:'var(--syne)',marginBottom:18}}>Studio Profile</div>
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                <Input label="Studio Name" value={profile.studioName||''} onChange={e=>setProfile(p=>({...p,studioName:e.target.value}))} placeholder="Unsorted Studio"/>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}} className="r2">
                  <Input label="Your Name" value={profile.ownerName||''} onChange={e=>setProfile(p=>({...p,ownerName:e.target.value}))}/>
                  <Input label="Email" type="email" value={profile.email||''} onChange={e=>setProfile(p=>({...p,email:e.target.value}))}/>
                </div>
                <Input label="Phone" value={profile.phone||''} onChange={e=>setProfile(p=>({...p,phone:e.target.value}))}/>
                <Input label="Instagram Handle" placeholder="@unsortedstudio" value={profile.instagram||''} onChange={e=>setProfile(p=>({...p,instagram:e.target.value}))}/>
                <Textarea label="Bio / Positioning" rows={3} value={profile.bio||''} onChange={e=>setProfile(p=>({...p,bio:e.target.value}))} placeholder="Clarity-first branding studio"/>
                <Btn onClick={saveProfile}>Save Profile</Btn>
              </div>
            </Card>
          )}

          {/* TEAM MEMBERS — founder only */}
          {tab==='team'&&isFounder&&(
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <div>
                  <div style={{fontSize:14,fontWeight:600,fontFamily:'var(--syne)'}}>Team Members</div>
                  <div style={{fontSize:12,color:'var(--text3)',marginTop:2}}>{team.length} members · Only you (founder) can manage this</div>
                </div>
                <Btn onClick={openAddMember}><Plus size={13}/>Add Member</Btn>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {team.map(m=>(
                  <Card key={m.id} style={{padding:'14px 18px',display:'flex',alignItems:'center',gap:14}}>
                    <div style={{width:36,height:36,borderRadius:'50%',background:m.color||'var(--lime)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#fff',fontFamily:'var(--syne)',flexShrink:0}}>
                      {m.name.charAt(0)}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:500}}>{m.name}</div>
                      <div style={{fontSize:11,color:'var(--text3)',marginTop:2,display:'flex',alignItems:'center',gap:6}}>
                        <span style={{fontFamily:'var(--mono)'}}>{m.username}</span>
                        <span style={{display:'inline-block',width:3,height:3,borderRadius:'50%',background:'var(--text3)'}}/>
                        <span style={{color:roleColor[m.role]||'var(--text3)',textTransform:'capitalize',fontWeight:500}}>{m.role}</span>
                      </div>
                    </div>
                    {m.id===currentUser?.id&&<span style={{fontSize:10,padding:'2px 8px',borderRadius:10,background:'var(--lime-bg)',color:'#1A6B0A',border:'1px solid var(--lime-border)',fontWeight:500}}>You</span>}
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={()=>openEditMember(m)} style={{padding:'5px 8px',borderRadius:6,border:'1px solid var(--border)',background:'transparent',cursor:'pointer',color:'var(--text2)',display:'flex',alignItems:'center',gap:4,fontSize:12}}><Edit2 size={12}/>Edit</button>
                      {m.id!==currentUser?.id&&<button onClick={()=>deleteMember(m.id)} style={{padding:'5px 8px',borderRadius:6,border:'1px solid var(--red-border)',background:'transparent',cursor:'pointer',color:'var(--red)',display:'flex',alignItems:'center',gap:4,fontSize:12}}><Trash2 size={12}/></button>}
                    </div>
                  </Card>
                ))}
              </div>

              <div style={{marginTop:14,padding:'12px 14px',background:'var(--surface2)',borderRadius:'var(--r-sm)',border:'1px solid var(--border)',fontSize:12,color:'var(--text3)',lineHeight:1.7}}>
                <strong style={{color:'var(--text2)'}}>Roles:</strong><br/>
                Founder — full access + team management<br/>
                Team — full access, cannot manage team<br/>
                Employee — view + edit, cannot delete
              </div>
            </div>
          )}

          {/* APPEARANCE */}
          {tab==='appearance'&&(
            <Card style={{padding:'20px 22px'}}>
              <div style={{fontSize:14,fontWeight:600,fontFamily:'var(--syne)',marginBottom:18}}>Appearance</div>
              <div style={{marginBottom:20}}>
                <div style={{fontSize:12,fontWeight:500,color:'var(--text2)',marginBottom:10}}>Theme</div>
                <div style={{display:'flex',gap:10}}>
                  {[{k:'light',l:'Light Mode',i:Sun},{k:'dark',l:'Dark Mode',i:Moon}].map(t=>{const Icon=t.i;return(
                    <button key={t.k} onClick={()=>{setTheme(t.k);document.documentElement.setAttribute('data-theme',t.k)}} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'12px',borderRadius:'var(--r-sm)',border:`2px solid ${theme===t.k?'var(--text)':'var(--border)'}`,background:theme===t.k?'var(--surface2)':'transparent',cursor:'pointer',fontSize:13,color:theme===t.k?'var(--text)':'var(--text2)',fontWeight:theme===t.k?600:400,transition:'all .15s'}}>
                      <Icon size={15}/>{t.l}
                    </button>
                  )})}
                </div>
              </div>
              <div style={{padding:'14px',background:'var(--surface2)',borderRadius:'var(--r-sm)',border:'1px solid var(--border)'}}>
                <div style={{fontSize:12,fontWeight:500,marginBottom:10}}>Fonts</div>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  <div style={{fontFamily:'var(--syne)',fontSize:15,fontWeight:700}}>Syne — Headings</div>
                  <div style={{fontFamily:'var(--body)',fontSize:13}}>DM Sans — Body</div>
                  <div style={{fontFamily:'var(--mono)',fontSize:12}}>JetBrains Mono — Labels</div>
                </div>
              </div>
            </Card>
          )}

          {/* DATA */}
          {tab==='data'&&(
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <Card style={{padding:'20px 22px'}}>
                <div style={{fontSize:14,fontWeight:600,fontFamily:'var(--syne)',marginBottom:6}}>Export Backup</div>
                <p style={{fontSize:13,color:'var(--text2)',lineHeight:1.7,marginBottom:16}}>Download all your data as JSON.</p>
                <Btn onClick={exportData}><Download size={14}/>Export Backup</Btn>
              </Card>
              {isFounder&&<Card style={{padding:'20px 22px',border:'1px solid var(--red-border)',background:'var(--red-bg)'}}>
                <div style={{fontSize:14,fontWeight:600,fontFamily:'var(--syne)',color:'var(--red)',marginBottom:6}}>Danger Zone</div>
                <p style={{fontSize:13,color:'var(--red)',lineHeight:1.7,marginBottom:16,opacity:.9}}>Permanently deletes all Studio OS data.</p>
                <Btn variant="danger" onClick={clearAll}><Trash2 size={14}/>Clear All Data</Btn>
              </Card>}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Member Modal */}
      <Modal open={memberModal} onClose={()=>setMemberModal(false)} title={editMember?'Edit Member':'Add Team Member'}>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Input label="Full Name *" placeholder="Ananya Shah" value={mForm.name||''} onChange={e=>setMForm(p=>({...p,name:e.target.value}))}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Input label="Username *" placeholder="ananya" value={mForm.username||''} onChange={e=>setMForm(p=>({...p,username:e.target.value.toLowerCase().replace(/\s/g,'')}))}/>
            <Input label="Password *" placeholder="set a password" value={mForm.password||''} onChange={e=>setMForm(p=>({...p,password:e.target.value}))}/>
          </div>
          {/* Role */}
          <div>
            <div style={{fontSize:12,fontWeight:500,color:'var(--text2)',marginBottom:8}}>Role</div>
            <div style={{display:'flex',flexDirection:'column',gap:7}}>
              {ROLES.map(r=>(
                <label key={r.value} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 13px',borderRadius:'var(--r-sm)',border:`1.5px solid ${mForm.role===r.value?'var(--text)':'var(--border)'}`,background:mForm.role===r.value?'var(--surface2)':'transparent',cursor:'pointer',transition:'all .12s'}}>
                  <input type="radio" name="role" value={r.value} checked={mForm.role===r.value} onChange={()=>setMForm(p=>({...p,role:r.value}))} style={{accentColor:'var(--text)'}}/>
                  <div>
                    <div style={{fontSize:13,fontWeight:500,color:mForm.role===r.value?'var(--text)':'var(--text2)'}}>{r.label}</div>
                    <div style={{fontSize:11,color:'var(--text3)',marginTop:1}}>{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          {/* Color */}
          <div>
            <div style={{fontSize:12,fontWeight:500,color:'var(--text2)',marginBottom:8}}>Avatar Color</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {COLORS.map(col=>(
                <button key={col} onClick={()=>setMForm(p=>({...p,color:col}))} style={{width:28,height:28,borderRadius:'50%',background:col,border:mForm.color===col?'3px solid var(--text)':'3px solid transparent',cursor:'pointer',transition:'border .12s'}}/>
              ))}
            </div>
          </div>
          <Btn onClick={saveMember} disabled={!mForm.name||!mForm.username||!mForm.password} style={{justifyContent:'center'}}>
            {editMember?'Update Member':'Add Member'}
          </Btn>
        </div>
      </Modal>
      <Toast/>
    </div>
  )
}
