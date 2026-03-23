import { useStore } from '../store/index.js'
import { LayoutDashboard,Users,FolderKanban,CheckSquare,FileText,Calendar,Receipt,Settings,X,Plus,BarChart2,Megaphone,TrendingUp } from 'lucide-react'

const NAV=[
  {key:'dashboard',label:'Dashboard',icon:LayoutDashboard},
  {key:'clients',label:'Clients',icon:Users},
  {key:'projects',label:'Projects',icon:FolderKanban},
  {key:'pipeline',label:'Pipeline',icon:TrendingUp},
  {key:'tasks',label:'Tasks',icon:CheckSquare},
  {key:'files',label:'Files',icon:FileText},
  {key:'calendar',label:'Content Cal.',icon:Calendar},
  {key:'meetings',label:'Meetings',icon:Megaphone},
  {key:'invoices',label:'Invoices',icon:Receipt},
  {key:'metrics',label:'Metrics',icon:BarChart2},
]

function NavItem({item,active,onClick}){
  const Icon=item.icon
  return(
    <button onClick={onClick} style={{display:'flex',alignItems:'center',gap:9,padding:'8px 12px',borderRadius:'var(--r-sm)',border:'none',cursor:'pointer',width:'100%',textAlign:'left',background:active?'var(--surface2)':'transparent',color:active?'var(--text)':'var(--text2)',fontWeight:active?500:400,fontSize:13,transition:'all .12s',borderLeft:`2px solid ${active?'var(--text)':'transparent'}`}}
      onMouseEnter={e=>{if(!active)e.currentTarget.style.background='var(--surface2)'}}
      onMouseLeave={e=>{if(!active)e.currentTarget.style.background='transparent'}}>
      <Icon size={15} style={{flexShrink:0,opacity:active?1:.7}}/>{item.label}
    </button>
  )
}

export default function Sidebar(){
  const{currentView,setView,mobileSidebarOpen,setMobileSidebar,clients,setActiveClient}=useStore()
  const content=(
    <div style={{height:'100%',display:'flex',flexDirection:'column',padding:'0 10px 16px'}}>
      <div style={{padding:'18px 4px 16px',borderBottom:'1px solid var(--border)',marginBottom:10}}>
        <div style={{fontFamily:'var(--syne)',fontSize:18,fontWeight:800,letterSpacing:'-.01em'}}>Unsorted<span style={{color:'var(--text3)'}}>.</span></div>
        <div style={{fontSize:10,color:'var(--text3)',fontFamily:'var(--mono)',marginTop:2,letterSpacing:'.06em'}}>STUDIO OS v2.0</div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:1,flex:1,overflowY:'auto'}}>
        <div style={{fontSize:10,fontFamily:'var(--mono)',color:'var(--text3)',letterSpacing:'.08em',textTransform:'uppercase',padding:'4px 12px 6px'}}>Workspace</div>
        {NAV.map(item=><NavItem key={item.key} item={item} active={currentView===item.key} onClick={()=>{setView(item.key);setMobileSidebar(false)}}/>)}
        {clients.length>0&&<>
          <div style={{fontSize:10,fontFamily:'var(--mono)',color:'var(--text3)',letterSpacing:'.08em',textTransform:'uppercase',padding:'12px 12px 6px'}}>Clients</div>
          {clients.slice(0,5).map(c=>(
            <button key={c.id} onClick={()=>{setView('clients');setActiveClient(c.id);setMobileSidebar(false)}} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 12px',borderRadius:'var(--r-sm)',border:'none',cursor:'pointer',width:'100%',textAlign:'left',background:'transparent',color:'var(--text2)',fontSize:12,transition:'background .12s'}}
              onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={{width:18,height:18,borderRadius:'50%',background:c.color,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:700,color:'#fff',fontFamily:'var(--syne)',overflow:'hidden'}}>
                {c.photo?<img src={c.photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:c.avatar}
              </div>
              <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.brand}</span>
            </button>
          ))}
        </>}
      </div>
      <div style={{borderTop:'1px solid var(--border)',paddingTop:10}}>
        <NavItem item={{key:'settings',label:'Settings',icon:Settings}} active={currentView==='settings'} onClick={()=>{setView('settings');setMobileSidebar(false)}}/>
      </div>
    </div>
  )
  return(
    <>
      <aside style={{width:210,flexShrink:0,height:'100vh',position:'sticky',top:0,background:'var(--surface)',borderRight:'1px solid var(--border)',overflowY:'auto'}} className="sidebar-desktop">{content}</aside>
      {mobileSidebarOpen&&(
        <div onClick={()=>setMobileSidebar(false)} style={{position:'fixed',inset:0,zIndex:500,background:'var(--overlay)',backdropFilter:'blur(2px)'}}>
          <div onClick={e=>e.stopPropagation()} style={{position:'absolute',left:0,top:0,bottom:0,width:230,background:'var(--surface)',borderRight:'1px solid var(--border)',overflowY:'auto'}}>
            <button onClick={()=>setMobileSidebar(false)} style={{position:'absolute',top:14,right:14,background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:8,width:28,height:28,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text2)'}}><X size={13}/></button>
            {content}
          </div>
        </div>
      )}
      <style>{`@media(max-width:768px){.sidebar-desktop{display:none!important}}`}</style>
    </>
  )
}
