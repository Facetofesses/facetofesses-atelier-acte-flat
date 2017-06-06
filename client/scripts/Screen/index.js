import config from '../frontConfig.json'
import SocketClient from '../utils/SocketClient'

export default class Screen {
  constructor () {
    this.config = config
    this.loadGifs()
    this.animationContainer = document.getElementById('gif')

    this.state = {
      position: null,
      speed: 1
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
    console.log('gifs loaded')

    this.updateState('position', 0)
    this.updateAnimation()
  }

  onSocketMessage (e) {
    const datas = JSON.parse(e.data)
    this.updateState(datas.key, datas.value)
    this.updateAnimation()
  }

  updateState (key, value) {
    console.log('update', key, value)
    this.state[key] = value
  }

  updateAnimation () {
    const configItem = this.config.find((config) => {
      return config.position === this.state.position && config.speed === this.state.speed
    })
    if (configItem) {
      this.animationContainer.src = configItem.url
    }
  }
}
