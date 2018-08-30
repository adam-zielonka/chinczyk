import { getRandom } from './Tools'

export default class Dice {
  state: number

  constructor(dice?: Dice | number) {
    if (dice instanceof Dice) {
      this.state = dice.state
    } else if (dice) {
      this.state = dice
    } else {
      this.throw()
    }
  }

  throw(): number {
    this.state = getRandom(1, 6)
    return this.state
  }
}
