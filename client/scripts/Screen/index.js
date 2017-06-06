import config from '../frontConfig.json'
import SocketClient from '../utils/SocketClient'
import {
  randomInt
} from '../utils/index'

export default class Screen {
  constructor () {
    this.config = config
    this.loadVideos()
    this.videoContainer = document.getElementById('video')
    this.partnerTextElement = document.getElementsByClassName('partner-text')[0]
    this.overlayElement = document.getElementsByClassName('overlay')[0]

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

  /**
   * Load all videos
   */
  loadVideos () {
    const promises = []
    this.config.forEach(c => promises.push(this.loadVideo(c)))

    Promise.all(promises)
      .then(this.onVideosLoaded.bind(this))
  }

  /**
   * Load a video
   * @param configItem
   * @returns {Promise.<TResult>}
   */
  loadVideo (configItem) {
    return fetch(configItem.resourceUrl)
      .then(data => data.blob())
      .then(data => {
        configItem.url = URL.createObjectURL(data)
      })
  }

  /**
   * Event triggered when all videos are loaded
   */
  onVideosLoaded () {
    this.updateAnimation()
  }

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
      .to(this.videoContainer, 0.5, {
        autoAlpha: 0
      })
      .call(() => {
        if (configItem) {
          this.videoContainer.pause()
          this.videoContainer.src = configItem.url
          this.videoContainer.load()
          this.videoContainer.play()
        }
      })
      .to(this.videoContainer, 0.5, {
        autoAlpha: 1
      })
  }

  /**
   * Called when caress has been sended
   */
  onCaress () {
    if (!this.caressTimeline) {
      this.caressTimeline = new TimelineMax({
        paused: true
      })
        .fromTo(this.overlayElement, 1, {
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
    if (this.writeTimeline && this.writeTimeline.isActive()) {
      this.writeTimeline.pause()
      TweenMax.to(this.partnerTextElement, 0.3, {
        autoAlpha: 0,
        overwrite: 'all'
      })
    }

    this.writeTimeline = new TimelineMax()
      .set(this.partnerTextElement, {
        autoAlpha: 0,
        y: 250,
        xPercent: -50
      })
      .call(() => {
        this.partnerTextElement.innerHTML = text
      })
      .add('move', 0)
      .to(this.partnerTextElement, 0.5, {
        autoAlpha: 1
      }, 0)
      .to(this.partnerTextElement, 0.5, {
        autoAlpha: 0
      }, 6.4)
      .to(this.partnerTextElement, 7, {
        y: 0,
        ease: Linear.easeNone
      }, 0)
      .call(() => {
        this.partnerTextElement.innerHTML = ''
      })
  }
}
