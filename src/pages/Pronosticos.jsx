import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const RONDAS = [
  { id: 'R1', label: 'GRUPOS' },
  { id: 'R2', label: '16AVOS' },
  { id: 'R3', label: 'OCTAVOS' },
  { id: 'R4', label: 'CUARTOS' },
  { id: 'R5', label: 'SEMIS' },
  { id: 'R6', label: 'FINAL' },
]

const PUNTOS_RONDA = {
  R1: { marcador: 3, anotador: 2, resultado: 1 },
  R2: { marcador: 6, anotador: 4, resultado: 2 },
  R3: { marcador: 10, anotador: 6, resultado: 4 },
  R4: { marcador: 15, anotador: 9, resultado: 6 },
  R5: { marcador: 20, anotador: 12, resultado: 8 },
  R6: { marcador: 30, anotador: 18, resultado: 12 },
}

export default function Pronosticos({ participante }) {
  const [ronda, setRonda] = useState('R1')
  const [partidos, setPartidos] = useState([])
  const [pronosticos, setPronosticos] = useState({})
  const [enviados, setEnviados] = useState({})
  const [jugadores, setJugadores] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => { fetchData() }, [ronda])

  async function fetchData() {
    setLoading(true)

    const { data: ps } = await supabase
      .from('partidos').select('*').eq('ronda', ronda).neq('estado', 'oculto').order('fecha_hora')

    const ids = (ps || []).map(p => p.id)

    const { data: pronos } = await supabase
      .from('pronosticos').select('*')
      .eq('participante_id', participante.id)
      .in('partido_id', ids.length ? ids : [0])

    const { data: jugs } = await supabase
      .from('jugadores').select('nombre, numero, equipo')
      .in('equipo', (ps || []).flatMap(p => [p.equipo_local, p.equipo_visita]))

    const pronosMap = {}
    const enviadosMap = {}
    ;(pronos || []).forEach(pr => {
      pronosMap[pr.partido_id] = { local: pr.goles_local, visita: pr.goles_visita, scorer: pr.primer_anotador }
      enviadosMap[pr.partido_id] = pr.bloqueado || false
    })

    const jugsMap = {}
    ;(jugs || []).forEach(j => {
      if (!jugsMap[j.equipo]) jugsMap[j.equipo] = []
      jugsMap[j.equipo].push({ nombre: j.nombre, numero: j.numero })
    })
    Object.keys(jugsMap).forEach(eq => {
      jugsMap[eq].sort((a, b) => (a.numero || 99) - (b.numero || 99))
    })

    setPartidos(ps || [])
    setPronosticos(pronosMap)
    setEnviados(enviadosMap)
    setJugadores(jugsMap)
    setLoading(false)
  }

  function updateProno(partidoId, field, value) {
    if (enviados[partidoId]) return
    setPronosticos(prev => ({
      ...prev,
      [partidoId]: { ...(prev[partidoId] || { local: 0, visita: 0, scorer: '' }), [field]: value }
    }))
  }

  function isDeadlinePassed(fechaHora) {
    const deadline = new Date(fechaHora)
    deadline.setDate(deadline.getDate() - 1)
    deadline.setHours(23, 59, 0, 0)
    return new Date() > deadline
  }

  async function enviarProno(partido) {
    if (enviados[partido.id]) return
    setSaving(partido.id)
    const pr = pronosticos[partido.id] || { local: 0, visita: 0, scorer: '' }

    const { error } = await supabase.from('pronosticos').upsert({
      participante_id: participante.id,
      partido_id: partido.id,
      goles_local: parseInt(pr.local) || 0,
      goles_visita: parseInt(pr.visita) || 0,
      primer_anotador: pr.scorer || '',
      bloqueado: true,
    }, { onConflict: 'participante_id,partido_id' })

    if (!error) {
      setEnviados(prev => ({ ...prev, [partido.id]: true }))
    } else {
      setMsg('Error al guardar')
    }
    setSaving(null)
  }

  const fmtFecha = f => new Date(f).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  const rondaLabel = r => ({ R1:'Grupos', R2:'16avos', R3:'Octavos', R4:'Cuartos', R5:'Semis', R6:'Final' })[r] || r

  return (
    <div style={s.page}>
      <div style={s.rondas}>
        {RONDAS.map(r => (
          <button key={r.id} style={{...s.rondaBtn, ...(ronda===r.id ? s.rondaActive : {})}} onClick={() => setRonda(r.id)}>{r.label}</button>
        ))}
      </div>

      <div style={s.hint}>
        ⏰ Deadline: 23:59 del día anterior · Una vez enviado no se puede editar
      </div>

      {loading ? <div style={s.loading}>Cargando...</div> :
       partidos.length === 0 ? <div style={s.empty}><p>Sin partidos en esta ronda aún.</p></div> : (
        partidos.map(p => {
          const pr = pronosticos[p.id] || { local: 0, visita: 0, scorer: '' }
          const passed = isDeadlinePassed(p.fecha_hora)
          const enviado = enviados[p.id]
          const bloqueado = passed || enviado
          const pts = PUNTOS_RONDA[p.ronda]
          const jugLocal = jugadores[p.equipo_local] || []
          const jugVisita = jugadores[p.equipo_visita] || []
          const todosJug = [...jugLocal, ...jugVisita].sort()

          return (
            <div key={p.id} style={{...s.card, ...(bloqueado ? s.cardLocked : {})}}>
              <div style={s.cardTop}>
                <span style={s.rondaBadge}>{rondaLabel(p.ronda)}</span>
                <span style={s.fecha}>{fmtFecha(p.fecha_hora)}</span>
                {enviado && <span style={s.enviadoBadge}>✓ ENVIADO</span>}
                {passed && !enviado && <span style={s.closedBadge}>CERRADO</span>}
              </div>

              <div style={s.matchRow}>
                <span style={s.teamName}>{p.equipo_local}</span>
                <div style={s.scoreBox}>
                  <input type="number" min="0" max="20" style={{...s.scoreInput, ...(bloqueado ? s.inputLocked : {})}}
                    value={pr.local ?? 0} disabled={bloqueado}
                    onChange={e => updateProno(p.id, 'local', e.target.value)} />
                  <span style={s.sep}>–</span>
                  <input type="number" min="0" max="20" style={{...s.scoreInput, ...(bloqueado ? s.inputLocked : {})}}
                    value={pr.visita ?? 0} disabled={bloqueado}
                    onChange={e => updateProno(p.id, 'visita', e.target.value)} />
                </div>
                <span style={{...s.teamName, textAlign:'right'}}>{p.equipo_visita}</span>
              </div>

              <div style={s.scorerRow}>
                <div style={s.scorerLabel}>⚽ PRIMER ANOTADOR</div>
                {todosJug.length > 0 ? (
                  <select style={{...s.scorerSelect, ...(bloqueado ? s.inputLocked : {})}}
                    value={pr.scorer || ''} disabled={bloqueado}
                    onChange={e => updateProno(p.id, 'scorer', e.target.value)}>
                    <option value="">— Selecciona jugador —</option>
                    <option value="autogol">Autogol</option>
                    <optgroup label={p.equipo_local}>
                      {jugLocal.map(j => <option key={j.nombre} value={j.nombre}>{j.numero ? `${j.numero} · ${j.nombre}` : j.nombre}</option>)}
                    </optgroup>
                    <optgroup label={p.equipo_visita}>
                      {jugVisita.map(j => <option key={j.nombre} value={j.nombre}>{j.numero ? `${j.numero} · ${j.nombre}` : j.nombre}</option>)}
                    </optgroup>
                  </select>
                ) : (
                  <input type="text" style={{...s.scorerInput, ...(bloqueado ? s.inputLocked : {})}}
                    placeholder="Nombre del jugador" value={pr.scorer || ''} disabled={bloqueado}
                    onChange={e => updateProno(p.id, 'scorer', e.target.value)} />
                )}
              </div>

              <div style={s.ptsInfo}>
                <span>Marcador exacto: <strong>{pts.marcador} pts</strong></span>
                <span>Anotador: <strong>{pts.anotador} pts</strong></span>
                <span>Resultado: <strong>{pts.resultado} pts</strong></span>
              </div>

              {!bloqueado && (
                <button style={{...s.enviarBtn, opacity: saving === p.id ? 0.7 : 1}}
                  onClick={() => enviarProno(p)} disabled={saving === p.id}>
                  {saving === p.id ? 'ENVIANDO...' : 'ENVIAR PRONÓSTICO'}
                </button>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

const s = {
  page: { padding: '1rem 0' },
  rondas: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '0.75rem' },
  rondaBtn: { padding: '5px 12px', borderRadius: 100, border: '1px solid #222', background: 'transparent', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', color: '#888880', fontFamily: "'Barlow Condensed', sans-serif" },
  rondaActive: { background: '#C9A84C', color: '#0a0a0a', borderColor: '#C9A84C' },
  hint: { fontSize: 11, color: '#C9A84C', background: '#161200', padding: '8px 12px', borderRadius: 8, marginBottom: '1rem', border: '1px solid #2a2000' },
  loading: { textAlign: 'center', color: '#444', padding: '2rem', fontSize: 13 },
  empty: { textAlign: 'center', color: '#444', padding: '2rem', fontSize: 14 },
  card: { background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, padding: '14px', marginBottom: 10 },
  cardLocked: { opacity: 0.7 },
  cardTop: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  rondaBadge: { fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#C9A84C' },
  fecha: { fontSize: 11, color: '#888880', flex: 1 },
  enviadoBadge: { fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#00C97A', background: '#001a0f', padding: '2px 8px', borderRadius: 100 },
  closedBadge: { fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#FF2D2D', background: '#1a0808', padding: '2px 8px', borderRadius: 100 },
  matchRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 },
  teamName: { flex: 1, fontSize: 14, fontWeight: 600, color: '#F5F0E8' },
  scoreBox: { display: 'flex', alignItems: 'center', gap: 8 },
  scoreInput: { width: 54, textAlign: 'center', padding: '8px 4px', background: '#161616', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 22, fontWeight: 900, color: '#F5F0E8', fontFamily: "'Barlow Condensed', sans-serif" },
  inputLocked: { background: '#0a0a0a', color: '#444', cursor: 'not-allowed' },
  sep: { fontSize: 20, fontWeight: 700, color: '#444' },
  scorerRow: { marginBottom: 10 },
  scorerLabel: { fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#888880', marginBottom: 6 },
  scorerSelect: { width: '100%', padding: '10px 12px', background: '#161616', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 13, color: '#F5F0E8', cursor: 'pointer' },
  scorerInput: { width: '100%', padding: '10px 12px', background: '#161616', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 13, color: '#F5F0E8' },
  ptsInfo: { display: 'flex', gap: 12, fontSize: 11, color: '#444440', marginBottom: 12, flexWrap: 'wrap' },
  enviarBtn: { width: '100%', padding: '12px', background: 'linear-gradient(135deg, #C9A84C, #8a6d2a)', color: '#0a0a0a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 900, letterSpacing: 2, cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif" },
}
