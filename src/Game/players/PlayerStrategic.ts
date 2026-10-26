import type Game from '../Game'
import { PlayerFilds } from '../Consts'
import Player from './Player'

type Coordinate = [number, number]

export default class PlayerStrategic extends Player {
  constructor(id: number, private style: 'hunter' | 'tactician') { super(id) }

  private path(token: number): Coordinate[] {
    return PlayerFilds[token].order.flatMap(id => PlayerFilds[id].board).concat(PlayerFilds[token].home)
  }

  // Count enemy die outcomes that could land on this square next turn.
  private danger(game: Game, target: Coordinate, captured: Coordinate): number {
    const fields = game.getState().filds
    let threats = 0
    for (let enemy = 1; enemy <= 4; enemy++) {
      if (enemy === this.id || !game.getPlayer(enemy)) continue
      const path = this.path(enemy)
      const targetIndex = path.findIndex(([x, y]) => x === target[0] && y === target[1])
      if (targetIndex < 0 || targetIndex >= 40) continue
      for (let roll = 1; roll <= 6; roll++) {
        const source = path[targetIndex - roll]
        if (source && fields[source[1]][source[0]] === enemy &&
          !(source[0] === captured[0] && source[1] === captured[1])) threats++
      }
      if (targetIndex === 0 && PlayerFilds[enemy].start.some(([x, y]) => fields[y][x] === enemy)) threats++
    }
    return threats
  }

  public chooseAction(game: Game): number[] | undefined {
    const actions = game.posibleActions()
    const path = this.path(this.id)
    const fields = game.getState().filds
    let best = -Infinity
    let selected: number[] | undefined
    for (const action of actions) {
      const index = path.findIndex(([x, y]) => x === action[0] && y === action[1])
      const destinationIndex = index < 0 ? 0 : index + game.getState().dice.state
      const destination = path[destinationIndex]
      const capture = fields[destination[1]][destination[0]] !== 0
      const home = destinationIndex >= 40
      const score = (capture ? (this.style === 'hunter' ? 140 : 65) : 0) +
        (home ? 110 : 0) + (index < 0 ? 22 : 0) + destinationIndex * 0.7 +
        (this.style === 'tactician' ? -this.danger(game, destination, destination) * 30 : 0)
      if (score > best) { best = score; selected = action }
    }
    return selected
  }

  play(game: Game) {
    const action = this.chooseAction(game)
    if (action) game.onClick(action[1], action[0])
    else game.noMoves()
  }
}
