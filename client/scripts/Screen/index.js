import config from '../frontConfig.json'
import SocketClient from '../utils/SocketClient'
import ResourceHelper from './ResourceHelper'
import {
  randomInt,
  selectClass,
  selectId
} from '../utils/index'
import VideoRenderer from './VideoRenderer'
import Raf from 'raf'

export default class Screen {
  constructor () {
    this.config = config
    ResourceHelper.loadVideos(config)
    this.initializeElements()
    this.videoRenderer = new VideoRenderer(this.$els.videoContainer)

    // interactions datas
    this.positionResponseTimeoutId = null
    this.positionResponseGaiaTimeoutId = null
    this.responses = ['Je t’aime...', 'Mon amour', 'Hum...c\'est tellement bon']
    this.caressTimeline = null
    this.caressExcitation = 0

    this.state = {
      position: null,
      speed: 0
    }

    SocketClient.instance.onmessage = this.onSocketMessage.bind(this)
    this.renderVideoElement()
    this.render()
  }

  initializeElements () {
    this.$els = {
      videoContainer: selectId('video'),
      partnerTextElement: selectClass('partner-text'),
      overlayElement: selectClass('overlay')
    }

    document.getElementsByTagName('button')[0].addEventListener('click', () => {
      this.$els.videoContainer.load()
      this.$els.videoContainer.play()
      document.getElementsByTagName('button')[0].style.display = 'none'
    })

    window.setTimeout(() => {
      window.addEventListener('touchmove', (e) => {
        e.preventDefault()
      })
    }, 1500)
  }

  render () {
    if (this.useThreeJsRenderer) {
      this.videoRenderer.render()
    }

    Raf(this.render.bind(this))
  }

  /**
   * Event triggered when screen receive datas from tablet
   * @param e
   */
  onSocketMessage (e) {
    const datas = JSON.parse(e.data)
    this.updateState(datas.id, datas.selection)
    if (datas.id === 'position' || datas.id === 'speed') {
      const animation = this.getAnimation()

      if (animation) {
        this.updateAnimation(animation, datas.id === 'speed')
      }
    }
  }

  /**
   * Update state with datas from tablet
   * Call method for interactions
   * @param key
   * @param value
   */
  updateState (key, value) {
    this.state[key] = value

    switch (key) {
      case 'position':
        this.onPositionChange()
        break
      case 'sweet-words':
        this.onSweetWordsChange()
        break
      case 'caress':
        this.onCaress()
        break
      default:
        break
    }
  }

  /**
   * Called when position changed
   */
  onPositionChange () {
    // clear timeouts
    if (this.positionResponseTimeoutId) {
      clearTimeout(this.positionResponseTimeoutId)
      this.positionResponseTimeoutId = null
    }
    if (this.positionResponseGaiaTimeoutId) {
      clearTimeout(this.positionResponseGaiaTimeoutId)
      this.positionResponseGaiaTimeoutId = null
    }

    this.positionResponseTimeoutId = window.setTimeout(() => {
      this.write('Pfiou, je commence<br> à fatiguer...')
      this.positionResponseGaiaTimeoutId = window.setTimeout(() => {
        console.log('gaia: tu devrais changer de position')
      }, 5000)
    }, randomInt(10000, 15000))
  }

  /**
   * Called when sweet words have been sended
   */
  onSweetWordsChange () {
    window.setTimeout(() => {
      this.write(this.responses[randomInt(0, this.responses.length - 1)])
    }, 1500)
  }

  getAnimation () {
    return this.config.find((config) => {
      return config.position === this.state.position && config.speed === this.state.speed
    })
  }

  /**
   * Update video source with new datas (position and speed)
   */
  updateAnimation (animation, isSpeed) {
    const glitchTime = (isSpeed) ? 0.6 : 1

    this.renderThreeJs()
    window.setTimeout(() => {
      this.videoRenderer.glitch()

      this.$els.videoContainer.src = animation.resourceUrl
      this.$els.videoContainer.load()
      this.$els.videoContainer.play()

      this.$els.videoContainer.onplay = () => {
        this.$els.videoContainer.onplay = null
        new TimelineMax()
          .call(this.videoRenderer.unglitch.bind(this.videoRenderer), null, this.videoRenderer, glitchTime)
          .call(this.renderVideoElement.bind(this), null, this)
      }
    }, 50)
  }

  /**
   * Called when caress has been sended
   */
  onCaress () {
    this.renderThreeJs()
    this.videoRenderer.startCircleWave(this.renderVideoElement.bind(this))
  }

  /**
   * Write text on screen
   * @param text
   */
  write (text) {
    const startWriteTimeline = () => {
      this.writeTimeline = new TimelineMax()
        .set(this.$els.partnerTextElement, {
          autoAlpha: 0,
          y: 250,
          xPercent: -50
        })
        .call(() => {
          this.$els.partnerTextElement.innerHTML = text
        })
        .add('move', 0)
        .to(this.$els.partnerTextElement, 0.5, {
          autoAlpha: 1
        }, 0)
        .to(this.$els.partnerTextElement, 0.5, {
          autoAlpha: 0
        }, 6.4)
        .to(this.$els.partnerTextElement, 7, {
          y: 0,
          ease: Linear.easeNone
        }, 0)
        .call(() => {
          this.$els.partnerTextElement.innerHTML = ''
        })
    }

    if (this.writeTimeline && this.writeTimeline.isActive()) {
      this.writeTimeline.pause()
      TweenMax.to(this.$els.partnerTextElement, 0.3, {
        autoAlpha: 0,
        overwrite: 'all',
        onComplete: startWriteTimeline
      })
    } else {
      startWriteTimeline()
    }
  }

  renderThreeJs () {
    this.useThreeJsRenderer = true
    this.$els.videoContainer.style.display = 'none'
  }

  renderVideoElement () {
    this.videoRenderer.renderer.clear()
    this.useThreeJsRenderer = false
    this.$els.videoContainer.style.display = 'block'
  }
}
