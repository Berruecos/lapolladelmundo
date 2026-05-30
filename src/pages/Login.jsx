import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState(localStorage.getItem('polla_email') || '')
  const [password, setPassword] = useState(localStorage.getItem('polla_pass') || '')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(!!localStorage.getItem('polla_email'))
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMsg, setResetMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setMsg(''); setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password, remember)
      } else {
        if (!nombre.trim()) throw new Error('Escribe tu nombre')
        await signUp(email, password, nombre.trim())
        setMsg('Cuenta creada. Ya puedes iniciar sesión.')
        setMode('login')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleReset(e) {
    e.preventDefault()
    setResetMsg(''); setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: 'https://lapolladelmundo.vercel.app',
    })
    if (error) setResetMsg('Error: ' + error.message)
    else setResetMsg('Te enviamos un correo para restablecer tu contraseña.')
    setLoading(false)
  }

  const EyeIcon = () => showPass ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888880" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888880" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )

  if (resetMode) return (
    <div style={s.page}>
      <div style={s.bg} />
      <div style={s.card}>
        <LogoArea />
        <div style={s.resetTitle}>RECUPERAR CONTRASEÑA</div>
        <form onSubmit={handleReset} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>TU CORREO</label>
            <input style={s.input} type="email" placeholder="tucorreo@gmail.com"
              value={resetEmail} onChange={e => setResetEmail(e.target.value)} required />
          </div>
          {resetMsg && <div style={resetMsg.includes('Error') ? s.error : s.success}>{resetMsg}</div>}
          <button style={{...s.btn, opacity: loading ? 0.7 : 1}} type="submit" disabled={loading}>
            {loading ? 'ENVIANDO...' : 'ENVIAR CORREO'}
          </button>
          <button type="button" style={s.backBtn} onClick={() => { setResetMode(false); setResetMsg('') }}>
            ← Volver al login
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      <div style={s.bg} />
      <div style={s.card}>
        <LogoArea />
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
            <div style={s.passWrap}>
              <input style={{...s.input, ...s.passInput}} type={showPass ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              <button type="button" style={s.eyeBtn} onClick={() => setShowPass(!showPass)}>
                <EyeIcon />
              </button>
            </div>
          </div>

          {mode === 'login' && (
            <div style={s.rememberRow}>
              <label style={s.rememberLabel}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  style={{marginRight: 6, accentColor: '#C9A84C'}} />
                Recordarme
              </label>
              <button type="button" style={s.forgotBtn} onClick={() => { setResetMode(true); setResetEmail(email) }}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

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

function LogoArea() {
  const [logoUrl, setLogoUrl] = useState(null)
  useState(() => {
    import('../lib/supabase').then(({ supabase }) => {
      supabase.from('configuracion').select('valor').eq('clave', 'logo_url').single()
        .then(({ data }) => { if (data) setLogoUrl(data.valor) })
    })
  })

  return (
    <div style={s.logoArea}>
      <div style={s.trophyWrap}>
        <div style={s.trophyGlow} />
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" style={s.trophyImg} />
        ) : (
          <span style={{fontSize: 52}}>🏆</span>
        )}
      </div>
      <div style={s.title}>LA POLLA DEL</div>
      <div style={s.titleGold}>MUNDO 2026</div>
      <div style={s.subtitle}>USA · CANADA · MÉXICO</div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative', overflow: 'hidden', background: '#0a0a0a' },
  bg: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, #1a1200 0%, #0a0a0a 60%)', pointerEvents: 'none' },
  card: { width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 },
  logoArea: { textAlign: 'center', marginBottom: '2rem' },
  trophyWrap: { position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  trophyGlow: { position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, #C9A84C33 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  trophyImg: { width: 110, height: 'auto', position: 'relative', zIndex: 1, filter: 'drop-shadow(0 4px 20px #C9A84C66)' },
  title: { fontFamily: "'Arial Black', sans-serif", fontSize: 32, fontWeight: 900, letterSpacing: 4, color: '#F5F0E8', lineHeight: 1 },
  titleGold: { fontFamily: "'Arial Black', sans-serif", fontSize: 36, fontWeight: 900, letterSpacing: 4, color: '#C9A84C', lineHeight: 1, marginBottom: 8 },
  subtitle: { fontSize: 11, letterSpacing: 3, color: '#888880', fontWeight: 500 },
  resetTitle: { fontSize: 13, fontWeight: 700, letterSpacing: 2, color: '#F5F0E8', marginBottom: '1.5rem', textAlign: 'center' },
  tabs: { display: 'flex', borderBottom: '1px solid #222', marginBottom: '1.5rem' },
  tab: { flex: 1, background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '10px', fontSize: 12, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', color: '#444', marginBottom: -1, transition: 'all .2s', fontFamily: "'Arial Black', sans-serif" },
  tabActive: { color: '#C9A84C', borderBottomColor: '#C9A84C' },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#888880' },
  input: { padding: '12px 14px', background: '#161616', border: '1px solid #222', borderRadius: 8, fontSize: 14, color: '#F5F0E8', outline: 'none' },
  passWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  passInput: { flex: 1, paddingRight: 44 },
  eyeBtn: { position: 'absolute', right: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' },
  rememberRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: -6 },
  rememberLabel: { display: 'flex', alignItems: 'center', fontSize: 12, color: '#888880', cursor: 'pointer' },
  forgotBtn: { background: 'none', border: 'none', color: '#C9A84C', fontSize: 12, cursor: 'pointer', padding: 0, fontWeight: 500 },
  btn: { padding: '14px', background: 'linear-gradient(135deg, #C9A84C, #8a6d2a)', color: '#0a0a0a', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 900, letterSpacing: 2, cursor: 'pointer', marginTop: 4, fontFamily: "'Arial Black', sans-serif" },
  backBtn: { background: 'none', border: 'none', color: '#888880', fontSize: 13, cursor: 'pointer', textAlign: 'center', padding: '8px 0', marginTop: 4 },
  error: { color: '#FF2D2D', fontSize: 12, padding: '10px 12px', background: '#1a0808', borderRadius: 6, border: '1px solid #7a0f0f' },
  success: { color: '#00C97A', fontSize: 12, padding: '10px 12px', background: '#001a0f', borderRadius: 6, border: '1px solid #005a30' },
}
