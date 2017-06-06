import {
  PIECE_TOUCH,
  PIECE_MOVE,
  PIECE_ROTATE,
  PIECE_RELEASE
} from '../utils/EventTypes'
import config from '../config.json'
import Piece from '../pieces/Piece'
import {near} from '../utils/index'
import Basket from '../elements/Basket'

class PieceManager {
  start (pixiApp) {
    this.createPieces(pixiApp)
    this.initializeEvents()
  }

  initializeEvents () {
    const bindedOnPieceTouch = this.onPieceTouch.bind(this)
    const bindedOnPieceMove = this.onPieceMove.bind(this)
    const bindedOnPieceRotate = this.onPieceRotate.bind(this)
    const bindedOnPieceRelease = this.onPieceRelease.bind(this)

    window.addEventListener(PIECE_TOUCH, bindedOnPieceTouch)
    window.addEventListener(PIECE_MOVE, bindedOnPieceMove)
    window.addEventListener(PIECE_ROTATE, bindedOnPieceRotate)
    window.addEventListener(PIECE_RELEASE, bindedOnPieceRelease)
  }

  createPieces (pixiApp) {
    this.pieces = []

    config.pieces.forEach((pieceConfig) => {
      // Create piece
      const piece = new Piece(pieceConfig)
      piece.elements.forEach((element) => {
        pixiApp.stage.addChild(element.getGraphics())
      })
      this.pieces.push(piece)
    })
  }

  onPieceTouch (e) {
    const touch = e.detail.touch
    console.log(touch)
    this.pieces.every((piece) => {
      const match = touch.lengths.every(l => near(l, piece.config.matrix[0]) || near(l, piece.config.matrix[2]) || near(l, piece.config.matrix[2]))
      if (match) {
        piece.onDetect(touch.x, touch.y)
        return false
      } else {
        return true
      }
    })
  }

  onPieceMove (e) {
    const touch = e.detail.touch
    let to = {}

    const distance = Math.sqrt(Math.pow(Basket.x - touch.x, 2) + Math.pow(Basket.y - touch.y, 2))

    const piece = this.pieces.find(p => p.isActive())
    if (!piece) return

    if (distance < 200) {
      to = {
        x: Basket.x,
        y: Basket.y
      }
      piece.onBasket = true
    } else {
      to = {
        x: touch.x,
        y: touch.y
      }
      piece.onBasket = false
    }

    TweenMax.to(piece, 0.2, to)
  }

  onPieceRotate (e) {
    const piece = this.pieces.find(piece => piece.isActive())
    if (piece) {
      piece.setRotation(e.detail.type, e.detail.rotation)
    }
  }

  onPieceRelease () {
    Basket.hide()
    const piece = this.pieces.find(p => p.isActive())
    if (piece) {
      piece.onRelease()
    }
  }

  update () {
    this.pieces.forEach(piece => piece.update())
  }

  render () {
    this.pieces.forEach(piece => piece.render())
  }
}

export default new PieceManager()
