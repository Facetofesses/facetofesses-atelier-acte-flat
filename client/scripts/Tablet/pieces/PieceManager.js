import config from '../../config.json'
import Piece from './Piece'

class PieceManager {
  start () {
    this.createPieces()
  }

  createPieces () {
    this.pieces = {}

    config.pieces.forEach((pieceConfig) => {
      this.pieces[pieceConfig.id] = new Piece(pieceConfig)
    })
  }
}


export default new PieceManager()
