bash

cat > /home/claude/polla2026v2/src/pages/Reglamento.jsx << 'ENDOFFILE'
const IconClock = ({color}) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconLock = ({color}) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const IconOne = ({color}) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="9" y1="8" x2="12" y2="8"/>
  </svg>
)
const IconCalc = ({color}) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/>
  </svg>
)
const IconTimer = ({color}) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 2h6"/><path d="M12 2v3"/>
  </svg>
)
const IconExtra = ({color}) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
  </svg>
)
const IconOwnGoal = ({color}) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v4l-3 3"/>
    <line x1="8" y1="8" x2="16" y2="16"/>
  </svg>
)
const IconNo = ({color}) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>
)

export default function Reglamento() {
  const puntos = [
    { ronda: 'R1', fase: 'Grupos', marcador: 3, anotador: 2, resultado: 1 },
    { ronda: 'R2', fase: 'Dieciseisavos', marcador: 6, anotador: 4, resultado: 2 },
    { ronda: 'R3', fase: 'Octavos', marcador: 10, anotador: 6, resultado: 4 },
    { ronda: 'R4', fase: 'Cuartos', marcador: 15, anotador: 9, resultado: 6 },
    { ronda: 'R5', fase: 'Semifinales', marcador: 20, anotador: 12, resultado: 8 },
    { ronda: 'R6', fase: 'Final', marcador: 30, anotador: 18, resultado: 12 },
  ]

  const reglas = [
    { icon: <IconClock color="#C9A84C"/>, titulo: 'Deadline', texto: 'Pronósticos antes de las 23:59 del día anterior. Si no enviaste, recibes 0-0 autogol automático.' },
    { icon: <IconLock color="#1E6FFF"/>, titulo: 'No editable', texto: 'Una vez enviado tu pronóstico, queda bloqueado definitivamente. No se puede modificar.' },
    { icon: <IconOne color="#00C97A"/>, titulo: 'Solo una vez', texto: 'El pronóstico se envía una sola vez por partido.' },
    { icon: <IconCalc color="#C9A84C"/>, titulo: 'Marcador exacto', texto: 'No acumula con acertar resultado. Solo se toma el mayor puntaje.' },
    { icon: <IconTimer color="#888880"/>, titulo: 'Tiempo reglamentario', texto: 'Marcadores válidos solo a los 90 minutos.' },
    { icon: <IconExtra color="#1E6FFF"/>, titulo: '0-0 en tiempo extra', texto: 'El primer anotador es el que anote en prórroga o el primer penalti.' },
    { icon: <IconOwnGoal color="#FF2D2D"/>, titulo: 'Autogol', texto: 'Si el primer gol es autogol, gana puntos por anotador quien haya seleccionado "Autogol".' },
    { icon: <IconNo color="#FF2D2D"/>, titulo: '3° y 4° puesto', texto: 'No suma puntos.' },
  ]

  return (
    <div style={s.page}>
      <div style={s.sectionTitle}>TABLA DE PUNTOS</div>
      <div style={s.tableWrap}>
        <div style={s.tableHeader}>
          <span style={s.th}>FASE</span>
          <span style={{...s.th, textAlign:'center'}}>MARCADOR</span>
          <span style={{...s.th, textAlign:'center'}}>ANOTADOR</span>
          <span style={{...s.th, textAlign:'center'}}>RESULTADO</span>
        </div>
        {puntos.map((p, i) => (
          <div key={p.ronda} style={{...s.tableRow, background: i % 2 === 0 ? '#111' : '#0f0f0f'}}>
            <span style={s.tdFase}>{p.fase}</span>
            <span style={{...s.tdPts, color: '#C9A84C'}}>{p.marcador}</span>
            <span style={{...s.tdPts, color: '#1E6FFF'}}>{p.anotador}</span>
            <span style={{...s.tdPts, color: '#00C97A'}}>{p.resultado}</span>
          </div>
        ))}
      </div>

      <div style={{...s.sectionTitle, marginTop: '1.5rem'}}>REGLAS</div>
      <div style={s.reglasList}>
        {reglas.map((r, i) => (
          <div key={i} style={s.regla}>
            <div style={s.reglaIconWrap}>{r.icon}</div>
            <div>
              <div style={s.reglaTitulo}>{r.titulo}</div>
              <div style={s.reglaTexto}>{r.texto}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const s = {
  page: { padding: '1rem 0' },
  sectionTitle: { fontSize: 11, letterSpacing: 3, fontWeight: 700, color: '#C9A84C', marginBottom: '0.75rem' },
  tableWrap: { borderRadius: 12, overflow: 'hidden', border: '1px solid #1e1e1e', marginBottom: '0.5rem' },
  tableHeader: { display: 'flex', background: '#161616', padding: '8px 14px', gap: 8 },
  th: { flex: 1, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: '#444440' },
  tableRow: { display: 'flex', padding: '10px 14px', gap: 8, alignItems: 'center' },
  tdFase: { flex: 1, fontSize: 13, fontWeight: 600, color: '#F5F0E8' },
  tdPts: { flex: 1, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 900, textAlign: 'center' },
  reglasList: { display: 'flex', flexDirection: 'column', gap: 8 },
  regla: { display: 'flex', gap: 12, background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '12px 14px', alignItems: 'flex-start' },
  reglaIconWrap: { flexShrink: 0, marginTop: 1 },
  reglaTitulo: { fontSize: 13, fontWeight: 700, color: '#F5F0E8', marginBottom: 2 },
  reglaTexto: { fontSize: 12, color: '#888880', lineHeight: 1.5 },
}
ENDOFFILE
echo "done"
