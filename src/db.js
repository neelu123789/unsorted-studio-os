import { v4 as uuid } from 'uuid';

const KEY = 'studio_os_v1';

const defaultData = {
  clients: [
    { id:'c1',name:'Arjun Mehta',email:'arjun@bloomskin.in',phone:'+91 98765 43210',company:'Bloom Skincare',type:'D2C',status:'active',avatar_color:'#FF6B35',joined:'2025-01-15',budget:'1,20,000',notes:'D2C skincare brand. Wants complete rebrand.',city:'Mumbai',portal_enabled:true,portal_password:'bloom2025' },
    { id:'c2',name:'Priya Sharma',email:'priya@novalabs.io',phone:'+91 87654 32109',company:'Nova Labs',type:'SaaS',status:'active',avatar_color:'#2563EB',joined:'2025-02-01',budget:'85,000',notes:'B2B SaaS. Website redesign + brand system.',city:'Bangalore',portal_enabled:true,portal_password:'nova2025' },
    { id:'c3',name:'Rohit Kapoor',email:'rohit@zestfit.co',phone:'+91 76543 21098',company:'ZestFit',type:'D2C',status:'pending',avatar_color:'#059669',joined:'2025-03-10',budget:'60,000',notes:'Fitness startup. Discovery call done.',city:'Delhi',portal_enabled:false,portal_password:'' },
  ],
  projects: [
    { id:'p1',client_id:'c1',name:'Bloom — Full Brand Identity',status:'in_progress',priority:'high',start_date:'2025-01-20',due_date:'2025-04-15',budget:'1,20,000',billed:'60,000',progress:55,description:'Logo, packaging, guidelines, website.',tags:['Branding','Packaging','Web'] },
    { id:'p2',client_id:'c2',name:'Nova Labs — Website Redesign',status:'in_progress',priority:'medium',start_date:'2025-02-05',due_date:'2025-04-30',budget:'85,000',billed:'42,500',progress:35,description:'Full website redesign with new brand system.',tags:['Web','Branding'] },
    { id:'p3',client_id:'c1',name:'Bloom — Social Media Kit',status:'completed',priority:'low',start_date:'2025-01-20',due_date:'2025-02-28',budget:'20,000',billed:'20,000',progress:100,description:'Instagram templates and social media brand kit.',tags:['Social'] },
  ],
  tasks: [
    { id:'t1',project_id:'p1',client_id:'c1',title:'Logo exploration — Round 2',status:'in_progress',priority:'high',due:'2025-03-25',assigned:'You' },
    { id:'t2',project_id:'p1',client_id:'c1',title:'Packaging mockups (3 variants)',status:'todo',priority:'high',due:'2025-04-01',assigned:'You' },
    { id:'t3',project_id:'p2',client_id:'c2',title:'Homepage wireframe review',status:'review',priority:'medium',due:'2025-03-28',assigned:'You' },
    { id:'t4',project_id:'p2',client_id:'c2',title:'Brand guidelines document',status:'todo',priority:'medium',due:'2025-04-10',assigned:'You' },
    { id:'t5',project_id:'p1',client_id:'c1',title:'Client feedback call notes',status:'done',priority:'low',due:'2025-03-18',assigned:'You' },
  ],
  meetings: [
    { id:'m1',client_id:'c1',title:'Logo R2 Presentation',date:'2025-03-25',time:'11:00',duration:'60 min',type:'presentation',notes:'Present 3 logo directions',link:'https://meet.google.com' },
    { id:'m2',client_id:'c2',title:'Wireframe Review — Nova',date:'2025-03-28',time:'15:00',duration:'45 min',type:'review',notes:'Homepage wireframes walkthrough',link:'' },
    { id:'m3',client_id:'c3',title:'Discovery Call — ZestFit',date:'2025-03-30',time:'10:00',duration:'30 min',type:'discovery',notes:'Initial call, understand brand needs',link:'' },
  ],
  invoices: [
    { id:'inv1',client_id:'c1',project_id:'p1',number:'INV-001',amount:'60000',status:'paid',issued:'2025-02-01',due:'2025-02-15',description:'Bloom — 50% advance payment' },
    { id:'inv2',client_id:'c2',project_id:'p2',number:'INV-002',amount:'42500',status:'pending',issued:'2025-03-01',due:'2025-03-15',description:'Nova Labs — 50% advance' },
    { id:'inv3',client_id:'c1',project_id:'p3',number:'INV-003',amount:'20000',status:'paid',issued:'2025-03-01',due:'2025-03-10',description:'Bloom — Social Media Kit complete' },
  ],
  files: [
    { id:'f1',client_id:'c1',project_id:'p1',name:'Logo_Explorations_R1.pdf',size:'4.2 MB',type:'pdf',uploaded:'2025-02-10',shared:true,uploaded_by:'studio',url:'#' },
    { id:'f2',client_id:'c1',project_id:'p1',name:'Brand_Brief_Bloom.docx',size:'1.1 MB',type:'doc',uploaded:'2025-01-22',shared:true,uploaded_by:'studio',url:'#' },
    { id:'f3',client_id:'c2',project_id:'p2',name:'Homepage_Wireframe_v1.fig',size:'8.7 MB',type:'fig',uploaded:'2025-02-20',shared:false,uploaded_by:'studio',url:'#' },
    { id:'f4',client_id:'c1',project_id:'p1',name:'Client_Reference_Images.zip',size:'22 MB',type:'zip',uploaded:'2025-01-18',shared:false,uploaded_by:'client',url:'#' },
  ],
  pipeline: [
    { id:'pl1',name:'Aisha Nair',company:'Greens & Co',type:'D2C',value:'75000',stage:'discovery',source:'DM',date:'2025-03-10',notes:'Organic food brand, interested in full identity' },
    { id:'pl2',name:'Sameer Joshi',company:'TechFlow',type:'SaaS',value:'95000',stage:'proposal',source:'Referral',date:'2025-03-15',notes:'Proposal sent, awaiting feedback' },
    { id:'pl3',name:'Divya Rao',company:'Casa Interiors',type:'Other',value:'55000',stage:'new',source:'Ad',date:'2025-03-20',notes:'Initial DM, needs discovery call' },
  ],
};

function load() {
  try { const r=localStorage.getItem(KEY); return r ? {...defaultData,...JSON.parse(r)} : defaultData; } catch { return defaultData; }
}
function persist(d) { try { localStorage.setItem(KEY,JSON.stringify(d)); } catch(e){} }

function formatBytes(b) {
  if(b<1024) return b+' B';
  if(b<1024*1024) return (b/1024).toFixed(1)+' KB';
  return (b/(1024*1024)).toFixed(1)+' MB';
}

class DB {
  constructor() { this._data=load(); }
  getAll(t) { return [...(this._data[t]||[])]; }
  getById(t,id) { return (this._data[t]||[]).find(r=>r.id===id); }
  insert(t,r) { const row={id:uuid(),...r}; if(!this._data[t])this._data[t]=[]; this._data[t].push(row); persist(this._data); return row; }
  update(t,id,u) { const i=(this._data[t]||[]).findIndex(r=>r.id===id); if(i===-1)return null; this._data[t][i]={...this._data[t][i],...u}; persist(this._data); return this._data[t][i]; }
  delete(t,id) { this._data[t]=(this._data[t]||[]).filter(r=>r.id!==id); persist(this._data); }
  where(t,f,v) { return (this._data[t]||[]).filter(r=>r[f]===v); }
  uploadFile(clientId,projectId,file) {
    return new Promise(res=>{
      const reader=new FileReader();
      reader.onload=e=>{
        const ext=file.name.split('.').pop().toLowerCase();
        const tm={pdf:'pdf',doc:'doc',docx:'doc',fig:'fig',png:'img',jpg:'img',jpeg:'img',zip:'zip',mp4:'vid',mov:'vid'};
        const row=this.insert('files',{client_id:clientId,project_id:projectId,name:file.name,size:formatBytes(file.size),type:tm[ext]||'file',uploaded:new Date().toISOString().split('T')[0],shared:false,uploaded_by:'studio',url:e.target.result});
        res(row);
      };
      reader.readAsDataURL(file);
    });
  }
  stats() {
    const cl=this._data.clients||[],pr=this._data.projects||[],inv=this._data.invoices||[],tk=this._data.tasks||[];
    return {
      active_clients:cl.filter(c=>c.status==='active').length,
      total_clients:cl.length,
      active_projects:pr.filter(p=>p.status==='in_progress').length,
      total_revenue:inv.filter(i=>i.status==='paid').reduce((a,i)=>a+parseInt(i.amount||0),0),
      pending_revenue:inv.filter(i=>i.status==='pending').reduce((a,i)=>a+parseInt(i.amount||0),0),
      overdue_tasks:tk.filter(t=>t.status!=='done'&&new Date(t.due)<new Date()).length,
    };
  }
}

export const db=new DB();
export {uuid};
