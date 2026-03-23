import { useState, useRef, useEffect } from 'react'
import { X, Check, Camera, Upload } from 'lucide-react'

/* ── AVATAR (with upload/delete) ── */
export function Avatar({ name, color, size=32, photo, editable, onPhotoChange, onPhotoDelete }) {
  const ref = useRef()
  const initials = (name||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
  const handleFile = e => {
    const file = e.target.files?.[0]; if (!file) return
    const r = new FileReader(); r.onload = ev => onPhotoChange?.(ev.target.result); r.readAsDataURL(file)
  }
  return (
    <div style={{position:'relative',display:'inline-flex',flexShrink:0}}>
      <div style={{width:size,height:size,borderRadius:'50%',background:photo?'transparent':(color||'var(--lime)'),color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.35,fontWeight:700,fontFamily:'var(--syne)',overflow:'hidden',flexShrink:0,border:photo?'2px solid var(--border)':'none'}}>
        {photo?<img src={photo} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:initials}
      </div>
      {editable&&<>
        <button onClick={()=>ref.current?.click()} title="Upload photo" style={{position:'absolute',bottom:-2,right:photo?16:-2,width:Math.max(18,size*.34),height:Math.max(18,size*.34),borderRadius:'50%',background:'var(--text)',border:'2px solid var(--surface)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--bg)'}}>
          <Camera size={Math.max(9,size*.16)}/>
        </button>
        {photo&&<button onClick={onPhotoDelete} title="Remove photo" style={{position:'absolute',bottom:-2,right:-2,width:Math.max(16,size*.3),height:Math.max(16,size*.3),borderRadius:'50%',background:'var(--red)',border:'2px solid var(--surface)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#fff'}}>
          <X size={Math.max(8,size*.14)}/>
        </button>}
        <input ref={ref} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile}/>
      </>}
    </div>
  )
}

/* ── BADGE ── */
const BS={
  active:{bg:'var(--lime-bg)',c:'#1A6B0A',b:'var(--lime-border)'},
  done:{bg:'var(--lime-bg)',c:'#1A6B0A',b:'var(--lime-border)'},
  paid:{bg:'var(--lime-bg)',c:'#1A6B0A',b:'var(--lime-border)'},
  signed:{bg:'var(--lime-bg)',c:'#1A6B0A',b:'var(--lime-border)'},
  'in-progress':{bg:'var(--blue-bg)',c:'var(--blue)',b:'var(--blue-border)'},
  discovery:{bg:'var(--blue-bg)',c:'var(--blue)',b:'var(--blue-border)'},
  client:{bg:'var(--teal-bg)',c:'var(--teal)',b:'var(--teal-border)'},
  pending:{bg:'var(--orange-bg)',c:'var(--orange)',b:'var(--orange-border)'},
  proposal:{bg:'var(--orange-bg)',c:'var(--orange)',b:'var(--orange-border)'},
  invoice:{bg:'var(--orange-bg)',c:'var(--orange)',b:'var(--orange-border)'},
  'awaiting signature':{bg:'var(--orange-bg)',c:'var(--orange)',b:'var(--orange-border)'},
  overdue:{bg:'var(--red-bg)',c:'var(--red)',b:'var(--red-border)'},
  contract:{bg:'var(--red-bg)',c:'var(--red)',b:'var(--red-border)'},
  'not-started':{bg:'var(--surface2)',c:'var(--text2)',b:'var(--border)'},
  inactive:{bg:'var(--surface2)',c:'var(--text3)',b:'var(--border)'},
  general:{bg:'var(--surface2)',c:'var(--text3)',b:'var(--border)'},
  high:{bg:'var(--red-bg)',c:'var(--red)',b:'var(--red-border)'},
  med:{bg:'var(--orange-bg)',c:'var(--orange)',b:'var(--orange-border)'},
  low:{bg:'var(--surface2)',c:'var(--text3)',b:'var(--border)'},
  D2C:{bg:'var(--purple-bg)',c:'var(--purple)',b:'var(--purple-border)'},
  SaaS:{bg:'var(--blue-bg)',c:'var(--blue)',b:'var(--blue-border)'},
  Startup:{bg:'var(--teal-bg)',c:'var(--teal)',b:'var(--teal-border)'},
  Other:{bg:'var(--surface2)',c:'var(--text2)',b:'var(--border)'},
  design:{bg:'var(--purple-bg)',c:'var(--purple)',b:'var(--purple-border)'},
  strategy:{bg:'var(--blue-bg)',c:'var(--blue)',b:'var(--blue-border)'},
}
export function Badge({label,type}){
  const s=BS[type||label]||BS.inactive
  return <span style={{display:'inline-flex',alignItems:'center',padding:'2px 8px',borderRadius:20,background:s.bg,color:s.c,border:`1px solid ${s.b}`,fontSize:11,fontWeight:500,whiteSpace:'nowrap',textTransform:'capitalize'}}>{(label||type||'').replace(/-/g,' ')}</span>
}

/* ── BUTTON ── */
export function Btn({children,onClick,variant='primary',size='md',disabled,style:sx,type='button'}){
  const[h,setH]=useState(false)
  const base={display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6,borderRadius:'var(--r-sm)',fontFamily:'var(--body)',fontWeight:500,cursor:disabled?'not-allowed':'pointer',border:'1px solid transparent',transition:'all .15s',opacity:disabled?.5:1,whiteSpace:'nowrap',flexShrink:0}
  const sz={sm:{padding:'4px 10px',fontSize:12},md:{padding:'8px 14px',fontSize:13},lg:{padding:'10px 20px',fontSize:14}}
  const vr={
    primary:{background:h?'var(--text2)':'var(--text)',color:'var(--bg)',borderColor:'var(--text)'},
    secondary:{background:h?'var(--surface3)':'var(--surface2)',color:'var(--text)',borderColor:'var(--border2)'},
    ghost:{background:h?'var(--surface2)':'transparent',color:'var(--text2)',borderColor:'transparent'},
    danger:{background:h?'var(--red-bg)':'transparent',color:'var(--red)',borderColor:'var(--red-border)'},
    lime:{background:h?'#4a9e2c':'var(--lime)',color:'#fff',borderColor:'var(--lime)'},
  }
  return <button type={type} onClick={onClick} disabled={disabled} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{...base,...sz[size],...vr[variant],...sx}}>{children}</button>
}

/* ── CARD ── */
export function Card({children,style,onClick}){
  const[h,setH]=useState(false)
  return <div onClick={onClick} onMouseEnter={()=>onClick&&setH(true)} onMouseLeave={()=>setH(false)} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'16px 18px',boxShadow:h?'var(--shadow-md)':'var(--shadow)',cursor:onClick?'pointer':'default',transition:'all .15s',transform:h?'translateY(-1px)':'none',...style}}>{children}</div>
}

/* ── INPUTS ── */
export function Input({label,error,hint,...p}){
  return(
    <div style={{display:'flex',flexDirection:'column',gap:4}}>
      {label&&<label style={{fontSize:12,fontWeight:500,color:'var(--text2)'}}>{label}</label>}
      <input {...p} style={{padding:'8px 11px',borderRadius:'var(--r-sm)',border:`1px solid ${error?'var(--red)':'var(--border2)'}`,background:'var(--surface)',color:'var(--text)',fontSize:13,outline:'none',width:'100%',transition:'border-color .15s,box-shadow .15s',...p.style}}
        onFocus={e=>{e.target.style.borderColor='var(--blue)';e.target.style.boxShadow='0 0 0 3px var(--blue-bg)'}}
        onBlur={e=>{e.target.style.borderColor=error?'var(--red)':'var(--border2)';e.target.style.boxShadow='none'}}/>
      {hint&&!error&&<span style={{fontSize:11,color:'var(--text3)'}}>{hint}</span>}
      {error&&<span style={{fontSize:11,color:'var(--red)'}}>{error}</span>}
    </div>
  )
}
export function Select({label,...p}){
  return(
    <div style={{display:'flex',flexDirection:'column',gap:4}}>
      {label&&<label style={{fontSize:12,fontWeight:500,color:'var(--text2)'}}>{label}</label>}
      <select {...p} style={{padding:'8px 11px',borderRadius:'var(--r-sm)',border:'1px solid var(--border2)',background:'var(--surface)',color:'var(--text)',fontSize:13,outline:'none',cursor:'pointer',...p.style}}>
        {p.options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
export function Textarea({label,rows=3,...p}){
  return(
    <div style={{display:'flex',flexDirection:'column',gap:4}}>
      {label&&<label style={{fontSize:12,fontWeight:500,color:'var(--text2)'}}>{label}</label>}
      <textarea rows={rows} {...p} style={{padding:'8px 11px',borderRadius:'var(--r-sm)',border:'1px solid var(--border2)',background:'var(--surface)',color:'var(--text)',fontSize:13,outline:'none',resize:'vertical',fontFamily:'var(--body)',lineHeight:1.6,...p.style}}/>
    </div>
  )
}

/* ── MODAL ── */
export function Modal({open,onClose,title,children,width=520}){
  useEffect(()=>{
    if(!open)return
    const h=e=>{if(e.key==='Escape')onClose()}
    window.addEventListener('keydown',h); return()=>window.removeEventListener('keydown',h)
  },[open,onClose])
  if(!open)return null
  return(
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:1000,background:'var(--overlay)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',padding:16,overflowY:'auto'}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'var(--surface)',borderRadius:'var(--r-lg)',border:'1px solid var(--border)',boxShadow:'var(--shadow-lg)',width:'100%',maxWidth:width,display:'flex',flexDirection:'column',overflow:'hidden',maxHeight:'92vh',margin:'auto',animation:'fadeUp .2s ease'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <span style={{fontSize:15,fontWeight:600,fontFamily:'var(--syne)'}}>{title}</span>
          <button onClick={onClose} style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:8,width:28,height:28,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text2)'}}><X size={14}/></button>
        </div>
        <div style={{padding:'18px 20px',overflowY:'auto'}}>{children}</div>
      </div>
    </div>
  )
}

/* ── MISC ── */
export function SectionHeader({title,sub,action}){
  return(
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20,gap:12,flexWrap:'wrap'}}>
      <div><h2 style={{fontSize:20,fontWeight:700,fontFamily:'var(--syne)',letterSpacing:'-.01em'}}>{title}</h2>{sub&&<p style={{fontSize:13,color:'var(--text3)',marginTop:3}}>{sub}</p>}</div>
      {action}
    </div>
  )
}
export function StatCard({label,value,sub,color='var(--text)'}){
  return(
    <Card style={{padding:'14px 16px'}}>
      <div style={{fontSize:10,fontFamily:'var(--mono)',color:'var(--text3)',letterSpacing:'.07em',textTransform:'uppercase',marginBottom:6}}>{label}</div>
      <div style={{fontSize:24,fontWeight:700,fontFamily:'var(--syne)',color,lineHeight:1}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:'var(--text3)',marginTop:5,lineHeight:1.5}}>{sub}</div>}
    </Card>
  )
}
export function ProgressBar({value,color='var(--lime)',height=6,label}){
  return(
    <div>
      {label&&<div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--text3)',marginBottom:4}}><span>{label}</span><span>{value}%</span></div>}
      <div style={{height,background:'var(--surface3)',borderRadius:99,overflow:'hidden'}}>
        <div style={{height:'100%',width:`${Math.min(100,Math.max(0,value))}%`,background:color,borderRadius:99,transition:'width .4s ease'}}/>
      </div>
    </div>
  )
}
export function Tabs({tabs,active,onChange}){
  return(
    <div style={{display:'flex',gap:2,background:'var(--surface2)',borderRadius:'var(--r-sm)',padding:3,flexWrap:'wrap',border:'1px solid var(--border)'}}>
      {tabs.map(t=>(
        <button key={t.key} onClick={()=>onChange(t.key)} style={{padding:'6px 12px',borderRadius:6,border:'none',cursor:'pointer',background:active===t.key?'var(--surface)':'transparent',color:active===t.key?'var(--text)':'var(--text3)',fontWeight:active===t.key?500:400,fontSize:12,boxShadow:active===t.key?'var(--shadow)':'none',transition:'all .15s',whiteSpace:'nowrap',fontFamily:'var(--body)'}}>{t.label}</button>
      ))}
    </div>
  )
}
export function FileDropZone({onFiles,label='Drop files or click to upload',sub='Any file type'}){
  const[drag,setDrag]=useState(false)
  const ref=useRef()
  const handle=files=>{
    if(!files?.length)return
    Array.from(files).forEach(file=>{
      const r=new FileReader(); r.onload=e=>onFiles({name:file.name,size:fmt(file.size),type:ftype(file.name),dataUrl:e.target.result}); r.readAsDataURL(file)
    })
  }
  return(
    <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);handle(e.dataTransfer.files)}} onClick={()=>ref.current?.click()} style={{border:`2px dashed ${drag?'var(--blue)':'var(--border2)'}`,borderRadius:'var(--r)',padding:'28px 20px',textAlign:'center',cursor:'pointer',background:drag?'var(--blue-bg)':'transparent',transition:'all .15s'}}>
      <Upload size={22} style={{color:'var(--text3)',marginBottom:8}}/>
      <div style={{fontSize:13,color:'var(--text2)',fontWeight:500}}>{label}</div>
      <div style={{fontSize:11,color:'var(--text3)',marginTop:3}}>{sub}</div>
      <input ref={ref} type="file" multiple style={{display:'none'}} onChange={e=>handle(e.target.files)}/>
    </div>
  )
}
export function Empty({icon,title,sub,action}){
  return(
    <div style={{textAlign:'center',padding:'48px 24px',color:'var(--text3)'}}>
      <div style={{fontSize:36,marginBottom:12}}>{icon}</div>
      <div style={{fontSize:14,fontWeight:500,color:'var(--text2)',marginBottom:6}}>{title}</div>
      <div style={{fontSize:13,marginBottom:action?16:0,lineHeight:1.6}}>{sub}</div>
      {action}
    </div>
  )
}
export function useToast(){
  const[ts,setTs]=useState([])
  const show=(msg,type='success')=>{const id=Date.now();setTs(t=>[...t,{id,msg,type}]);setTimeout(()=>setTs(t=>t.filter(x=>x.id!==id)),3500)}
  const Toast=()=>(
    <div style={{position:'fixed',bottom:24,right:24,zIndex:9999,display:'flex',flexDirection:'column',gap:8,pointerEvents:'none'}}>
      {ts.map(t=>(
        <div key={t.id} style={{background:t.type==='success'?'var(--text)':t.type==='error'?'var(--red)':'var(--orange)',color:t.type==='success'?'var(--bg)':'#fff',padding:'10px 16px',borderRadius:'var(--r-sm)',fontSize:13,fontWeight:500,boxShadow:'var(--shadow-md)',display:'flex',alignItems:'center',gap:8,animation:'toastIn .2s ease'}}>
          {t.type==='success'?<Check size={14}/>:<X size={14}/>}{t.msg}
        </div>
      ))}
    </div>
  )
  return{show,Toast}
}
const fmt=b=>b<1024?b+' B':b<1048576?(b/1024).toFixed(1)+' KB':(b/1048576).toFixed(1)+' MB'
const ftype=n=>{const e=n.split('.').pop().toLowerCase();if(e==='pdf')return 'pdf';if(['png','jpg','jpeg','gif','webp','svg'].includes(e))return 'image';if(e==='fig')return 'figma';if(['zip','rar'].includes(e))return 'archive';if(['doc','docx'].includes(e))return 'doc';return 'file'}
export const FILE_ICONS={pdf:'📄',image:'🖼️',figma:'🎨',doc:'📝',archive:'📦',file:'📎'}
export const FILE_CATS=['design','strategy','contract','invoice','general']
