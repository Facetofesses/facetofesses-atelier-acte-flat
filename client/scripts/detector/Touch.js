/**
 * Helper class to get useful informations on 3 points on screen
 */
export default class Touch {
  constructor (points) {
    this.x = 0
    this.y = 0
    this.lengths = []
    this.calculateCenter(points[0], points[1], points[2])
    this.setLengths(points[0], points[1], points[2])
  }

  /**
   * set x and y properties, corresponding to the center of the 3 points
   * @param A object with screenX and screenY properties
   * @param B object with screenX and screenY properties
   * @param C object with screenX and screenY properties
   */
  calculateCenter (A, B, C) {
    const yDeltaA = B.screenY - A.screenY
    const xDeltaA = B.screenX - A.screenX
    const yDeltaB = C.screenY - B.screenY
    const xDeltaB = C.screenX - B.screenX

    const aSlope = yDeltaA / xDeltaA
    const bSlope = yDeltaB / xDeltaB

    this.x = (aSlope * bSlope * (A.screenY - C.screenY) + bSlope * (A.screenX + B.screenX) - aSlope * (B.screenX + C.screenX)) / (2 * (bSlope - aSlope))
    this.y = -1 * (this.x - (A.screenX + B.screenX) / 2) / aSlope + (A.screenY + B.screenY) / 2
  }

  /**
   * Fill lengths array with each distance between the 3 points (A-B, B-C, C-A)
   * @param A object with screenX and screenY properties
   * @param B object with screenX and screenY properties
   * @param C object with screenX and screenY properties
   */
  setLengths (A, B, C) {
    const yDeltaA = B.screenY - A.screenY
    const xDeltaA = B.screenX - A.screenX
    const yDeltaB = C.screenY - B.screenY
    const xDeltaB = C.screenX - B.screenX
    const yDeltaC = A.screenY - C.screenY
    const xDeltaC = A.screenX - C.screenX

    this.lengths = [this.length(xDeltaB, yDeltaB), this.length(xDeltaA, yDeltaA), this.length(xDeltaC, yDeltaC)]
  }

  /**
   * Return the result of Pythagore formula
   * @param a x difference between 2 points
   * @param b y difference between 2 points
   * @returns {number}
   */
  length (a, b) {
    return Math.round(Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)) * 10) / 10
  }
}
