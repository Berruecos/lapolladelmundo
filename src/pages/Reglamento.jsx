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
    { icon: '⏰', titulo: 'Deadline', texto: 'Pronósticos antes de las 23:59 del día anterior a cada fecha. Si no enviaste, recibes 0–0 autogol automático.' },
    { icon: '🔒', titulo: 'No editable', texto: 'Una vez enviado tu pronóstico, queda bloqueado. No se puede modificar.' },
    { icon: '1️⃣', titulo: 'Solo una vez', texto: 'El pronóstico se envía una sola vez por partido.' },
    { icon: '🧮', titulo: 'Marcador exacto', texto: 'No acumula con acertar resultado. Solo se toma el mayor puntaje.' },
    { icon: '⏱️', titulo: 'Tiempo reglamentario', texto: 'Marcadores válidos solo a los 90 minutos.' },
    { icon: '🥅', titulo: '0-0 en tiempo extra', texto: 'El primer anotador es el que anote en prórroga o el primer penalti.' },
    { icon: '🙃', titulo: 'Autogol', texto: 'Si el primer gol es autogol, nadie gana puntos por anotador.' },
    { icon: '🚫', titulo: '3° y 4° puesto', texto: 'No suma puntos.' },
  ]

  return (
    <div style={s.page}>
      <div style={s.titleArea}>
        <div style={s.sectionTitle}>TABLA DE PUNTOS</div>
      </div>

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
            <span style={s.reglaIcon}>{r.icon}</span>
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
  titleArea: { marginBottom: '0.75rem' },
  sectionTitle: { fontSize: 11, letterSpacing: 3, fontWeight: 700, color: '#C9A84C', marginBottom: '0.75rem' },
  tableWrap: { borderRadius: 12, overflow: 'hidden', border: '1px solid #1e1e1e', marginBottom: '0.5rem' },
  tableHeader: { display: 'flex', background: '#161616', padding: '8px 14px', gap: 8 },
  th: { flex: 1, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: '#444440' },
  tableRow: { display: 'flex', padding: '10px 14px', gap: 8, alignItems: 'center' },
  tdFase: { flex: 1, fontSize: 13, fontWeight: 600, color: '#F5F0E8' },
  tdPts: { flex: 1, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 900, textAlign: 'center' },
  reglasList: { display: 'flex', flexDirection: 'column', gap: 8 },
  regla: { display: 'flex', gap: 12, background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '12px 14px' },
  reglaIcon: { fontSize: 20, flexShrink: 0 },
  reglaTitulo: { fontSize: 13, fontWeight: 700, color: '#F5F0E8', marginBottom: 2 },
  reglaTexto: { fontSize: 12, color: '#888880', lineHeight: 1.5 },
}
