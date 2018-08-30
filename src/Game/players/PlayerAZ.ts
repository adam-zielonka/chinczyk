import Game from '../Game'
import Player from './Player'

export default class PlayerAZ extends Player {

  play(game: Game) {
    super.play(game)
    const actions = game.posibleActions()
    switch (actions.length) {
      case 0:
        game.noMoves()
        break
      case 1:
        game.onClick(actions[0][1], actions[0][0])
        break
      default:
        game.onClick(actions[0][1], actions[0][0])
        break
    }


  }

}
