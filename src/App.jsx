import { useState } from 'react'
import { useAuth } from './lib/AuthContext'
import Login from './pages/Login'
import Ranking from './pages/Ranking'
import Pronosticos from './pages/Pronosticos'
import Rivales from './pages/Rivales'
import Reglamento from './pages/Reglamento'
import Admin from './pages/Admin'

const TabIcon = ({ id, active }) => {
  const color = active ? '#C9A84C' : '#444440'
  if (id === 'ranking') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
    </svg>
  )
  if (id === 'pronosticos') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8v4l3 3"/>
    </svg>
  )
  if (id === 'rivales') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
  if (id === 'reglamento') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  )
  if (id === 'admin') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
  return null
}

const TABS = [
  { id: 'ranking', label: 'TABLA', adminOnly: false },
  { id: 'pronosticos', label: 'PICKS', adminOnly: false },
  { id: 'rivales', label: 'RIVALES', adminOnly: false },
  { id: 'reglamento', label: 'REGLAS', adminOnly: false },
  { id: 'admin', label: 'ADMIN', adminOnly: true },
]

export default function App() {
  const { user, participante, loading, signOut } = useAuth()
  const [tab, setTab] = useState('ranking')

  if (loading) return (
    <div style={s.loading}>
      <div style={s.loadingBall}>🏆</div>
      <div style={s.loadingText}>LA POLLA DEL MUNDO</div>
      <div style={s.loadingSub}>2026</div>
    </div>
  )

  if (!user || !participante) return <Login />

  const visibleTabs = TABS.filter(t => !t.adminOnly || participante.es_admin)

  const renderTab = () => {
    switch(tab) {
      case 'ranking': return <Ranking participante={participante} />
      case 'pronosticos': return <Pronosticos participante={participante} />
      case 'rivales': return <Rivales />
      case 'reglamento': return <Reglamento />
      case 'admin': return <Admin participante={participante} />
      default: return null
    }
  }

  return (
    <div style={s.app}>
      <div style={s.header}>
        <div>
          <div style={s.headerTitle}>LA POLLA DEL MUNDO</div>
          <div style={s.headerSub}>2026 · {participante.nombre}</div>
        </div>
        <button style={s.signOut} onClick={signOut}>SALIR</button>
      </div>

      <div style={s.content}>
        {renderTab()}
      </div>

      <div style={s.nav}>
        {visibleTabs.map(t => (
          <button key={t.id}
            style={{...s.navBtn, ...(tab===t.id ? s.navBtnActive : {})}}
            onClick={() => setTab(t.id)}>
            <TabIcon id={t.id} active={tab===t.id} />
            <span style={{...s.navLabel, ...(tab===t.id ? s.navLabelActive : {})}}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

const s = {
  app: { minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' },
  loading: { minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 },
  loadingBall: { fontSize: 52, marginBottom: 8 },
  loadingText: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, letterSpacing: 4, color: '#F5F0E8' },
  loadingSub: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 900, letterSpacing: 4, color: '#C9A84C' },
  header: { background: '#0d0d0d', borderBottom: '1px solid #1e1e1e', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 },
  headerTitle: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 900, letterSpacing: 3, color: '#F5F0E8' },
  headerSub: { fontSize: 11, color: '#888880', letterSpacing: 1, marginTop: 1 },
  signOut: { background: 'none', border: '1px solid #222', borderRadius: 6, padding: '5px 12px', fontSize: 10, cursor: 'pointer', color: '#888880', fontWeight: 700, letterSpacing: 1, fontFamily: "'Barlow Condensed', sans-serif" },
  content: { flex: 1, padding: '0 16px', paddingBottom: 72, overflowY: 'auto' },
  nav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: '#0d0d0d', borderTop: '1px solid #1e1e1e', display: 'flex', zIndex: 10 },
  navBtn: { flex: 1, background: 'none', border: 'none', padding: '8px 4px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  navBtnActive: { background: '#111' },
  navLabel: { fontSize: 9, color: '#444440', fontWeight: 700, letterSpacing: 1, fontFamily: "'Barlow Condensed', sans-serif" },
  navLabelActive: { color: '#C9A84C' },
}
