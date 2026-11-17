import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import Boundary from './Boundary.jsx'
import { GLASSES, PROPS, GK } from './config.js'
import { store, RM, kf, ease, clamp } from './store.js'

const PARALLEL = 3 // eyes/skulls downloading at the same time, once the hero glasses are in

// Start the hero download as soon as this module loads. It shares one request with the
// <link rel="preload"> in index.html, and useGLTF caches by URL, so nothing is fetched twice.
useGLTF.preload(GLASSES)

// Loads a GLB, keeps its original materials, centres it and normalises its largest side to 1 unit.
function Model({ url, onReady }) {
  const { scene } = useGLTF(url)
  const gl = useThree((s) => s.gl)
  const camera = useThree((s) => s.camera)
  const root = useThree((s) => s.scene)
  const k = useMemo(() => {
    const b = new THREE.Box3().setFromObject(scene), z = b.getSize(new THREE.Vector3())
    scene.position.sub(b.getCenter(new THREE.Vector3()))
    return 1 / Math.max(z.x, z.y, z.z, 1e-6)
  }, [scene])
  useEffect(() => {
    // Warm-up while the model is still hidden: upload its textures and compile its shaders now,
    // so the first visible frame does not stall.
    try {
      scene.traverse((n) => {
        [].concat(n.material || []).forEach((m) => {
          for (const key in m) { const t = m[key]; if (t && t.isTexture) gl.initTexture(t) }
        })
      })
      Promise.resolve(gl.compileAsync ? gl.compileAsync(scene, camera, root) : gl.compile(scene, camera, root)).catch(() => {})
    } catch (e) { console.warn('[VISION] warm-up skipped', e) }
    onReady?.()
  }, [])
  return <group scale={k}><primitive object={scene} /></group>
}

// Master rig: smooths scroll progress, moves the camera. Mounted first so it runs first each frame.
function Rig() {
  useFrame(({ camera, size }, dt) => {
    store.p = RM ? store.target : THREE.MathUtils.damp(store.p, store.target, 5, dt)
    const p = store.p
    camera.position.set(Math.sin(p * 5) * .8, Math.cos(p * 3.2) * .35, 9 - 1.4 * Math.sin(p * Math.PI))
    camera.lookAt(0, 0, 0)
    store.ax = Math.min(1, size.width / size.height)
    if (!store.dn) store.drag *= Math.pow(.992, dt * 60)
  })
  return null
}

const V = new THREE.Vector3()
const ANCHORS = [new THREE.Vector3(-.46, .02, 0), new THREE.Vector3(.14, -.03, 0)]

function Glasses({ onReady }) {
  const ref = useRef(), rv = useRef(RM ? 1 : 0)
  useFrame(({ clock, camera }, dt) => {
    const g = ref.current; if (!g) return
    const p = store.p, ax = store.ax, t = RM ? 0 : clock.elapsedTime
    rv.current = Math.min(1, rv.current + Math.min(dt, .05) * .9) // soft entrance instead of popping in
    g.position.set(kf(p, GK.x) * ax, kf(p, GK.y) + Math.sin(t * .8) * .06, 0)
    g.scale.setScalar(kf(p, GK.s) * Math.max(.6, ax) * (.8 + .2 * ease(rv.current)))
    g.rotation.set(Math.sin(p * 9) * .12, kf(p, GK.r) + store.drag + Math.sin(t * .6) * .12, 0)
    g.updateMatrixWorld(true)
    const o = ease(clamp(p < .78 ? (p - .72) / .05 : (.86 - p) / .04))
    store.an.forEach((el, i) => {
      if (!el) return
      el.style.opacity = o
      if (o > 0) {
        V.copy(ANCHORS[i]); g.localToWorld(V); V.project(camera)
        el.style.left = (V.x * .5 + .5) * innerWidth + 'px'; el.style.top = (-V.y * .5 + .5) * innerHeight + 'px'
      }
    })
  })
  return <group ref={ref}><Model url={GLASSES} onReady={onReady} /></group>
}

function Prop({ o, onReady }) {
  const ref = useRef(), rv = useRef(RM ? 1 : 0)
  useFrame(({ clock }, dt) => {
    const g = ref.current; if (!g) return
    // grows in over about a second from the moment it has loaded, even if its scroll window is already active
    rv.current = Math.min(1, rv.current + Math.min(dt, .05) * 1.1)
    const p = store.p, d = o.at - p, a = Math.abs(d)
    g.visible = a < .2
    if (!g.visible) return
    const ax = store.ax, f = Math.min(1, ease(1 - a / .2) * 1.6), t = RM ? 0 : clock.elapsedTime
    g.position.set(o.x * ax, d * 16 * o.spd, o.z)
    g.scale.setScalar(o.size * Math.max(.6, ax) * f * ease(rv.current))
    g.rotation.set(Math.sin(p * 6 + o.x) * .35, p * o.rs + t * .2, .1 * o.x)
  })
  return <group ref={ref} visible={false}><Model url={o.url} onReady={onReady} /></group>
}

export default function Scene() {
  const [ready, setReady] = useState(false) // hero glasses loaded (or failed)
  const [started, setStarted] = useState([]) // indices of PROPS whose download has begun
  const [done, setDone] = useState(0) // how many of those have finished (loaded or failed)
  const finish = () => setDone((v) => v + 1)

  // Keep PARALLEL downloads running; each free slot goes to the not-yet-started model nearest
  // to the current scroll position (at the top of the page that is simply scroll order).
  useEffect(() => {
    if (!ready || started.length - done >= PARALLEL || started.length >= PROPS.length) return
    const next = PROPS.map((_, i) => i)
      .filter((i) => !started.includes(i))
      .sort((a, b) => Math.abs(PROPS[a].at - store.target) - Math.abs(PROPS[b].at - store.target))[0]
    setStarted((s) => [...s, next])
  }, [ready, started, done])

  return (
    <>
      <Rig />
      <hemisphereLight args={[0xffffff, 0xb8b8b8, .9]} />
      <directionalLight position={[4, 6, 6]} intensity={2.4} />
      <directionalLight position={[-6, 2, -4]} intensity={1.4} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={4} position={[0, 5, -5]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={2} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[3, 6, 1]} />
        <Lightformer form="rect" intensity={2} position={[5, 1, 2]} rotation-y={-Math.PI / 2} scale={[3, 6, 1]} />
      </Environment>
      <Boundary onError={() => setReady(true)}>
        <Suspense fallback={null}><Glasses onReady={() => setReady(true)} /></Suspense>
      </Boundary>
      {started.map((i) => (
        <Boundary key={PROPS[i].url} onError={finish}>
          <Suspense fallback={null}><Prop o={PROPS[i]} onReady={finish} /></Suspense>
        </Boundary>
      ))}
    </>
  )
}
