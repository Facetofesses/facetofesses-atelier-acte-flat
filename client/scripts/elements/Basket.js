import {
  PIECE_MOVE
} from '../utils/EventTypes'

class Basket {
  start (pixiApp) {
    this.visible = false
    this.middleSceneX = pixiApp.renderer.width / (2 * pixiApp.renderer.resolution)
    this.x = this.middleSceneX
    this.y = 70

    this.graphics = new PIXI.Graphics()
    this.createPoints(pixiApp)
    this.createImage()
    pixiApp.stage.addChild(this.graphics)
    pixiApp.stage.addChild(this.basketImage)

    this.initializeEvents()
    this.createTimeline()
  }

  initializeEvents () {
    const bindedOnPieceMove = this.onPieceMove.bind(this)

    window.addEventListener(PIECE_MOVE, bindedOnPieceMove)
  }

  createPoints () {
    this.curves = [
      {x: 0, y: 0},
      {x: 0.17, y: 0},
      {x: 0.33, y: 1.02},
      {x: 0.50, y: 1},
      {x: 0.66, y: 1.02},
      {x: 0.82, y: 0},
      {x: 1, y: 0}
    ]
    this.points = []
    let amplitude = 100

    this.curves.forEach((c) => {
      this.points.push({
        x: this.middleSceneX + c.x * 400 - 200,
        y: c.y * amplitude,
        startY: c.y * amplitude
      })
    })
  }

  createImage () {
    this.basketImage = PIXI.Sprite.fromImage(require('../../img/delete.png'))
    this.basketImage.x = this.middleSceneX - 12
    this.basketImage.y = 30
    this.basketImage.alpha = 0
  }

  createTimeline () {
    const completeCallback = () => {
      this.visible = !this.visible
    }
    this.showTimeline = new TimelineMax({
      paused: true,
      onComplete: completeCallback,
      onReverseComplete: completeCallback
    })
    this.points.forEach((p) => {
      this.showTimeline.fromTo(p, 1, {
        y: 0
      }, {
        y: p.y,
        ease: Elastic.easeOut.config(1, 0.3)
      }, 0)
    })
    this.showTimeline.fromTo(this.basketImage, 0.2, {
      alpha: 0
    }, {
      alpha: 1
    }, 0.1)
  }

  onPieceMove (e) {
    const touch = e.detail.touch
    const distance = Math.sqrt(Math.pow(this.x - touch.x, 2) + Math.pow(this.y - touch.y, 2))

    if (distance < 300) {
      this.show()
    } else {
      this.hide()
    }
  }

  show () {
    if (this.visible || (this.showTimeline.isActive() && !this.visible)) return
    this.showTimeline.play()
  }

  hide () {
    if (!this.visible || (this.showTimeline.isActive() && this.visible)) return
    this.showTimeline.reverse()
  }

  update () {}

  render () {
    this.graphics.clear()

    this.graphics.beginFill(0x242A2E)
    this.graphics.moveTo(this.points[0].x, this.points[0].y)

    this.graphics.bezierCurveTo(this.points[1].x, this.points[1].y, this.points[2].x, this.points[2].y, this.points[3].x, this.points[3].y)
    this.graphics.bezierCurveTo(this.points[4].x, this.points[4].y, this.points[5].x, this.points[5].y, this.points[6].x, this.points[6].y)

    this.graphics.endFill()
  }
}

export default new Basket()
