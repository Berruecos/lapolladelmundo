import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const RONDAS = [
  { id: 'total', label: 'Total' },
  { id: 'R1', label: 'Grupos' },
  { id: 'R2', label: '16avos' },
  { id: 'R3', label: 'Octavos' },
  { id: 'R4', label: 'Cuartos' },
  { id: 'R5', label: 'Semis' },
  { id: 'R6', label: 'Final' },
]

const COLORS = ['#dbeafe','#dcfce7','#fef9c3','#fce7f3','#ede9fe','#ffedd5','#f0fdf4','#fdf2f8']
const TEXT_COLORS = ['#1e40af','#166534','#854d0e','#9d174d','#5b21b6','#9a3412','#14532d','#86198f']

export default function Ranking({ participante }) {
  const [ranking, setRanking] = useState([])
  const [ronda, setRonda] = useState('total')
  const [loading, setLoading] = useState(true)
  const [totalPot, setTotalPot] = useState(0)

  useEffect(() => { fetchRanking() }, [ronda])

  async function fetchRanking() {
    setLoading(true)
    let query = supabase
      .from('participantes')
      .select(`id, nombre, pago, puntos(total, pts_marcador, pts_anotador, pts_resultado, partido_id, partidos(ronda))`)

    const { data } = await query
    if (!data) { setLoading(false); return }

    const pagados = data.filter(p => p.pago)
    setTotalPot(pagados.length * 100000)

    const lista = data.map(p => {
      const puntosFiltrados = (p.puntos || []).filter(pu =>
        ronda === 'total' ? true : pu.partidos?.ronda === ronda
      )
      return {
        id: p.id,
        nombre: p.nombre,
        pago: p.pago,
        total: puntosFiltrados.reduce((s, pu) => s + (pu.total || 0), 0),
        pts_marcador: puntosFiltrados.reduce((s, pu) => s + (pu.pts_marcador || 0), 0),
        pts_anotador: puntosFiltrados.reduce((s, pu) => s + (pu.pts_anotador || 0), 0),
        pts_resultado: puntosFiltrados.reduce((s, pu) => s + (pu.pts_resultado || 0), 0),
      }
    }).sort((a, b) => b.total - a.total)

    setRanking(lista)
    setLoading(false)
  }

  const fmt = n => new Intl.NumberFormat('es-CO').format(n)

  return (
    <div style={styles.page}>
      <div style={styles.metrics}>
        <div style={styles.metric}>
          <div style={styles.metricLabel}>Premio 1°</div>
          <div style={styles.metricVal}>${fmt(Math.round(totalPot * 0.6))}</div>
        </div>
        <div style={styles.metric}>
          <div style={styles.metricLabel}>Premio 2°</div>
          <div style={styles.metricVal}>${fmt(Math.round(totalPot * 0.2))}</div>
        </div>
        <div style={styles.metric}>
          <div style={styles.metricLabel}>Cerveza 🍺</div>
          <div style={styles.metricVal}>${fmt(Math.round(totalPot * 0.2))}</div>
        </div>
      </div>

      <div style={styles.rondas}>
        {RONDAS.map(r => (
          <button key={r.id} style={{...styles.rondaBtn, ...(ronda===r.id ? styles.rondaActive : {})}} onClick={() => setRonda(r.id)}>{r.label}</button>
        ))}
      </div>

      {loading ? <p style={styles.muted}>Cargando...</p> : (
        <div style={styles.list}>
          {ranking.map((p, i) => {
            const initials = p.nombre.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
            const isMe = p.id === participante?.id
            return (
              <div key={p.id} style={{...styles.row, ...(isMe ? styles.rowMe : {})}}>
                <div style={styles.pos}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span style={styles.posNum}>{i+1}</span>}
                </div>
                <div style={{...styles.avatar, background: COLORS[i % COLORS.length], color: TEXT_COLORS[i % TEXT_COLORS.length]}}>{initials}</div>
                <div style={styles.info}>
                  <div style={styles.nombre}>{p.nombre} {isMe && <span style={styles.meBadge}>Tú</span>}</div>
                  <div style={styles.breakdown}>
                    ⚽ {p.pts_marcador} · 👤 {p.pts_anotador} · ✅ {p.pts_resultado}
                  </div>
                </div>
                <div style={styles.pts}>{p.total} <span style={styles.ptsLabel}>pts</span></div>
              </div>
            )
          })}
          {ranking.length === 0 && <p style={styles.muted}>Aún no hay puntos registrados.</p>}
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { padding: '1rem 0' },
  metrics: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: '1rem' },
  metric: { background: '#f5f5f4', borderRadius: 10, padding: '10px 12px' },
  metricLabel: { fontSize: 11, color: '#888', marginBottom: 2 },
  metricVal: { fontSize: 15, fontWeight: 700, color: '#1a1a1a' },
  rondas: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1rem' },
  rondaBtn: { padding: '5px 12px', borderRadius: 100, border: '1px solid #e0e0e0', background: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', color: '#555' },
  rondaActive: { background: '#1a1a1a', color: 'white', borderColor: '#1a1a1a' },
  list: { display: 'flex', flexDirection: 'column', gap: 6 },
  row: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'white', borderRadius: 10, border: '1px solid #f0f0f0' },
  rowMe: { border: '1.5px solid #1a1a1a' },
  pos: { width: 28, textAlign: 'center', fontSize: 18 },
  posNum: { fontSize: 13, fontWeight: 600, color: '#888' },
  avatar: { width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 },
  info: { flex: 1, minWidth: 0 },
  nombre: { fontSize: 14, fontWeight: 600, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 6 },
  meBadge: { fontSize: 10, background: '#1a1a1a', color: 'white', padding: '1px 6px', borderRadius: 100, fontWeight: 500 },
  breakdown: { fontSize: 11, color: '#999', marginTop: 2 },
  pts: { fontSize: 20, fontWeight: 700, color: '#1a1a1a' },
  ptsLabel: { fontSize: 11, fontWeight: 400, color: '#999' },
  muted: { color: '#999', fontSize: 14, textAlign: 'center', padding: '2rem 0' },
}
