import { PlayerFilds } from '../Consts'
import Game from '../Game'
import Player from './Player'

export default class PlayerAZ extends Player {

  // fieldsOfDestruction(game: Game) {
  //   const fields = game.getState().filds
  //   const token = game.getState().token
  //   const count = game.getState().dice.state
  //   let board = []
  //   for (const id of PlayerFilds[token].order) {
  //     board = board.concat(PlayerFilds[id].board)
  //   }
  //   board = board.concat(PlayerFilds[token].home)

  //   const stones = []

  //   let i = 0
  //   const result = board.map(field => {
  //     const fieldValue = fields[field[1]][field[0]]
  //     if (fieldValue !== token && fieldValue !== 0) {
  //       stones.push(field)
  //     }
  //     ++i
  //     return 0
  //   })
  //   return result
  // }

  play(game: Game) {
    super.play(game)
    const actions = game.posibleActions()
    // console.log(this.fieldsOfDestruction(game))
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
