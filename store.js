// Shared animation state: written by ScrollTrigger / pointer events, read by the 3D scene every frame.
export const RM = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
export const store = { p: 0, target: 0, ax: 1, drag: 0, dn: false, an: [] }
export const ease = (t) => t * t * (3 - 2 * t)
export const clamp = (v) => Math.min(1, Math.max(0, v))
export function kf(p, K) {
  for (let i = 1; i < K.length; i++) if (p <= K[i][0]) { const a = K[i - 1], b = K[i]; return a[1] + (b[1] - a[1]) * ease((p - a[0]) / (b[0] - a[0])) }
  return K[K.length - 1][1]
}
