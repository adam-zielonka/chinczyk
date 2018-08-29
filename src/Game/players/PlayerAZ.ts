import Game from '../Game'
import Player from './Player'

export default class PlayerAZ extends Player {

  play(game: Game) {
    super.play(game)
    const actions = game.posibleActions()
    if (actions.length) {
      game.onClick(actions[0][1], actions[0][0])
    } else {
      game.noMoves()
    }
  }

}
