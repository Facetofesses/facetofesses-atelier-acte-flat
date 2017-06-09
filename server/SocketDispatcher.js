import SocketListener from './SocketListener'

const DEVICE_NEEDED = 2

class SocketDispatcher {
  constructor () {
    this.devices = []
  }

  setSocketServer (io) {
    this.io = io

    // binded event methods
    this.bindedOnConnection = this.onConnection.bind(this)
  }

  /**
   * get SocketListener instance
   * @param device
   * @returns {*}
   */
  getDevice (device) {
    return this.devices.find(d => d.device === device)
  }

  /**
   * Start to dispatch
   */
  startDispatch () {
    this.addConnectionEventListener()
  }

  /**
   * Listen to connection events
   */
  addConnectionEventListener () {
    this.io.on('connection', this.bindedOnConnection)
  }

  /**
   * Set data event listener
   * @param socket
   */
  onConnection (socket) {
    socket.on('data', (data) => {
      this.onData(data, socket)
    })
  }

  /**
   * @param datas Parsed datas received by data event
   * @param socket
   */
  onAuth (datas, socket) {
    const device = datas['device']

    let socketListener = new SocketListener()
    socketListener.setSocket(socket)
    socketListener.setDevice(device)
    this.devices.push(socketListener)

    if (this.devices.length === DEVICE_NEEDED) {
      const screen = this.getDevice('screen')
      const tablet = this.getDevice('tablet')

      if (screen && tablet) {
        screen.onSocketDatasReceived = (datas) => {
          tablet.emit(datas.type, datas)
        }

        tablet.onSocketDatasReceived = (datas) => {
          screen.emit(datas.type, datas)
        }
      }
    }
  }

  /**
   * @param datas JSON string received
   */
  onData (datas, socket = null) {
    const data = JSON.parse(datas)
    if (data['type'] === 'auth') {
      this.onAuth(data, socket)
    }
  }
}

export default new SocketDispatcher()
