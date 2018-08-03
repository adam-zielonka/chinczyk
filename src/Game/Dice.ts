import { getRandom } from './Tools'

export default class Dice {
  state: number

  constructor() {
    this.throw()
  }

  throw(): number {
    this.state = getRandom(1, 6)
    return this.state
  }
}
