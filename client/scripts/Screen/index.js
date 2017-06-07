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
    ResourceHelper.loadVideos(config, this.onVideosLoaded.bind(this))
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
  }

  initializeElements () {
    this.$els = {
      videoContainer: selectId('video'),
      partnerTextElement: selectClass('partner-text'),
      overlayElement: selectClass('overlay')
    }
  }

  render () {
    this.videoRenderer.render()

    Raf(this.render.bind(this))
  }

  /**
   * Event triggered when all videos are loaded
   */
  onVideosLoaded () {}

  /**
   * Event triggered when screen receive datas from tablet
   * @param e
   */
  onSocketMessage (e) {
    const datas = JSON.parse(e.data)
    this.updateState(datas.id, datas.selection)
    if (datas.id === 'position' || datas.id === 'speed') {
      this.updateAnimation()
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

  /**
   * Update video source with new datas (position and speed)
   */
  updateAnimation () {
    const configItem = this.config.find((config) => {
      return config.position === this.state.position && config.speed === this.state.speed
    })

    new TimelineMax()
      .call(this.videoRenderer.glitch.bind(this.videoRenderer), null, this.videoRenderer, 0)
      .call(() => {
        if (configItem) {
          this.$els.videoContainer.pause()
          this.$els.videoContainer.src = configItem.url
          this.$els.videoContainer.load()
          this.$els.videoContainer.play()
          this.$els.videoContainer.addEventListener('playing', this.videoRenderer.unglitch.bind(this.videoRenderer))
        }
      }, null, null, 2)
  }

  /**
   * Called when caress has been sended
   */
  onCaress () {
    if (!this.caressTimeline) {
      this.caressTimeline = new TimelineMax({
        paused: true
      })
        .fromTo(this.$els.overlayElement, 1, {
          backgroundColor: '#000000'
        }, {
          backgroundColor: '#673101'
        })
    }

    this.caressExcitation += 0.01
    if (this.caressExcitation > 1) {
      this.caressExcitation = 1
    }

    this.caressTimeline.seek(this.caressExcitation)
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
}
