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
        setMsg('Revisa tu correo para confirmar tu cuenta, luego inicia sesión.')
        setMode('login')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.ball}>⚽</span>
          <h1 style={styles.title}>Polla Transcontinental</h1>
          <p style={styles.subtitle}>Mundial 2026</p>
        </div>

        <div style={styles.tabs}>
          <button style={{...styles.tab, ...(mode==='login' ? styles.tabActive : {})}} onClick={() => { setMode('login'); setError(''); setMsg('') }}>Iniciar sesión</button>
          <button style={{...styles.tab, ...(mode==='register' ? styles.tabActive : {})}} onClick={() => { setMode('register'); setError(''); setMsg('') }}>Registrarse</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'register' && (
            <div style={styles.field}>
              <label style={styles.label}>Tu nombre</label>
              <input style={styles.input} type="text" placeholder="ej. Juancho Pérez" value={nombre} onChange={e => setNombre(e.target.value)} required />
            </div>
          )}
          <div style={styles.field}>
            <label style={styles.label}>Correo electrónico</label>
            <input style={styles.input} type="email" placeholder="tucorreo@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input style={styles.input} type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          {msg && <p style={styles.success}>{msg}</p>}
          <button style={{...styles.btn, opacity: loading ? 0.7 : 1}} type="submit" disabled={loading}>
            {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f4', padding: '1rem' },
  card: { background: 'white', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 400, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  header: { textAlign: 'center', marginBottom: '1.5rem' },
  ball: { fontSize: 40 },
  title: { fontSize: 20, fontWeight: 600, margin: '8px 0 4px', color: '#1a1a1a' },
  subtitle: { fontSize: 14, color: '#888', margin: 0 },
  tabs: { display: 'flex', borderBottom: '1px solid #eee', marginBottom: '1.5rem' },
  tab: { flex: 1, background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '8px', fontSize: 14, cursor: 'pointer', color: '#888', fontWeight: 500, marginBottom: -1 },
  tabActive: { color: '#1a1a1a', borderBottomColor: '#1a1a1a' },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  field: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 13, color: '#555', fontWeight: 500 },
  input: { padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none' },
  btn: { padding: '12px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4 },
  error: { color: '#c0392b', fontSize: 13, margin: 0, padding: '8px 12px', background: '#fdf2f2', borderRadius: 6 },
  success: { color: '#27ae60', fontSize: 13, margin: 0, padding: '8px 12px', background: '#f0faf4', borderRadius: 6 },
}
