import { useState } from 'react'
import { useAuth } from './lib/AuthContext'
import Login from './pages/Login'
import Ranking from './pages/Ranking'
import Pronosticos from './pages/Pronosticos'
import Rivales from './pages/Rivales'
import Reglamento from './pages/Reglamento'
import Admin from './pages/Admin'

const TABS = [
  { id: 'ranking', label: 'TABLA', icon: '🏆' },
  { id: 'pronosticos', label: 'PICKS', icon: '⚽' },
  { id: 'rivales', label: 'RIVALES', icon: '👀' },
  { id: 'reglamento', label: 'REGLAS', icon: '📋' },
  { id: 'admin', label: 'ADMIN', icon: '⚙️', adminOnly: true },
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
            <span style={s.navIcon}>{t.icon}</span>
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
  navIcon: { fontSize: 18 },
  navLabel: { fontSize: 9, color: '#444440', fontWeight: 700, letterSpacing: 1, fontFamily: "'Barlow Condensed', sans-serif" },
  navLabelActive: { color: '#C9A84C' },
}
