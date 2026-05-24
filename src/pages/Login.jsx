import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setMsg(''); setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        if (!nombre.trim()) throw new Error('Escribe tu nombre')
        await signUp(email, password, nombre.trim())
        setMsg('Revisa tu correo para confirmar tu cuenta.')
        setMode('login')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.bg} />
      <div style={s.card}>
        <div style={s.logoArea}>
          <div style={s.trophy}>🏆</div>
          <div style={s.title}>LA POLLA DEL</div>
          <div style={s.titleGold}>MUNDO 2026</div>
          <div style={s.subtitle}>USA · CANADA · MÉXICO</div>
        </div>

        <div style={s.tabs}>
          <button style={{...s.tab, ...(mode==='login' ? s.tabActive : {})}}
            onClick={() => { setMode('login'); setError(''); setMsg('') }}>
            Iniciar sesión
          </button>
          <button style={{...s.tab, ...(mode==='register' ? s.tabActive : {})}}
            onClick={() => { setMode('register'); setError(''); setMsg('') }}>
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          {mode === 'register' && (
            <div style={s.field}>
              <label style={s.label}>TU NOMBRE</label>
              <input style={s.input} type="text" placeholder="Ej. Juancho Pérez"
                value={nombre} onChange={e => setNombre(e.target.value)} required />
            </div>
          )}
          <div style={s.field}>
            <label style={s.label}>CORREO ELECTRÓNICO</label>
            <input style={s.input} type="email" placeholder="tucorreo@gmail.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>CONTRASEÑA</label>
            <input style={s.input} type="password" placeholder="Mínimo 6 caracteres"
              value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          {error && <div style={s.error}>{error}</div>}
          {msg && <div style={s.success}>{msg}</div>}
          <button style={{...s.btn, opacity: loading ? 0.7 : 1}} type="submit" disabled={loading}>
            {loading ? 'CARGANDO...' : mode === 'login' ? 'ENTRAR' : 'CREAR CUENTA'}
          </button>
        </form>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative', overflow: 'hidden', background: '#0a0a0a' },
  bg: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, #1a1200 0%, #0a0a0a 60%)', pointerEvents: 'none' },
  card: { width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 },
  logoArea: { textAlign: 'center', marginBottom: '2rem' },
  trophy: { fontSize: 52, marginBottom: 12, display: 'block' },
  title: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 900, letterSpacing: 4, color: '#F5F0E8', lineHeight: 1 },
  titleGold: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 900, letterSpacing: 4, color: '#C9A84C', lineHeight: 1, marginBottom: 8 },
  subtitle: { fontSize: 11, letterSpacing: 3, color: '#888880', fontWeight: 500 },
  tabs: { display: 'flex', borderBottom: '1px solid #222', marginBottom: '1.5rem' },
  tab: { flex: 1, background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '10px', fontSize: 12, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', color: '#444', marginBottom: -1, transition: 'all .2s', fontFamily: "'Barlow Condensed', sans-serif" },
  tabActive: { color: '#C9A84C', borderBottomColor: '#C9A84C' },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#888880' },
  input: { padding: '12px 14px', background: '#161616', border: '1px solid #222', borderRadius: 8, fontSize: 14, color: '#F5F0E8', outline: 'none', transition: 'border .2s' },
  btn: { padding: '14px', background: 'linear-gradient(135deg, #C9A84C, #8a6d2a)', color: '#0a0a0a', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 900, letterSpacing: 2, cursor: 'pointer', marginTop: 4, fontFamily: "'Barlow Condensed', sans-serif" },
  error: { color: '#FF2D2D', fontSize: 12, padding: '10px 12px', background: '#1a0808', borderRadius: 6, border: '1px solid #7a0f0f' },
  success: { color: '#00C97A', fontSize: 12, padding: '10px 12px', background: '#001a0f', borderRadius: 6, border: '1px solid #005a30' },
}
