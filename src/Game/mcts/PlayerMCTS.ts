import Game from '../Game'
import Player from '../Player'
import Node from './Node'
import State from './State'
import Tree from './Tree'
import UCT from './UCT'

export default class PlayerMCTS extends Player {

  public selectPromisingNode(root: Node): Node {
    let node = root
    while (node.childArray.length) {
        node = UCT.findBestNodeWithUCT(node)
    }
    return node
  }

  public expandNode(node: Node) {
    const possibleStates = node.state.getAllPossibleStates()
    possibleStates.forEach(state => {
        const newNode = new Node(state())
        newNode.parent = node
        node.childArray.push(newNode)
    })
  }

  public simulateRandomPlayout(node: Node): number {
    let status = node.state.game.checkWiner()
    if (status) {
      return status === this.id ? 10 : 0
    }
    const state = new State(node.state.game)
    let counter = 100
    while (!status && --counter) {
        state.randomPlay()
        status = node.state.game.checkWiner()
    }
    if (!counter) {
      return 10 * node.state.game.complateStatus() / 4
    } else {
      return status === this.id ? 10 : 0
    }
  }

  public backPropogation(node: Node, score: number) {
    if (score < 0) { return }
    let tempNode = node
    while (tempNode) {
        tempNode.state.visitCount++
        tempNode.state.winScore += score
        tempNode = tempNode.parent
    }
  }

  public getResult(game: Game): number[] {
    const tree = new Tree(game)
    console.log(tree)
    let iter = 100
    while (iter--) {
      // 1. Select promising node
      console.log('Loop')
      const promisingNode = this.selectPromisingNode(tree.root)
      if (!promisingNode.state.game.checkWiner()) {
        this.expandNode(promisingNode)
      }
      // 2. Symulation
      let nodeToExplore = promisingNode
      if (promisingNode.childArray.length > 0) {
        nodeToExplore = promisingNode.getRandomChildNode()
      }
      // 3. Back propagation
      const playoutResult = this.simulateRandomPlayout(nodeToExplore)
      // if (playoutResult === -1) {
      //   console.log(playoutResult)
      // }
      this.backPropogation(nodeToExplore, playoutResult)
    }
    console.log(tree)
    tree.print()
    const winnerNode = tree.root.getChildWithMaxScore()
    tree.root.printPoints()
    tree.root = winnerNode
    return winnerNode.state.action
  }

  play(game: Game) {
    super.play(game)
    console.log('MCTS')
    const actions = game.posibleActions()
    switch (actions.length) {
      case 0:
        game.noMoves()
        break
      case 1:
        game.onClick(actions[0][1], actions[0][0])
        break
      default:
        const result = this.getResult(game)
        if (result) {
          game.onClick(result[1], result[0])
        } else {
          game.noMoves()
        }
        break
    }
  }

}
