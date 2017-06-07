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
    const plane = new THREE.PlaneGeometry(600, 400)
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
