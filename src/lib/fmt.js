// Safe number formatting — toLocaleString('en-IN') crashes in some
// Node/Vercel edge environments. This is a safe fallback.
export function fmtINR(num) {
  const n = parseInt(num) || 0
  if (isNaN(n)) return '0'
  try {
    return n.toLocaleString('en-IN')
  } catch {
    // fallback: manual Indian number formatting
    const s = Math.abs(n).toString()
    if (s.length <= 3) return n < 0 ? '-' + s : s
    const last3 = s.slice(-3)
    const rest = s.slice(0, -3)
    const formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3
    return n < 0 ? '-' + formatted : formatted
  }
}
