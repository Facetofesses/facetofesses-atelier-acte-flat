import '../lib/CopyShader'
import '../lib/DigitalGlitch'
import '../lib/EffectComposer'
import '../lib/RenderPass'
import '../lib/MaskPass'
import '../lib/ShaderPass'
import '../lib/GlitchPass'
import {
  randomInt
} from '../utils/index'

export default class VideoRenderer {
  constructor (videoDomElement) {
    this.videoDomElement = videoDomElement
    this.glitchEnabled = false
    this.circles = []

    this.createScene()
    this.createCamera()
    this.createRenderer()
    this.createCameraPlane()
    this.addEffects()

    this.addToDOM()
  }

  createCamera () {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
    this.camera.position.z = 800
    this.camera.lookAt(new THREE.Vector3(0, 0, 0))
    this.scene.add(this.camera)
  }

  createRenderer () {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  createScene () {
    this.scene = new THREE.Scene()
  }

  glitch () {
    this.glitchEnabled = true
    this.glitchPass.goWild = true
  }

  unglitch () {
    this.glitchEnabled = false
    this.glitchPass.goWild = false
  }

  startCircleWave () {
    this.circles = []
    for (let i = 0; i < 5; i++) {
      const circle = this.createCircle()
      this.scene.add(circle)
      this.circles.push(circle)
      const radius = randomInt(10, 50)
      TweenMax.to(circle.scale, 2, {
        x: `+=${radius}`,
        y: `+=${radius}`,
        ease: Power1.easeIn
      })
      TweenMax.to(circle.material, 2, {
        opacity: 0,
        delay: 1.5
      })
    }
  }

  createCircle () {
    let geometry = new THREE.CircleGeometry(1, 500)
    geometry.vertices.shift()
    let material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true
    })
    let circle = new THREE.Line(geometry, material)

    const POSITION_INTERVAL = 50
    circle.position.set(randomInt(-POSITION_INTERVAL, POSITION_INTERVAL), randomInt(-POSITION_INTERVAL, POSITION_INTERVAL), 0)

    return circle
  }

  addEffects () {
    this.composer = new THREE.EffectComposer(this.renderer)
    this.rendererPass = new THREE.RenderPass(this.scene, this.camera)
    this.glitchPass = new THREE.GlitchPass(64)
    this.glitchPass.goWild = false
    this.glitchPass.renderToScreen = true
    this.composer.addPass(this.rendererPass)
    this.composer.addPass(this.glitchPass)
  }

  createCameraPlane () {
    this.texture = new THREE.Texture(this.videoDomElement)
    this.texture.needsUpdate = true
    this.texture.minFilter = THREE.LinearFilter

    const material = new THREE.MeshBasicMaterial({map: this.texture})
    const plane = new THREE.PlaneGeometry(850, 480)
    this.scr = new THREE.Mesh(plane, material)
    this.scene.add(this.scr)
  }

  addToDOM () {
    document.getElementsByClassName('screen')[0].appendChild(this.renderer.domElement)
  }

  render () {
    if (this.videoDomElement.readyState === this.videoDomElement.HAVE_ENOUGH_DATA) {
      if (this.texture) this.texture.needsUpdate = true
    }
    if (this.glitchEnabled) {
      this.composer.render()
    } else {
      this.renderer.render(this.scene, this.camera)
    }
  }
}
