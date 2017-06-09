import domReady from 'domready'
import WebFont from 'webfontloader'
import 'gsap'
import Screen from './Screen/index'
import Tablet from './Tablet/Tablet'
import SocketClient from './utils/SocketClient'
import SoundHelper from './utils/SoundHelper'
import {
  selectClass
} from './utils/index'

const DOM_READY_EVENT = 'dom-ready'
const FONTS_READY_EVENT = 'fonts-ready'
const dbg = debug('app:App')

export default class App {
  constructor () {
    dbg('Init App')
    this.events = []
    this.waitDomReady()
    this.waitFontsReady()
  }

  /**
   * Hide/show device container and start app
   */
  start () {
    const hash = window.location.hash.substr(1)

    if (hash === 'tablet') {
      selectClass('tablet').style.display = 'block'
      let tablet = new Tablet()
      SocketClient.setKey('tablet')

      Promise.all([SocketClient.start(), SoundHelper.start()])
        .then(this.onTabletLoaded.bind(this, tablet))
    } else if (hash === 'screen') {
      selectClass('screen').style.display = 'block'
      SocketClient.setKey('screen')
      SocketClient.start()
        .then(() => {
          new Screen()
        })
    }
  }

  onTabletLoaded (tablet) {
    const startButton = document.getElementsByClassName('start-experience')[0]
    const callback = () => {
      SoundHelper.play('intro_sound')

      TweenMax.to(startButton, 0.5, {
        autoAlpha: 0
      })

      window.setTimeout(() => {
        SoundHelper.multiPlayer.startLoop('ambient_sound')
        SoundHelper.multiPlayer.startLoop('pulse_sound')
        SoundHelper.getActiveSound('pulse_sound').playbackRate.rampTo(0.5, 0)
        tablet.listenPiecesInteractions()
      }, SoundHelper.getActiveSound('intro_sound').buffer.duration * 1000)
    }

    startButton.addEventListener('click', callback)
    startButton.addEventListener('touchstart', callback)
  }

  waitDomReady () {
    dbg('wait for DOM ready')
    this.events.push(DOM_READY_EVENT)
    domReady(() => {
      dbg('DOM ready')
      this.onLoadEventSuccess(DOM_READY_EVENT)
    })
  }

  waitFontsReady () {
    dbg('wait for fonts ready')
    this.events.push(FONTS_READY_EVENT)
    WebFont.load({
      custom: {
        families: ['Blogger Sans:400'],
        urls: ['/static/font.css']
      },
      classes: false,
      active: () => {
        dbg('fonts ready')
        this.onLoadEventSuccess(FONTS_READY_EVENT)
      }
    })
  }

  onLoadEventSuccess (key) {
    this.events.splice(this.events.indexOf(key), 1)
    if (this.events.length === 0) {
      this.start()
    }
  }
}
