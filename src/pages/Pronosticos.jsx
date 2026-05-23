import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const RONDAS = [
  { id: 'R1', label: 'Grupos' },
  { id: 'R2', label: 'Dieciseisavos' },
  { id: 'R3', label: 'Octavos' },
  { id: 'R4', label: 'Cuartos' },
  { id: 'R5', label: 'Semifinales' },
  { id: 'R6', label: 'Final' },
]

export default function Pronosticos({ participante }) {
  const [ronda, setRonda] = useState('R1')
  const [partidos, setPartidos] = useState([])
  const [pronosticos, setPronosticos] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { fetchPartidos() }, [ronda])

  async function fetchPartidos() {
    setLoading(true)
    const { data: ps } = await supabase
      .from('partidos')
      .select('*')
      .eq('ronda', ronda)
      .order('fecha_hora')

    const { data: pronos } = await supabase
      .from('pronosticos')
      .select('*')
      .eq('participante_id', participante.id)
      .in('partido_id', (ps || []).map(p => p.id))

    const pronosMap = {}
    ;(pronos || []).forEach(pr => {
      pronosMap[pr.partido_id] = { local: pr.goles_local, visita: pr.goles_visita, scorer: pr.primer_anotador }
    })

    setPartidos(ps || [])
    setPronosticos(pronosMap)
    setLoading(false)
  }

  function updateProno(partidoId, field, value) {
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

  async function save() {
    setSaving(true); setMsg('')
    const upserts = partidos
      .filter(p => !isDeadlinePassed(p.fecha_hora))
      .map(p => {
        const pr = pronosticos[p.id] || { local: 0, visita: 0, scorer: '' }
        return {
          participante_id: participante.id,
          partido_id: p.id,
          goles_local: parseInt(pr.local) || 0,
          goles_visita: parseInt(pr.visita) || 0,
          primer_anotador: pr.scorer || '',
        }
      })

    if (upserts.length === 0) { setMsg('No hay partidos con deadline abierto.'); setSaving(false); return }

    const { error } = await supabase.from('pronosticos').upsert(upserts, { onConflict: 'participante_id,partido_id' })
    if (error) setMsg('Error al guardar: ' + error.message)
    else setMsg('¡Pronósticos guardados!')
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  const fmtFecha = (f) => new Date(f).toLocaleDateString('es-CO', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div style={styles.page}>
      <div style={styles.rondas}>
        {RONDAS.map(r => (
          <button key={r.id} style={{...styles.rondaBtn, ...(ronda===r.id ? styles.rondaActive : {})}} onClick={() => setRonda(r.id)}>{r.label}</button>
        ))}
      </div>

      <p style={styles.hint}>Deadline: antes de las 23:59 del día anterior a cada partido.</p>

      {loading ? <p style={styles.muted}>Cargando partidos...</p> : partidos.length === 0 ? (
        <div style={styles.empty}>
          <p>Aún no hay partidos en esta ronda.</p>
          <p style={{fontSize: 12, color: '#aaa'}}>El organizador los cargará pronto.</p>
        </div>
      ) : (
        <>
          {partidos.map(p => {
            const pr = pronosticos[p.id] || { local: 0, visita: 0, scorer: '' }
            const passed = isDeadlinePassed(p.fecha_hora)
            const done = p.goles_local !== null
            return (
              <div key={p.id} style={{...styles.card, opacity: passed ? 0.7 : 1}}>
                <div style={styles.cardHeader}>
                  <span style={styles.fecha}>{fmtFecha(p.fecha_hora)}</span>
                  {passed && <span style={styles.badgeClosed}>Cerrado</span>}
                  {done && <span style={styles.badgeDone}>Resultado: {p.goles_local}–{p.goles_visita}</span>}
                </div>
                <div style={styles.matchRow}>
                  <span style={styles.team}>{p.equipo_local}</span>
                  <div style={styles.scoreBox}>
                    <input
                      type="number" min="0" max="20"
                      style={styles.scoreInput}
                      value={pr.local ?? 0}
                      disabled={passed}
                      onChange={e => updateProno(p.id, 'local', e.target.value)}
                    />
                    <span style={styles.sep}>–</span>
                    <input
                      type="number" min="0" max="20"
                      style={styles.scoreInput}
                      value={pr.visita ?? 0}
                      disabled={passed}
                      onChange={e => updateProno(p.id, 'visita', e.target.value)}
                    />
                  </div>
                  <span style={{...styles.team, textAlign:'right'}}>{p.equipo_visita}</span>
                </div>
                <input
                  type="text"
                  placeholder="Primer anotador (nombre del jugador)"
                  style={styles.scorerInput}
                  value={pr.scorer || ''}
                  disabled={passed}
                  onChange={e => updateProno(p.id, 'scorer', e.target.value)}
                />
              </div>
            )
          })}

          {msg && <p style={msg.includes('Error') ? styles.error : styles.success}>{msg}</p>}

          <button style={{...styles.saveBtn, opacity: saving ? 0.7 : 1}} onClick={save} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar pronósticos'}
          </button>
        </>
      )}
    </div>
  )
}

const styles = {
  page: { padding: '1rem 0' },
  rondas: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '0.75rem' },
  rondaBtn: { padding: '5px 12px', borderRadius: 100, border: '1px solid #e0e0e0', background: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', color: '#555' },
  rondaActive: { background: '#1a1a1a', color: 'white', borderColor: '#1a1a1a' },
  hint: { fontSize: 12, color: '#f59e0b', background: '#fffbeb', padding: '6px 10px', borderRadius: 6, marginBottom: '1rem' },
  muted: { color: '#999', fontSize: 14, textAlign: 'center', padding: '2rem 0' },
  empty: { textAlign: 'center', padding: '2rem', color: '#888', fontSize: 14 },
  card: { background: 'white', border: '1px solid #f0f0f0', borderRadius: 12, padding: '1rem', marginBottom: 10 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  fecha: { fontSize: 12, color: '#888' },
  badgeClosed: { fontSize: 11, background: '#fef2f2', color: '#991b1b', padding: '2px 8px', borderRadius: 100, fontWeight: 500 },
  badgeDone: { fontSize: 11, background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: 100, fontWeight: 500 },
  matchRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  team: { flex: 1, fontSize: 14, fontWeight: 600, color: '#1a1a1a' },
  scoreBox: { display: 'flex', alignItems: 'center', gap: 6 },
  scoreInput: { width: 50, textAlign: 'center', padding: '6px 4px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 18, fontWeight: 700, color: '#1a1a1a' },
  sep: { fontSize: 18, fontWeight: 700, color: '#aaa' },
  scorerInput: { width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, color: '#1a1a1a', boxSizing: 'border-box' },
  saveBtn: { width: '100%', padding: 14, background: '#1a1a1a', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
  error: { color: '#c0392b', fontSize: 13, padding: '8px 12px', background: '#fdf2f2', borderRadius: 6, marginBottom: 8 },
  success: { color: '#27ae60', fontSize: 13, padding: '8px 12px', background: '#f0faf4', borderRadius: 6, marginBottom: 8 },
}
