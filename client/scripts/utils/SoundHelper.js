import Tone from 'tone'

class SoundHelper {
  start () {
    this.sounds = {
      on_selection: '/static/selection_sound.mp3'
    }
    this.loadSounds()
  }

  /**
   * Load all sounds needed in app
   */
  loadSounds () {
    this.multiPlayer = new Tone.MultiPlayer(this.sounds, this.loadHandler.bind(this)).toMaster()
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
