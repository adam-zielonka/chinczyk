import Game from '../Game'
import Player from './Player'

export default class PlayerLast extends Player {

  play(game: Game) {
    super.play(game)
    const actions = game.posibleActions()
    if (actions.length) {
      game.onClick(actions[actions.length - 1][1], actions[actions.length - 1][0])
    } else {
      game.noMoves()
    }
  }

}
