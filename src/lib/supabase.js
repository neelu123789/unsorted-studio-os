// src/lib/supabase.js
// Single Supabase client used everywhere in the app.
// Reads credentials from .env (Vite exposes VITE_* vars to the browser).

import { createClient } from '@supabase/supabase-js'

const URL  = import.meta.env.VITE_SUPABASE_URL
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!URL || !ANON) {
  throw new Error(
    '[Studio OS] Missing Supabase env vars.\n' +
    'Create a .env file at the project root with:\n' +
    '  VITE_SUPABASE_URL=https://xxxx.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=eyJ...'
  )
}

export const supabase = createClient(URL, ANON, {
  auth: { persistSession: false }, // no user auth — studio uses service key
})

// ── STORAGE HELPERS ──────────────────────────────────────────

const BUCKET = 'studio-files'

/**
 * Upload a file (from FileReader dataUrl or File object).
 * Returns { path, publicUrl } or throws.
 */
export async function uploadFile(file, clientId, category = 'general') {
  // Convert dataUrl to Blob if needed
  let blob
  if (typeof file === 'string' && file.startsWith('data:')) {
    const res = await fetch(file)
    blob = await res.blob()
  } else {
    blob = file
  }

  const ext    = blob.type.split('/')[1] || 'bin'
  const ts     = Date.now()
  const path   = `clients/${clientId}/${category}/${ts}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error

  // Generate a signed URL valid for 7 days (portal access)
  const { data: signed, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 7)
  if (signErr) throw signErr

  return { path, publicUrl: signed.signedUrl }
}

/**
 * Delete a file from storage by its storage_path.
 */
export async function deleteStorageFile(storagePath) {
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath])
  if (error) console.error('Storage delete error:', error)
}

/**
 * Get a fresh signed URL for a stored file (URL expires after 7 days).
 */
export async function refreshSignedUrl(storagePath) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 60 * 60 * 24 * 7)
  if (error) throw error
  return data.signedUrl
}
