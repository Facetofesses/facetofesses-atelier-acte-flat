import Express from 'express'
import http from 'http'
import SockJs from 'sockjs'
import SocketDispatcher from './SocketDispatcher'
import path from 'path'

const PORT = 8090

export default class Server {
  constructor () {
    this.app = Express()
    this.app.use(Express.static('build/public'))

    this.setMainRoutes()
    this.createServer()

    SocketDispatcher.setSocketServer(this.io)
    SocketDispatcher.startDispatch()
  }

  /**
   * Create Express & Socket server
   */
  createServer () {
    this.server = http.createServer(this.app)
    this.io = SockJs.createServer({
      sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js'
    })
    this.io.installHandlers(this.server, {
      prefix: '/ws'
    })
  }

  /**
   * Set all Express routes
   */
  setMainRoutes () {
    this.app.get('/', (req, res) => {
      res.sendFile(path.resolve('public/index.html'))
    })
  }

  /**
   * Start server
   */
  start () {
    this.server.listen(PORT, '0.0.0.0')
  }
}
