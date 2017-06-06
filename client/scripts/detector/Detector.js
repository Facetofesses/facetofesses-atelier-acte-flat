import Hammer from 'hammerjs'
import Touch from './Touch'
import Events from '../utils/Events'
import {
  PIECE_TOUCH,
  PIECE_MOVE,
  PIECE_ROTATE,
  PIECE_RELEASE
} from '../utils/EventTypes'

/**
 * Set all interactions listeners and send events on detection
 */
class Detector {
  initialize (canvas) {
    this.mc = new Hammer(canvas)

    this.addTouchListener()
    this.addRotateListener()
  }

  /**
   * Add all touch flow events listeners
   */
  addTouchListener () {
    window.addEventListener('touchstart', this.onTouchStart.bind(this))
    window.addEventListener('touchmove', this.onTouchMove.bind(this))
    window.addEventListener('touchend', this.onTouchEnd.bind(this))
  }

  /**
   * Add Hammer rotate listener
   */
  addRotateListener () {
    this.mc.add(new Hammer.Rotate({
      pointers: 3
    }))
    this.mc.on('rotate rotatestart rotateend', this.onRotate.bind(this))
  }

  /**
   * Callback method on rotate
   * @param e
   */
  onRotate (e) {
    Events.commit(PIECE_ROTATE, {
      type: e.type,
      rotation: Math.round(e.rotation)
    })
  }

  /**
   * Callback method on touch start
   * @param e
   */
  onTouchStart (e) {
    const touches = Array.from(e.targetTouches)
    console.log('touch', touches.length)

    if (touches.length === 3) {
      const touch = new Touch(touches)
      Events.commit(PIECE_TOUCH, {touch})
    }
  }

  /**
   * Callback method on touch move
   * @param e
   */
  onTouchMove (e) {
    const touches = Array.from(e.targetTouches)

    if (touches.length === 3) {
      const touch = new Touch(touches)
      Events.commit(PIECE_MOVE, {touch})
    }
  }

  /**
   * Callback method on touch end
   */
  onTouchEnd () {
    Events.commit(PIECE_RELEASE)
  }
}

export default new Detector()
