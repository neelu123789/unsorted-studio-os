import{useState}from'react'
import{useStore}from'../store/index.js'
import{Card,Btn,Modal,Select,SectionHeader,Empty,useToast,FILE_ICONS,FILE_CATS,FileDropZone}from'../components/ui.jsx'
import{Share2,Trash2,Download,PenLine,CheckCircle,Plus,Search}from'lucide-react'

const CAT_TABS=[{k:'all',l:'All'},{k:'design',l:'Design'},{k:'strategy',l:'Strategy'},{k:'contract',l:'Contracts'},{k:'invoice',l:'Invoices'},{k:'general',l:'General'},{k:'client',l:'From Client'}]
const CAT_META={
  design:{icon:'🎨',color:'var(--purple)',bg:'var(--purple-bg)',border:'var(--purple-border)'},
  strategy:{icon:'📊',color:'var(--blue)',bg:'var(--blue-bg)',border:'var(--blue-border)'},
  contract:{icon:'📝',color:'var(--orange)',bg:'var(--orange-bg)',border:'var(--orange-border)'},
  invoice:{icon:'🧾',color:'var(--lime)',bg:'var(--lime-bg)',border:'var(--lime-border)'},
  general:{icon:'📂',color:'var(--text3)',bg:'var(--surface2)',border:'var(--border)'},
}

export default function Files(){
  const{files,clients,addFile,deleteFile,toggleFileShare,updateFile}=useStore()
  const{show,Toast}=useToast()
  const[modal,setModal]=useState(false)
  const[ff,setFf]=useState({category:'general',share:false,sig:false})
  const[tab,setTab]=useState('all')
  const[search,setSearch]=useState('')

  const filtered=files.filter(f=>{
    const mt=tab==='all'||(tab==='client'?f.uploadedBy==='client':f.category===tab)
    const ms=!search||f.name.toLowerCase().includes(search.toLowerCase())
    return mt&&ms
  })

  const counts=Object.fromEntries(CAT_TABS.map(t=>[t.k,t.k==='all'?files.length:t.k==='client'?files.filter(f=>f.uploadedBy==='client').length:files.filter(f=>f.category===t.k).length]))

  const doUpload=({name,size,type,dataUrl})=>{
    const cid=ff.clientId||null
    addFile({clientId:cid,name,size,type,dataUrl,sharedWithClient:ff.share,category:ff.category||'general',signatureRequired:ff.sig&&ff.category==='contract',signedBack:false})
    setModal(false);setFf({category:'general',share:false,sig:false});show('File uploaded!')
  }

  const getClient=id=>clients.find(c=>c.id===id)

  return(
    <div style={{padding:'24px 28px 60px',maxWidth:1200,margin:'0 auto'}}>
      <SectionHeader title="Files" sub={`${files.length} total · ${files.filter(f=>f.sharedWithClient).length} shared`} action={<Btn onClick={()=>setModal(true)}><Plus size={14}/>Upload</Btn>}/>

      {/* Category tabs */}
      <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap',alignItems:'center'}}>
        <div style={{display:'flex',gap:2,background:'var(--surface2)',borderRadius:'var(--r-sm)',padding:3,border:'1px solid var(--border)',flexWrap:'wrap'}}>
          {CAT_TABS.map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:'5px 11px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,background:tab===t.k?'var(--surface)':'transparent',color:tab===t.k?'var(--text)':'var(--text3)',fontWeight:tab===t.k?500:400,transition:'all .12s',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:4}}>
              {t.l}{counts[t.k]>0&&<span style={{fontSize:10,fontFamily:'var(--mono)',background:tab===t.k?'var(--surface3)':'transparent',padding:'0 4px',borderRadius:8}}>{counts[t.k]}</span>}
            </button>
          ))}
        </div>
        <div style={{position:'relative',marginLeft:'auto'}}>
          <Search size={12} style={{position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',color:'var(--text3)'}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search files…" style={{padding:'6px 10px 6px 27px',borderRadius:20,border:'1px solid var(--border)',background:'var(--surface)',fontSize:12,outline:'none',width:160,color:'var(--text)'}}/>
        </div>
      </div>

      {/* Pending contracts alert */}
      {tab==='all'&&files.filter(f=>f.signatureRequired&&!f.signedBack).length>0&&(
        <div style={{background:'var(--orange-bg)',border:'1px solid var(--orange-border)',borderRadius:'var(--r-sm)',padding:'11px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
          <PenLine size={15} style={{color:'var(--orange)',flexShrink:0}}/>
          <span style={{fontSize:13,color:'var(--orange)',fontWeight:500}}>{files.filter(f=>f.signatureRequired&&!f.signedBack).length} contract(s) awaiting client signature</span>
          <button onClick={()=>setTab('contract')} style={{marginLeft:'auto',fontSize:12,color:'var(--orange)',background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}}>View →</button>
        </div>
      )}

      {filtered.length===0?<Empty icon="📂" title="No files here" sub="Upload and tag files to see them here." action={<Btn onClick={()=>setModal(true)}>Upload file</Btn>}/>:
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))',gap:12}}>
          {filtered.map(file=>{
            const cm=CAT_META[file.category]||CAT_META.general
            const client=getClient(file.clientId)
            return(
              <Card key={file.id} style={{padding:15,border:file.category==='contract'&&file.signatureRequired&&!file.signedBack?'1px solid var(--orange-border)':undefined}}>
                {/* Category color strip */}
                <div style={{height:3,borderRadius:2,background:cm.color,marginBottom:12}}/>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                  <span style={{fontSize:26}}>{FILE_ICONS[file.type]||'📎'}</span>
                  <span style={{fontSize:10,padding:'2px 7px',borderRadius:10,background:cm.bg,color:cm.color,border:`1px solid ${cm.border}`,fontWeight:500,textTransform:'capitalize'}}>{file.category}</span>
                </div>
                <div style={{fontSize:12,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:2}}>{file.name}</div>
                <div style={{fontSize:11,color:'var(--text3)',marginBottom:client?6:10}}>{file.size} · {file.uploaded}</div>
                {client&&<div style={{fontSize:11,color:'var(--text2)',marginBottom:10,display:'flex',alignItems:'center',gap:5}}>
                  <div style={{width:12,height:12,borderRadius:'50%',background:client.color,flexShrink:0}}/>
                  {client.brand}
                </div>}
                {/* Signature status */}
                {file.category==='contract'&&file.signatureRequired&&(
                  <div style={{marginBottom:10}}>
                    {file.signedBack
                      ?<span style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:10,color:'#1A6B0A',background:'var(--lime-bg)',border:'1px solid var(--lime-border)',padding:'2px 8px',borderRadius:20}}><CheckCircle size={10}/>Signed</span>
                      :<span style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:10,color:'var(--orange)',background:'var(--orange-bg)',border:'1px solid var(--orange-border)',padding:'2px 8px',borderRadius:20}}><PenLine size={10}/>Awaiting signature</span>}
                  </div>
                )}
                {file.uploadedBy==='client'&&<div style={{marginBottom:10}}><span style={{fontSize:10,padding:'2px 7px',borderRadius:10,background:'var(--teal-bg)',color:'var(--teal)',border:'1px solid var(--teal-border)'}}>↑ From client</span></div>}
                {/* Actions */}
                <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                  <button onClick={()=>{toggleFileShare(file.id);show(file.sharedWithClient?'Removed from portal':'Added to portal!')}} style={{flex:1,padding:'5px 7px',borderRadius:6,cursor:'pointer',border:`1px solid ${file.sharedWithClient?'var(--lime-border)':'var(--border2)'}`,background:file.sharedWithClient?'var(--lime-bg)':'transparent',fontSize:11,color:file.sharedWithClient?'#1A6B0A':'var(--text3)',display:'flex',alignItems:'center',justifyContent:'center',gap:3,fontWeight:500}}>
                    <Share2 size={10}/>{file.sharedWithClient?'Shared':'Share'}
                  </button>
                  {file.dataUrl&&<button onClick={()=>{const a=document.createElement('a');a.href=file.dataUrl;a.download=file.name;a.click()}} style={{padding:'5px 7px',borderRadius:6,border:'1px solid var(--border)',background:'transparent',cursor:'pointer',color:'var(--text3)',display:'flex',alignItems:'center'}}><Download size={12}/></button>}
                  <button onClick={()=>{deleteFile(file.id);show('Deleted')}} style={{padding:'5px 7px',borderRadius:6,border:'1px solid var(--border)',background:'transparent',cursor:'pointer',color:'var(--red)',display:'flex',alignItems:'center'}}><Trash2 size={12}/></button>
                </div>
                {file.category==='contract'&&file.signatureRequired&&!file.signedBack&&(
                  <button onClick={()=>{updateFile(file.id,{signedBack:true});show('Marked as signed!')}} style={{width:'100%',marginTop:8,padding:'6px',borderRadius:6,border:'1px solid var(--lime-border)',background:'var(--lime-bg)',color:'#1A6B0A',fontSize:11,fontWeight:500,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>
                    <CheckCircle size={12}/>Mark as signed
                  </button>
                )}
              </Card>
            )
          })}
        </div>}

      {/* Upload modal */}
      <Modal open={modal} onClose={()=>setModal(false)} title="Upload File">
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Select label="File Category" value={ff.category||'general'} onChange={e=>setFf(p=>({...p,category:e.target.value}))} options={FILE_CATS.map(c=>({value:c,label:{design:'Design Files',strategy:'Strategy Docs',contract:'Contracts',invoice:'Invoices',general:'General Files'}[c]||c}))}/>
          <Select label="Client (optional)" value={ff.clientId||''} onChange={e=>setFf(p=>({...p,clientId:e.target.value}))} options={[{value:'',label:'No specific client'},...clients.map(c=>({value:c.id,label:c.brand}))]}/>
          {/* Category description */}
          {ff.category&&ff.category!=='general'&&(
            <div style={{padding:'10px 12px',borderRadius:'var(--r-sm)',background:(CAT_META[ff.category]||{}).bg||'var(--surface2)',border:`1px solid ${(CAT_META[ff.category]||{}).border||'var(--border)'}`,fontSize:12,color:(CAT_META[ff.category]||{}).color||'var(--text2)'}}>
              {{design:'Design files: logos, mockups, brand assets, Figma exports',strategy:'Strategy docs: briefs, decks, research, brand positioning',contract:'Contracts: service agreements, SOWs, NDAs',invoice:'Invoice files: payment records, receipts'}[ff.category]||'General files'}
            </div>
          )}
          <label style={{display:'flex',alignItems:'center',gap:10,fontSize:13,cursor:'pointer',padding:'10px 12px',borderRadius:'var(--r-sm)',border:'1px solid var(--border)',background:'var(--surface2)'}}>
            <input type="checkbox" checked={ff.share||false} onChange={e=>setFf(p=>({...p,share:e.target.checked}))} style={{width:15,height:15,cursor:'pointer'}}/>
            <div><div style={{fontWeight:500}}>Share with client portal immediately</div><div style={{fontSize:11,color:'var(--text3)',marginTop:1}}>Client will see this in their portal</div></div>
          </label>
          {ff.category==='contract'&&(
            <label style={{display:'flex',alignItems:'center',gap:10,fontSize:13,cursor:'pointer',padding:'10px 12px',borderRadius:'var(--r-sm)',border:'1px solid var(--orange-border)',background:'var(--orange-bg)'}}>
              <input type="checkbox" checked={ff.sig||false} onChange={e=>setFf(p=>({...p,sig:e.target.checked}))} style={{width:15,height:15,cursor:'pointer'}}/>
              <div><div style={{fontWeight:500,color:'var(--orange)'}}>Requires client signature</div><div style={{fontSize:11,color:'var(--text3)',marginTop:1}}>Client can download, sign, and upload back through their portal</div></div>
            </label>
          )}
          <FileDropZone onFiles={doUpload} label="Drop file here or click to browse" sub={`Category: ${ff.category||'general'}`}/>
        </div>
      </Modal>
      <Toast/>
    </div>
  )
}
