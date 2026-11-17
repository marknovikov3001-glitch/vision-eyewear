const M = (f) => `/models/${f}`
export const GLASSES = M('glasses.glb')
// size = world width, at = scroll position where it crosses the centre, spd = parallax speed, rs = scroll-linked spin
export const PROPS = [
  { url: M('eye-anatomical.glb'), size: 1.5, at: .27, x: -2.7, z: -1, spd: 1.0, rs: 7 },
  { url: M('eye-blue.glb'), size: 1.0, at: .31, x: 2.6, z: -3, spd: .7, rs: -5 },
  { url: M('eye-simple.glb'), size: .8, at: .35, x: -.6, z: 1.5, spd: 1.5, rs: 9 },
  { url: M('eye-study.glb'), size: 1.9, at: .40, x: 3.0, z: -2, spd: .85, rs: 4 },
  { url: M('eye-realistic.glb'), size: 1.2, at: .44, x: -3.1, z: -.5, spd: 1.2, rs: -6 },
  { url: M('skull-a.glb'), size: 4.2, at: .57, x: -2.5, z: -2, spd: .8, rs: 3 },
  { url: M('skull-b.glb'), size: 1.3, at: .62, x: 2.7, z: 1, spd: 1.6, rs: -4 }
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
