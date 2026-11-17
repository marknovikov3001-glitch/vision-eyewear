const M = (f) => `/models/${f}`
export const GLASSES = M('glasses.glb')

// Material treatment for the white sculptures so they stay readable on the white page:
// slightly warmer, less reflective stone tone; no custom shader modifications.
const SCULPT = { tint: .84, rough: .55, env: .75 }

// size = world width, at = scroll position where it crosses the centre, spd = parallax speed.
// Eyes spin with scroll (rs). Heads turn gently instead (ry = resting turn, turn = sweep while passing).
// Optional rot: [x, y, z] corrects a model that was exported lying down or facing away.
export const PROPS = [
  { url: M('eye-anatomy-study.glb'), size: 1.7, at: .27, x: -2.7, z: -1, spd: 1.0, rs: 7, look: SCULPT },
  { url: M('eye-blue.glb'), size: 1.0, at: .31, x: 2.6, z: -3, spd: .7, rs: -5 },
  { url: M('eye-david-scan.glb'), size: .95, at: .35, x: -.6, z: 1.5, spd: 1.5, rs: 9, look: SCULPT },
  { url: M('eye-sculpt.glb'), size: 1.9, at: .40, x: 3.0, z: -2, spd: .85, rs: 4, look: SCULPT },
  { url: M('eye-realistic.glb'), size: 1.2, at: .44, x: -3.1, z: -.5, spd: 1.2, rs: -6 },
  { url: M('head-mannequin.glb'), size: 3.9, at: .57, x: -2.4, z: -2, spd: .8, ry: .5, turn: 2.5, look: SCULPT },
  { url: M('head-woman.glb'), size: 2.1, at: .62, x: 2.6, z: 0, spd: 1.6, ry: -.5, turn: -2.5, look: SCULPT }
]
export const GK = {
  x: [[0, 0], [.2, 2.5], [.45, -2.6], [.62, 2.4], [.78, 0], [1, 0]],
  y: [[0, .1], [.2, -1.2], [.45, .9], [.62, -.6], [.78, 0], [1, .2]],
  s: [[0, 3.4], [.2, 1.5], [.45, 1.3], [.62, 1.0], [.78, 3.2], [1, 3.8]],
  r: [[0, -.5], [.2, 1.6], [.45, 3.1], [.62, 4.4], [.78, 6.3], [1, 9.4]]
}
// text windows: selector, fade-in start, fully in, fade-out start, gone (scroll progress 0-1)
export const WIN = [['#h0', 0, 0, .1, .18], ['#s0', 0, 0, .08, .14], ['#h1', .2, .26, .4, .46], ['#s1', .24, .3, .4, .46],
  ['#h2', .47, .52, .66, .7], ['#s2', .5, .55, .64, .69], ['#h3', .71, .75, .85, .89], ['#s3', .73, .77, .85, .89],
  ['#cta', .75, .79, .86, .9], ['#h4', .91, .95, 2, 3], ['#s4', .94, .98, 2, 3]]
