import{fmtINR}from'../lib/fmt.js'
import{useState}from'react'
import{useStore}from'../store/index.js'
import{FileDropZone,FILE_ICONS}from'../components/ui.jsx'
import{Download,Upload,CheckCircle,PenLine,Sun,Moon}from'lucide-react'

const CAT_TABS=[{k:'all',l:'All Files'},{k:'design',l:'Design'},{k:'strategy',l:'Strategy'},{k:'contract',l:'Contracts'},{k:'invoice',l:'Invoices'},{k:'general',l:'General'}]
const CAT_ICONS={design:'🎨',strategy:'📊',contract:'📝',invoice:'🧾',general:'📂'}

export default function ClientPortal({token}){
  const{clients,files,projects,invoices,clientUploadFile,theme,setTheme}=useStore()
  const client=clients.find(c=>c.portal_token===token)
  const[tab,setTab]=useState('all')
  const[uploadingFor,setUploadingFor]=useState(null)
  const[uploaded,setUploaded]=useState(new Set())

  // Apply theme
  const toggleTheme=()=>{
    const n=theme==='light'?'dark':'light'
    setTheme(n)
    document.documentElement.setAttribute('data-theme',n)
  }

  if(!client)return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',padding:24}}>
      <div style={{textAlign:'center',maxWidth:360}}>
        <div style={{fontSize:48,marginBottom:16}}>🔒</div>
        <div style={{fontFamily:'var(--syne)',fontSize:22,fontWeight:700,marginBottom:8}}>Invalid Portal Link</div>
        <p style={{color:'var(--text2)',fontSize:14,lineHeight:1.7}}>This link is invalid or expired. Contact your studio for a new link.</p>
      </div>
    </div>
  )

  // ④ All shared files visible — all categories
  const shared=files.filter(f=>f.clientId===client.id&&f.sharedWithClient)
  const tabFiles=shared.filter(f=>tab==='all'||f.category===tab)
  const cProjects=projects.filter(p=>p.clientId===client.id)
  const paidAmt=invoices.filter(i=>i.clientId===client.id&&i.status==='paid').reduce((a,i)=>a+parseInt(i.amount||0),0)
  const pendingAmt=invoices.filter(i=>i.clientId===client.id&&i.status!=='paid').reduce((a,i)=>a+parseInt(i.amount||0),0)
  const needsSig=shared.filter(f=>f.category==='contract'&&f.signatureRequired&&!f.signedBack&&!uploaded.has(f.id))

  const handleSignedUpload=(contractId,{name,size,type,dataUrl})=>{
    clientUploadFile({clientId:client.id,name:`SIGNED_${name}`,size,type,dataUrl,category:'contract'})
    setUploaded(s=>new Set([...s,contractId]))
    setUploadingFor(null)
  }

  return(
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>
      {/* Header */}
      <header style={{background:'var(--surface)',borderBottom:'1px solid var(--border)',padding:'0 24px',height:54,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:50}}>
        <div style={{fontFamily:'var(--syne)',fontSize:17,fontWeight:800}}>Unsorted<span style={{color:'var(--text3)'}}>.</span></div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          {/* ⑦ Theme toggle in portal too */}
          <button onClick={toggleTheme} style={{width:32,height:32,borderRadius:8,border:'1px solid var(--border)',background:'var(--surface2)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text2)'}}>
            {theme==='light'?<Moon size={14}/>:<Sun size={14}/>}
          </button>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            {client.photo?<img src={client.photo} alt="" style={{width:28,height:28,borderRadius:'50%',objectFit:'cover'}}/>:<div style={{width:28,height:28,borderRadius:'50%',background:client.color||'var(--lime)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff',fontFamily:'var(--syne)'}}>{client.avatar}</div>}
            <span style={{fontSize:13,fontWeight:500}}>{client.brand}</span>
          </div>
        </div>
      </header>

      <div style={{padding:'28px 20px 60px',maxWidth:960,margin:'0 auto'}}>
        <div style={{marginBottom:26}}>
          <h1 style={{fontFamily:'var(--syne)',fontSize:24,fontWeight:800,marginBottom:4}}>Welcome, {client.name.split(' ')[0]} 👋</h1>
          <p style={{color:'var(--text2)',fontSize:13}}>Your private project workspace for <strong>{client.brand}</strong></p>
        </div>

        {/* ③ Contracts needing signature */}
        {needsSig.length>0&&(
          <div style={{background:'var(--orange-bg)',border:'1px solid var(--orange-border)',borderRadius:'var(--r-sm)',padding:'14px 18px',marginBottom:22}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}><PenLine size={15} style={{color:'var(--orange)',flexShrink:0}}/><span style={{fontSize:13,fontWeight:600,color:'var(--orange)'}}>{needsSig.length} contract{needsSig.length>1?'s':''} need{needsSig.length===1?'s':''} your signature</span></div>
            <p style={{fontSize:12,color:'var(--orange)',lineHeight:1.6,marginBottom:8}}>Download the contract(s) below → sign them → upload signed copy using "Upload signed copy" button.</p>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{needsSig.map(c=><span key={c.id} style={{fontSize:11,padding:'2px 9px',borderRadius:10,background:'rgba(255,255,255,.4)',color:'var(--orange)',border:'1px solid var(--orange-border)'}}>{c.name}</span>)}</div>
          </div>
        )}

        {/* Projects */}
        {cProjects.length>0&&(
          <div style={{marginBottom:28}}>
            <h2 style={{fontFamily:'var(--syne)',fontSize:16,fontWeight:700,marginBottom:14}}>Your Projects</h2>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {cProjects.map(p=>(
                <div key={p.id} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'18px 20px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12,gap:12,flexWrap:'wrap'}}>
                    <div><div style={{fontSize:15,fontWeight:600,fontFamily:'var(--syne)'}}>{p.name}</div>{p.description&&<div style={{fontSize:12,color:'var(--text2)',marginTop:3,lineHeight:1.6}}>{p.description}</div>}</div>
                    <span style={{fontSize:11,padding:'2px 10px',borderRadius:20,background:'var(--surface2)',color:'var(--text2)',border:'1px solid var(--border)',textTransform:'capitalize',whiteSpace:'nowrap'}}>{(p.status||'').replace(/-/g,' ')}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--text3)',marginBottom:6}}><span>Progress</span><span style={{fontFamily:'var(--mono)'}}>{p.progress||0}%</span></div>
                  <div style={{height:8,background:'var(--surface3)',borderRadius:99,overflow:'hidden'}}><div style={{height:'100%',width:`${p.progress||0}%`,background:'var(--lime)',borderRadius:99,transition:'width .4s'}}/></div>
                  {(p.deliverables||[]).length>0&&(
                    <div style={{marginTop:14,display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:7}}>
                      {p.deliverables.map(d=>(
                        <div key={d.id} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 10px',borderRadius:7,background:d.status==='done'?'var(--lime-bg)':'var(--surface2)',border:`1px solid ${d.status==='done'?'var(--lime-border)':'var(--border)'}`}}>
                          <div style={{width:6,height:6,borderRadius:2,flexShrink:0,background:d.status==='done'?'var(--lime)':d.status==='in-progress'?'var(--blue)':'var(--text3)'}}/>
                          <span style={{fontSize:11,color:d.status==='done'?'#1A6B0A':'var(--text)'}}>{d.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ④ Files — all categories with tabs */}
        <div style={{marginBottom:28}}>
          <h2 style={{fontFamily:'var(--syne)',fontSize:16,fontWeight:700,marginBottom:14}}>Shared Files<span style={{fontWeight:400,color:'var(--text3)',fontSize:13,marginLeft:6}}>({shared.length})</span></h2>
          {/* Category filter tabs */}
          <div style={{display:'flex',gap:2,background:'var(--surface2)',borderRadius:'var(--r-sm)',padding:3,border:'1px solid var(--border)',marginBottom:16,flexWrap:'wrap'}}>
            {CAT_TABS.map(t=>{
              const cnt=t.k==='all'?shared.length:shared.filter(f=>f.category===t.k).length
              if(cnt===0&&t.k!=='all')return null
              return(<button key={t.k} onClick={()=>setTab(t.k)} style={{padding:'6px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,background:tab===t.k?'var(--surface)':'transparent',color:tab===t.k?'var(--text)':'var(--text3)',fontWeight:tab===t.k?500:400,transition:'all .12s',display:'flex',alignItems:'center',gap:4,whiteSpace:'nowrap'}}>
                {t.k!=='all'&&<span>{CAT_ICONS[t.k]}</span>}{t.l}{cnt>0&&t.k!=='all'&&<span style={{fontSize:10,fontFamily:'var(--mono)',background:tab===t.k?'var(--surface3)':'transparent',padding:'0 4px',borderRadius:8}}>{cnt}</span>}
              </button>)
            })}
          </div>
          {tabFiles.length===0?(
            <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'32px',textAlign:'center'}}>
              <div style={{fontSize:28,marginBottom:8}}>{CAT_ICONS[tab]||'📂'}</div>
              <div style={{fontSize:14,color:'var(--text2)',fontWeight:500}}>No {tab==='all'?'':tab+' '}files shared yet</div>
            </div>
          ):(
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(195px,1fr))',gap:12}}>
              {tabFiles.map(file=>{
                const needSig=file.category==='contract'&&file.signatureRequired&&!file.signedBack&&!uploaded.has(file.id)
                const isSigned=file.signedBack||uploaded.has(file.id)
                return(
                  <div key={file.id} style={{background:'var(--surface)',border:`1px solid ${needSig?'var(--orange-border)':isSigned?'var(--lime-border)':'var(--border)'}`,borderRadius:'var(--r)',padding:14}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><span style={{fontSize:26}}>{FILE_ICONS[file.type]||'📎'}</span><span style={{fontSize:10,padding:'2px 7px',borderRadius:10,background:'var(--surface2)',color:'var(--text3)',border:'1px solid var(--border)',textTransform:'capitalize'}}>{file.category}</span></div>
                    <div style={{fontSize:12,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:2}}>{file.name}</div>
                    <div style={{fontSize:11,color:'var(--text3)',marginBottom:10}}>{file.size}·{file.uploaded}</div>
                    {/* ③ Signature status */}
                    {file.category==='contract'&&file.signatureRequired&&(
                      <div style={{marginBottom:10}}>
                        {isSigned?<span style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:10,color:'#1A6B0A',background:'var(--lime-bg)',border:'1px solid var(--lime-border)',padding:'2px 8px',borderRadius:20}}><CheckCircle size={10}/>Signed & uploaded</span>
                          :<span style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:10,color:'var(--orange)',background:'var(--orange-bg)',border:'1px solid var(--orange-border)',padding:'2px 8px',borderRadius:20}}><PenLine size={10}/>Needs your signature</span>}
                      </div>
                    )}
                    <div style={{display:'flex',flexDirection:'column',gap:6}}>
                      {file.dataUrl&&<button onClick={()=>{const a=document.createElement('a');a.href=file.dataUrl;a.download=file.name;a.click()}} style={{padding:'7px 8px',borderRadius:6,border:'1px solid var(--border)',background:'transparent',cursor:'pointer',color:'var(--text2)',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',gap:5,fontWeight:500}}><Download size={13}/>Download</button>}
                      {/* ③ Upload signed contract back */}
                      {needSig&&(
                        uploadingFor===file.id?(
                          <div>
                            <FileDropZone onFiles={f=>handleSignedUpload(file.id,f)} label="Drop signed file" sub="PDF or image"/>
                            <button onClick={()=>setUploadingFor(null)} style={{width:'100%',marginTop:5,padding:'4px',borderRadius:4,border:'none',background:'transparent',cursor:'pointer',color:'var(--text3)',fontSize:11}}>Cancel</button>
                          </div>
                        ):(
                          <button onClick={()=>setUploadingFor(file.id)} style={{padding:'7px 8px',borderRadius:6,border:'1px solid var(--orange-border)',background:'var(--orange-bg)',cursor:'pointer',color:'var(--orange)',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',gap:5,fontWeight:500}}><Upload size={13}/>Upload signed copy</button>
                        )
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Invoice summary */}
        {(paidAmt>0||pendingAmt>0)&&(
          <div>
            <h2 style={{fontFamily:'var(--syne)',fontSize:16,fontWeight:700,marginBottom:14}}>Invoice Summary</h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div style={{background:'var(--lime-bg)',border:'1px solid var(--lime-border)',borderRadius:'var(--r)',padding:'14px 18px'}}><div style={{fontSize:10,color:'#1A6B0A',fontFamily:'var(--mono)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:6}}>Paid</div><div style={{fontSize:22,fontWeight:700,fontFamily:'var(--syne)',color:'#1A6B0A'}}>₹{fmtINR(paidAmt)}</div></div>
              <div style={{background:'var(--orange-bg)',border:'1px solid var(--orange-border)',borderRadius:'var(--r)',padding:'14px 18px'}}><div style={{fontSize:10,color:'var(--orange)',fontFamily:'var(--mono)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:6}}>Outstanding</div><div style={{fontSize:22,fontWeight:700,fontFamily:'var(--syne)',color:'var(--orange)'}}>₹{fmtINR(pendingAmt)}</div></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
