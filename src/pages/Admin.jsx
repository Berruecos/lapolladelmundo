import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const RONDAS = ['R1','R2','R3','R4','R5','R6']
const FASES = { R1:'Fase de grupos', R2:'Dieciseisavos', R3:'Octavos', R4:'Cuartos', R5:'Semifinales', R6:'Final' }
const API_KEY = '' // El organizador pone aquí su key de API-Football

export default function Admin({ participante }) {
  const [tab, setTab] = useState('partidos')
  const [partidos, setPartidos] = useState([])
  const [participantes, setParticipantes] = useState([])
  const [ronda, setRonda] = useState('R1')
  const [form, setForm] = useState({ local: '', visita: '', fecha_hora: '', ronda: 'R1' })
  const [msg, setMsg] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [apiKey, setApiKey] = useState('')

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
      ronda: form.ronda,
      fase: FASES[form.ronda],
      equipo_local: form.local.trim(),
      equipo_visita: form.visita.trim(),
      fecha_hora: form.fecha_hora,
      estado: 'pendiente',
    })
    if (error) setMsg('Error: ' + error.message)
    else { setMsg('Partido agregado'); setForm({ local: '', visita: '', fecha_hora: '', ronda: form.ronda }); fetchPartidos() }
    setTimeout(() => setMsg(''), 3000)
  }

  async function togglePago(id, actual) {
    await supabase.from('participantes').update({ pago: !actual }).eq('id', id)
    fetchParticipantes()
  }

  async function registrarResultado(partido) {
    const local = parseInt(prompt(`Goles de ${partido.equipo_local}:`))
    const visita = parseInt(prompt(`Goles de ${partido.equipo_visita}:`))
    const scorer = prompt('Primer anotador (nombre exacto):')
    if (isNaN(local) || isNaN(visita)) return

    const { error } = await supabase.from('partidos').update({
      goles_local: local,
      goles_visita: visita,
      primer_anotador: scorer || null,
      estado: 'finalizado',
    }).eq('id', partido.id)

    if (!error) {
      await supabase.rpc('calcular_puntos', { p_partido_id: partido.id })
      setMsg('Resultado guardado y puntos calculados')
      fetchPartidos()
    }
    setTimeout(() => setMsg(''), 4000)
  }

  async function syncDesdeAPI(partido) {
    if (!apiKey) { setMsg('Primero ingresa tu API key de API-Football abajo'); return }
    setSyncing(true)
    try {
      const res = await fetch(`https://v3.football.api-sports.io/fixtures?id=${partido.api_fixture_id}`, {
        headers: { 'x-apisports-key': apiKey }
      })
      const data = await res.json()
      const fix = data.response?.[0]
      if (!fix) { setMsg('No se encontró el partido en la API'); setSyncing(false); return }
      const status = fix.fixture.status.short
      if (!['FT','AET','PEN'].includes(status)) { setMsg('El partido aún no ha terminado'); setSyncing(false); return }

      const local = fix.goals.home
      const visita = fix.goals.away
      const events = fix.events || []
      const firstGoal = events.find(e => e.type === 'Goal' && e.detail !== 'Missed Penalty')
      const scorer = firstGoal ? firstGoal.player.name : null

      await supabase.from('partidos').update({
        goles_local: local,
        goles_visita: visita,
        primer_anotador: scorer,
        estado: 'finalizado',
      }).eq('id', partido.id)

      await supabase.rpc('calcular_puntos', { p_partido_id: partido.id })
      setMsg(`Sincronizado: ${partido.equipo_local} ${local}–${visita} ${partido.equipo_visita}. Primer anotador: ${scorer || 'no registrado'}`)
      fetchPartidos()
    } catch (err) {
      setMsg('Error al sincronizar: ' + err.message)
    }
    setSyncing(false)
    setTimeout(() => setMsg(''), 5000)
  }

  const fmtFecha = (f) => new Date(f).toLocaleDateString('es-CO', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  if (!participante?.es_admin) return <div style={styles.noAdmin}><p>🔒 Esta sección es solo para el organizador.</p></div>

  return (
    <div style={styles.page}>
      <div style={styles.tabs}>
        <button style={{...styles.tab, ...(tab==='partidos' ? styles.tabActive : {})}} onClick={() => setTab('partidos')}>Partidos</button>
        <button style={{...styles.tab, ...(tab==='participantes' ? styles.tabActive : {})}} onClick={() => setTab('participantes')}>Participantes</button>
        <button style={{...styles.tab, ...(tab==='api' ? styles.tabActive : {})}} onClick={() => setTab('api')}>API Resultados</button>
      </div>

      {msg && <p style={styles.msgBox}>{msg}</p>}

      {tab === 'partidos' && (
        <>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Agregar partido</h3>
            <form onSubmit={addPartido} style={styles.form}>
              <select style={styles.input} value={form.ronda} onChange={e => setForm({...form, ronda: e.target.value})}>
                {RONDAS.map(r => <option key={r} value={r}>{r} — {FASES[r]}</option>)}
              </select>
              <div style={styles.row2}>
                <input style={styles.input} placeholder="Equipo local" value={form.local} onChange={e => setForm({...form, local: e.target.value})} required />
                <input style={styles.input} placeholder="Equipo visitante" value={form.visita} onChange={e => setForm({...form, visita: e.target.value})} required />
              </div>
              <input style={styles.input} type="datetime-local" value={form.fecha_hora} onChange={e => setForm({...form, fecha_hora: e.target.value})} required />
              <button style={styles.btn} type="submit">Agregar partido</button>
            </form>
          </div>

          <div style={styles.rondas}>
            {RONDAS.map(r => (
              <button key={r} style={{...styles.rondaBtn, ...(ronda===r ? styles.rondaActive : {})}} onClick={() => setRonda(r)}>{FASES[r]}</button>
            ))}
          </div>

          {partidos.map(p => (
            <div key={p.id} style={styles.partidoCard}>
              <div style={styles.partidoInfo}>
                <div style={styles.partidoNombre}>{p.equipo_local} vs {p.equipo_visita}</div>
                <div style={styles.partidoFecha}>{fmtFecha(p.fecha_hora)}</div>
                {p.goles_local !== null && (
                  <div style={styles.resultadoBadge}>✅ {p.goles_local}–{p.goles_visita} · {p.primer_anotador || 'sin anotador'}</div>
                )}
              </div>
              <div style={styles.partidoActions}>
                <button style={styles.btnSmall} onClick={() => registrarResultado(p)}>Resultado manual</button>
                {p.api_fixture_id && (
                  <button style={{...styles.btnSmall, ...styles.btnSync}} onClick={() => syncDesdeAPI(p)} disabled={syncing}>
                    {syncing ? '...' : 'Sync API'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </>
      )}

      {tab === 'participantes' && (
        <div>
          {participantes.map(p => (
            <div key={p.id} style={styles.partRow}>
              <div style={styles.partInfo}>
                <div style={styles.partNombre}>{p.nombre} {p.es_admin && <span style={styles.adminBadge}>Admin</span>}</div>
                <div style={styles.partEmail}>{p.pago ? '✅ Pagó $100.000' : '⏳ Pendiente de pago'}</div>
              </div>
              <button
                style={{...styles.btnSmall, ...(p.pago ? styles.btnDanger : styles.btnSuccess)}}
                onClick={() => togglePago(p.id, p.pago)}
              >
                {p.pago ? 'Marcar sin pagar' : 'Marcar como pagado'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'api' && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Configurar API-Football</h3>
          <p style={styles.hint}>Regístrate gratis en <strong>dashboard.api-football.com</strong>, copia tu API key y pégala aquí. Con esto los resultados se sincronizan automáticamente.</p>
          <div style={styles.field}>
            <label style={styles.label}>Tu API Key de API-Football</label>
            <input style={styles.input} type="text" placeholder="Pega tu key aquí" value={apiKey} onChange={e => setApiKey(e.target.value)} />
          </div>
          <p style={styles.hint2}>Una vez configurada, en cada partido verás el botón <strong>"Sync API"</strong> para jalar el resultado automáticamente.</p>
          <p style={styles.hint2}>También debes asignar el <strong>api_fixture_id</strong> a cada partido. Puedes encontrarlo buscando en la API:<br/><code style={styles.code}>GET /fixtures?league=1&season=2026</code></p>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { padding: '1rem 0' },
  noAdmin: { textAlign: 'center', padding: '3rem', color: '#888', fontSize: 15 },
  tabs: { display: 'flex', borderBottom: '1px solid #eee', marginBottom: '1rem' },
  tab: { flex: 1, background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '8px', fontSize: 13, cursor: 'pointer', color: '#888', fontWeight: 500, marginBottom: -1 },
  tabActive: { color: '#1a1a1a', borderBottomColor: '#1a1a1a' },
  card: { background: 'white', border: '1px solid #f0f0f0', borderRadius: 12, padding: '1rem', marginBottom: '1rem' },
  cardTitle: { fontSize: 14, fontWeight: 700, marginBottom: '1rem', color: '#1a1a1a' },
  form: { display: 'flex', flexDirection: 'column', gap: 8 },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  input: { padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, color: '#1a1a1a', width: '100%', boxSizing: 'border-box' },
  btn: { padding: '10px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  rondas: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1rem' },
  rondaBtn: { padding: '4px 10px', borderRadius: 100, border: '1px solid #e0e0e0', background: 'white', fontSize: 11, fontWeight: 500, cursor: 'pointer', color: '#555' },
  rondaActive: { background: '#1a1a1a', color: 'white', borderColor: '#1a1a1a' },
  partidoCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', border: '1px solid #f0f0f0', borderRadius: 10, padding: '10px 12px', marginBottom: 8, gap: 8 },
  partidoInfo: { flex: 1 },
  partidoNombre: { fontSize: 13, fontWeight: 600, color: '#1a1a1a' },
  partidoFecha: { fontSize: 11, color: '#999', marginTop: 2 },
  resultadoBadge: { fontSize: 11, color: '#166534', background: '#f0fdf4', padding: '2px 6px', borderRadius: 6, marginTop: 4, display: 'inline-block' },
  partidoActions: { display: 'flex', gap: 6, flexShrink: 0 },
  btnSmall: { padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: 'white', color: '#1a1a1a', whiteSpace: 'nowrap' },
  btnSync: { background: '#1a1a1a', color: 'white', borderColor: '#1a1a1a' },
  btnDanger: { background: '#fef2f2', color: '#991b1b', borderColor: '#fecaca' },
  btnSuccess: { background: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0' },
  partRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', border: '1px solid #f0f0f0', borderRadius: 10, padding: '10px 12px', marginBottom: 8, gap: 8 },
  partInfo: { flex: 1 },
  partNombre: { fontSize: 14, fontWeight: 600, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 6 },
  partEmail: { fontSize: 12, color: '#888', marginTop: 2 },
  adminBadge: { fontSize: 10, background: '#1a1a1a', color: 'white', padding: '1px 6px', borderRadius: 100 },
  msgBox: { fontSize: 13, padding: '8px 12px', background: '#f0fdf4', color: '#166534', borderRadius: 8, marginBottom: '1rem' },
  hint: { fontSize: 13, color: '#888', marginBottom: '1rem', lineHeight: 1.5 },
  hint2: { fontSize: 12, color: '#aaa', marginTop: '0.75rem', lineHeight: 1.5 },
  field: { marginBottom: '0.75rem' },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 4 },
  code: { fontFamily: 'monospace', fontSize: 12, background: '#f5f5f4', padding: '2px 6px', borderRadius: 4 },
}
