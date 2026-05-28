import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const RONDAS = ['R1','R2','R3','R4','R5','R6']
const FASES = { R1:'Fase de grupos', R2:'Dieciseisavos', R3:'Octavos', R4:'Cuartos', R5:'Semifinales', R6:'Final' }

export default function Admin({ participante }) {
  const [tab, setTab] = useState('partidos')
  const [partidos, setPartidos] = useState([])
  const [participantes, setParticipantes] = useState([])
  const [ronda, setRonda] = useState('R1')
  const [form, setForm] = useState({ local: '', visita: '', fecha_hora: '', ronda: 'R1' })
  const [msg, setMsg] = useState('')
  const [apiKey, setApiKey] = useState(localStorage.getItem('api_football_key') || '')

  function saveApiKey(key) {
    setApiKey(key)
    localStorage.setItem('api_football_key', key)
  }
  const [syncing, setSyncing] = useState(false)

  useEffect(() => { fetchPartidos(); fetchParticipantes() }, [ronda])

  async function fetchPartidos() {
    const { data } = await supabase.from('partidos').select('*').eq('ronda', ronda).order('fecha_hora')
    setPartidos(data || [])
  }

  async function fetchParticipantes() {
    const { data } = await supabase.from('participantes').select('*').order('created_at')
    setParticipantes(data || [])
  }

  async function addPartido(e) {
    e.preventDefault()
    const { error } = await supabase.from('partidos').insert({
      ronda: form.ronda, fase: FASES[form.ronda],
      equipo_local: form.local.trim(), equipo_visita: form.visita.trim(),
      fecha_hora: form.fecha_hora, estado: 'pendiente',
    })
    if (error) showMsg('Error: ' + error.message)
    else { showMsg('Partido agregado ✓'); setForm({ ...form, local: '', visita: '', fecha_hora: '' }); fetchPartidos() }
  }

  async function registrarResultado(partido) {
    const local = parseInt(prompt(`Goles de ${partido.equipo_local}:`))
    const visita = parseInt(prompt(`Goles de ${partido.equipo_visita}:`))
    const scorer = prompt('Primer anotador (nombre exacto o "autogol"):')
    if (isNaN(local) || isNaN(visita)) return
    const { error } = await supabase.rpc('registrar_resultado', {
      p_partido_id: partido.id,
      p_goles_local: local,
      p_goles_visita: visita,
      p_primer_anotador: scorer || null,
    })
    if (error) showMsg('Error: ' + error.message)
    else { showMsg('Resultado guardado y puntos calculados ✓'); fetchPartidos() }
  }

  async function eliminarPartido(partido) {
    if (!confirm(`¿Eliminar ${partido.equipo_local} vs ${partido.equipo_visita}?`)) return
    await supabase.from('partidos').delete().eq('id', partido.id)
    showMsg('Partido eliminado ✓')
    fetchPartidos()
  }

  async function ocultarPartido(partido) {
    await supabase.from('partidos').update({ estado: partido.estado === 'oculto' ? 'pendiente' : 'oculto' }).eq('id', partido.id)
    showMsg(partido.estado === 'oculto' ? 'Partido visible ✓' : 'Partido oculto ✓')
    fetchPartidos()
  }
    async function syncDesdeAPI(partido) { if (!apiKey) { showMsg('Primero agrega tu API key'); return }
    setSyncing(true)
    try {
      const res = await fetch(`https://v3.football.api-sports.io/fixtures?id=${partido.api_fixture_id}`, {
        headers: { 'x-apisports-key': apiKey }
      })
      const data = await res.json()
      const fix = data.response?.[0]
      if (!fix) { showMsg('Partido no encontrado en la API'); setSyncing(false); return }
      if (!['FT','AET','PEN'].includes(fix.fixture.status.short)) { showMsg('El partido aún no ha terminado'); setSyncing(false); return }
      const local = fix.goals.home
      const visita = fix.goals.away
      const events = fix.events || []
      const firstGoal = events.find(e => e.type === 'Goal')
      const isOwnGoal = firstGoal?.detail === 'Own Goal'
      const scorer = isOwnGoal ? 'autogol' : firstGoal?.player?.name || null
      await supabase.from('partidos').update({ goles_local: local, goles_visita: visita, primer_anotador: scorer, estado: 'finalizado' }).eq('id', partido.id)
      await supabase.rpc('calcular_puntos', { p_partido_id: partido.id })
      showMsg(`Sincronizado: ${local}–${visita} · ${scorer || 'sin anotador'}`)
      fetchPartidos()
    } catch (err) {
      showMsg('Error: ' + err.message)
    }
    setSyncing(false)
  }

  function showMsg(m) { setMsg(m); setTimeout(() => setMsg(''), 4000) }

  const fmtFecha = f => new Date(f).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  if (!participante?.es_admin) return (
    <div style={s.noAdmin}>🔒 Solo para el organizador.</div>
  )

  return (
    <div style={s.page}>
      <div style={s.tabs}>
        {['partidos','participantes','api'].map(t => (
          <button key={t} style={{...s.tab, ...(tab===t ? s.tabActive : {})}} onClick={() => setTab(t)}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {msg && <div style={s.msgBox}>{msg}</div>}

      {tab === 'partidos' && (
        <>
          <div style={s.card}>
            <div style={s.cardTitle}>AGREGAR PARTIDO</div>
            <form onSubmit={addPartido} style={s.form}>
              <select style={s.input} value={form.ronda} onChange={e => setForm({...form, ronda: e.target.value})}>
                {RONDAS.map(r => <option key={r} value={r}>{r} — {FASES[r]}</option>)}
              </select>
              <div style={s.row2}>
                <input style={s.input} placeholder="Equipo local" value={form.local} onChange={e => setForm({...form, local: e.target.value})} required />
                <input style={s.input} placeholder="Equipo visitante" value={form.visita} onChange={e => setForm({...form, visita: e.target.value})} required />
              </div>
              <input style={s.input} type="datetime-local" value={form.fecha_hora} onChange={e => setForm({...form, fecha_hora: e.target.value})} required />
              <button style={s.btn} type="submit">+ AGREGAR</button>
            </form>
          </div>

          <div style={s.rondas}>
            {RONDAS.map(r => (
              <button key={r} style={{...s.rondaBtn, ...(ronda===r ? s.rondaActive : {})}} onClick={() => setRonda(r)}>
                {FASES[r]}
              </button>
            ))}
          </div>

          {partidos.map(p => (
            <div key={p.id} style={s.partidoCard}>
              <div style={s.partidoInfo}>
                <div style={s.partidoNombre}>{p.equipo_local} vs {p.equipo_visita}</div>
                <div style={s.partidoFecha}>{fmtFecha(p.fecha_hora)}</div>
                {p.goles_local !== null && (
                  <div style={s.resultadoBadge}>✓ {p.goles_local}–{p.goles_visita} · {p.primer_anotador || 'sin anotador'}</div>
                )}
              </div>
              <div style={s.partidoActions}>
                <button style={s.btnSm} onClick={() => registrarResultado(p)}>Manual</button>
                {p.api_fixture_id && (
                  <button style={{...s.btnSm, ...s.btnGold}} onClick={() => syncDesdeAPI(p)} disabled={syncing}>
                    {syncing ? '...' : 'Sync API'}
                  </button>
                )}
                <button style={{...s.btnSm, ...s.btnWarning}} onClick={() => ocultarPartido(p)}>
                  {p.estado === 'oculto' ? '👁 Mostrar' : '🙈 Ocultar'}
                </button>
                <button style={{...s.btnSm, ...s.btnDanger}} onClick={() => eliminarPartido(p)}>🗑</button>
              </div>
            </div>
          ))}
        </>
      )}

      {tab === 'participantes' && (
        <div>
          {participantes.map(p => (
            <div key={p.id} style={s.partRow}>
              <div style={s.partInfo}>
                <div style={s.partNombre}>
                  {p.nombre}
                  {p.es_admin && <span style={s.adminBadge}>ADMIN</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'api' && (
        <div style={s.card}>
          <div style={s.cardTitle}>API-FOOTBALL</div>
          <p style={s.hint}>Regístrate gratis en <strong style={{color:'#C9A84C'}}>dashboard.api-football.com</strong>, copia tu API key y pégala aquí.</p>
          <input style={s.input} type="text" placeholder="Tu API key" value={apiKey} onChange={e => saveApiKey(e.target.value)} />
          <p style={{...s.hint, marginTop: 12}}>Para sincronizar, cada partido debe tener su <code style={s.code}>api_fixture_id</code>. Consúltalo así:<br/><code style={s.code}>GET /fixtures?league=1&season=2026</code></p>
        </div>
      )}
    </div>
  )
}

const s = {
  page: { padding: '1rem 0' },
  noAdmin: { textAlign: 'center', padding: '3rem', color: '#444', fontSize: 15 },
  tabs: { display: 'flex', borderBottom: '1px solid #1e1e1e', marginBottom: '1rem' },
  tab: { flex: 1, background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '8px', fontSize: 12, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', color: '#444', marginBottom: -1, fontFamily: "'Barlow Condensed', sans-serif" },
  tabActive: { color: '#C9A84C', borderBottomColor: '#C9A84C' },
  card: { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '14px', marginBottom: '1rem' },
  cardTitle: { fontSize: 11, letterSpacing: 3, fontWeight: 700, color: '#C9A84C', marginBottom: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 8 },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  input: { padding: '10px 12px', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, fontSize: 13, color: '#F5F0E8', width: '100%', boxSizing: 'border-box' },
  btn: { padding: '10px', background: 'linear-gradient(135deg, #C9A84C, #8a6d2a)', color: '#0a0a0a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 900, letterSpacing: 1, cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif" },
  rondas: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1rem' },
  rondaBtn: { padding: '4px 10px', borderRadius: 100, border: '1px solid #222', background: 'transparent', fontSize: 11, fontWeight: 600, cursor: 'pointer', color: '#888880' },
  rondaActive: { background: '#C9A84C', color: '#0a0a0a', borderColor: '#C9A84C' },
  partidoCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '10px 14px', marginBottom: 8, gap: 8 },
  partidoInfo: { flex: 1 },
  partidoNombre: { fontSize: 13, fontWeight: 600, color: '#F5F0E8' },
  partidoFecha: { fontSize: 11, color: '#888880', marginTop: 2 },
  resultadoBadge: { fontSize: 11, color: '#00C97A', marginTop: 4 },
  partidoActions: { display: 'flex', gap: 6 },
  btnSm: { padding: '6px 10px', border: '1px solid #222', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', background: '#161616', color: '#F5F0E8' },
  btnGold: { background: '#C9A84C22', color: '#C9A84C', borderColor: '#C9A84C44' },
  btnWarning: { background: '#1a1200', color: '#C9A84C', borderColor: '#2a2000' },
  btnDanger: { background: '#1a0808', color: '#FF2D2D', borderColor: '#7a0f0f' },
  partRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '10px 14px', marginBottom: 8 },
  partInfo: { flex: 1 },
  partNombre: { fontSize: 14, fontWeight: 600, color: '#F5F0E8', display: 'flex', alignItems: 'center', gap: 6 },
  adminBadge: { fontSize: 9, background: '#C9A84C', color: '#0a0a0a', padding: '2px 6px', borderRadius: 100, fontWeight: 900, letterSpacing: 1 },
  msgBox: { fontSize: 12, padding: '10px 14px', background: '#001a0f', color: '#00C97A', borderRadius: 8, marginBottom: '1rem', border: '1px solid #005a30' },
  hint: { fontSize: 12, color: '#888880', lineHeight: 1.6, marginBottom: 8 },
  code: { fontFamily: 'monospace', fontSize: 11, background: '#161616', padding: '2px 6px', borderRadius: 4, color: '#C9A84C' },
}
