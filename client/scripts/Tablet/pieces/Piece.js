import {
  selectClass
} from '../../utils/index'
import SplitText from '../../lib/SplitText'

export default class Piece {
  constructor (pieceConfig) {
    this.config = pieceConfig
    this.id = this.config.id
    this.currentSplit = null

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
    let p2 = this.backgroundCenter
    let p1 = {
      x: e.pageX,
      y: e.pageY
    }

    let angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI + 180
    const positionIndex = (Math.round(angle * 6 / 360) + 1) % 6

    this.animateText(this.config.positions[positionIndex] || '')

    TweenMax.to(this.$els.upperElement, 0.3, {
      rotation: 60 + positionIndex * 60
    })
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
