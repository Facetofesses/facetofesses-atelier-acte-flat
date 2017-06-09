import PieceManager from './pieces/PieceManager'
import {
  selectClass,
  randomInt,
  randomFloat
} from '../utils/index'
import SocketClient from '../utils/SocketClient'
import SoundHelper from '../utils/SoundHelper'

export default class Tablet {
  constructor () {
    this.pieceManager = new PieceManager()
    this.initializeElements()
    this.animateBubbles()

    SocketClient.addOnMessageListener(this.onSocketMessage.bind(this))
  }

  /**
   * Initialize elements
   */
  initializeElements () {
    this.$els = {
      bubbles: selectClass('bubble', true)
    }
  }

  /**
   * Initialize events
   */
  initializeEvents () {
    window.setTimeout(() => {
      window.addEventListener('touchmove', (e) => {
        e.preventDefault()
      })
    }, 1500)
  }

  /**
   * Enable touch interaction on each piece
   */
  listenPiecesInteractions () {
    for (let key in this.pieceManager.pieces) {
      if (this.pieceManager.pieces.hasOwnProperty(key)) {
        this.pieceManager.pieces[key].initializeEvents()
      }
    }
  }

  /**
   * Animate background bubbles (position and scale)
   */
  animateBubbles () {
    // place bubbles
    this.$els.bubbles.forEach((bubble) => {
      TweenMax.set(bubble, {
        x: randomInt(0, window.innerWidth - 200),
        y: randomInt(0, window.innerHeight - 200)
      })
    })

    const bubblesAnimation = () => {
      this.$els.bubbles.forEach((bubble) => {
        TweenMax.to(bubble, 20, {
          x: randomInt(0, window.innerWidth - 200),
          y: randomInt(0, window.innerHeight - 200),
          scaleX: randomFloat(0.8, 1.2),
          scaleY: randomFloat(0.8, 1.2),
          ease: Linear.easeNone
        })
      })
    }

    bubblesAnimation()
    window.setInterval(bubblesAnimation, 20000)
  }

  /**
   * Called when Tablet receive socket messages
   * @param datas
   */
  onSocketMessage (datas) {
    if (datas.type === 'sound') {
      SoundHelper.play(datas.sound)

      if (datas.action && datas.action === 'stop_all') {
        // stop all (sound)
      }
    }
  }
}
