import config from '../../config.json'
import Piece from './Piece'

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
      this.pieces[pieceConfig.id] = new Piece(pieceConfig)
    })
  }
}
