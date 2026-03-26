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
import Auth,{getCurrentUser,setCurrentUser}from'./pages/Auth.jsx'
import NotifPanel from'./components/NotifPanel.jsx'
import ErrorBoundary from'./components/ErrorBoundary.jsx'
import{Menu,Sun,Moon,Bell}from'lucide-react'

const getToken=()=>new URLSearchParams(window.location.search).get('portal')

export default function App(){
  const token=getToken()
  if(token)return<ClientPortal token={token}/>
  return<AuthWrapper/>
}

function AuthWrapper(){
  const[user,setUser]=useState(()=>getCurrentUser())
  if(!user)return<Auth onLogin={u=>{setCurrentUser(u);setUser(u)}}/>
  return<StudioOS user={user} onLogout={()=>{setCurrentUser(null);setUser(null)}}/>
}

function StudioOS({user,onLogout}){
  const{currentView,setMobileSidebar,mobileSidebarOpen,theme,setTheme,notifications,loadAll,loading,error}=useStore()
  const[notifOpen,setNotifOpen]=useState(false)
  const[loadSlow,setLoadSlow]=useState(false)
  const unread=notifications.filter(n=>!n.read).length

  useEffect(()=>{document.documentElement.setAttribute('data-theme',theme||'light')},[theme])
  useEffect(()=>{ loadAll() },[])
  useEffect(()=>{
    if(!loading)return
    const t=setTimeout(()=>setLoadSlow(true),5000)
    return()=>clearTimeout(t)
  },[loading])

  if(loading)return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',flexDirection:'column',gap:16,padding:24}}>
      <div style={{fontFamily:'var(--syne)',fontSize:20,fontWeight:800}}>Unsorted<span style={{color:'var(--text3)'}}>.</span></div>
      <div style={{fontSize:13,color:'var(--text3)'}}>Loading workspace…</div>
      <div style={{width:44,height:3,borderRadius:2,background:'var(--border)',overflow:'hidden',position:'relative'}}>
        <div style={{position:'absolute',top:0,left:0,width:'50%',height:'100%',background:'var(--text)',borderRadius:2,animation:'lb 1.1s ease-in-out infinite'}}/>
      </div>
      {loadSlow&&<div style={{maxWidth:380,textAlign:'center',padding:'14px 18px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,marginTop:8}}>
        <div style={{fontSize:13,fontWeight:500,marginBottom:6}}>Taking longer than expected…</div>
        <div style={{fontSize:12,color:'var(--text2)',lineHeight:1.7}}>Check your <code style={{background:'var(--surface2)',padding:'1px 4px',borderRadius:3,fontSize:11}}>.env</code> file has correct Supabase credentials, then restart <code style={{background:'var(--surface2)',padding:'1px 4px',borderRadius:3,fontSize:11}}>npm run dev</code>.</div>
        <button onClick={()=>loadAll()} style={{marginTop:10,padding:'6px 16px',borderRadius:7,border:'1px solid var(--border)',background:'var(--surface2)',cursor:'pointer',fontSize:12}}>Retry</button>
      </div>}
      <style>{`[data-theme]{background:var(--bg)}@keyframes lb{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}`}</style>
    </div>
  )

  if(error)return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',flexDirection:'column',gap:12,padding:24,textAlign:'center'}}>
      <div style={{fontSize:32}}>⚠️</div>
      <div style={{fontFamily:'var(--syne)',fontSize:18,fontWeight:700,color:'var(--red)'}}>Cannot connect to Supabase</div>
      <div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--text3)',background:'var(--surface2)',padding:'10px 14px',borderRadius:8,border:'1px solid var(--border)',maxWidth:440,wordBreak:'break-all',textAlign:'left'}}>{error}</div>
      <button onClick={()=>loadAll()} style={{padding:'8px 18px',borderRadius:8,border:'1px solid var(--border)',background:'var(--surface)',cursor:'pointer',fontSize:13}}>Retry</button>
    </div>
  )

  const TITLES={dashboard:'Dashboard',clients:'Clients',projects:'Projects',pipeline:'Pipeline',tasks:'Tasks',files:'Files',calendar:'Content',meetings:'Meetings',invoices:'Invoices',metrics:'Metrics',settings:'Settings'}

  const Page=()=>{
    switch(currentView){
      case'dashboard':return<Dashboard/>
      case'clients':return<Clients/>
      case'projects':return<Projects/>
      case'pipeline':return<Pipeline/>
      case'tasks':return<Tasks/>
      case'files':return<Files/>
      case'calendar':return<ContentCalendar/>
      case'meetings':return<Meetings/>
      case'invoices':return<Invoices/>
      case'metrics':return<MetricsPage/>
      case'settings':return<Settings onLogout={onLogout}/>
      default:return<Dashboard/>
    }
  }

  return(
    <div style={{display:'flex',minHeight:'100vh',background:'var(--bg)'}}>
      <Sidebar user={user}/>
      <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column'}}>
        <header style={{height:52,background:'var(--surface)',borderBottom:'1px solid var(--border)',position:'sticky',top:0,zIndex:100,flexShrink:0,display:'flex',alignItems:'center',padding:'0 16px',gap:10}}>
          <button onClick={()=>setMobileSidebar(!mobileSidebarOpen)} className="mobile-show" style={{background:'none',border:'none',cursor:'pointer',color:'var(--text)',display:'none',alignItems:'center',padding:4}}><Menu size={20}/></button>
          <span className="mobile-show" style={{fontFamily:'var(--syne)',fontSize:15,fontWeight:700,display:'none'}}>{TITLES[currentView]||'Studio OS'}</span>
          {/* User badge — desktop */}
          <div className="desktop-show" style={{display:'flex',alignItems:'center',gap:7}}>
            <div style={{width:22,height:22,borderRadius:'50%',background:user?.color||'var(--lime)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:'#fff',fontFamily:'var(--syne)'}}>{user?.name?.charAt(0)}</div>
            <span style={{fontSize:12,color:'var(--text2)',fontWeight:500}}>{user?.name}</span>
          </div>
          <div style={{flex:1}}/>
          {/* Theme toggle */}
          <button onClick={()=>{const n=theme==='light'?'dark':'light';setTheme(n)}} style={{width:34,height:34,borderRadius:'var(--r-sm)',border:'1px solid var(--border)',background:'var(--surface2)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text2)',flexShrink:0}}>
            {theme==='light'?<Moon size={15}/>:<Sun size={15}/>}
          </button>
          {/* Notifications */}
          <button onClick={()=>setNotifOpen(p=>!p)} style={{width:34,height:34,borderRadius:'var(--r-sm)',border:'1px solid var(--border)',background:'var(--surface2)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text2)',position:'relative',flexShrink:0}}>
            <Bell size={15}/>
            {unread>0&&<span style={{position:'absolute',top:7,right:7,width:7,height:7,borderRadius:'50%',background:'var(--red)',border:'1.5px solid var(--surface)'}}/>}
          </button>
        </header>
        <main style={{flex:1,overflowY:'auto'}}><ErrorBoundary><Page/></ErrorBoundary></main>
      </div>
      <NotifPanel open={notifOpen} onClose={()=>setNotifOpen(false)}/>
      <style>{`
        @media(max-width:768px){.mobile-show{display:flex!important}.desktop-show{display:none!important}}
        @media(max-width:600px){.r2{grid-template-columns:1fr!important}.r3{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  )
}
