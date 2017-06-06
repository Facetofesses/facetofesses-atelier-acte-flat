import Element from './Element'

export default class TextPiece extends Element {
  constructor (x, y, options) {
    super()

    this.name = options.name
    this.graphics = new PIXI.Text('', {
      fontWeight: 800,
      fontSize: 40,
      fontFamily: 'Blogger Sans',
      fill: '#FFFFFF',
      align: 'center'
    })
    this.graphics.visible = this.visible

    this.graphics.x = x
    this.graphics.y = y
  }

  show () {
    this.graphics.text = this.name.toUpperCase()
    this.visible = true
  }

  hide () {
    this.visible = false
  }

  update (values) {
    super.update(values)

    this.graphics.x -= this.graphics.width / 2
    this.graphics.y -= this.graphics.height / 2
  }

  render () {
    this.graphics.visible = this.visible
  }
}
