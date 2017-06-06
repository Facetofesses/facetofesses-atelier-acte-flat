import Element from './Element'

export default class TextSelection extends Element {
  constructor (x, y, options) {
    super()

    this.positions = options.positions
    this.graphics = new PIXI.Text('', {
      fontWeight: 400,
      fontSize: 40,
      fontFamily: 'Blogger Sans',
      fill: '#FFFFFF',
      align: 'center'
    })
    this.graphics.visible = this.visible

    this.graphics.x = x
    this.graphics.y = y
  }

  show (activeIndex) {
    this.visible = true
    this.updateActive(activeIndex)
  }

  hide () {
    this.visible = false
  }

  update (values) {
    super.update(values)

    this.graphics.y -= this.graphics.height + 190
    this.graphics.x -= this.graphics.width / 2
  }

  updateActive (newActiveIndex) {
    new TimelineMax()
      .to(this.graphics, 0.2, {
        alpha: 0
      })
      .call(() => {
        if (!this.positions[newActiveIndex]) {
          console.log('existe pas', newActiveIndex)
        }
        this.graphics.text = this.positions[newActiveIndex].name
      })
      .to(this.graphics, 0.2, {
        alpha: 1
      })
  }

  render () {
    this.graphics.visible = this.visible
  }
}
