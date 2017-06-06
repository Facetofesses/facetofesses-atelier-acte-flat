import Element from './Element'
import {randomInt} from '../utils/index'

const EDGES = 10

export default class Blob extends Element {
  constructor (x, y, options) {
    super()

    this.color = options.color
    this.defineEdges()

    this.graphics = new PIXI.Graphics()
    this.graphics.x = x
    this.graphics.y = y
  }

  show (cb) {
    this.visible = true
    this.animateEdges(cb)
  }

  hide (onComplete) {
    console.log('hide')
    window.setTimeout(onComplete, 1000)

    this.edges.forEach((edge) => {
      TweenMax.to(edge, 1, {
        x: 0,
        y: 0,
        ease: Elastic.easeOut.config(1, 0.5)
      })
    })
  }

  idle () {
    console.log('idle')

    this.edges.forEach((edge) => {
      TweenMax.to(edge, 1, {
        x: edge.idleX,
        y: edge.idleY,
        ease: Elastic.easeOut.config(1, 0.5)
      })
    })
  }

  animateEdges (onComplete) {
    const tl = new TimelineMax({onComplete})

    this.edges.forEach((edge) => {
      tl.to(edge, 1, {
        x: edge.blobX,
        y: edge.blobY,
        ease: Elastic.easeOut.config(1, 0.5)
      }, 0)
    })
  }

  defineEdges () {
    this.edges = []
    let angle = 0

    for (let i = 0; i <= EDGES; i++, angle += Math.PI * 2 / EDGES) {
      const edge = {
        x: 0,
        y: 0,
        idleX: Math.cos(angle) * this.radius,
        idleY: Math.sin(angle) * this.radius,
        blobX: Math.cos(angle) * (this.radius + randomInt(-20, 50)),
        blobY: Math.sin(angle) * (this.radius + randomInt(-20, 50))
      }
      this.edges.push(edge)
    }
  }

  render () {
    this.graphics.clear()

    if (!this.visible) return

    this.graphics.beginFill(this.color)
    this.graphics.moveTo(this.edges[0].x, this.edges[0].y)

    let i
    for (i = 1; i < this.edges.length - 2; i++) {
      let xc = (this.edges[i].x + this.edges[i + 1].x) / 2
      let yc = (this.edges[i].y + this.edges[i + 1].y) / 2
      this.graphics.quadraticCurveTo(this.edges[i].x, this.edges[i].y, xc, yc)
    }
    this.graphics.arcTo(this.edges[i].x, this.edges[i].y, this.edges[i + 1].x, this.edges[i + 1].y, 10)

    this.graphics.endFill()
  }
}
