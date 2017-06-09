import Tone from 'tone'

class SoundHelper {
  /**
   * Define all sounds
   */
  start () {
    this.sounds = {
      ambient_sound: '/static/sounds/ambient_sound.mp3',
      caress_help_sound: '/static/sounds/caress_help_sound.mp3',
      end_sound: '/static/sounds/end_sound.mp3',
      intro_sound: '/static/sounds/intro_sound.mp3',
      position_help_sound: '/static/sounds/position_help_sound.mp3',
      pulse_sound: '/static/sounds/pulse_sound.mp3',
      selection_sound: '/static/sounds/selection_sound.mp3',
      sweet_words_help_sound: '/static/sounds/sweet_words_help_sound.mp3'
    }
    return this.loadSounds()
  }

  /**
   * Load all sounds needed in app
   */
  loadSounds () {
    return new Promise((resolve, reject) => {
      this.multiPlayer = new Tone.MultiPlayer(this.sounds, resolve).toMaster()
    })
  }

  getActiveSound (key) {
    return this.multiPlayer._activeSources[key][0]
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
