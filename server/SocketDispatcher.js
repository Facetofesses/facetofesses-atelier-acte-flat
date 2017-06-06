import Tablet from './Tablet'
import Screen from './Screen'

class SocketDispatcher {
  setSocketServer (io) {
    this.io = io

    // binded event methods
    this.bindedOnConnection = this.onConnection.bind(this)

    Tablet.onSocketDatasReceived = (datas) => {
      Screen.emit('data', datas)
    }
  }

  startDispatch () {
    this.addConnectionEventListener()
  }

  addConnectionEventListener () {
    this.io.on('connection', this.bindedOnConnection)
  }

  onConnection (socket) {
    console.log('receive connection')
    socket.on('data', (data) => {
      this.onData(data, socket)
    })
  }

  /**
   * @param datas Parsed datas received by data event
   */
  onAuth (datas, socket) {
    const device = datas['device']

    switch (device) {
      case 'screen':
        Screen.setSocket(socket)
        break
      case 'tablet':
        Tablet.setSocket(socket)
        break
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
