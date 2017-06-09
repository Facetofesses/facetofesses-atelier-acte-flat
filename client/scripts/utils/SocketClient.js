import SockJS from 'sockjs-client'

const IP = '192.168.43.9'
const SOCKET_URL = `http://${IP}:8090/ws`

class SocketClient {
  constructor () {
    this.onOpenCallback = null
    this.onMessageCallbacks = []
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
    return new Promise((resolve, reject) => {
      this.onOpenCallback = onOpenCallback
      this.instance = new SockJS(SOCKET_URL)
      this.instance.onclose = this.onClose.bind(this)
      this.instance.onmessage = this.onMessage.bind(this)

      this.instance.onopen = () => {
        this.onOpen()
        resolve()
      }
    })
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

  onMessage (e) {
    const datas = JSON.parse(e.data)
    this.onMessageCallbacks.forEach(cb => cb(datas))
  }

  addOnMessageListener (cb) {
    this.onMessageCallbacks.push(cb)
  }

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
