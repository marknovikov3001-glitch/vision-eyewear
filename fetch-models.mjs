// Puts the GLB files into public/models/ (served as /models/...).
// Files already in public/models are kept; missing ones are downloaded from the public GitHub repo at build time.
import { mkdir, access, writeFile } from 'node:fs/promises'

const BASE = 'https://raw.githubusercontent.com/marknovikov3001-glitch/vision-eyewear/main/'
const FILES = {
  'glasses.glb': 'glasses.glb',
  'anatomical_eye_ball(2).glb': 'eye-anatomical.glb',
  'blue_eyeball_free.glb': 'eye-blue.glb',
  'eye(1).glb': 'eye-simple.glb',
  'eye_study.glb': 'eye-study.glb',
  'realistic_human_eye.glb': 'eye-realistic.glb',
  'skull_downloadable.glb': 'skull-a.glb',
  'skull_salazar_downloadable.glb': 'skull-b.glb'
}
await mkdir('public/models', { recursive: true })
let failed = false
for (const [remote, local] of Object.entries(FILES)) {
  const path = `public/models/${local}`
  try { await access(path); console.log('exists ', local); continue } catch {}
  try {
    const res = await fetch(BASE + remote)
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.subarray(0, 4).toString() !== 'glTF') throw new Error('not a GLB (Git LFS pointer or HTML?)')
    await writeFile(path, buf)
    console.log('fetched', local, (buf.length / 1048576).toFixed(1) + ' MB')
  } catch (e) {
    console.warn('FAILED ', local, e.message)
    if (local === 'glasses.glb') failed = true
  }
}
if (failed) { console.error('Main product model is missing - aborting.'); process.exit(1) }
