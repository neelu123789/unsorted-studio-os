import{useStore}from'../store/index.js'
import{X,CheckCheck,Trash2,Bell,AlertTriangle,Info,CheckCircle}from'lucide-react'
import{formatDistanceToNow,parseISO}from'date-fns'
const IC={success:<CheckCircle size={13} style={{color:'var(--lime)'}}/>,warning:<AlertTriangle size={13} style={{color:'var(--orange)'}}/>,info:<Info size={13} style={{color:'var(--blue)'}}/>,error:<X size={13} style={{color:'var(--red)'}}/>}
export default function NotifPanel({open,onClose}){
  const{notifications,markAllRead,clearNotifications}=useStore()
  if(!open)return null
  return(
    <>
      <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:400}}/>
      <div style={{position:'fixed',top:58,right:14,width:310,background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r-lg)',boxShadow:'var(--shadow-lg)',zIndex:500,overflow:'hidden',maxHeight:'72vh',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <Bell size={14} style={{color:'var(--text2)'}}/>
            <span style={{fontSize:13,fontWeight:600,fontFamily:'var(--syne)'}}>Notifications</span>
            {notifications.filter(n=>!n.read).length>0&&<span style={{fontSize:10,background:'var(--red)',color:'#fff',padding:'1px 6px',borderRadius:10,fontFamily:'var(--mono)'}}>{notifications.filter(n=>!n.read).length}</span>}
          </div>
          <div style={{display:'flex',gap:4}}>
            <button onClick={markAllRead} title="Mark all read" style={{background:'none',border:'none',cursor:'pointer',color:'var(--text3)',display:'flex',padding:4}}><CheckCheck size={13}/></button>
            <button onClick={clearNotifications} title="Clear all" style={{background:'none',border:'none',cursor:'pointer',color:'var(--text3)',display:'flex',padding:4}}><Trash2 size={13}/></button>
          </div>
        </div>
        <div style={{overflowY:'auto',flex:1}}>
          {notifications.length===0?<div style={{padding:'32px 20px',textAlign:'center',color:'var(--text3)',fontSize:13}}><Bell size={22} style={{marginBottom:8,opacity:.3,display:'block',margin:'0 auto 8px'}}/> No notifications</div>:
            notifications.map(n=>(
              <div key={n.id} style={{padding:'11px 16px',borderBottom:'1px solid var(--border)',background:n.read?'transparent':'var(--surface2)'}}>
                <div style={{display:'flex',gap:9,alignItems:'flex-start'}}>
                  <div style={{marginTop:2,flexShrink:0}}>{IC[n.type]||IC.info}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:n.read?400:500,color:'var(--text)',marginBottom:2}}>{n.title}</div>
                    {n.body&&<div style={{fontSize:11,color:'var(--text3)',lineHeight:1.5}}>{n.body}</div>}
                    <div style={{fontSize:10,color:'var(--text3)',marginTop:3,fontFamily:'var(--mono)'}}>{n.time?formatDistanceToNow(parseISO(n.time),{addSuffix:true}):'just now'}</div>
                  </div>
                  {!n.read&&<div style={{width:6,height:6,borderRadius:'50%',background:'var(--blue)',flexShrink:0,marginTop:4}}/>}
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  )
}
