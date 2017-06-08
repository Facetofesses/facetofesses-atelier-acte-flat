import SockJS from 'sockjs-client'

const IP = '192.168.43.9'
const SOCKET_URL = `http://${IP}:8090/ws`

class SocketClient {
  constructor () {
    this.onOpenCallback = null
  }

  /**
   * @param key
   */
  setKey (key) {
    this.key = key
  }

  /**
   * Connect to socket server
   */
  start (onOpenCallback = () => {}) {
    this.onOpenCallback = onOpenCallback
    this.instance = new SockJS(SOCKET_URL)
    this.instance.onopen = this.onOpen.bind(this)
    this.instance.onclose = this.onClose.bind(this)
  }

  /**
   * send socket message of type 'auth' to identify device on server
   */
  onOpen () {
    this.send('auth', {
      device: this.key
    })
    this.onOpenCallback()
  }

  onClose () {}

  /**
   * Send socket message containing a type and datas
   * @param type
   * @param datas
   */
  send (type, datas) {
    const msg = Object.assign({}, datas, {type})
    this.instance.send(JSON.stringify(msg))
  }
}

export default new SocketClient()
