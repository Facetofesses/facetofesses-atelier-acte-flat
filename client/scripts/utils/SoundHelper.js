import Tone from 'tone'

class SoundHelper {
  /**
   * Define all sounds
   */
  start () {
    this.sounds = {
      on_selection: '/static/selection_sound.mp3',
      ambient_sound: '/static/ambient_sound.mp3'
    }
    this.loadSounds()
  }

  /**
   * Load all sounds needed in app
   */
  loadSounds () {
    this.multiPlayer = new Tone.MultiPlayer(this.sounds, this.loadHandler.bind(this)).toMaster()
  }

  /**
   * Event called when all sounds are loaded
   */
  loadHandler () {
    this.multiPlayer.startLoop('ambient_sound')
  }

  /**
   * Start to play a sound
   * @param key
   */
  play (key) {
    this.multiPlayer.start(key)
  }
}

export default new SoundHelper()
