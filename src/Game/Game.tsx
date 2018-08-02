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
    color: number | undefined
    player?: number | undefined
}

function Square(props: ISquareProps) {
  const color = (props.color === undefined ? '' : 'bg-' + Colors[props.color])
  return (
      <button className={'square ' + (color)}>
          &nbsp;
      </button>
  )
}

interface IGameState {
  filds: number
}

export default class Game extends React.Component<null, IGameState> {

  constructor() {
    super(null)
    this.state = {
      filds: 1
    }
  }

  public render() {
    const row = []
    let squares = []
    for (let i = 0; i < Filds.length; i++) {
      for (let j = 0; j < Filds[i].length; j++) {
        squares.push(<Square key={`${i}-${j}`} color={Filds[i][j]} />)
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
