import { Colors } from './Consts'
import Game from './Game'

export interface IPlayer {
  id: number
  play(game: Game)
}

export default class Player implements IPlayer {

  constructor(public id: number) {}

  play(game: Game) {
    // console.log('Player ' + Colors[this.id])
  }
}
