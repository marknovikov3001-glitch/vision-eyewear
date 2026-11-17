import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Scene from './Scene.jsx'
import Boundary from './Boundary.jsx'
import { store, RM } from './store.js'
import { WIN } from './config.js'

gsap.registerPlugin(ScrollTrigger)

const hasGL = () => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false } }

// Quiet loading state: a hairline bar and one status line, shown only until the first load completes.
function Loader() {
  const { progress, active, errors } = useProgress()
  const [seen, setSeen] = useState(false)
  useEffect(() => { if (!active && progress >= 100) setSeen(true) }, [active, progress])
  const msg = errors.length ? '3D ASSETS UNAVAILABLE' : seen ? '' : `LOADING ${Math.round(progress)}`
  return (<><div id="bar" style={{ width: progress + '%', opacity: seen ? 0 : 1 }} /><div id="st">{msg}</div></>)
}

export default function App() {
  const dr = useRef(), a1 = useRef(), a2 = useRef()
  const [gl] = useState(hasGL)

  useEffect(() => {
    store.an = [a1.current, a2.current]
    const ctx = gsap.context(() => {
      const upd = (s) => { store.target = s.progress; if (dr.current) dr.current.style.display = s.progress > .72 && s.progress < .86 ? 'block' : 'none' }
      const tl = gsap.timeline({ scrollTrigger: { trigger: '#sp', start: 'top top', end: 'bottom bottom', scrub: RM ? true : .6, onUpdate: upd, onRefresh: upd } })
      const y = RM ? 0 : 5
      WIN.forEach(([s, a, b, c, d]) => {
        if (b > a) tl.fromTo(s, { autoAlpha: 0, yPercent: y }, { autoAlpha: 1, yPercent: 0, duration: b - a, ease: 'power2.out' }, a)
        if (d <= 1) tl.to(s, { autoAlpha: 0, yPercent: -y, duration: d - c, ease: 'power2.in' }, c)
      })
      tl.set({}, {}, 1)
    })
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    let lx = 0
    const move = (e) => { if (store.dn) { store.drag += (e.clientX - lx) * .012; lx = e.clientX } }
    const up = () => { store.dn = false; if (dr.current) dr.current.style.cursor = 'grab' }
    const down = (e) => { store.dn = true; lx = e.clientX; dr.current.style.cursor = 'grabbing' }
    const el = dr.current
    el.addEventListener('pointerdown', down); addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', up)
    return () => { ctx.revert(); el.removeEventListener('pointerdown', down); removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up) }
  }, [])

  const toEnd = () => scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * .96, behavior: RM ? 'auto' : 'smooth' })

  return (
    <>
      <div id="sp" />
      <div id="A">
        <div className="hl" id="h0"><h1 style={{ '--fs': '19vw' }}>VISION.</h1></div>
        <div className="hl tl" id="h1"><h2 style={{ '--fs': '11.5vw' }}>PERCEPTION<br />IS EVERY&shy;<br />THING.</h2></div>
        <div className="hl br" id="h3"><h2 style={{ '--fs': '10vw' }}>ENGINEERED<br />FOR<br />PERSPECTIVE.</h2></div>
        <div className="hl c" id="h4"><h2 style={{ '--fs': '10vw' }}>CHANGE YOUR<br />PERSPECTIVE.</h2></div>
      </div>

      <Boundary fallback={<p className="msg">WEBGL IS UNAVAILABLE ON THIS DEVICE.</p>}>
        {gl ? (
          <Canvas className="cv" dpr={[1, 1.75]} camera={{ fov: 35, position: [0, 0, 9], near: .1, far: 100 }}
            gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
            style={{ position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none', touchAction: 'pan-y' }}>
            <Scene />
          </Canvas>
        ) : <p className="msg">WEBGL IS UNAVAILABLE ON THIS DEVICE.</p>}
      </Boundary>

      <div id="dr" ref={dr} />
      <div id="B">
        <div className="hl br" id="h2"><h2 style={{ '--fs': '12vw' }}>SEE WHAT<br />OTHERS<br />DON’T.</h2></div>
        <div className="sm" id="s0">BEYOND SIGHT.</div>
        <div className="sm" id="s1"><b>001 / THE HUMAN EYE</b>To see is to interpret. Every frame is a decision about what the world becomes.</div>
        <div className="sm" id="s2"><b>002 / BEYOND THE ORDINARY</b>Structure, scale and silence. Looking, treated as sculpture.</div>
        <div className="sm" id="s3"><b>003 / PRODUCT EXPLORATION</b>Drag to turn the object. Look closer.</div>
        <button id="cta" onClick={toEnd}>EXPLORE VISION →</button>
        <div className="sm" id="s4">VISION © 2026<b>BEYOND SIGHT.</b></div>
      </div>

      <div className="an l" ref={a1}><i /><u /><span>FRAME<b>A single line of thought, drawn in space.</b></span></div>
      <div className="an r" ref={a2}><i /><u /><span>LENSES<b>A window onto another point of view.</b></span></div>
      <div className="cor" style={{ top: 'calc(14px + env(safe-area-inset-top,0px))', left: 14 }}>VISION / 001</div>
      <div className="cor" style={{ top: 'calc(14px + env(safe-area-inset-top,0px))', right: 14, textAlign: 'right' }}>DESIGNED TO SEE DIFFERENTLY</div>
      <div className="cor" style={{ bottom: 'calc(14px + env(safe-area-inset-bottom,0px))', left: 14 }}>EXPLORE THE EXPERIENCE</div>
      <div className="cor" style={{ bottom: 'calc(14px + env(safe-area-inset-bottom,0px))', right: 14, textAlign: 'right' }}>SCROLL TO DISCOVER</div>
      <Loader />
    </>
  )
}
