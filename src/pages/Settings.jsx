import{useState}from'react'
import{useStore}from'../store/index.js'
import{Card,Btn,Input,Textarea,SectionHeader,useToast}from'../components/ui.jsx'
import{User,Palette,Download,Trash2,Sun,Moon}from'lucide-react'

export default function Settings(){
  const{show,Toast}=useToast()
  const{theme,setTheme}=useStore()
  const[tab,setTab]=useState('profile')
  const[profile,setProfile]=useState(()=>{try{return JSON.parse(localStorage.getItem('us_profile')||'{}')}catch{return{}}})

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

  const TABS=[{k:'profile',l:'Studio Profile',i:User},{k:'appearance',l:'Appearance',i:Palette},{k:'data',l:'Data & Export',i:Download}]

  return(
    <div style={{padding:'24px 28px 60px',maxWidth:760,margin:'0 auto'}}>
      <SectionHeader title="Settings"/>
      <div style={{display:'flex',gap:24,alignItems:'flex-start',flexWrap:'wrap'}}>
        <div style={{width:180,flexShrink:0}}>
          {TABS.map(t=>{const Icon=t.i;return(
            <button key={t.k} onClick={()=>setTab(t.k)} style={{display:'flex',alignItems:'center',gap:9,padding:'9px 12px',borderRadius:'var(--r-sm)',border:'none',cursor:'pointer',width:'100%',background:tab===t.k?'var(--surface2)':'transparent',color:tab===t.k?'var(--text)':'var(--text2)',fontWeight:tab===t.k?500:400,fontSize:13,marginBottom:2,borderLeft:`2px solid ${tab===t.k?'var(--text)':'transparent'}`,transition:'all .12s',fontFamily:'var(--body)'}}>
              <Icon size={14}/>{t.l}
            </button>
          )})}
        </div>
        <div style={{flex:1,minWidth:260}}>
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
          {tab==='appearance'&&(
            <Card style={{padding:'20px 22px'}}>
              <div style={{fontSize:14,fontWeight:600,fontFamily:'var(--syne)',marginBottom:18}}>Appearance</div>
              {/* ⑦ Light / Dark toggle in settings */}
              <div style={{marginBottom:22}}>
                <div style={{fontSize:12,fontWeight:500,color:'var(--text2)',marginBottom:10}}>Theme</div>
                <div style={{display:'flex',gap:10}}>
                  {[{k:'light',l:'Light Mode',i:Sun},{k:'dark',l:'Dark Mode',i:Moon}].map(t=>{const Icon=t.i;return(
                    <button key={t.k} onClick={()=>{setTheme(t.k);document.documentElement.setAttribute('data-theme',t.k)}} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'12px 16px',borderRadius:'var(--r-sm)',border:`2px solid ${theme===t.k?'var(--text)':'var(--border)'}`,background:theme===t.k?'var(--surface2)':'transparent',cursor:'pointer',fontSize:13,color:theme===t.k?'var(--text)':'var(--text2)',fontWeight:theme===t.k?600:400,transition:'all .15s'}}>
                      <Icon size={15}/>{t.l}
                    </button>
                  )})}
                </div>
                <div style={{marginTop:10,padding:'10px 12px',borderRadius:'var(--r-sm)',background:'var(--surface2)',fontSize:12,color:'var(--text3)'}}>
                  Current: <strong style={{color:'var(--text)'}}>{theme==='light'?'Light':'Dark'} Mode</strong> — also toggle with the {theme==='light'?<Moon size={11} style={{verticalAlign:'middle'}}/>:<Sun size={11} style={{verticalAlign:'middle'}}/>} button in the top bar
                </div>
              </div>
              <div style={{padding:'14px 16px',background:'var(--surface2)',borderRadius:'var(--r-sm)',border:'1px solid var(--border)'}}>
                <div style={{fontSize:12,fontWeight:500,marginBottom:10}}>Fonts</div>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  <div style={{fontFamily:'var(--syne)',fontSize:15,fontWeight:700}}>Syne — Headings</div>
                  <div style={{fontFamily:'var(--body)',fontSize:13}}>DM Sans — Body text</div>
                  <div style={{fontFamily:'var(--mono)',fontSize:12}}>JetBrains Mono — Labels & numbers</div>
                </div>
              </div>
            </Card>
          )}
          {tab==='data'&&(
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <Card style={{padding:'20px 22px'}}>
                <div style={{fontSize:14,fontWeight:600,fontFamily:'var(--syne)',marginBottom:6}}>Export Backup</div>
                <p style={{fontSize:13,color:'var(--text2)',lineHeight:1.7,marginBottom:16}}>Download all your data (clients, projects, leads, content, metrics) as JSON.</p>
                <Btn onClick={exportData}><Download size={14}/>Export Backup</Btn>
              </Card>
              <Card style={{padding:'20px 22px',border:'1px solid var(--red-border)',background:'var(--red-bg)'}}>
                <div style={{fontSize:14,fontWeight:600,fontFamily:'var(--syne)',color:'var(--red)',marginBottom:6}}>Danger Zone</div>
                <p style={{fontSize:13,color:'var(--red)',lineHeight:1.7,marginBottom:16,opacity:.9}}>Permanently deletes all Studio OS data. No undo.</p>
                <Btn variant="danger" onClick={clearAll}><Trash2 size={14}/>Clear All Data</Btn>
              </Card>
              <Card style={{padding:'16px 20px'}}>
                <div style={{fontSize:12,color:'var(--text3)',lineHeight:1.8}}>
                  <div>Studio OS v2.0 · Built for Unsorted Studio</div>
                  <div>Data stored locally in browser · No server required</div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
      <Toast/>
    </div>
  )
}
