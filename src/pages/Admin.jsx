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
  const [syncingAll, setSyncingAll] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')
  const [logoInput, setLogoInput] = useState('')
  const [pronosticosActivos, setPronosticosActivos] = useState(true)

  function saveApiKey(key) {
    setApiKey(key)
    localStorage.setItem('api_football_key', key)
  }

  useEffect(function() { fetchPartidos(); fetchParticipantes(); fetchConfig() }, [ronda])

  async function fetchPartidos() {
    const { data } = await supabase.from('partidos').select('*').eq('ronda', ronda).order('fecha_hora')
    setPartidos(data || [])
  }

  async function fetchParticipantes() {
    const { data } = await supabase.from('participantes').select('*').order('created_at')
    setParticipantes(data || [])
  }

  async function fetchConfig() {
    const { data: logo } = await supabase.from('configuracion').select('valor').eq('clave', 'logo_url').single()
    if (logo) { setLogoUrl(logo.valor); setLogoInput(logo.valor) }
    const { data: pc } = await supabase.from('configuracion').select('valor').eq('clave', 'pronosticos_activos').single()
    if (pc) setPronosticosActivos(pc.valor === 'true')
  }

  async function saveLogo() {
    await supabase.from('configuracion').upsert({ clave: 'logo_url', valor: logoInput, updated_at: new Date().toISOString() })
    setLogoUrl(logoInput)
    showMsg('Logo actualizado')
  }

  async function togglePronosticos() {
    var nuevo = !pronosticosActivos
    await supabase.from('configuracion').upsert({ clave: 'pronosticos_activos', valor: nuevo ? 'true' : 'false', updated_at: new Date().toISOString() })
    setPronosticosActivos(nuevo)
    showMsg(nuevo ? 'Pronosticos activados' : 'Pronosticos desactivados')
  }

  async function cargarPartidosMundial() {
    if (!apiKey) { showMsg('Primero agrega tu API key'); return }
    if (!confirm('Cargar todos los partidos del Mundial 2026?')) return
    setSyncingAll(true)
    showMsg('Cargando partidos...')
    try {
      var res = await fetch('https://v3.football.api-sports.io/fixtures?league=1&season=2026', {
        headers: { 'x-apisports-key': apiKey }
      })
      var data = await res.json()
      var fixtures = data.response || []
      if (fixtures.length === 0) { showMsg('No se encontraron partidos'); setSyncingAll(false); return }
      var insertados = 0
      var errores = 0
      for (var i = 0; i < fixtures.length; i++) {
        var f = fixtures[i]
        var round = f.league.round || ''
        var rondaVal = null
        if (round.indexOf('Group') >= 0) rondaVal = 'R1'
        else if (round.indexOf('Round of 32') >= 0 || round.indexOf('1/16') >= 0) rondaVal = 'R2'
        else if (round.indexOf('Round of 16') >= 0 || round.indexOf('1/8') >= 0) rondaVal = 'R3'
        else if (round.indexOf('Quarter') >= 0 || round.indexOf('1/4') >= 0) rondaVal = 'R4'
        else if (round.indexOf('Semi') >= 0) rondaVal = 'R5'
        else if (round.indexOf('Final') >= 0 && round.indexOf('3rd') < 0) rondaVal = 'R6'
        if (!rondaVal) continue
        var result = await supabase.from('partidos').upsert({
          api_fixture_id: f.fixture.id,
          ronda: rondaVal,
          fase: FASES[rondaVal],
          equipo_local: f.teams.home.name,
          equipo_visita: f.teams.away.name,
          fecha_hora: f.fixture.date,
          estado: (f.fixture.status.short === 'FT') ? 'finalizado' : 'pendiente',
          goles_local: f.goals.home,
          goles_visita: f.goals.away,
        }, { onConflict: 'api_fixture_id' })
        if (result.error) errores++
        else insertados++
      }
      showMsg(insertados + ' partidos cargados' + (errores > 0 ? ' (' + errores + ' errores)' : ''))
      fetchPartidos()
    } catch (err) {
      showMsg('Error: ' + err.message)
    }
    setSyncingAll(false)
  }

  async function addPartido(e) {
    e.preventDefault()
    var ins = await supabase.from('partidos').insert({
      ronda: form.ronda, fase: FASES[form.ronda],
      equipo_local: form.local.trim(), equipo_visita: form.visita.trim(),
      fecha_hora: form.fecha_hora, estado: 'pendiente',
    })
    if (ins.error) showMsg('Error: ' + ins.error.message)
    else { showMsg('Partido agregado'); setForm({ ...form, local: '', visita: '', fecha_hora: '' }); fetchPartidos() }
  }

  async function registrarResultado(partido) {
    var local = parseInt(prompt('Goles de ' + partido.equipo_local + ':'))
    var visita = parseInt(prompt('Goles de ' + partido.equipo_visita + ':'))
    if (isNaN(local) || isNaN(visita)) return
    var jugs = await supabase.from('jugadores').select('nombre, numero').in('equipo', [partido.equipo_local, partido.equipo_visita]).order('numero')
    var jugList = (jugs.data || []).map(function(j) { return j.numero ? j.numero + ' - ' + j.nombre : j.nombre })
    var opciones = ['0: autogol'].concat(jugList.map(function(n, i) { return (i + 1) + ': ' + n }))
    var seleccion = prompt('Primer anotador - escribe el numero:\n' + opciones.join('\n'))
    if (seleccion === null) return
    var idx = parseInt(seleccion)
    var scorer = seleccion
    if (!isNaN(idx)) {
      if (idx === 0) scorer = 'autogol'
      else scorer = (jugs.data || [])[idx - 1] ? (jugs.data || [])[idx - 1].nombre : seleccion
    }
    var rr = await supabase.rpc('registrar_resultado', {
      p_partido_id: partido.id,
      p_goles_local: local,
      p_goles_visita: visita,
      p_primer_anotador: scorer || null,
    })
    if (rr.error) showMsg('Error: ' + rr.error.message)
    else { showMsg('Resultado guardado y puntos calculados'); fetchPartidos() }
  }

  async function eliminarPartido(partido) {
    if (!confirm('Eliminar ' + partido.equipo_local + ' vs ' + partido.equipo_visita + '?')) return
    await supabase.from('puntos').delete().eq('partido_id', partido.id)
    await supabase.from('pronosticos').delete().eq('partido_id', partido.id)
    await supabase.from('partidos').delete().eq('id', partido.id)
    showMsg('Partido eliminado')
    fetchPartidos()
  }

  async function ocultarPartido(partido) {
    var nuevoEstado = partido.estado === 'oculto' ? 'pendiente' : 'oculto'
    await supabase.from('partidos').update({ estado: nuevoEstado }).eq('id', partido.id)
    showMsg(partido.estado === 'oculto' ? 'Partido visible' : 'Partido oculto')
    fetchPartidos()
  }

  async function toggleActivo(p) {
    var nuevoEstado = !p.activo
    if (nuevoEstado === true) {
      if (confirm(p.nombre + ' pasara a ACTIVO y sus puntos acumulados se borraran. Continuar?')) {
        await supabase.from('puntos').delete().eq('participante_id', p.id)
        await supabase.from('participantes').update({ activo: true }).eq('id', p.id)
        showMsg(p.nombre + ' activado con 0 puntos')
        fetchParticipantes()
      }
    } else {
      await supabase.from('participantes').update({ activo: false }).eq('id', p.id)
      showMsg(p.nombre + ' desactivado')
      fetchParticipantes()
    }
  }

  function showMsg(m) { setMsg(m); setTimeout(function() { setMsg('') }, 4000) }

  function fmtFecha(f) {
    return new Date(f).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  if (!participante || !participante.es_admin) {
    return React.createElement('div', { style: s.noAdmin }, 'Solo para el organizador.')
  }

  return (
    <div style={s.page}>
      <div style={s.tabs}>
        {['partidos','participantes','config','api'].map(function(t) {
          return (
            <button key={t} style={tab===t ? Object.assign({}, s.tab, s.tabActive) : s.tab} onClick={function() { setTab(t) }}>
              {t.toUpperCase()}
            </button>
          )
        })}
      </div>

      {msg ? <div style={s.msgBox}>{msg}</div> : null}

      {tab === 'partidos' && (
        <div>
          <div style={s.card}>
            <div style={s.cardTitle}>CARGAR PARTIDOS DEL MUNDIAL</div>
            <p style={s.hint}>Jala automaticamente todos los partidos del Mundial 2026 desde la API.</p>
            <button style={Object.assign({}, s.btn, { background: syncingAll ? '#333' : 'linear-gradient(135deg, #1E6FFF, #0d3b8a)' })}
              onClick={cargarPartidosMundial} disabled={syncingAll}>
              {syncingAll ? 'CARGANDO...' : 'CARGAR TODOS LOS PARTIDOS DEL MUNDIAL'}
            </button>
          </div>

          <div style={s.card}>
            <div style={s.cardTitle}>AGREGAR PARTIDO</div>
            <form onSubmit={addPartido} style={s.form}>
              <select style={s.input} value={form.ronda} onChange={function(e) { setForm(Object.assign({}, form, { ronda: e.target.value })) }}>
                {RONDAS.map(function(r) { return <option key={r} value={r}>{r} - {FASES[r]}</option> })}
              </select>
              <div style={s.row2}>
                <input style={s.input} placeholder="Equipo local" value={form.local} onChange={function(e) { setForm(Object.assign({}, form, { local: e.target.value })) }} required />
                <input style={s.input} placeholder="Equipo visitante" value={form.visita} onChange={function(e) { setForm(Object.assign({}, form, { visita: e.target.value })) }} required />
              </div>
              <input style={s.input} type="datetime-local" value={form.fecha_hora} onChange={function(e) { setForm(Object.assign({}, form, { fecha_hora: e.target.value })) }} required />
              <button style={s.btn} type="submit">+ AGREGAR</button>
            </form>
          </div>

          <div style={s.rondas}>
            {RONDAS.map(function(r) {
              return (
                <button key={r} style={ronda===r ? Object.assign({}, s.rondaBtn, s.rondaActive) : s.rondaBtn} onClick={function() { setRonda(r) }}>
                  {FASES[r]}
                </button>
              )
            })}
          </div>

          {partidos.length === 0 && <p style={s.hint}>No hay partidos en esta ronda.</p>}

          {partidos.map(function(p) {
            return (
              <div key={p.id} style={s.partidoCard}>
                <div style={s.partidoInfo}>
                  <div style={s.partidoNombre}>{p.equipo_local} vs {p.equipo_visita}</div>
                  <div style={s.partidoFecha}>{fmtFecha(p.fecha_hora)}</div>
                  {p.goles_local !== null && (
                    <div style={s.resultadoBadge}>{p.goles_local}-{p.goles_visita} - {p.primer_anotador || 'sin anotador'}</div>
                  )}
                </div>
                <div style={s.partidoActions}>
                  <button style={s.btnSm} onClick={function() { registrarResultado(p) }}>Manual</button>
                  <button style={Object.assign({}, s.btnSm, s.btnWarning)} onClick={function() { ocultarPartido(p) }}>
                    {p.estado === 'oculto' ? 'Mostrar' : 'Ocultar'}
                  </button>
                  <button style={Object.assign({}, s.btnSm, s.btnDanger)} onClick={function() { eliminarPartido(p) }}>Borrar</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'participantes' && (
        <div>
          <p style={s.hint}>Total: {participantes.length} - Activos: {participantes.filter(function(p) { return p.activo }).length}</p>
          {participantes.map(function(p) {
            return (
              <div key={p.id} style={s.partRow}>
                <div style={s.partInfo}>
                  <div style={s.partNombre}>
                    {p.nombre}
                    {p.es_admin && <span style={s.adminBadge}>ADMIN</span>}
                  </div>
                  <div style={{ fontSize: 11, color: p.activo ? '#00C97A' : '#666', marginTop: 2 }}>
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </div>
                </div>
                {!p.es_admin && (
                  <button
                    style={Object.assign({}, s.toggleBtn, {
                      background: p.activo ? '#001a0f' : '#1a1200',
                      borderColor: p.activo ? '#005a30' : '#2a2000',
                      color: p.activo ? '#00C97A' : '#C9A84C'
                    })}
                    onClick={function() { toggleActivo(p) }}>
                    {p.activo ? 'Desactivar' : 'Activar'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {tab === 'config' && (
        <div>
          <div style={s.card}>
            <div style={s.cardTitle}>LOGO</div>
            <p style={s.hint}>URL de la imagen del logo.</p>
            {logoUrl && (
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <img src={logoUrl} alt="Logo" style={{ width: 80, height: 'auto' }} />
              </div>
            )}
            <input style={s.input} type="text" placeholder="https://..." value={logoInput} onChange={function(e) { setLogoInput(e.target.value) }} />
            <button style={Object.assign({}, s.btn, { marginTop: 8 })} onClick={saveLogo}>GUARDAR LOGO</button>
          </div>

          <div style={s.card}>
            <div style={s.cardTitle}>PRONOSTICOS</div>
            <p style={s.hint}>Activa o desactiva el envio de pronosticos para todos los participantes.</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: pronosticosActivos ? '#00C97A' : '#FF2D2D' }}>
                  {pronosticosActivos ? 'ACTIVADOS' : 'DESACTIVADOS'}
                </div>
                <div style={{ fontSize: 12, color: '#888880', marginTop: 4 }}>
                  {pronosticosActivos ? 'Los participantes pueden enviar sus picks' : 'Nadie puede enviar pronosticos'}
                </div>
              </div>
              <button
                style={Object.assign({}, s.toggleBtn, {
                  background: pronosticosActivos ? '#001a0f' : '#1a0808',
                  borderColor: pronosticosActivos ? '#005a30' : '#7a0f0f',
                  color: pronosticosActivos ? '#00C97A' : '#FF2D2D',
                  minWidth: 100
                })}
                onClick={togglePronosticos}>
                {pronosticosActivos ? 'DESACTIVAR' : 'ACTIVAR'}
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'api' && (
        <div style={s.card}>
          <div style={s.cardTitle}>API-FOOTBALL</div>
          <p style={s.hint}>Pega tu API key aqui.</p>
          <input style={s.input} type="text" placeholder="Tu API key" value={apiKey} onChange={function(e) { saveApiKey(e.target.value) }} />
        </div>
      )}
    </div>
  )
}

const s = {
  page: { padding: '1rem 0' },
  noAdmin: { textAlign: 'center', padding: '3rem', color: '#444', fontSize: 15 },
  tabs: { display: 'flex', borderBottom: '1px solid #1e1e1e', marginBottom: '1rem', flexWrap: 'wrap' },
  tab: { flex: 1, background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '8px 4px', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', color: '#444', marginBottom: -1, fontFamily: "'Barlow Condensed', sans-serif", minWidth: 60 },
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
  partidoInfo: { flex: 1, minWidth: 0 },
  partidoNombre: { fontSize: 13, fontWeight: 600, color: '#F5F0E8' },
  partidoFecha: { fontSize: 11, color: '#888880', marginTop: 2 },
  resultadoBadge: { fontSize: 11, color: '#00C97A', marginTop: 4 },
  partidoActions: { display: 'flex', gap: 4, flexWrap: 'wrap', flexShrink: 0 },
  btnSm: { padding: '5px 8px', border: '1px solid #222', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer', background: '#161616', color: '#F5F0E8' },
  btnWarning: { background: '#1a1200', color: '#C9A84C', borderColor: '#2a2000' },
  btnDanger: { background: '#1a0808', color: '#FF2D2D', borderColor: '#7a0f0f' },
  partRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '10px 14px', marginBottom: 8 },
  partInfo: { flex: 1 },
  partNombre: { fontSize: 14, fontWeight: 600, color: '#F5F0E8', display: 'flex', alignItems: 'center', gap: 6 },
  adminBadge: { fontSize: 9, background: '#C9A84C', color: '#0a0a0a', padding: '2px 6px', borderRadius: 100, fontWeight: 900, letterSpacing: 1 },
  toggleBtn: { padding: '6px 12px', border: '1px solid', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0 },
  msgBox: { fontSize: 12, padding: '10px 14px', background: '#001a0f', color: '#00C97A', borderRadius: 8, marginBottom: '1rem', border: '1px solid #005a30' },
  hint: { fontSize: 12, color: '#888880', lineHeight: 1.6, marginBottom: 8 },
}
