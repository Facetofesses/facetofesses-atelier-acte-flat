import '../lib/CopyShader'
import '../lib/DigitalGlitch'
import '../lib/EffectComposer'
import '../lib/RenderPass'
import '../lib/MaskPass'
import '../lib/ShaderPass'
import '../lib/GlitchPass'

export default class VideoRenderer {
  constructor (videoDomElement) {
    this.videoDomElement = videoDomElement
    this.glitchEnabled = false

    this.createScene()
    this.createCamera()
    this.createRenderer()
    this.createCameraPlane()
    this.addEffects()

    this.addToDOM()
  }

  /**
   * Create Three JS camera
   */
  createCamera () {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
    this.camera.position.z = 400
    this.camera.lookAt(new THREE.Vector3(0, 0, 0))
    this.scene.add(this.camera)
  }

  /**
   * Create Three JS renderer
   */
  createRenderer () {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
  }

  /**
   * Create Three JS scene
   */
  createScene () {
    this.scene = new THREE.Scene()
  }

  /**
   * Enable glitch
   */
  glitch () {
    this.glitchEnabled = true
    this.glitchPass.goWild = true
  }

  /**
   * Disable glitch
   */
  unglitch () {
    this.glitchEnabled = false
    this.glitchPass.goWild = false
  }

  /**
   * Add EffectComposer (glitch)
   */
  addEffects () {
    this.composer = new THREE.EffectComposer(this.renderer)
    this.rendererPass = new THREE.RenderPass(this.scene, this.camera)
    this.glitchPass = new THREE.GlitchPass(128)
    this.glitchPass.goWild = false
    this.glitchPass.renderToScreen = true
    this.composer.addPass(this.rendererPass)
    this.composer.addPass(this.glitchPass)
  }

  /**
   * Create Three JS plane to print camera images
   */
  createCameraPlane () {
    this.texture = new THREE.VideoTexture(this.videoDomElement)
    this.texture.minFilter = THREE.LinearFilter
    this.texture.magFilter = THREE.LinearFilter

    const material = new THREE.MeshBasicMaterial({map: this.texture})
    const plane = new THREE.PlaneBufferGeometry(425, 240)
    this.scr = new THREE.Mesh(plane, material)
    this.scene.add(this.scr)
  }

  /**
   * Add renderer to DOM
   */
  addToDOM () {
    document.getElementsByClassName('screen')[0].appendChild(this.renderer.domElement)
  }

  /**
   * Render Three JS scene
   */
  render () {
    if (!this.videoDomElement.HAVE_ENOUGH_DATA) return
    if (this.glitchEnabled) {
      this.composer.render()
    } else {
      this.renderer.render(this.scene, this.camera)
    }
  }
}
