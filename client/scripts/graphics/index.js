import Detector from '../detector/Detector'
import Basket from '../elements/Basket'
import PieceManager from '../pieces/PieceManager'
import {
  selectClass
} from '../utils/index'
import SplitText from '../lib/SplitText'

const SKIP_INTRO = true

export default class Graphics {
  constructor () {
    this.createApp()
    this.attachToDom(selectClass('tablet'))

    // Detector
    Detector.initialize(this.app.view)

    // Elements
    PieceManager.start(this.app)
    Basket.start(this.app)

    if (SKIP_INTRO) {
      this.animateUiElements()
      this.loop()
    } else {
      window.addEventListener('click', this.animateUiElements.bind(this))
      window.addEventListener('touchstart', this.animateUiElements.bind(this))
    }
  }

  /**
   * Create PIXI application and add it to the DOM
   */
  createApp () {
    this.app = new PIXI.Application(window.innerWidth, window.innerHeight, {
      transparent: true,
      antialias: true,
      autoResize: true,
      forceFXAA: true,
      roundPixels: true,
      resolution: window.devicePixelRatio || 1
    })

    // window.setTimeout(() => {
    //   PieceManager.pieces[0].onDetect(400, 400)
    //
    //   window.setTimeout(() => {
    //     PieceManager.pieces[0].setRotation(160)
    //     window.setTimeout(() => {
    //       PieceManager.pieces[0].setRotation(200)
    //       window.setTimeout(() => {
    //         PieceManager.pieces[0].setRotation(240)
    //         window.setTimeout(() => {
    //           PieceManager.pieces[0].setRotation(280)
    //           window.setTimeout(() => {
    //             PieceManager.pieces[0].setRotation(320)
    //           }, 1000)
    //         }, 1000)
    //       }, 1000)
    //     }, 1000)
    //   }, 1000)
    // }, 2000)
  }

  attachToDom (domElement = document.body) {
    domElement.appendChild(this.app.view)
  }

  loop () {
    this.app.ticker.add(() => {
      PieceManager.update()
      Basket.update()

      PieceManager.render()
      Basket.render()
    })
  }

  animateUiElements () {
    // let chars
    let tl = new TimelineMax()
      .from('.cursor', 0.7, {
        autoAlpha: 0
      })

    if (!SKIP_INTRO) {
      Array.from(document.querySelectorAll('.indication span')).forEach((span) => {
        let chars = new SplitText(span, {
          type: 'chars'
        }).chars

        tl.staggerFrom(chars, 0.2, {
          y: '+=30',
          autoAlpha: 0,
          ease: Elastic.easeOut.config(0.8, 0.3)
        }, 0.03, 1)
        .staggerTo(chars, 0.5, {
          y: '-=30',
          autoAlpha: 0
        }, 0.03, 4)
      })

      tl.to('.cursor', 0.7, {
        autoAlpha: 0
      })
    }

    tl.call(() => {
      let overlay = document.getElementsByClassName('overlay')[0]
      overlay.parentElement.removeChild(overlay)
      this.loop()
    })
  }
}
