import Game from '../Game'
import Node from './Node'
import State from './State'

export default class Tree {
  root: Node

  constructor(game: Game) {
    this.root = new Node(new State(game))
  }

  print() {
    console.log(this.root)
  }
}
