import * as React from 'react'
import './Game.css'


const Colors = [
  'empty', 'green', 'yellow', 'red', 'blue'
]

const Filds = [
  [3, 3,  ,  , 0, 0, 4,  ,  , 4, 4, ],
  [3, 3,  ,  , 0, 4, 0,  ,  , 4, 4, ],
  [ ,  ,  ,  , 0, 4, 0,  ,  ,  ,  , ],
  [ ,  ,  ,  , 0, 4, 0,  ,  ,  ,  , ],
  [3, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, ],
  [0, 3, 3, 3, 3, 0, 1, 1, 1, 1, 0, ],
  [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, ],
  [ ,  ,  ,  , 0, 2, 0,  ,  ,  ,  , ],
  [ ,  ,  ,  , 0, 2, 0,  ,  ,  ,  , ],
  [2, 2,  ,  , 0, 2, 0,  ,  , 1, 1, ],
  [2, 2,  ,  , 2, 0, 0,  ,  , 1, 1, ]
]

const PlayerFilds = []

PlayerFilds[1] = {
  home: [[9, 5], [8, 5], [7, 5], [6, 5]],
  board: [[10, 6], [9, 6], [8, 6], [7, 6], [6, 6], [6, 7], [6, 8], [6, 9], [6, 10], [5, 10]],
  start: [[9, 9], [10, 9], [9, 10], [10, 10]],
  order: [1, 2, 3, 4]
}

PlayerFilds[2] = {
  home: [[5, 9], [5, 8], [5, 7], [5, 6]],
  board: [[4, 10], [4, 9], [4, 8], [4, 7], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], [0, 5]],
  start: [[0, 9], [1, 9], [0, 10], [1, 10]],
  order: [2, 3, 4, 1]
}

PlayerFilds[3] = {
  home: [[1, 5], [2, 5], [3, 5], [4, 5]],
  board: [[0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [4, 3], [4, 2], [4, 1], [4, 0], [5, 0]],
  start: [[0, 0], [1, 0], [0, 1], [1, 1]],
  order: [3, 4, 1, 2]
}

PlayerFilds[4] = {
  home: [[5, 1], [5, 2], [5, 3], [5, 4]],
  board: [[6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [7, 4], [8, 4], [9, 4], [10, 4], [10, 5]],
  start: [[9, 0], [10, 0], [9, 1], [10, 1]],
  order: [4, 1, 2, 3]
}

const PlayerBoard = [,
  [[9, 9], [10, 9], [9, 10], [10, 10]],
  [[0, 9], [1, 9], [0, 10], [1, 10]],
  [[0, 0], [1, 0], [0, 1], [1, 1]],
  [[9, 0], [10, 0], [9, 1], [10, 1]]
]


interface ISquareProps {
    color: number
    activeColor: number
    player?: number
    onClick(): void
}

function Square(props: ISquareProps) {
  const color = (props.color === undefined ? '' : 'bg-' + Colors[props.color])
  const stone = (<div className={'p-' + Colors[props.activeColor]}>&#11044;</div>)
  return (
      <button className={'square ' + (color)} onClick={props.onClick}>
        {props.activeColor ? stone : ' '}
      </button>
  )
}

interface IGameState {
  filds: number[][],
  token: number
}

export default class Game extends React.Component<null, IGameState> {

  constructor(props) {
    super(props)
    this.state = {
      token: 2,
      filds: [
        [3, 3,  ,  , 0, 0, 0,  ,  , 4, 4, ],
        [3, 0,  ,  , 0, 0, 0,  ,  , 4, 4, ],
        [ ,  ,  ,  , 0, 0, 0,  ,  ,  ,  , ],
        [ ,  ,  ,  , 0, 0, 0,  ,  ,  ,  , ],
        [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
        [2, 0, 0, 0, 0,  , 0, 0, 0, 0, 0, ],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
        [ ,  ,  ,  , 0, 0, 0,  ,  ,  ,  , ],
        [ ,  ,  ,  , 0, 0, 0,  ,  ,  ,  , ],
        [2, 2,  ,  , 0, 0, 0,  ,  , 1, 1, ],
        [2, 2,  ,  , 0, 0, 0,  ,  , 1, 1, ]
      ]
    }
  }

  public findNextFild(i: number, j: number, count: number) {
    let result

    // Start field
    if (count === 6) {
      for (const field of PlayerFilds[this.state.token].start) {
        if (field[0] === j && field[1] === i) {
          result = PlayerFilds[this.state.token].board[0]
          break
        }
      }
    }

    if (!result) {
      // Set path
      let board = []
      for (const id of PlayerFilds[this.state.token].order) {
        board = board.concat(PlayerFilds[id].board)
      }
      board = board.concat(PlayerFilds[this.state.token].home)

      // Find next field
      let steps = 0
      let found = false
      for (const field of board) {
        if (field[0] === j && field[1] === i) { found = true }
        if (found) {
          if (steps === count) {
            result = field
            break
          }
          steps++
        }
      }
    }

    // Update if posible
    const filds = this.state.filds
    if (result) {
      if (filds[result[1]][result[0]] !== this.state.token) {
        filds[i][j] = 0
        if (filds[result[1]][result[0]]) {
          for (const field of PlayerFilds[filds[result[1]][result[0]]].start) {
            if (!filds[field[1]][field[0]]) {
              filds[field[1]][field[0]] = filds[result[1]][result[0]]
              break
            }
          }
        }
        filds[result[1]][result[0]] = this.state.token

        let token = this.state.token + 1
        if (token > 4) { token = 1 }
        this.setState({ filds, token })
      }
    }
  }

  public moveStone(i: number, j: number, count: number) {
    const filds = this.state.filds
    if (filds[i][j] && filds[i][j] === this.state.token) {
      this.findNextFild(i, j, count)
    }
  }

  public onClick(i: number, j: number) {
    this.moveStone(i, j, 1)
  }

  public render() {
    const filds = this.state.filds
    const row = []
    let squares = []
    for (let i = 0; i < Filds.length; i++) {
      for (let j = 0; j < Filds[i].length; j++) {
        squares.push(<Square key={`${i}-${j}`} color={Filds[i][j]} activeColor={filds[i][j]} onClick={this.onClick.bind(this, i, j)}/>)
      }
      row.push(<div key={`r-${i}`} className='board-row'>{squares}</div>)
      squares = []
    }

    return (
      <div>
        {row}
      </div>
    )
  }
}
