import Tone from 'tone'

class SoundHelper {
  start () {
    this.sounds = {
      test: '/static/test.mp3'
    }
    this.loadSounds()
  }

  /**
   * Load all sounds needed in app
   */
  loadSounds () {
    this.multiPlayer = new Tone.MultiPlayer(this.sounds, this.loadHandler.bind(this))
  }

  loadHandler () {
    console.log('chargé')
  }

  /**
   * Start a sound
   * @param key
   */
  play (key) {
    this.multiPlayer.start(key)
  }
}

export default new SoundHelper()
