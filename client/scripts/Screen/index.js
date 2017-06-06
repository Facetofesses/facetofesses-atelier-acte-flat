import config from '../frontConfig.json'
import SocketClient from '../utils/SocketClient'
import ResourceHelper from './ResourceHelper'
import {
  randomInt
} from '../utils/index'
import '../lib/CopyShader'
import '../lib/DigitalGlitch'
import '../lib/EffectComposer'
import '../lib/RenderPass'
import '../lib/MaskPass'
import '../lib/ShaderPass'
import '../lib/GlitchPass'

export default class Screen {
  constructor () {
    this.config = config
    ResourceHelper.loadVideos(this.onVideosLoaded.bind(this), config)

    this.videoContainer = document.getElementById('video')
    this.partnerTextElement = document.getElementsByClassName('partner-text')[0]
    this.overlayElement = document.getElementsByClassName('overlay')[0]

    // interactions datas
    this.positionResponseTimeoutId = null
    this.positionResponseGaiaTimeoutId = null
    this.responses = ['Je t’aime...', 'Mon amour', 'Hum...c\'est tellement bon']
    this.caressTimeline = null
    this.caressExcitation = 0

    // Rendering
    this.glitch = false
    this.createThreeScene()

    this.state = {
      position: null,
      speed: 0
    }

    SocketClient.instance.onmessage = this.onSocketMessage.bind(this)
  }

  createThreeScene () {
    // Create scene
    this.scene = new THREE.Scene()

    // Create camera
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
    this.camera.position.z = 800
    this.camera.lookAt(new THREE.Vector3(0, 0, 0))
    this.scene.add(this.camera)

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    // Create texture
    this.texture = new THREE.Texture(this.videoContainer)
    this.texture.needsUpdate = true
    this.texture.minFilter = THREE.LinearFilter

    // Create plane
    const material = new THREE.MeshBasicMaterial({map: this.texture})
    const plane = new THREE.PlaneGeometry(600, 400)
    this.scr = new THREE.Mesh(plane, material)
    this.scene.add(this.scr)

    // Add canvas to DOM
    document.getElementsByClassName('screen')[0].appendChild(this.renderer.domElement)

    // Video effects
    this.composer = new THREE.EffectComposer(this.renderer)
    this.rendererPass = new THREE.RenderPass(this.scene, this.camera)
    this.glitchPass = new THREE.GlitchPass(64)
    this.glitchPass.goWild = false
    this.glitchPass.renderToScreen = true
    this.composer.addPass(this.rendererPass)
    this.composer.addPass(this.glitchPass)

    this.render()
  }

  render () {
    if (this.videoContainer.readyState === this.videoContainer.HAVE_ENOUGH_DATA) {
      if (this.texture) this.texture.needsUpdate = true
    }
    if (this.glitch) {
      this.composer.render()
    } else {
      this.renderer.render(this.scene, this.camera)
    }
    requestAnimationFrame(this.render.bind(this))
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
      .call(() => {
        this.glitch = true
        this.glitchPass.goWild = true
      }, null, null, 0)
      .call(() => {
        if (configItem) {
          this.videoContainer.pause()
          this.videoContainer.src = configItem.url
          this.videoContainer.load()
          this.videoContainer.play()
          this.videoContainer.addEventListener('playing', () => {
            this.glitch = false
            this.glitchPass.goWild = false
          })
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
