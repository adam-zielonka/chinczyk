import * as React from 'react'
import { Colors, Filds, PlayerFilds } from './Consts'
import Dice from './Dice'
import './Game.css'

interface ISquareProps {
    color: number
    activeColor: number
    disabled: boolean
    player?: number
    x: number
    y: number
    onClick(): void
}

function Square(props: ISquareProps) {
  const color = (props.color === undefined ? '' : 'bg-' + Colors[props.color])
  const stone = (<div className={'p-' + Colors[props.activeColor]}>&#11044;</div>)
  const numbers = '' // (<div className='numbers'>{props.x} {props.y}</div>)
  return (
      <button className={'square ' + (color)} onClick={props.onClick} disabled={props.disabled}>
        {props.activeColor ? stone : props.color !== undefined ? numbers : ''}
        {/* {props.color !== undefined ? numbers : ''} */}
      </button>
  )
}

interface IGameState {
  filds: number[][],
  token: number,
  dice: Dice,
  winner: number
}

export default class Game extends React.Component<null, IGameState> {

  constructor(props) {
    super(props)
    this.state = {
      winner: 0,
      token: 1,
      dice: new Dice(),
      filds: [
        [3, 3,  ,  , 0, 0, 0,  ,  , 4, 4, ],
        [3, 3,  ,  , 0, 0, 0,  ,  , 4, 4, ],
        [ ,  ,  ,  , 0, 0, 0,  ,  ,  ,  , ],
        [ ,  ,  ,  , 0, 0, 0,  ,  ,  ,  , ],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
        [0, 0, 0, 0, 0,  , 0, 0, 0, 0, 0, ],
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
        this.setState({ filds })
        this.nextPlayer()
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
    this.moveStone(i, j, this.state.dice.state)
  }

  public noMoves(this) {
    this.nextPlayer(this)
  }

  public nextPlayer(this) {
    const winner = this.checkWiner()
    if (winner) {
      this.setState({ winner })
    } else {
      this.state.dice.throw()
      let token = this.state.token + 1
      if (token > 4) { token = 1 }
      this.setState({ token })
    }
  }

  public posibleActions() {
    const fields = this.state.filds
    const token = this.state.token
    const count = this.state.dice.state
    const result = []

    // Start field
    if (count === 6) {
      for (const field of PlayerFilds[token].start) {
        const [x, y] = PlayerFilds[token].board[0]
        if (fields[field[1]][field[0]] === token && fields[y][x] !== token) {
          result.push(field)
        }
      }
    }

    // Set path
    let board = []
    for (const id of PlayerFilds[token].order) {
      board = board.concat(PlayerFilds[id].board)
    }
    board = board.concat(PlayerFilds[token].home)

    // Find next field
    let i = 0
    for (const field of board) {
      if (fields[field[1]][field[0]] === token) {
        if (board.length - 1 >= i + count && fields[board[i + count][1]][board[i + count][0]] !== token) {
          result.push(field)
        }
      }
      ++i
    }
    return result
  }

  public checkWiner(): number {
    const fields = this.state.filds
    let playerID = 0
    for (const player of PlayerFilds) {
      if (player) {
        ++playerID
        let counter = 0
        for (const field of player.home) {
          if (fields[field[1]][field[0]] === playerID) { ++counter }
        }
        if (counter === 4) { return playerID }
      }
    }
    return 0
  }

  public render() {
    const filds = this.state.filds
    const actions = this.posibleActions()
    const winner = this.state.winner
    const row = []
    let squares = []
    for (let i = 0; i < Filds.length; i++) {
      for (let j = 0; j < Filds[i].length; j++) {
        squares.push(<Square key={`${i}-${j}`} x={i} y={j} color={Filds[i][j]}
            activeColor={filds[i][j]} onClick={this.onClick.bind(this, i, j)} disabled={Boolean(winner)}/>)
      }
      row.push(<div key={`r-${i}`} className='board-row'>{squares}</div>)
      squares = []
    }

    const gameInfo = !winner ? (
      <div className='game-info'>
        <div className={'bg-' + Colors[this.state.token]}>Player {this.state.token} - {Colors[this.state.token].toUpperCase()}</div>
        <div>Dice: {this.state.dice.state}</div>
        <div>Winner: {winner}</div>
        <button onClick={this.noMoves.bind(this, this)} hidden={Boolean(actions.length)}>
          No moves
        </button>
        {actions.map(action => (
          <button key={'a' + action[1] + '-' + action[0]} onClick={this.onClick.bind(this, action[1], action[0])}>
            {action[1]} {action[0]}
          </button>
        ))}
      </div>
    ) : (
      <div className='game-info'>
        <div className={'bg-' + Colors[winner]}>Winner: Player {winner} - {Colors[winner].toUpperCase()}</div>
      </div>
    )

    return (
      <div className='game'>
        <div className='game-board'>
          {row}
        </div>
        {gameInfo}
      </div>
    )
  }
}
