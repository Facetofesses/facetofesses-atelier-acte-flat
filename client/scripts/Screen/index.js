import config from '../frontConfig.json'
import SocketClient from '../utils/SocketClient'
import {
  randomInt
} from '../utils/index'

export default class Screen {
  constructor () {
    this.config = config
    this.loadGifs()
    this.animationContainer = document.getElementById('gif')
    this.partnerTextElement = document.getElementsByClassName('partner-text')[0]
    this.overlayElement = document.getElementsByClassName('overlay')[0]

    // interactions
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

  loadGifs () {
    const promises = []
    this.config.forEach(c => promises.push(this.loadGif(c)))

    Promise.all(promises)
      .then(this.onGifsLoaded.bind(this))
  }

  loadGif (configItem) {
    return fetch(configItem.resourceUrl)
      .then(data => data.blob())
      .then(data => {
        configItem.url = URL.createObjectURL(data)
      })
  }

  onGifsLoaded () {
    this.updateAnimation()
  }

  onSocketMessage (e) {
    const datas = JSON.parse(e.data)
    this.updateState(datas.id, datas.selection)
    if (datas.id === 'position' || datas.id === 'speed') {
      this.updateAnimation()
    }
  }

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

  onSweetWordsChange () {
    window.setTimeout(() => {
      this.write(this.responses[randomInt(0, this.responses.length - 1)])
    }, 1500)
  }

  updateAnimation () {
    const configItem = this.config.find((config) => {
      return config.position === this.state.position && config.speed === this.state.speed
    })

    new TimelineMax()
      .to(this.animationContainer, 0.5, {
        autoAlpha: 0
      })
      .call(() => {
        this.animationContainer.src = (configItem) ? configItem.url : ''
      })
      .to(this.animationContainer, 0.5, {
        autoAlpha: 1
      })
  }

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
