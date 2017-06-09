export default class SocketListener {
  constructor () {
    this.device = null
    this.socket = null
  }

  /**
   * Set socket object
   * @param socket
   */
  setSocket (socket) {
    this.socket = socket
    this.listen()
  }

  /**
   * Set device
   * @param device
   */
  setDevice (device) {
    this.device = device
  }

  /**
   * Listen data events
   */
  listen () {
    this.socket.on('data', (datas) => {
      this.onSocketDatasReceived(JSON.parse(datas))
    })
    this.socket.on('close', this.onClose.bind(this))
  }

  /**
   * Called when receive datas from device client
   * @param datas
   */
  onSocketDatasReceived (datas) {}

  /**
   * Emit socket event
   * @param type
   * @param datas
   */
  emit (type, datas) {
    const obj = Object.assign({}, datas, {type})
    if (this.socket) {
      this.socket.write(JSON.stringify(obj))
    }
  }

  onClose () {}
}
