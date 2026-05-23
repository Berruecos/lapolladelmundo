import { useState } from 'react'
import { useAuth } from './lib/AuthContext'
import Login from './pages/Login'
import Ranking from './pages/Ranking'
import Pronosticos from './pages/Pronosticos'
import Admin from './pages/Admin'
import Reglamento from './pages/Reglamento'

const TABS = [
  { id: 'ranking', label: 'Tabla', icon: '🏆' },
  { id: 'pronosticos', label: 'Mis picks', icon: '⚽' },
  { id: 'reglamento', label: 'Reglas', icon: '📋' },
  { id: 'admin', label: 'Admin', icon: '⚙️' },
]

export default function App() {
  const { user, participante, loading, signOut } = useAuth()
  const [tab, setTab] = useState('ranking')

  if (loading) return (
    <div style={styles.loading}>
      <span style={styles.loadingBall}>⚽</span>
      <p style={styles.loadingText}>Cargando...</p>
    </div>
  )

  if (!user || !participante) return <Login />

  const renderTab = () => {
    switch(tab) {
      case 'ranking': return <Ranking participante={participante} />
      case 'pronosticos': return <Pronosticos participante={participante} />
      case 'reglamento': return <Reglamento />
      case 'admin': return <Admin participante={participante} />
      default: return null
    }
  }

  const visibleTabs = participante.es_admin ? TABS : TABS.filter(t => t.id !== 'admin')

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitle}>⚽ Polla Transcontinental</div>
          <div style={styles.headerSub}>Mundial 2026 · Hola, {participante.nombre}</div>
        </div>
        <button style={styles.signOut} onClick={signOut}>Salir</button>
      </div>

      {!participante.pago && (
        <div style={styles.noPagoBanner}>
          ⚠️ Aún no has pagado la inscripción ($100.000). Tus puntos no contarán hasta que el organizador confirme tu pago.
        </div>
      )}

      <div style={styles.content}>
        {renderTab()}
      </div>

      <div style={styles.nav}>
        {visibleTabs.map(t => (
          <button key={t.id} style={{...styles.navBtn, ...(tab===t.id ? styles.navBtnActive : {})}} onClick={() => setTab(t.id)}>
            <span style={styles.navIcon}>{t.icon}</span>
            <span style={styles.navLabel}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

const styles = {
  app: { minHeight: '100vh', background: '#f5f5f4', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto', position: 'relative' },
  loading: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#f5f5f4' },
  loadingBall: { fontSize: 48 },
  loadingText: { fontSize: 16, color: '#888' },
  header: { background: 'white', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 10 },
  headerTitle: { fontSize: 15, fontWeight: 700, color: '#1a1a1a' },
  headerSub: { fontSize: 12, color: '#888', marginTop: 2 },
  signOut: { background: 'none', border: '1px solid #e0e0e0', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer', color: '#888' },
  noPagoBanner: { background: '#fffbeb', borderBottom: '1px solid #fde68a', padding: '10px 16px', fontSize: 12, color: '#92400e', lineHeight: 1.4 },
  content: { flex: 1, padding: '0 16px', paddingBottom: 80, overflowY: 'auto' },
  nav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderTop: '1px solid #eee', display: 'flex', zIndex: 10 },
  navBtn: { flex: 1, background: 'none', border: 'none', padding: '10px 4px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  navBtnActive: { background: '#fafafa' },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 10, color: '#888', fontWeight: 500 },
}
