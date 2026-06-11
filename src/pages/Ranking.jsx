import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const RONDAS = [
  { id: 'total', label: 'TOTAL' },
  { id: 'dia', label: 'HOY' },
  { id: 'R1', label: 'GRUPOS' },
  { id: 'R2', label: '16AVOS' },
  { id: 'R3', label: 'OCTAVOS' },
  { id: 'R4', label: 'CUARTOS' },
  { id: 'R5', label: 'SEMIS' },
  { id: 'R6', label: 'FINAL' },
]

const COLORS = ['#C9A84C','#888880','#8B5E3C','#1E6FFF','#00C97A','#FF2D2D','#9B59B6','#E67E22']

function Countdown() {
  const [tiempo, setTiempo] = useState({ d:0, h:0, m:0, s:0, started: false })
  useEffect(() => {
    function calc() {
      const mundial = new Date('2026-06-11T19:00:00Z')
      const diff = mundial - new Date()
      if (diff <= 0) { setTiempo({ started: true }); return }
      setTiempo({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        started: false
      })
    }
    calc()
    const i = setInterval(calc, 1000)
    return () => clearInterval(i)
  }, [])

  if (tiempo.started) return (
    <div style={cd.wrap}>
      <div style={cd.startedText}>🏆 EL MUNDIAL HA COMENZADO</div>
    </div>
  )

  return (
    <div style={cd.wrap}>
      <div style={cd.label}>FALTAN</div>
      <div style={cd.boxes}>
        {[{v: tiempo.d, l:'DÍAS'},{v: tiempo.h, l:'HRS'},{v: tiempo.m, l:'MIN'},{v: tiempo.s, l:'SEG'}].map(({v,l}) => (
          <div key={l} style={cd.box}>
            <div style={cd.num}>{String(v).padStart(2,'0')}</div>
            <div style={cd.unit}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const cd = {
  wrap: { background: 'linear-gradient(135deg, #161200, #0a0a0a)', border: '1px solid #2a2000', borderRadius: 16, padding: '16px', marginBottom: '1rem', textAlign: 'center' },
  label: { fontSize: 10, letterSpacing: 3, color: '#C9A84C', marginBottom: 10, fontWeight: 700 },
  boxes: { display: 'flex', gap: 8, justifyContent: 'center' },
  box: { background: '#111', border: '1px solid #222', borderRadius: 8, padding: '8px 12px', minWidth: 56 },
  num: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, color: '#F5F0E8', lineHeight: 1 },
  unit: { fontSize: 9, letterSpacing: 2, color: '#888880', marginTop: 2 },
  startedText: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 900, color: '#C9A84C', letterSpacing: 2 },
}

function ProximosPartidos() {
  const [partidos, setPartidos] = useState([])
  useEffect(() => {
    supabase.from('partidos').select('*').neq('estado','oculto').order('fecha_hora').limit(10).then(({data}) => setPartidos(data || []))
  }, [])

  const ahora = new Date()
  const enVivo = partidos.filter(p => {
    const ini = new Date(p.fecha_hora)
    const fin = new Date(ini.getTime() + 2*60*60*1000)
    return p.estado !== 'finalizado' && ahora >= ini && ahora <= fin
  })
  const proximos = partidos.filter(p => new Date(p.fecha_hora) > ahora && p.estado !== 'finalizado').slice(0,3)

  const fmt = f => {
    const d = new Date(f)
    const hoy = new Date()
    const man = new Date(); man.setDate(hoy.getDate()+1)
    const hora = d.toLocaleTimeString('es', {hour:'2-digit', minute:'2-digit'})
    if (d.toDateString() === hoy.toDateString()) return 'Hoy · ' + hora
    if (d.toDateString() === man.toDateString()) return 'Mañana · ' + hora
    return d.toLocaleDateString('es', {weekday:'short', day:'numeric', month:'short'}) + ' · ' + hora
  }

  const rondaLabel = r => ({R1:'Grupos',R2:'16avos',R3:'Octavos',R4:'Cuartos',R5:'Semis',R6:'Final'})[r] || r

  if (partidos.length === 0) return null

  return (
    <div style={{marginBottom:'1rem'}}>
      {enVivo.map(p => (
        <div key={p.id} style={pp.liveCard}>
          <div style={pp.liveHeader}>
            <span style={pp.liveDot}></span>
            <span style={pp.liveLabel}>EN VIVO · {rondaLabel(p.ronda)}</span>
            {p.minuto && <span style={pp.liveMin}>{p.minuto}'</span>}
          </div>
          <div style={pp.matchRow}>
            <span style={pp.team}>{p.equipo_local}</span>
            <div style={pp.liveScore}>{p.goles_local != null ? p.goles_local : '–'} : {p.goles_visita != null ? p.goles_visita : '–'}</div>
            <span style={{...pp.team, textAlign:'right'}}>{p.equipo_visita}</span>
          </div>
        </div>
      ))}
      {proximos.length > 0 && (
        <>
          <div style={pp.sectionTitle}>PRÓXIMOS PARTIDOS</div>
          {proximos.map(p => (
            <div key={p.id} style={pp.card}>
              <div style={pp.cardTop}>
                <span style={pp.ronda}>{rondaLabel(p.ronda)}</span>
                <span style={pp.fecha}>{fmt(p.fecha_hora)}</span>
              </div>
              <div style={pp.matchRow}>
                <span style={pp.team}>{p.equipo_local}</span>
                <span style={pp.vs}>VS</span>
                <span style={{...pp.team, textAlign:'right'}}>{p.equipo_visita}</span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

const pp = {
  sectionTitle: { fontSize: 10, letterSpacing: 3, color: '#888880', fontWeight: 700, marginBottom: 8 },
  liveCard: { background: 'linear-gradient(135deg, #1a0808, #0a0a0a)', border: '1px solid #7a0f0f', borderRadius: 12, padding: '12px 14px', marginBottom: 8 },
  liveHeader: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 },
  liveDot: { width: 8, height: 8, borderRadius: '50%', background: '#FF2D2D', display: 'inline-block' },
  liveMin: { fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#FF2D2D', marginLeft: 8, fontFamily: "'Barlow Condensed', sans-serif" },
  liveScore: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, color: '#FF2D2D', minWidth: 70, textAlign: 'center' },
  card: { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '10px 14px', marginBottom: 8 },
  cardTop: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  ronda: { fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#C9A84C' },
  fecha: { fontSize: 11, color: '#888880' },
  matchRow: { display: 'flex', alignItems: 'center', gap: 8 },
  team: { flex: 1, fontSize: 14, fontWeight: 600, color: '#F5F0E8' },
  vs: { fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#444', minWidth: 30, textAlign: 'center' },
}

export default function Ranking({ participante }) {
  const [ranking, setRanking] = useState([])
  const [ronda, setRonda] = useState('total')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchRanking() }, [ronda])

  async function fetchRanking() {
    setLoading(true)
    const { data } = await supabase
      .from('participantes')
      .select('id, nombre, activo, puntos(total, pts_marcador, pts_anotador, pts_resultado, partido_id, partidos(ronda, fecha_hora))')

    if (!data) { setLoading(false); return }
    const hoy = new Date().toDateString()

    const lista = data.map(p => {
      let puntosFiltrados = p.puntos || []
      if (ronda === 'dia') {
        puntosFiltrados = puntosFiltrados.filter(pu => pu.partidos?.fecha_hora && new Date(pu.partidos.fecha_hora).toDateString() === hoy)
      } else if (ronda !== 'total') {
        puntosFiltrados = puntosFiltrados.filter(pu => pu.partidos?.ronda === ronda)
      }
      return {
        id: p.id,
        nombre: p.nombre,
        activo: p.activo,
        total: puntosFiltrados.reduce((s, pu) => s + (pu.total || 0), 0),
        pts_marcador: puntosFiltrados.reduce((s, pu) => s + (pu.pts_marcador || 0), 0),
        pts_anotador: puntosFiltrados.reduce((s, pu) => s + (pu.pts_anotador || 0), 0),
        pts_resultado: puntosFiltrados.reduce((s, pu) => s + (pu.pts_resultado || 0), 0),
      }
    })

    // Activos primero ordenados por puntos, inactivos al final
    const activos = lista.filter(p => p.activo).sort((a, b) => b.total - a.total)
    const inactivos = lista.filter(p => !p.activo).sort((a, b) => b.total - a.total)

    setRanking([...activos, ...inactivos])
    setLoading(false)
  }

  const activos = ranking.filter(p => p.activo)
  const myPos = activos.findIndex(r => r.id === participante?.id) + 1
  const myData = ranking.find(r => r.id === participante?.id)

  return (
    <div style={s.page}>
      <Countdown />
      <ProximosPartidos />

      <div style={s.myCard}>
        <div style={s.myLeft}>
          <div style={s.myLabel}>TU POSICIÓN</div>
          <div style={s.myPos}>{myData?.activo ? (myPos || '–') : '–'}</div>
        </div>
        <div style={s.myDivider} />
        <div style={s.myRight}>
          <div style={s.myLabel}>TUS PUNTOS</div>
          <div style={s.myPts}>{myData?.total || 0} <span style={s.myPtsLabel}>PTS</span></div>
        </div>
        <div style={s.myDivider} />
        <div style={s.myRight}>
          <div style={s.myLabel}>PARTICIPANTES</div>
          <div style={s.myPts}>{activos.length}</div>
        </div>
      </div>

      <div style={s.rondas}>
        {RONDAS.map(r => (
          <button key={r.id} style={{...s.rondaBtn, ...(ronda===r.id ? s.rondaActive : {})}}
            onClick={() => setRonda(r.id)}>{r.label}</button>
        ))}
      </div>

      {loading ? <div style={s.loading}>Cargando...</div> : (
        <div style={s.list}>
          {ranking.map((p, i) => {
            const isActive = p.activo
            const activeIndex = activos.findIndex(a => a.id === p.id)
            const initials = p.nombre.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
            const isMe = p.id === participante?.id
            const medal = activeIndex === 0 ? '🥇' : activeIndex === 1 ? '🥈' : activeIndex === 2 ? '🥉' : null

            return (
              <div key={p.id} style={{...s.row, ...(isMe ? s.rowMe : {}), ...(!isActive ? s.rowInactive : {})}}>
                <div style={s.pos}>
                  {isActive
                    ? (medal || <span style={s.posNum}>{activeIndex + 1}</span>)
                    : <span style={s.posNumInactive}>—</span>
                  }
                </div>
                <div style={{...s.avatar, background: COLORS[i % COLORS.length] + '22', border: '1px solid ' + COLORS[i % COLORS.length] + '44', color: COLORS[i % COLORS.length]}}>
                  {initials}
                </div>
                <div style={s.info}>
                  <div style={s.nombre}>
                    {p.nombre}
                    {isMe && <span style={s.meBadge}>TÚ</span>}
                    {!isActive && <span style={s.inactiveBadge}>INACTIVO</span>}
                  </div>
                  <div style={s.breakdown}>
                    <span style={{color:'#C9A84C'}}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle', marginRight:2}}><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                      {p.pts_marcador}
                    </span>
                    <span style={{color:'#1E6FFF', margin:'0 6px'}}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1E6FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle', marginRight:2}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      {p.pts_anotador}
                    </span>
                    <span style={{color:'#00C97A'}}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#00C97A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle', marginRight:2}}><polyline points="20 6 9 17 4 12"/></svg>
                      {p.pts_resultado}
                    </span>
                  </div>
                </div>
                <div style={s.pts}>
                  {p.total}
                  <span style={s.ptsLabel}>pts</span>
                </div>
              </div>
            )
          })}
          {ranking.length === 0 && <p style={s.empty}>Sin datos aún.</p>}
        </div>
      )}
    </div>
  )
}

const s = {
  page: { padding: '1rem 0' },
  myCard: { display: 'flex', background: '#111', border: '1px solid #C9A84C22', borderRadius: 12, padding: '14px 16px', marginBottom: '1rem', gap: 8, alignItems: 'center' },
  myLeft: { flex: 1, textAlign: 'center' },
  myRight: { flex: 1, textAlign: 'center' },
  myDivider: { width: 1, height: 36, background: '#222' },
  myLabel: { fontSize: 9, letterSpacing: 2, color: '#888880', marginBottom: 4 },
  myPos: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, color: '#C9A84C', lineHeight: 1 },
  myPts: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 900, color: '#F5F0E8', lineHeight: 1 },
  myPtsLabel: { fontSize: 12, color: '#888880', fontWeight: 400 },
  rondas: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1rem' },
  rondaBtn: { padding: '5px 12px', borderRadius: 100, border: '1px solid #222', background: 'transparent', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', color: '#888880', fontFamily: "'Barlow Condensed', sans-serif", transition: 'all .15s' },
  rondaActive: { background: '#C9A84C', color: '#0a0a0a', borderColor: '#C9A84C' },
  list: { display: 'flex', flexDirection: 'column', gap: 6 },
  row: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#111', borderRadius: 12, border: '1px solid #1e1e1e' },
  rowMe: { border: '1px solid #C9A84C44', background: '#161200' },
  rowInactive: { opacity: 0.55 },
  pos: { width: 28, textAlign: 'center', fontSize: 18, flexShrink: 0 },
  posNum: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: '#444' },
  posNumInactive: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, color: '#333' },
  avatar: { width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, fontFamily: "'Barlow Condensed', sans-serif" },
  info: { flex: 1, minWidth: 0 },
  nombre: { fontSize: 15, fontWeight: 600, color: '#F5F0E8', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  meBadge: { fontSize: 9, background: '#C9A84C', color: '#0a0a0a', padding: '2px 6px', borderRadius: 100, fontWeight: 900, letterSpacing: 1 },
  inactiveBadge: { fontSize: 9, background: '#222', color: '#666', padding: '2px 6px', borderRadius: 100, fontWeight: 700, letterSpacing: 1 },
  breakdown: { fontSize: 11, color: '#444440', marginTop: 2 },
  pts: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, color: '#F5F0E8', display: 'flex', alignItems: 'baseline', gap: 3 },
  ptsLabel: { fontSize: 11, fontWeight: 400, color: '#444440' },
  loading: { textAlign: 'center', color: '#444', padding: '2rem', fontSize: 13 },
  empty: { textAlign: 'center', color: '#444', padding: '2rem', fontSize: 13 },
}
