import config from '../frontConfig.json'
import SocketClient from '../utils/SocketClient'
import {
  randomInt,
  selectClass,
  selectId
} from '../utils/index'
import VideoRenderer from './VideoRenderer'
import Raf from 'raf'

let firstInteraction = true

const DEMO_TIME = 60

export default class Screen {
  constructor () {
    this.config = config
    this.initializeElements()
    this.videoRenderer = new VideoRenderer(this.$els.videoContainer)

    // interactions datas
    this.timeoutIds = []
    this.responses = ['Je t’aime...', 'Mon amour', 'Hum...c\'est tellement bon']
    this.caressTimeline = null

    this.state = {
      position: null,
      speed: 0
    }

    SocketClient.addOnMessageListener(this.onSocketMessage.bind(this))
    this.renderVideoElement()
    this.render()
  }

  /**
   * Initialize elements
   */
  initializeElements () {
    this.$els = {
      videoContainer: selectId('video'),
      partnerTextElement: selectClass('partner-text'),
      overlayElement: selectClass('overlay')
    }

    // document.getElementsByTagName('button')[0].addEventListener('click', () => {
    //   this.$els.videoContainer.load()
    //   this.$els.videoContainer.play()
    //   document.getElementsByTagName('button')[0].style.display = 'none'
    // })

    window.setTimeout(() => {
      window.addEventListener('touchmove', (e) => {
        e.preventDefault()
      })
    }, 1500)
  }

  /**
   * Render image with Three JS
   */
  render () {
    if (this.useThreeJsRenderer) {
      this.videoRenderer.render()
    }

    Raf(this.render.bind(this))
  }

  /**
   * Event triggered when screen receive datas from tablet
   * @param datas   All datas sended by tablet
   */
  onSocketMessage (datas) {
    if (firstInteraction) {
      // Add caress timeout
      this.clearResponseTimeout('gaia_caress_help')
      this.setResponseTimeout('gaia_caress_help', 7000, () => {
        SocketClient.send('sound', {
          sound: 'caress_help_sound'
        })
      })

      // Add sweet words timeout
      this.clearResponseTimeout('gaia_sweet_words_help')
      this.setResponseTimeout('gaia_sweet_words_help', 17000, () => {
        SocketClient.send('sound', {
          sound: 'sweet_words_help_sound'
        })
      })

      // end of demo timeout
      window.setTimeout(() => {
        SocketClient.send('sound', {
          sound: 'end_sound',
          action: 'stop_all'
        })
      }, DEMO_TIME * 1000)
      firstInteraction = false
    }

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
    this.clearResponseTimeout('position_change')
    this.clearResponseTimeout('gaia_position_help')

    this.setResponseTimeout('position_change', 25000, () => {
      this.write('Pfiou, je commence<br> à fatiguer...')
      this.setResponseTimeout('gaia_position_help', 5000, () => {
        SocketClient.send('sound', {
          sound: 'position_help_sound'
        })
      })
    })
  }

  /**
   * Called when sweet words have been sended
   */
  onSweetWordsChange () {
    this.clearResponseTimeout('gaia_sweet_words_help')
    window.setTimeout(() => {
      this.write(this.responses[randomInt(0, this.responses.length - 1)])
    }, 1500)
  }

  /**
   * Get animation which correspond to state
   */
  getAnimation () {
    return this.config.find((config) => {
      return config.position === this.state.position && config.speed === this.state.speed
    })
  }

  /**
   * Update video source with new datas (position and speed)
   * @param animation   Animation object (urls)
   * @param isSpeed   Used to determine glitch duration
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
    this.clearResponseTimeout('gaia_caress_help')
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

  /**
   * Use Three js renderer
   */
  renderThreeJs () {
    this.useThreeJsRenderer = true
    this.$els.videoContainer.style.display = 'none'
  }

  /**
   * Use video DOM element
   */
  renderVideoElement () {
    this.videoRenderer.renderer.clear()
    this.useThreeJsRenderer = false
    this.$els.videoContainer.style.display = 'block'
  }

  /**
   * Utils method to add a timeout
   * @param timeoutIdKey
   * @param delay
   * @param callback
   */
  setResponseTimeout (timeoutIdKey, delay, callback) {
    this.timeoutIds[timeoutIdKey] = window.setTimeout(callback, delay)
  }

  /**
   * Utils method to remove a timeout
   * @param timeoutIdKey
   */
  clearResponseTimeout (timeoutIdKey) {
    if (this.timeoutIds[timeoutIdKey]) {
      clearTimeout(this.timeoutIds[timeoutIdKey])
      this.timeoutIds[timeoutIdKey] = null
    }
  }
}
