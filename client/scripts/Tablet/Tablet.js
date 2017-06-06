import PieceManager from './pieces/PieceManager'
import {
  selectClass,
  randomInt,
  randomFloat
} from '../utils/index'

class Tablet {
  start () {
    PieceManager.start()
    this.initializeElements()
    this.initializeEvents()
    this.animateBubbles()
  }

  initializeElements () {
    this.$els = {
      bubbles: selectClass('bubble', true)
    }
  }

  initializeEvents () {
    window.setTimeout(() => {
      window.addEventListener('touchmove', (e) => {
        e.preventDefault()
      })
    }, 1500)
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
}

export default new Tablet()
