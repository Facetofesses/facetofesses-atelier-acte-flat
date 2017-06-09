import config from '../../config.json'
import Piece from './Piece'
import SoundHelper from '../../utils/SoundHelper'

export default class PieceManager {
  constructor () {
    this.createPieces()
  }

  /**
   * Create all pieces in config
   */
  createPieces () {
    this.pieces = {}

    config.pieces.forEach((pieceConfig) => {
      this.pieces[pieceConfig.id] = new Piece(pieceConfig, this.onSelectionChange.bind(this))
    })
  }

  onSelectionChange (pieceID, pieceSelection) {
    if (pieceID === 'speed') {
      const playbackRate = 0.5 + pieceSelection * 0.2
      SoundHelper.getActiveSound('pulse_sound').playbackRate.rampTo(playbackRate, 0.4)
    }
  }
}
