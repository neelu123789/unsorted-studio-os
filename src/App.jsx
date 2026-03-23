import{useEffect,useState}from'react'
import{useStore}from'./store/index.js'
import Sidebar from'./components/Sidebar.jsx'
import Dashboard from'./pages/Dashboard.jsx'
import Clients from'./pages/Clients.jsx'
import{Projects,Tasks,Meetings,Invoices}from'./pages/OtherPages.jsx'
import Files from'./pages/Files.jsx'
import ClientPortal from'./pages/ClientPortal.jsx'
import Pipeline from'./pages/Pipeline.jsx'
import ContentCalendar from'./pages/ContentCalendar.jsx'
import MetricsPage from'./pages/Metrics.jsx'
import Settings from'./pages/Settings.jsx'
import NotifPanel from'./components/NotifPanel.jsx'
import ErrorBoundary from'./components/ErrorBoundary.jsx'
import{Menu,Sun,Moon,Bell}from'lucide-react'

const getToken=()=>new URLSearchParams(window.location.search).get('portal')

// ── PAGE ROUTER — defined OUTSIDE StudioOS so it never re-mounts ──
function Page(){
  const{currentView}=useStore()
  switch(currentView){
    case'dashboard':return<Dashboard/>
    case'clients':  return<Clients/>
    case'projects': return<Projects/>
    case'pipeline': return<Pipeline/>
    case'tasks':    return<Tasks/>
    case'files':    return<Files/>
    case'calendar': return<ContentCalendar/>
    case'meetings': return<Meetings/>
    case'invoices': return<Invoices/>
    case'metrics':  return<MetricsPage/>
    case'settings': return<Settings/>
    default:        return<Dashboard/>
  }
}

export default function App(){
  const token=getToken()
  if(token)return<ClientPortal token={token}/>
  return<StudioOS/>
}

function StudioOS(){
  const{setMobileSidebar,mobileSidebarOpen,theme,setTheme,notifications,loadAll,loading,error}=useStore()
  const[notifOpen,setNotifOpen]=useState(false)
  const[loadSlow,setLoadSlow]=useState(false)
  const unread=notifications.filter(n=>!n.read).length

  // Apply theme on mount and when it changes
  useEffect(()=>{
    document.documentElement.setAttribute('data-theme',theme||'light')
  },[theme])

  // Load all data ONCE on mount
  useEffect(()=>{
    loadAll()
  },[]) // eslint-disable-line

  // Show slow-load hint after 6 seconds
  useEffect(()=>{
    if(!loading){ setLoadSlow(false); return }
    const t=setTimeout(()=>setLoadSlow(true),6000)
    return()=>clearTimeout(t)
  },[loading])

  // ── LOADING SCREEN ────────────────────────────────────────
  if(loading) return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',flexDirection:'column',gap:16,padding:24}}>
      <style>{`@keyframes lb{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}`}</style>
      <div style={{fontFamily:'var(--syne)',fontSize:20,fontWeight:800,color:'var(--text)'}}>Unsorted<span style={{color:'var(--text3)'}}>.</span></div>
      <div style={{fontSize:13,color:'var(--text3)'}}>Loading workspace…</div>
      <div style={{width:44,height:3,borderRadius:2,background:'var(--border)',overflow:'hidden',position:'relative'}}>
        <div style={{position:'absolute',top:0,left:0,width:'50%',height:'100%',background:'var(--text)',borderRadius:2,animation:'lb 1.1s ease-in-out infinite'}}/>
      </div>
      {loadSlow&&(
        <div style={{maxWidth:420,marginTop:8,padding:'16px 20px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,textAlign:'center'}}>
          <div style={{fontSize:13,fontWeight:500,color:'var(--text)',marginBottom:8}}>Taking too long…</div>
          <div style={{fontSize:12,color:'var(--text2)',lineHeight:1.8,marginBottom:10}}>
            Your <code style={{background:'var(--surface2)',padding:'1px 5px',borderRadius:4,fontSize:11}}>.env</code> file may be missing or have wrong values. It must be inside the <code style={{background:'var(--surface2)',padding:'1px 5px',borderRadius:4,fontSize:11}}>studio-os</code> folder and contain:
          </div>
          <code style={{display:'block',background:'var(--surface2)',padding:'8px 12px',borderRadius:8,fontSize:11,textAlign:'left',lineHeight:1.8,marginBottom:12}}>
            VITE_SUPABASE_URL=https://xxxx.supabase.co{'\n'}
            VITE_SUPABASE_ANON_KEY=eyJ...
          </code>
          <div style={{fontSize:11,color:'var(--text3)',marginBottom:12}}>After editing .env → press <strong>Ctrl+C</strong> to stop → run <code style={{background:'var(--surface2)',padding:'1px 4px',borderRadius:3}}>npm run dev</code> again</div>
          <button onClick={()=>loadAll()} style={{padding:'7px 18px',borderRadius:8,border:'1px solid var(--border)',background:'var(--surface2)',cursor:'pointer',fontSize:12,color:'var(--text)'}}>Retry now</button>
        </div>
      )}
    </div>
  )

  // ── ERROR SCREEN ──────────────────────────────────────────
  if(error) return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',flexDirection:'column',gap:12,padding:24,textAlign:'center'}}>
      <div style={{fontSize:32}}>⚠️</div>
      <div style={{fontFamily:'var(--syne)',fontSize:18,fontWeight:700,color:'var(--red)'}}>Cannot connect to Supabase</div>
      <p style={{fontSize:13,color:'var(--text2)',maxWidth:400,lineHeight:1.7}}>Check your <code>.env</code> file has the correct credentials.</p>
      <code style={{fontSize:11,color:'var(--text3)',background:'var(--surface2)',padding:'10px 14px',borderRadius:8,border:'1px solid var(--border)',maxWidth:440,wordBreak:'break-all',textAlign:'left',display:'block'}}>{error}</code>
      <button onClick={()=>loadAll()} style={{marginTop:4,padding:'8px 18px',borderRadius:8,border:'1px solid var(--border)',background:'var(--surface)',cursor:'pointer',fontSize:13,color:'var(--text)'}}>Retry</button>
    </div>
  )

  // ── MAIN APP ──────────────────────────────────────────────
  return(
    <div style={{display:'flex',minHeight:'100vh',background:'var(--bg)'}}>
      <Sidebar/>
      <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column'}}>
        <header style={{height:52,background:'var(--surface)',borderBottom:'1px solid var(--border)',position:'sticky',top:0,zIndex:100,flexShrink:0,display:'flex',alignItems:'center',padding:'0 16px',gap:10}}>
          <button onClick={()=>setMobileSidebar(!mobileSidebarOpen)} className="mobile-show" style={{background:'none',border:'none',cursor:'pointer',color:'var(--text)',display:'none',alignItems:'center',padding:4,marginRight:4}}><Menu size={20}/></button>
          <span className="mobile-show" style={{fontFamily:'var(--syne)',fontSize:15,fontWeight:700,display:'none',color:'var(--text)'}}>Studio OS</span>
          <span className="desktop-show" style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--text3)',letterSpacing:'.06em'}}>v2.0</span>
          <div style={{flex:1}}/>
          <button onClick={()=>setTheme(theme==='light'?'dark':'light')} style={{width:34,height:34,borderRadius:'var(--r-sm)',border:'1px solid var(--border)',background:'var(--surface2)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text2)',transition:'all .15s',flexShrink:0}}>
            {theme==='light'?<Moon size={15}/>:<Sun size={15}/>}
          </button>
          <button onClick={()=>setNotifOpen(p=>!p)} style={{width:34,height:34,borderRadius:'var(--r-sm)',border:'1px solid var(--border)',background:'var(--surface2)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text2)',position:'relative',flexShrink:0}}>
            <Bell size={15}/>
            {unread>0&&<span style={{position:'absolute',top:7,right:7,width:7,height:7,borderRadius:'50%',background:'var(--red)',border:'1.5px solid var(--surface)'}}/>}
          </button>
        </header>
        <main style={{flex:1,overflowY:'auto'}}>
          <ErrorBoundary>
            <Page/>
          </ErrorBoundary>
        </main>
      </div>
      <NotifPanel open={notifOpen} onClose={()=>setNotifOpen(false)}/>
      <style>{`
        @media(max-width:768px){.mobile-show{display:flex!important}.desktop-show{display:none!important}}
        @media(max-width:600px){.r2{grid-template-columns:1fr!important}.r3{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  )
}
