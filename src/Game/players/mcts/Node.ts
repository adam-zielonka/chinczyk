import { round } from '../../Tools'
import State from './State'
import UCT from './UCT'

export default class Node {
  state: State
  parent: Node
  childArray: Node[]

  constructor(state: State) {
    this.state = state
    this.childArray = []
  }

  getRandomChildNode(): Node {
    const random = Math.floor(Math.random() * this.childArray.length)
    return this.childArray[random]
  }

  getUTC(parentVisit): number {
    return UCT.uctValue(parentVisit, this.state.winScore, this.state.visitCount)
  }

  getChildWithMaxScore(): Node {
    return this.childArray.reduce((a, b) => {
      return a.state.visitCount >= b.state.visitCount ? a : b
    })
  }

  printPoints() {
    for (const node of this.childArray) {
      // console.log(node)
      console.log(`${node.state.action[1]} ${node.state.action[0]} - ${
        round(node.state.winScore / 10, 2)}/${node.state.visitCount}`)
    }
  }
}
