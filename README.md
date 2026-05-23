# Polla Transcontinental 2026 ⚽

App de pronósticos para el Mundial 2026.

## Cómo desplegar en Vercel (gratis)

### Paso 1 — Instalar Node.js
Descarga e instala Node.js desde https://nodejs.org (versión LTS)

### Paso 2 — Descomprimir y abrir el proyecto
1. Descomprime la carpeta `polla2026`
2. Abre una terminal (en Mac: Terminal, en Windows: PowerShell)
3. Navega a la carpeta: `cd ruta/a/polla2026`

### Paso 3 — Instalar dependencias
```
npm install
```

### Paso 4 — Probar en local
```
npm run dev
```
Abre http://localhost:5173 en el navegador.

### Paso 5 — Desplegar en Vercel
1. Crea cuenta gratis en https://vercel.com
2. Instala Vercel CLI: `npm install -g vercel`
3. En la carpeta del proyecto: `vercel`
4. Sigue las instrucciones (acepta todo por defecto)
5. Te da un link tipo `https://polla2026-xxx.vercel.app`

¡Ese link es el que compartes con tus amigos!

## Hacerte admin
Después de registrarte en la app, ve a Supabase > Table Editor > participantes,
busca tu fila y cambia `es_admin` a `true`.

## Configurar API-Football
1. Regístrate gratis en https://dashboard.api-football.com
2. Copia tu API key
3. En la app, ve a Admin > API Resultados y pégala ahí

## Estructura de puntos
| Ronda | Marcador | Anotador | Resultado |
|-------|----------|----------|-----------|
| Grupos | 3 | 2 | 1 |
| 16avos | 6 | 4 | 2 |
| Octavos | 10 | 6 | 4 |
| Cuartos | 15 | 9 | 6 |
| Semis | 20 | 12 | 8 |
| Final | 30 | 18 | 12 |
