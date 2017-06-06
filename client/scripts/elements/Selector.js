import Element from './Element'

export default class Selector extends Element {
  constructor (x, y, options) {
    super()

    this.color = options.color
    this.positions = options.positions
    this.positionsArcLength = 2 * Math.PI / this.positions.length
    this.overflowActive = 0

    this.graphics = new PIXI.Graphics()
    this.graphics.x = x
    this.graphics.y = y
  }

  updateActive (newIndex) {
    new TimelineMax()
      .to(this, 0.2, {
        overflowActive: 0
      })
      .call(() => {
        this.activePositionIndex = newIndex
      })
      .to(this, 0.2, {
        overflowActive: 20
      })
  }

  show (activeIndex) {
    console.log('show selector')
    this.visible = true
    this.updateActive(activeIndex)
  }

  hide () {
    this.visible = false
  }

  render () {
    this.graphics.clear()
    if (!this.visible) return

    this.positions.forEach(this.drawArc.bind(this))
  }

  drawArc (position, i) {
    const angleFrom = this.positionsArcLength * i
    const angleTo = this.positionsArcLength * (i + 1)
    let lineWidth = 50

    if (this.activePositionIndex === i) {
      lineWidth += this.overflowActive
    }
    let radius = this.radius - 20 + lineWidth / 2

    this.graphics.moveTo(Math.cos(angleFrom) * radius, Math.sin(angleFrom) * radius)
    this.graphics.lineStyle(lineWidth, position.color)
    this.graphics.arc(0, 0, radius, angleFrom, angleTo, false)
  }
}
