import {
  selectClass
} from '../../utils/index'
import SplitText from '../../lib/SplitText'
import SocketClient from '../../utils/SocketClient'

// touchable arc length before and after an icon
const ANGLE_DETECTION_INTERVAL = 30

export default class Piece {
  constructor (pieceConfig) {
    this.config = pieceConfig
    this.id = this.config.id
    this.currentSplit = null
    this.lastSelectionIndex = 5

    this.initializeElements()
    this.initializeEvents()

    // Set reusable values
    const bounding = this.$els.background.getBoundingClientRect()
    this.backgroundCenter = {
      x: bounding.left + this.$els.background.offsetWidth / 2,
      y: bounding.top + this.$els.background.offsetHeight / 2
    }
  }

  initializeElements () {
    this.$els = {
      container: selectClass(this.id),
    }

    this.$els = {
      ...this.$els,
      text: this.$els.container.getElementsByClassName('text')[0],
      upperElement: this.$els.container.getElementsByClassName('upper-element')[0],
      background: this.$els.container.getElementsByClassName('background')[0],
    }
  }

  initializeEvents () {
    this.$els.background.addEventListener('touchstart', this.onBackgroundTouch.bind(this))
  }

  onBackgroundTouch (e) {
    const angle = this.getTouchAngle({
      x: e.pageX,
      y: e.pageY
    }, this.backgroundCenter)

    let selectionIndex = 0
    let iAngle = -360/12
    let index = 0
    for (iAngle = -360/12, index = 0; iAngle <= 360 + 360/12; iAngle+=360/6, index++) {
      if (angle < iAngle + ANGLE_DETECTION_INTERVAL && angle > iAngle - ANGLE_DETECTION_INTERVAL) {
        selectionIndex = index
        this.onSelectionChange(selectionIndex)
      }
    }
  }

  onSelectionChange (selectionIndex) {
    if (selectionIndex !== this.lastSelectionIndex) {
      // show text
      this.animateText(this.config.selections[selectionIndex] || '')

      // upper element rotation
      TweenMax.to(this.$els.upperElement, 0.3, {
        rotation: 60 + selectionIndex * 60
      })

      // send info to screen
      if (this.config.selections[selectionIndex]) {
        SocketClient.send('datas', {
          id: this.id,
          selection: selectionIndex,
          text: this.config.selections[selectionIndex] || ''
        })
      }

      this.lastSelectionIndex = selectionIndex
    }
  }

  getTouchAngle (p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI + 180
  }

  animateText (text) {
    const showNew = () => {
      if (text) {
        this.$els.text.innerText = text

        this.currentSplit = new SplitText(this.$els.text, {
          type: 'chars'
        }).chars

        TweenMax.staggerFromTo(this.currentSplit, 0.2, {
          y: 10,
          autoAlpha: 0
        },  {
          y: 0,
          autoAlpha: 1
        }, 0.05)
      } else {
        this.currentSplit = null
      }
    }

    if (this.currentSplit) {
      TweenMax.staggerTo(this.currentSplit, 0.2, {
        y: -10,
        autoAlpha: 0
      }, 0.05, showNew)
    } else {
      showNew()
    }
  }
}
