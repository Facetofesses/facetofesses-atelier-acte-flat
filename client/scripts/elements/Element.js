const RADIUS = 130

export default class Element {
  constructor () {
    this.radius = RADIUS
    this.graphics = null
    this.visible = false
  }

  getGraphics () {
    return this.graphics
  }

  update (val) {
    Object.assign(this.graphics, val)
  }

  render () {
  }
}
