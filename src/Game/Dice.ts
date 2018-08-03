import { getRandom } from './Tools'

export class Dice {
  state: number

  throw(): number {
    this.state = getRandom(1, 6)
    return this.state
  }
}
