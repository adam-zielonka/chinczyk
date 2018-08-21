import * as React from 'react'
import { Colors, Filds, PlayerFilds } from './Consts'
import Dice from './Dice'
import './Game.css'
import Player, { IPlayer } from './Player'
import PlayerFirst from './PlayerFirst'
import PlayerLast from './PlayerLast'
import Square from './Square'

export interface IGameState {
  filds: number[][],
  token: number,
  dice: Dice,
  winner: number,
  counter: number,
  players: IPlayer[],
  playerList: PlayerType[]
}

export enum PlayerType {
  None = 'None',
  Human = 'Human',
  FirstAI = 'FirstAI',
  LastAI = 'LastAI'
}

export const PlayersTypes: PlayerType[] = [
  PlayerType.None,
  PlayerType.Human,
  PlayerType.FirstAI,
  PlayerType.LastAI
]

export default class Game extends React.Component<null, IGameState> {

  constructor(props) {
    super(props)
    const playerList = [,
      PlayerType.FirstAI,
      PlayerType.None,
      PlayerType.LastAI,
      PlayerType.None
    ]
    const players: IPlayer[] = []
    let counter = 0
    for (const type of playerList) {
      if (type) {
        switch (type) {
          case PlayerType.FirstAI:
            players.push(new PlayerFirst(++counter))
            break
          case PlayerType.LastAI:
            players.push(new PlayerLast(++counter))
            break
          case PlayerType.Human:
            players.push(new Player(++counter))
            break
          default:
            players.push(null)
            break
        }
      }
    }

    this.state = {
      winner: 0,
      token: 1,
      counter: 0,
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
      ],
      players,
      playerList
    }
  }

  public newGame(this: Game) {
    const players: IPlayer[] = []
    let counter = 0
    for (const type of this.state.playerList) {
      if (type) {
        switch (type) {
          case PlayerType.FirstAI:
            players.push(new PlayerFirst(++counter))
            break
          case PlayerType.LastAI:
            players.push(new PlayerLast(++counter))
            break
          case PlayerType.Human:
            players.push(new Player(++counter))
            break
          default:
            ++counter
            players.push(null)
            break
        }
      }
    }
    const token = this.nextToken()
    this.setState({
      winner: 0,
      token,
      counter: 0,
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
      ],
      players
    })
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

  public getPlayer(token): IPlayer {
    return this.state.players[token - 1]
  }

  public nextPlayer(this) {
    const winner = this.checkWiner()
    if (winner) {
      this.setState({ winner })
    } else {
      this.state.dice.throw()
      const token = this.nextToken(this)
      this.setState({ token })
      setTimeout(() => this.getPlayer(token).play(this), 50)
    }
  }

  public nextToken(this): number {
    let token = this.state.token + 1
    if (token > 4) { token = 1 }
    while (!this.getPlayer(token)) {
      token++
      if (token > 4) { token = 1 }
    }
    return token
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

  public setPlayerType(this: Game, id: number, ai: PlayerType) {
    const playerList = this.state.playerList
    playerList[id] = ai
    this.setState({ playerList })
  }

  public renderSetup() {
    const playersSetup = []
    for (let i = 1; i < 5; ++i) {
      playersSetup.push(
        <div key={i} className='setup'>
          {Colors[i]}
          {PlayersTypes.map(player => (
            <div key={player + i}>
              <input type='radio' name={Colors[i]} id={Colors[i] + player} value={player}
                checked={player === this.state.playerList[i]} onChange={this.setPlayerType.bind(this, i, player)}/>
              <label htmlFor={Colors[i] + player}>{player}</label>
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className='setups'>
        {playersSetup}
        <button onClick={this.newGame.bind(this, this)}>
          New Game
        </button>
      </div>
    )
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
        {this.renderSetup()}
        <div className='game-board'>
          {row}
        </div>
        {gameInfo}
      </div>
    )
  }
}
