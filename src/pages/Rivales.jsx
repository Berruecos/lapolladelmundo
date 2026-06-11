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

export default function Rivales() {
  const [ronda, setRonda] = useState('R1')
  const [partidos, setPartidos] = useState([])
  const [selectedPartido, setSelectedPartido] = useState(null)
  const [picks, setPicks] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchPartidos() }, [ronda])

  async function fetchPartidos() {
    const { data } = await supabase
      .from('partidos').select('*')
      .eq('ronda', ronda)
      .order('fecha_hora')
    const cerrados = (data || []).filter(p => p.estado === 'finalizado' || isDeadlinePassed(p.fecha_hora))
    setPartidos(cerrados)
    setSelectedPartido(null)
    setPicks([])
  }

  function isDeadlinePassed(fechaHora) {
    const partidoUTC = new Date(fechaHora)
    const offsetColombia = 5 * 60 * 60 * 1000
    const partidoColombia = new Date(partidoUTC.getTime() - offsetColombia)
    const deadlineColombia = new Date(partidoColombia)
    deadlineColombia.setDate(deadlineColombia.getDate() - 1)
    deadlineColombia.setHours(23, 59, 59, 0)
    const ahoraColombia = new Date(Date.now() - offsetColombia)
    return ahoraColombia > deadlineColombia
  }

  async function fetchPicks(partido) {
    setSelectedPartido(partido)
    setLoading(true)
    const { data } = await supabase
      .from('pronosticos')
      .select('*, participantes(nombre)')
      .eq('partido_id', partido.id)
      .order('participantes(nombre)')
    setPicks(data || [])
    setLoading(false)
  }

  function calcPuntos(pick, partido) {
    if (partido.goles_local === null) return null
    const pts = { R1:{m:3,a:2,r:1}, R2:{m:6,a:4,r:2}, R3:{m:10,a:6,r:4}, R4:{m:15,a:9,r:6}, R5:{m:20,a:12,r:8}, R6:{m:30,a:18,r:12} }[partido.ronda]
    let total = 0
    const marcadorOk = pick.goles_local === partido.goles_local && pick.goles_visita === partido.goles_visita
    const resultadoOk = Math.sign(pick.goles_local - pick.goles_visita) === Math.sign(partido.goles_local - partido.goles_visita)
    const anotadorOk = pick.primer_anotador && partido.primer_anotador &&
      pick.primer_anotador.toLowerCase().trim() === partido.primer_anotador.toLowerCase().trim()
    if (marcadorOk) total += pts.m
    else if (resultadoOk) total += pts.r
    if (anotadorOk) total += pts.a
    return { total, marcadorOk, resultadoOk, anotadorOk }
  }

  function abrev(nombre) {
    return nombre.slice(0, 3).toUpperCase()
  }

  const fmtFecha = f => new Date(f).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })
  const rondaLabel = r => ({ R1:'Grupos', R2:'16avos', R3:'Octavos', R4:'Cuartos', R5:'Semis', R6:'Final' })[r] || r

  return (
    <div style={s.page}>
      <div style={s.rondas}>
        {RONDAS.map(r => (
          <button key={r.id} style={{...s.rondaBtn, ...(ronda===r.id ? s.rondaActive : {})}}
            onClick={() => setRonda(r.id)}>{r.label}</button>
        ))}
      </div>

      <div style={s.hint}>Solo se muestran partidos cuyo deadline ya pasó.</div>

      {partidos.length === 0 ? (
        <div style={s.empty}>Aún no hay partidos cerrados en esta ronda.</div>
      ) : (
        <>
          <div style={s.partidosList}>
            {partidos.map(p => (
              <button key={p.id}
                style={{...s.partidoBtn, ...(selectedPartido?.id === p.id ? s.partidoBtnActive : {})}}
                onClick={() => fetchPicks(p)}>
                <div style={s.partidoBtnTop}>
                  <span style={s.rondaBadge}>{rondaLabel(p.ronda)}</span>
                  <span style={s.fecha}>{fmtFecha(p.fecha_hora)}</span>
                </div>
                <div style={s.partidoBtnMatch}>
                  {p.equipo_local} vs {p.equipo_visita}
                  {p.goles_local !== null && (
                    <span style={s.resultadoInline}> · {p.goles_local}–{p.goles_visita}</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {selectedPartido && (
            <div style={s.picksSection}>
              <div style={s.picksHeader}>
                <div style={s.picksTitle}>{selectedPartido.equipo_local} vs {selectedPartido.equipo_visita}</div>
                {selectedPartido.goles_local !== null && (
                  <div style={s.picksResultado}>
                    Resultado: {selectedPartido.goles_local}–{selectedPartido.goles_visita}
                    {selectedPartido.primer_anotador && ` · ${selectedPartido.primer_anotador}`}
                  </div>
                )}
              </div>

              {loading ? <div style={s.loading}>Cargando picks...</div> :
               picks.length === 0 ? <div style={s.empty}>Nadie envió pronóstico para este partido.</div> : (
                <div style={s.table}>
                  <div style={s.tableHeader}>
                    <span style={s.thName}>PARTICIPANTE</span>
                    <span style={s.thScore}>{abrev(selectedPartido.equipo_local)} – {abrev(selectedPartido.equipo_visita)}</span>
                    <span style={s.thScorer}>ANOTADOR</span>
                    <span style={s.thPts}>PTS</span>
                  </div>
                  {picks.map(pick => {
                    const puntos = calcPuntos(pick, selectedPartido)
                    return (
                      <div key={pick.id} style={{...s.tableRow, ...(puntos?.total > 0 ? s.rowWin : {})}}>
                        <span style={s.tdName}>{pick.participantes?.nombre || '—'}</span>
                        <span style={{...s.tdScore, ...(puntos?.marcadorOk ? s.textGold : puntos?.resultadoOk ? s.textGreen : {})}}>
                          {pick.goles_local}–{pick.goles_visita}
                        </span>
                        <span style={{...s.tdScorer, ...(puntos?.anotadorOk ? s.textGold : {})}}>
                          {pick.primer_anotador || '—'}
                        </span>
                        <span style={s.tdPts}>
                          {puntos !== null ? <strong>{puntos.total}</strong> : '—'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

const s = {
  page: { padding: '1rem 0' },
  rondas: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '0.75rem' },
  rondaBtn: { padding: '5px 12px', borderRadius: 100, border: '1px solid #222', background: 'transparent', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', color: '#888880', fontFamily: "'Barlow Condensed', sans-serif" },
  rondaActive: { background: '#C9A84C', color: '#0a0a0a', borderColor: '#C9A84C' },
  hint: { fontSize: 11, color: '#888880', marginBottom: '1rem' },
  empty: { textAlign: 'center', color: '#444', padding: '2rem', fontSize: 13 },
  loading: { textAlign: 'center', color: '#444', padding: '1rem', fontSize: 13 },
  partidosList: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1rem' },
  partidoBtn: { background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' },
  partidoBtnActive: { border: '1px solid #C9A84C44', background: '#161200' },
  partidoBtnTop: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 },
  rondaBadge: { fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#C9A84C' },
  fecha: { fontSize: 11, color: '#888880' },
  partidoBtnMatch: { fontSize: 14, fontWeight: 600, color: '#F5F0E8' },
  resultadoInline: { color: '#00C97A', fontWeight: 700 },
  picksSection: { background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, padding: '14px' },
  picksHeader: { marginBottom: '1rem' },
  picksTitle: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 700, color: '#F5F0E8', marginBottom: 4 },
  picksResultado: { fontSize: 12, color: '#00C97A' },
  table: { display: 'flex', flexDirection: 'column', gap: 0 },
  tableHeader: { display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid #1e1e1e', marginBottom: 4 },
  thName: { flex: 2, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: '#444440' },
  thScore: { flex: 1, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: '#444440', textAlign: 'center' },
  thScorer: { flex: 2, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: '#444440' },
  thPts: { width: 36, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: '#444440', textAlign: 'right' },
  tableRow: { display: 'flex', gap: 8, padding: '8px 0', borderBottom: '1px solid #0f0f0f', alignItems: 'center' },
  rowWin: { },
  tdName: { flex: 2, fontSize: 13, color: '#F5F0E8', fontWeight: 500 },
  tdScore: { flex: 1, fontSize: 14, fontWeight: 700, color: '#888880', textAlign: 'center', fontFamily: "'Barlow Condensed', sans-serif" },
  tdScorer: { flex: 2, fontSize: 12, color: '#888880', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  tdPts: { width: 36, fontSize: 15, color: '#C9A84C', textAlign: 'right', fontFamily: "'Barlow Condensed', sans-serif" },
  textGold: { color: '#C9A84C' },
  textGreen: { color: '#00C97A' },
}
