import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import Boundary from './Boundary.jsx'
import { GLASSES, PROPS, GK } from './config.js'
import { store, RM, kf, ease, clamp } from './store.js'

// Loads a GLB, keeps its original materials, centres it and normalises its largest side to 1 unit.
function Model({ url, onReady }) {
  const { scene } = useGLTF(url)
  const k = useMemo(() => {
    const b = new THREE.Box3().setFromObject(scene), z = b.getSize(new THREE.Vector3())
    scene.position.sub(b.getCenter(new THREE.Vector3()))
    return 1 / Math.max(z.x, z.y, z.z, 1e-6)
  }, [scene])
  useEffect(() => { onReady?.() }, [])
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
  const ref = useRef()
  useFrame(({ clock, camera }) => {
    const g = ref.current; if (!g) return
    const p = store.p, ax = store.ax, t = RM ? 0 : clock.elapsedTime
    g.position.set(kf(p, GK.x) * ax, kf(p, GK.y) + Math.sin(t * .8) * .06, 0)
    g.scale.setScalar(kf(p, GK.s) * Math.max(.6, ax))
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
  const ref = useRef()
  useFrame(({ clock }) => {
    const g = ref.current; if (!g) return
    const p = store.p, d = o.at - p, a = Math.abs(d)
    g.visible = a < .2
    if (!g.visible) return
    const ax = store.ax, f = Math.min(1, ease(1 - a / .2) * 1.6), t = RM ? 0 : clock.elapsedTime
    g.position.set(o.x * ax, d * 16 * o.spd, o.z)
    g.scale.setScalar(o.size * Math.max(.6, ax) * f)
    g.rotation.set(Math.sin(p * 6 + o.x) * .35, p * o.rs + t * .2, .1 * o.x)
  })
  return <group ref={ref} visible={false}><Model url={o.url} onReady={onReady} /></group>
}

export default function Scene() {
  const [n, setN] = useState(0) // props are mounted one after another, after the hero glasses
  const next = (i) => () => setN((v) => Math.max(v, i + 2))
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
      <Boundary><Suspense fallback={null}><Glasses onReady={() => setN((v) => Math.max(v, 1))} /></Suspense></Boundary>
      {PROPS.slice(0, n).map((o, i) => (
        <Boundary key={o.url} onError={next(i)}><Suspense fallback={null}><Prop o={o} onReady={next(i)} /></Suspense></Boundary>
      ))}
    </>
  )
}
