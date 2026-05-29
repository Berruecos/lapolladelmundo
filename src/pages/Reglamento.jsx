bash

cd /home/claude/polla2026v2/src && python3 -c "
content = open('App.jsx').read()

old = '''const TABS = [
  { id: 'ranking', label: 'TABLA', icon: '🏆' },
  { id: 'pronosticos', label: 'PICKS', icon: '⚽' },
  { id: 'rivales', label: 'RIVALES', icon: '👀' },
  { id: 'reglamento', label: 'REGLAS', icon: '📋' },
  { id: 'admin', label: 'ADMIN', icon: '⚙️', adminOnly: true },
]'''

new = '''const TabIcon = ({ id, active }) => {
  const color = active ? '#C9A84C' : '#444440'
  if (id === 'ranking') return (
    <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke={color} strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\">
      <path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\"/><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\"/>
      <path d=\"M4 22h16\"/><path d=\"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22\"/>
      <path d=\"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22\"/>
      <path d=\"M18 2H6v7a6 6 0 0 0 12 0V2z\"/>
    </svg>
  )
  if (id === 'pronosticos') return (
    <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke={color} strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\">
      <circle cx=\"12\" cy=\"12\" r=\"10\"/>
      <path d=\"M12 8v4l3 3\"/>
    </svg>
  )
  if (id === 'rivales') return (
    <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke={color} strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\">
      <path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/>
      <path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"/><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"/>
    </svg>
  )
  if (id === 'reglamento') return (
    <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke={color} strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\">
      <path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"/>
      <polyline points=\"14 2 14 8 20 8\"/><line x1=\"16\" y1=\"13\" x2=\"8\" y2=\"13\"/>
      <line x1=\"16\" y1=\"17\" x2=\"8\" y2=\"17\"/><polyline points=\"10 9 9 9 8 9\"/>
    </svg>
  )
  if (id === 'admin') return (
    <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke={color} strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\">
      <circle cx=\"12\" cy=\"12\" r=\"3\"/>
      <path d=\"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z\"/>
    </svg>
  )
  return null
}

const TABS = [
  { id: 'ranking', label: 'TABLA', adminOnly: false },
  { id: 'pronosticos', label: 'PICKS', adminOnly: false },
  { id: 'rivales', label: 'RIVALES', adminOnly: false },
  { id: 'reglamento', label: 'REGLAS', adminOnly: false },
  { id: 'admin', label: 'ADMIN', adminOnly: true },
]'''

if old in content:
    print('FOUND tabs')
    content = content.replace(old, new)
    open('App.jsx', 'w').write(content)
else:
    print('NOT FOUND')
"
