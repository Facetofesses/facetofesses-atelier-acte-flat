import Blob from '../elements/Blob'
import Selector from '../elements/Selector'
import TextSelection from '../elements/TextSelection'
import TextPiece from '../elements/TextPiece'
import SocketClient from '../utils/SocketClient'
import SoundHelper from '../utils/SoundHelper'

const STATE_INACTIVE = 'STATE_INACTIVE'
const STATE_SHOW = 'STATE_SHOW'
const STATE_ACTIVE = 'STATE_ACTIVE'

let startRotation = null
let lastRotation = null

export default class Piece {
  /**
   * Represents one piece
   * @param config
   */
  constructor (config) {
    this.config = config

    this.state = STATE_INACTIVE
    this.x = 0
    this.y = 0
    this.rotation = 0
    this.activePositionIndex = 0
    this.onBasket = false

    this.createElements()
  }

  setActivePositionIndex () {
    let newIndex = Math.floor(this.rotation * this.config.positions.length / 360)

    console.log('new index', newIndex)

    if (newIndex < 0 || newIndex > this.config.positions.length - 1) {
      newIndex = 0
    }

    if (newIndex !== this.activePositionIndex) {
      this.textSelection.updateActive(newIndex)
      this.selector.updateActive(newIndex)
      this.activePositionIndex = newIndex

      this.sendSocketDatas()
    }
  }

  sendSocketDatas () {
    SocketClient.send('data', {
      key: this.config.id,
      value: this.activePositionIndex
    })
  }

  createElements () {
    this.blob = new Blob(this.x, this.y, {
      color: this.config.color
    })
    this.selector = new Selector(this.x, this.y, {
      color: this.config.color,
      positions: this.config.positions
    })

    this.textSelection = new TextSelection(this.x, this.y, {
      positions: this.config.positions
    })

    this.textPiece = new TextPiece(this.x, this.y, {
      name: this.config.name
    })

    this.elements = [this.blob, this.selector, this.textSelection, this.textPiece]
  }

  setRotation (type, rotation) {
    switch (type) {
      case 'rotatestart':
        lastRotation = this.rotation
        startRotation = rotation
        break
      case 'rotateend':
        lastRotation = this.rotation
        break
      case 'rotate':
        let diff = startRotation - rotation
        this.rotation = lastRotation - diff
        this.setActivePositionIndex()
        break
    }
  }

  onDetect (x, y) {
    if (this.state === STATE_SHOW) {
      TweenMax.to(this, 0.6, {
        x,
        y
      })
    } else {
      SoundHelper.play('test')
      this.sendSocketDatas()
      this.x = x
      this.y = y

      this.blob.show(() => {
        this.blob.idle()
        this.textSelection.show(this.activePositionIndex)
        this.textPiece.show()
        this.selector.show(this.activePositionIndex)
      })
    }

    this.state = STATE_ACTIVE
  }

  onRelease () {
    console.log('RELEASE', this.onBasket)
    if (this.onBasket) {
      this.onThrow()
    } else {
      this.state = STATE_SHOW
    }
  }

  onThrow () {
    this.selector.hide()
    this.textSelection.hide()
    this.textPiece.hide()
    this.blob.hide(() => {
      this.state = STATE_INACTIVE
    })
  }

  isActive () {
    return this.state === STATE_ACTIVE
  }

  update () {
    this.elements.forEach((element) => {
      element.update({
        x: this.x,
        y: this.y
      })
    })
  }

  render () {
    if (this.isActive()) {
      this.elements.forEach((element) => {
        element.render()
      })
    }
  }
}
