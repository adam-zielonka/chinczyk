import Game from '../../Game'

export default class State {
  game: Game
  playerNo: number
  visitCount: number
  winScore: number
  action: number[]

  constructor(game: Game) {
    this.game = new Game(game)
    this.playerNo = this.game.getState().token
    this.visitCount = 0
    this.winScore = 0
  }

  public getAllPossibleStates() {
    const states = []
    if (this.game.diceMove) {
      for (let i = 1; i <= 6; ++i) {
        const fun = () => {
          const state = new State(this.game)
          state.game.diceMove = false
          const dice = state.game.getState().dice
          dice.state = i
          return state
        }
        states.push(fun)
      }
    } else {
      for (const action of this.game.posibleActions()) {
        const fun = () => {
          const state = new State(this.game)
          state.game.diceMove = true
          state.game.onClick(action[1], action[0])
          state.action = action.map(a => a)
          return state
        }
        states.push(fun)
      }
      if (!states.length) {
        const fun = () => {
          const state = new State(this.game)
          state.game.diceMove = true
          state.game.noMoves()
          return state
        }
        states.push(fun)
      }
    }
    return states
  }

  public randomPlay() {
    const states = this.getAllPossibleStates()
    const random = Math.floor(Math.random() * states.length)
    this.game = states[random]().game
    this.playerNo = this.game.getState().token
  }
}
