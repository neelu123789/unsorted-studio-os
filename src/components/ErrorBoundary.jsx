import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(err) { return { error: err } }
  componentDidCatch(err, info) { console.error('Page crash:', err, info) }
  render() {
    if (this.state.error) return (
      <div style={{ padding: '40px 32px', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontFamily: 'var(--syne)', fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--red)' }}>
          Something crashed on this page
        </div>
        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 20 }}>
          {this.state.error?.message || 'Unknown error'}
        </div>
        <button
          onClick={() => { this.setState({ error: null }); window.location.reload() }}
          style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 13, color: 'var(--text)' }}
        >
          Reload page
        </button>
      </div>
    )
    return this.props.children
  }
}
