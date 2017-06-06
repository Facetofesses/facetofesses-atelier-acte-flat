import SockJS from 'sockjs-client'

const SOCKET_URL = 'http://192.168.1.34:8090/ws'

class SocketClient {
  /**
   * @param key
   */
  setKey (key) {
    this.key = key
  }

  /**
   * Connect to socket server
   */
  start () {
    this.instance = new SockJS(SOCKET_URL)
    this.instance.onopen = this.onOpen.bind(this)
    this.instance.onclose = this.onClose.bind(this)
  }

  /**
   * send socket message of type 'auth' to identify device on server
   */
  onOpen () {
    console.log('socket open')
    this.send('auth', {
      device: this.key
    })
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
