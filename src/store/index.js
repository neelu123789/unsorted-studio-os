// src/store/index.js
// Zustand store — all data backed by Supabase.
// UI state (theme, currentView) persisted locally via localStorage.

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase, uploadFile, deleteStorageFile } from '../lib/supabase.js'

const today = () => new Date().toISOString().split('T')[0]

export const computeInvoiceStatus = (inv) => {
  if (inv.status === 'paid') return 'paid'
  const due = inv.due
  if (due && new Date(due) < new Date()) return 'overdue'
  return 'pending'
}

// ── ROW MAPPERS (snake_case DB → camelCase UI) ─────────────
const mapClient = r => !r ? null : ({
  id:r.id, name:r.name, brand:r.brand, email:r.email, phone:r.phone,
  type:r.type, stage:r.stage, avatar:r.avatar, photo:r.photo_url,
  color:r.color, onboarded:r.onboarded, budget:r.budget?String(r.budget):'',
  notes:r.notes, portal_token:r.portal_token,
})
const mapProject = (r, deliverables=[]) => !r ? null : ({
  id:r.id, clientId:r.client_id, name:r.name, status:r.status,
  due:r.due, value:r.value?String(r.value):'', progress:r.progress||0,
  description:r.description, deliverables,
})
const mapDeliv = r => !r ? null : ({
  id:r.id, projectId:r.project_id, name:r.name, status:r.status, due:r.due,
})
const mapTask = r => !r ? null : ({
  id:r.id, clientId:r.client_id, projectId:r.project_id,
  title:r.title, priority:r.priority, due:r.due, done:r.done,
})
const mapInvoice = r => !r ? null : ({
  id:r.id, clientId:r.client_id, number:r.number,
  amount:r.amount?String(r.amount):'0',
  status:computeInvoiceStatus({status:r.status, due:r.due}),
  date:r.date, due:r.due, desc:r.description,
})
const mapMeeting = r => !r ? null : ({
  id:r.id, clientId:r.client_id, title:r.title,
  date:r.date, time:r.time?r.time.slice(0,5):'',
  duration:r.duration?String(r.duration):'60',
  type:r.type, link:r.link, notes:r.notes,
})
const mapFile = r => !r ? null : ({
  id:r.id, clientId:r.client_id, name:r.name,
  storagePath:r.storage_path, dataUrl:r.public_url,
  size:r.size, type:r.file_type, category:r.category,
  uploadedBy:r.uploaded_by, sharedWithClient:r.shared_with_client,
  signatureRequired:r.signature_required, signedBack:r.signed_back,
  uploaded:r.created_at?r.created_at.split('T')[0]:today(),
})
const mapNote = r => !r ? null : ({
  id:r.id, clientId:r.client_id, content:r.content,
  createdAt:r.created_at?r.created_at.split('T')[0]:today(),
})

// ── STORE ─────────────────────────────────────────────────
export const useStore = create(
  persist(
    (set, get) => ({
      // UI state
      currentView:'dashboard', activeClientId:null,
      mobileSidebarOpen:false, theme:'light', notifications:[],
      // Data state
      clients:[], projects:[], tasks:[], invoices:[],
      meetings:[], files:[], notes:[],
      loading:false, error:null,

      // UI actions
      setView: v => set({currentView:v}),
      setActiveClient: id => set({activeClientId:id}),
      setMobileSidebar: v => set({mobileSidebarOpen:v}),
      setTheme: t => { document.documentElement.setAttribute('data-theme',t); set({theme:t}) },

      // Notifications
      addNotification: n => set(s=>({notifications:[{...n,id:Date.now(),time:new Date().toISOString(),read:false},...s.notifications.slice(0,49)]})),
      markAllRead: () => set(s=>({notifications:s.notifications.map(n=>({...n,read:true}))})),
      clearNotifications: () => set({notifications:[]}),

      // ── LOAD ALL ─────────────────────────────────────────
      loadAll: async () => {
        set({ loading: true, error: null })

        // 10-second timeout so we never hang on loading forever
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(
            'Connection timed out after 10 seconds. Check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the .env file, then restart npm run dev.'
          )), 10000)
        )

        const fetchAll = async () => {
          const results = await Promise.all([
            supabase.from('clients').select('*').order('created_at'),
            supabase.from('projects').select('*').order('created_at'),
            supabase.from('deliverables').select('*').order('created_at'),
            supabase.from('tasks').select('*').order('created_at'),
            supabase.from('invoices').select('*').order('created_at'),
            supabase.from('meetings').select('*').order('date'),
            supabase.from('files').select('*').order('created_at'),
            supabase.from('notes').select('*').order('created_at'),
          ])

          // Surface the first Supabase error clearly
          const failed = results.find(r => r.error)
          if (failed?.error) {
            const e = failed.error
            throw new Error(e.message || e.details || e.hint || JSON.stringify(e))
          }

          const [cls, prj, dlv, tsk, inv, mtg, fls, nts] = results.map(r => r.data || [])
          const projects = prj.map(p => mapProject(p, dlv.filter(d => d.project_id === p.id).map(mapDeliv)))

          set({
            clients:  cls.map(mapClient),
            projects,
            tasks:    tsk.map(mapTask),
            invoices: inv.map(mapInvoice),
            meetings: mtg.map(mapMeeting),
            files:    fls.map(mapFile),
            notes:    nts.map(mapNote),
            loading:  false,
            error:    null,
          })
        }

        try {
          await Promise.race([fetchAll(), timeout])
        } catch(err) {
          console.error('loadAll failed:', err)
          set({ error: err?.message || 'Failed to connect to database', loading: false })
        }
      },

      // ── CLIENTS ──────────────────────────────────────────
      addClient: async data => {
        const av = data.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
        const cl = ['#5CB83A','#2563EB','#E8670D','#7C3AED','#0D9488','#D97706'][Math.floor(Math.random()*6)]
        const row = {
          name:data.name, brand:data.brand, email:data.email||null, phone:data.phone||null,
          type:data.type||'D2C', stage:data.stage||'discovery', avatar:av, color:cl,
          photo_url:data.photo||null, budget:data.budget?Number(data.budget):null, notes:data.notes||null,
        }
        const {data:c,error} = await supabase.from('clients').insert(row).select().single()
        if(error) throw error
        const client = mapClient(c)
        set(s=>({clients:[...s.clients,client]}))
        get().addNotification({type:'success',title:'Client onboarded',body:`${data.brand} added.`})
        return client
      },
      updateClient: async (id, data) => {
        const row = {}
        if(data.name!==undefined)  row.name=data.name
        if(data.brand!==undefined) row.brand=data.brand
        if(data.email!==undefined) row.email=data.email
        if(data.phone!==undefined) row.phone=data.phone
        if(data.type!==undefined)  row.type=data.type
        if(data.stage!==undefined) row.stage=data.stage
        if(data.photo!==undefined) row.photo_url=data.photo
        if(data.budget!==undefined) row.budget=data.budget?Number(data.budget):null
        if(data.notes!==undefined) row.notes=data.notes
        if(data.color!==undefined) row.color=data.color
        const {data:u,error} = await supabase.from('clients').update(row).eq('id',id).select().single()
        if(error) throw error
        set(s=>({clients:s.clients.map(c=>c.id===id?mapClient(u):c)}))
      },
      deleteClient: async id => {
        const {error} = await supabase.from('clients').delete().eq('id',id)
        if(error) throw error
        set(s=>({
          clients:s.clients.filter(c=>c.id!==id),
          projects:s.projects.filter(p=>p.clientId!==id),
          tasks:s.tasks.filter(t=>t.clientId!==id),
          files:s.files.filter(f=>f.clientId!==id),
          invoices:s.invoices.filter(i=>i.clientId!==id),
          notes:s.notes.filter(n=>n.clientId!==id),
        }))
      },

      // ── PROJECTS ─────────────────────────────────────────
      addProject: async data => {
        const row = {
          client_id:data.clientId||null, name:data.name, status:data.status||'not-started',
          due:data.due||null, value:data.value?Number(data.value):null,
          progress:parseInt(data.progress)||0, description:data.description||null,
        }
        const {data:c,error} = await supabase.from('projects').insert(row).select().single()
        if(error) throw error
        const project = {...mapProject(c), deliverables:[]}
        set(s=>({projects:[...s.projects,project]}))
        return project
      },
      updateProject: async (id, data) => {
        const row = {}
        if(data.name!==undefined) row.name=data.name
        if(data.status!==undefined) row.status=data.status
        if(data.due!==undefined) row.due=data.due||null
        if(data.value!==undefined) row.value=data.value?Number(data.value):null
        if(data.progress!==undefined) row.progress=parseInt(data.progress)||0
        if(data.description!==undefined) row.description=data.description
        if(data.clientId!==undefined) row.client_id=data.clientId
        const {data:u,error} = await supabase.from('projects').update(row).eq('id',id).select().single()
        if(error) throw error
        set(s=>({projects:s.projects.map(p=>p.id===id?{...mapProject(u),deliverables:p.deliverables}:p)}))
      },
      deleteProject: async id => {
        const {error} = await supabase.from('projects').delete().eq('id',id)
        if(error) throw error
        set(s=>({projects:s.projects.filter(p=>p.id!==id)}))
      },
      addDeliverable: async (pid, data) => {
        const row = {project_id:pid, name:data.name, status:data.status||'not-started', due:data.due||null}
        const {data:c,error} = await supabase.from('deliverables').insert(row).select().single()
        if(error) throw error
        set(s=>({projects:s.projects.map(p=>p.id===pid?{...p,deliverables:[...p.deliverables,mapDeliv(c)]}:p)}))
      },
      updateDeliverable: async (pid, did, data) => {
        const row = {}
        if(data.name!==undefined) row.name=data.name
        if(data.status!==undefined) row.status=data.status
        if(data.due!==undefined) row.due=data.due||null
        const {data:u,error} = await supabase.from('deliverables').update(row).eq('id',did).select().single()
        if(error) throw error
        set(s=>({projects:s.projects.map(p=>p.id===pid?{...p,deliverables:p.deliverables.map(d=>d.id===did?mapDeliv(u):d)}:p)}))
      },

      // ── TASKS ────────────────────────────────────────────
      addTask: async data => {
        const row = {
          client_id:data.clientId||null, project_id:data.projectId||null,
          title:data.title, priority:data.priority||'med', due:data.due||null, done:false,
        }
        const {data:c,error} = await supabase.from('tasks').insert(row).select().single()
        if(error) throw error
        set(s=>({tasks:[...s.tasks,mapTask(c)]}))
      },
      toggleTask: async id => {
        const t = get().tasks.find(t=>t.id===id)
        if(!t) return
        const {data:u,error} = await supabase.from('tasks').update({done:!t.done}).eq('id',id).select().single()
        if(error) throw error
        set(s=>({tasks:s.tasks.map(t=>t.id===id?mapTask(u):t)}))
      },
      updateTask: async (id, data) => {
        const row = {}
        if(data.title!==undefined) row.title=data.title
        if(data.priority!==undefined) row.priority=data.priority
        if(data.due!==undefined) row.due=data.due||null
        if(data.done!==undefined) row.done=data.done
        const {data:u,error} = await supabase.from('tasks').update(row).eq('id',id).select().single()
        if(error) throw error
        set(s=>({tasks:s.tasks.map(t=>t.id===id?mapTask(u):t)}))
      },
      deleteTask: async id => {
        const {error} = await supabase.from('tasks').delete().eq('id',id)
        if(error) throw error
        set(s=>({tasks:s.tasks.filter(t=>t.id!==id)}))
      },

      // ── INVOICES ─────────────────────────────────────────
      addInvoice: async data => {
        const row = {
          client_id:data.clientId||null, number:data.number||null,
          amount:Number(data.amount), status:data.status==='paid'?'paid':'pending',
          date:data.date||today(), due:data.due||null, description:data.desc||null,
        }
        const {data:c,error} = await supabase.from('invoices').insert(row).select().single()
        if(error) throw error
        set(s=>({invoices:[...s.invoices,mapInvoice(c)]}))
      },
      updateInvoice: async (id, data) => {
        const row = {}
        if(data.number!==undefined) row.number=data.number
        if(data.amount!==undefined) row.amount=Number(data.amount)
        if(data.status!==undefined) row.status=data.status==='paid'?'paid':'pending'
        if(data.date!==undefined) row.date=data.date
        if(data.due!==undefined) row.due=data.due||null
        if(data.desc!==undefined) row.description=data.desc
        if(data.clientId!==undefined) row.client_id=data.clientId
        const {data:u,error} = await supabase.from('invoices').update(row).eq('id',id).select().single()
        if(error) throw error
        set(s=>({invoices:s.invoices.map(i=>i.id===id?mapInvoice(u):i)}))
      },
      markInvoicePaid: async id => {
        const {data:u,error} = await supabase.from('invoices').update({status:'paid'}).eq('id',id).select().single()
        if(error) throw error
        set(s=>({invoices:s.invoices.map(i=>i.id===id?mapInvoice(u):i)}))
        get().addNotification({type:'success',title:'Payment received',body:'Invoice marked as paid.'})
      },
      deleteInvoice: async id => {
        const {error} = await supabase.from('invoices').delete().eq('id',id)
        if(error) throw error
        set(s=>({invoices:s.invoices.filter(i=>i.id!==id)}))
      },
      // checkOverdueInvoices: overdue status is computed at READ time via computeInvoiceStatus()
      // in mapInvoice() — no polling, no set() calls, no infinite loops.
      // This no-op is kept so existing imports don't break.
      checkOverdueInvoices: () => {},

      // ── MEETINGS ─────────────────────────────────────────
      addMeeting: async data => {
        const row = {
          client_id:data.clientId||null, title:data.title, date:data.date||null,
          time:data.time||null, duration:parseInt(data.duration)||60,
          type:data.type||'general', link:data.link||null, notes:data.notes||null,
        }
        const {data:c,error} = await supabase.from('meetings').insert(row).select().single()
        if(error) throw error
        const m = mapMeeting(c)
        set(s=>({meetings:[...s.meetings,m]}))
        get().addNotification({type:'info',title:'Meeting scheduled',body:`${data.title} on ${data.date}`})
        return m
      },
      updateMeeting: async (id, data) => {
        const row = {}
        if(data.title!==undefined) row.title=data.title
        if(data.clientId!==undefined) row.client_id=data.clientId
        if(data.date!==undefined) row.date=data.date
        if(data.time!==undefined) row.time=data.time
        if(data.duration!==undefined) row.duration=parseInt(data.duration)
        if(data.type!==undefined) row.type=data.type
        if(data.link!==undefined) row.link=data.link
        if(data.notes!==undefined) row.notes=data.notes
        const {data:u,error} = await supabase.from('meetings').update(row).eq('id',id).select().single()
        if(error) throw error
        set(s=>({meetings:s.meetings.map(m=>m.id===id?mapMeeting(u):m)}))
      },
      deleteMeeting: async id => {
        const {error} = await supabase.from('meetings').delete().eq('id',id)
        if(error) throw error
        set(s=>({meetings:s.meetings.filter(m=>m.id!==id)}))
      },

      // ── FILES ────────────────────────────────────────────
      addFile: async data => {
        let storagePath = null
        let publicUrl = data.dataUrl || null
        if(data.dataUrl && data.dataUrl.startsWith('data:') && data.clientId) {
          try {
            const r = await uploadFile(data.dataUrl, data.clientId, data.category||'general')
            storagePath = r.path
            publicUrl = r.publicUrl
          } catch(err) {
            console.warn('Storage upload failed, keeping dataUrl locally:', err)
          }
        }
        const row = {
          client_id:data.clientId||null, name:data.name,
          storage_path:storagePath, public_url:publicUrl,
          size:data.size||'', file_type:data.type||'file',
          category:data.category||'general', uploaded_by:data.uploadedBy||'studio',
          shared_with_client:data.sharedWithClient||false,
          signature_required:data.signatureRequired||false, signed_back:data.signedBack||false,
        }
        const {data:c,error} = await supabase.from('files').insert(row).select().single()
        if(error) throw error
        set(s=>({files:[...s.files,mapFile(c)]}))
      },
      updateFile: async (id, data) => {
        const row = {}
        if(data.sharedWithClient!==undefined)  row.shared_with_client=data.sharedWithClient
        if(data.signatureRequired!==undefined) row.signature_required=data.signatureRequired
        if(data.signedBack!==undefined)        row.signed_back=data.signedBack
        if(data.name!==undefined)              row.name=data.name
        const {data:u,error} = await supabase.from('files').update(row).eq('id',id).select().single()
        if(error) throw error
        set(s=>({files:s.files.map(f=>f.id===id?mapFile(u):f)}))
      },
      deleteFile: async id => {
        const file = get().files.find(f=>f.id===id)
        if(file?.storagePath) await deleteStorageFile(file.storagePath)
        const {error} = await supabase.from('files').delete().eq('id',id)
        if(error) throw error
        set(s=>({files:s.files.filter(f=>f.id!==id)}))
      },
      toggleFileShare: async id => {
        const file = get().files.find(f=>f.id===id)
        if(!file) return
        const {data:u,error} = await supabase.from('files').update({shared_with_client:!file.sharedWithClient}).eq('id',id).select().single()
        if(error) throw error
        set(s=>({files:s.files.map(f=>f.id===id?mapFile(u):f)}))
      },
      clientUploadFile: async data => {
        await get().addFile({...data, uploadedBy:'client', sharedWithClient:true})
        get().addNotification({type:'info',title:'Client uploaded a file',body:`${data.name} uploaded by your client.`})
      },

      // ── NOTES ────────────────────────────────────────────
      addNote: async data => {
        const row = {client_id:data.clientId, content:data.content}
        const {data:c,error} = await supabase.from('notes').insert(row).select().single()
        if(error) throw error
        set(s=>({notes:[...s.notes,mapNote(c)]}))
      },
      deleteNote: async id => {
        const {error} = await supabase.from('notes').delete().eq('id',id)
        if(error) throw error
        set(s=>({notes:s.notes.filter(n=>n.id!==id)}))
      },
    }),
    {
      name:'studio-os-ui',
      storage: createJSONStorage(()=>localStorage),
      partialize: s => ({          // ONLY these keys go to localStorage - never persist loading/error
        currentView: s.currentView,
        activeClientId: s.activeClientId,
        theme: s.theme,
        notifications: s.notifications,
      }),
    }
  )
)
