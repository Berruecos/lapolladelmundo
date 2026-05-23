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
    { icon: '💰', titulo: 'Inscripción', texto: '$100.000 COP. Sin pago antes del partido inaugural = puntaje 0.' },
    { icon: '🏆', titulo: 'Premios', texto: '1° puesto: 60% del total · 2° puesto: 20% · Cerveza del organizador: 20%.' },
    { icon: '⏰', titulo: 'Deadline', texto: 'Pronósticos antes de las 23:59 del día anterior a cada fecha. Si no, resultado 0–0 autogol.' },
    { icon: '✏️', titulo: 'Mensajes editados', texto: 'No se consideran. Resultado automático: 0–0, autogol.' },
    { icon: '🔁', titulo: 'Doble pronóstico', texto: 'Si mandas dos, solo cuenta el primero.' },
    { icon: '🧮', titulo: 'Marcador exacto', texto: 'No acumula con acertar resultado. Solo se toma el mayor.' },
    { icon: '⏱️', titulo: 'Tiempo reglamentario', texto: 'Marcadores válidos solo a los 90 minutos.' },
    { icon: '🥅', titulo: '0-0 en tiempo extra', texto: 'El primer anotador es el que anote en prórroga o el primer penalti.' },
    { icon: '🚫', titulo: '3° y 4° puesto', texto: 'No suma puntos.' },
  ]

  return (
    <div style={styles.page}>
      <h2 style={styles.sectionTitle}>Tabla de puntos</h2>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Ronda</th>
              <th style={styles.th}>Marcador</th>
              <th style={styles.th}>Anotador</th>
              <th style={styles.th}>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {puntos.map(p => (
              <tr key={p.ronda}>
                <td style={styles.td}><strong style={{fontWeight:600}}>{p.fase}</strong></td>
                <td style={{...styles.td, ...styles.pts}}>{p.marcador} pts</td>
                <td style={{...styles.td, ...styles.pts}}>{p.anotador} pts</td>
                <td style={{...styles.td, ...styles.pts}}>{p.resultado} pt{p.resultado>1?'s':''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{...styles.sectionTitle, marginTop: '1.5rem'}}>Reglas</h2>
      <div style={styles.reglasList}>
        {reglas.map((r, i) => (
          <div key={i} style={styles.regla}>
            <span style={styles.reglaIcon}>{r.icon}</span>
            <div>
              <div style={styles.reglaTitulo}>{r.titulo}</div>
              <div style={styles.reglaTexto}>{r.texto}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  page: { padding: '1rem 0' },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: '0.75rem' },
  tableWrap: { overflowX: 'auto', background: 'white', borderRadius: 12, border: '1px solid #f0f0f0' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { padding: '10px 12px', textAlign: 'left', color: '#888', fontWeight: 600, borderBottom: '1px solid #f0f0f0', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', borderBottom: '1px solid #f5f5f5', color: '#1a1a1a' },
  pts: { fontWeight: 700, color: '#059669' },
  reglasList: { display: 'flex', flexDirection: 'column', gap: 10 },
  regla: { display: 'flex', gap: 12, background: 'white', border: '1px solid #f0f0f0', borderRadius: 10, padding: '12px 14px' },
  reglaIcon: { fontSize: 20, flexShrink: 0 },
  reglaTitulo: { fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 2 },
  reglaTexto: { fontSize: 13, color: '#666', lineHeight: 1.5 },
}
