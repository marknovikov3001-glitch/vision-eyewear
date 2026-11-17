import { Component } from 'react'

export default class Boundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(e) { console.error('[VISION]', e); this.props.onError?.() }
  render() { return this.state.failed ? (this.props.fallback ?? null) : this.props.children }
}
