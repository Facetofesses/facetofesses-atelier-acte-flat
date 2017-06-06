import config from '../../config.json'
import Piece from './Piece'

class PieceManager {
  start () {
    this.createPieces()
  }

  /**
   * Create all pieces in config
   */
  createPieces () {
    this.pieces = {}

    config.pieces.forEach((pieceConfig) => {
      this.pieces[pieceConfig.id] = new Piece(pieceConfig)
    })

    this.pieces['position'].onSelectionChange(0)
    this.pieces['speed'].onSelectionChange(0)
  }
}


export default new PieceManager()
