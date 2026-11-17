// Puts the GLB files into public/models/ (served as /models/...).
// Files already in public/models are kept; missing ones are downloaded from the public GitHub repo at build time.
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const BASE = 'https://raw.githubusercontent.com/marknovikov3001-glitch/vision-eyewear/main/'
const FILES = {
  'glasses.glb': 'glasses.glb',
  'anatomy_study_-_eyes.glb': 'eye-anatomy-study.glb',
  'blue_eyeball_free.glb': 'eye-blue.glb',
  'davids_eye_-_scan.glb': 'eye-david-scan.glb',
  'eye_sculpt_2.glb': 'eye-sculpt.glb',
  'realistic_human_eye.glb': 'eye-realistic.glb',
  'mannequin_head.glb': 'head-mannequin.glb',
  'woman_head (1).glb': 'head-woman.glb'
}
await mkdir('public/models', { recursive: true })
const failures = []
function validateGLB(buf, filename) {
  if (buf.length < 20 || buf.subarray(0, 4).toString('ascii') !== 'glTF') {
    throw new Error(`${filename}: invalid GLB header (possibly HTML or Git LFS pointer)`)
  }
  if (buf.readUInt32LE(4) !== 2 || buf.readUInt32LE(8) !== buf.length) {
    throw new Error(`${filename}: invalid GLB version or length`)
  }
  if (buf.readUInt32LE(12) < 2 || buf.subarray(16, 20).toString('ascii') !== 'JSON') {
    throw new Error(`${filename}: missing GLB JSON chunk`)
  }
}
for (const [remote, local] of Object.entries(FILES)) {
  const path = `public/models/${local}`
  try {
    try {
      const existing = await readFile(path)
      validateGLB(existing, local)
      console.log('exists ', local)
      continue
    } catch (e) {
      if (e.code !== 'ENOENT') throw e
    }
    const res = await fetch(BASE + encodeURIComponent(remote))
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    validateGLB(buf, remote)
    await writeFile(path, buf)
    console.log('fetched', local, (buf.length / 1048576).toFixed(1) + ' MB')
  } catch (e) {
    console.error('FAILED', local, e.message)
    failures.push(local)
  }
}
if (failures.length) {
  console.error('Missing or invalid required GLB models:', failures.join(', '))
  process.exit(1)
}
