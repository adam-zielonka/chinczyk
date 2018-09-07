import { Colors } from '../Consts'
import Game from '../Game'

export interface IPlayer {
  id: number
  play(game: Game)
}

export default class Player implements IPlayer {

  constructor(public id: number) {}

  play(game: Game) {
    // console.log('%c ' + '%c Player ' + Colors[this.id] + '\t%c ',
    //   `background: ${Colors[this.id]}`,
    //   '',
    //   `background: ${Colors[this.id]}`
    // )
  }
}
