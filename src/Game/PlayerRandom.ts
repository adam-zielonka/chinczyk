import Game from './Game'
import Player from './Player'
import { getRandom } from './Tools'

export default class PlayerRandom extends Player {

  play(game: Game) {
    super.play(game)
    const actions = game.posibleActions()
    if (actions.length) {
      const number = getRandom(0, actions.length - 1)
      game.onClick(actions[number][1], actions[number][0])
    } else {
      game.noMoves()
    }
  }

}
