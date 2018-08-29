import * as React from 'react'
import { Colors, Filds, PlayerFilds } from './Consts'
import Dice from './Dice'
import './Game.css'
import PlayerMCTS from './players/mcts/PlayerMCTS'
import Player, { IPlayer } from './players/Player'
import PlayerAZ from './players/PlayerAZ'
import PlayerFirst from './players/PlayerFirst'
import PlayerLast from './players/PlayerLast'
import PlayerRandom from './players/PlayerRandom'
import Square from './Square'

export interface IGameState {
  filds: number[][],
  token: number,
  dice: Dice,
  winner: number,
  players: IPlayer[],
  playerList: PlayerType[]
}

export enum PlayerType {
  None = 'None',
  Human = 'Human',
  FirstAI = 'FirstAI',
  LastAI = 'LastAI',
  Random = 'Random',
  MCTS = 'MCTS',
  AZ = 'AZ'
}

export const PlayersTypes: PlayerType[] = [
  PlayerType.None,
  PlayerType.Human,
  PlayerType.FirstAI,
  PlayerType.LastAI,
  PlayerType.Random,
  PlayerType.MCTS,
  PlayerType.AZ
]

export default class Game extends React.Component<{}, IGameState> {

  symulation: boolean
  stopGame: boolean
  symulationState: IGameState
  double: boolean
  counter: number

  public setState(state: any) {
    if (this.symulation) {
      this.symulationState = {...this.symulationState, ...state}
    } else {
      super.setState(state)
    }
  }

  public getState(): IGameState {
    if (this.symulation) {
      return this.symulationState
    } else {
      return this.state
    }
  }

  constructor(game?: Game) {
    super(game)
    if (game instanceof Game) {
      this.symulationState = {
        winner: game.getState().winner,
        token: game.getState().token,
        dice: new Dice(game.getState().dice),
        filds: game.getState().filds.map(p => p.map(f => f)),
        players: game.getState().players.map(p => p),
        playerList: game.getState().playerList.map(p => p)
      }
      this.symulation = true
      this.stopGame = true
      this.double = game.double
      this.counter = game.counter
    } else {
      const playerList = [,
        PlayerType.MCTS,
        PlayerType.LastAI,
        PlayerType.FirstAI,
        PlayerType.LastAI
      ]
      const players: IPlayer[] = this.getPlayers(playerList)
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
        ],
        players,
        playerList
      }
      this.double = false
      this.counter = 0
      this.symulation = false
      this.stopGame = true
    }
  }

  public stop() {
    this.stopGame = true
  }

  public newGame(this: Game) {
    this.stop()
    const players: IPlayer[] = this.getPlayers(this.getState().playerList)
    const token = this.startToken(players, 1)
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

  public startGame(this: Game) {
    this.stopGame = false
    setTimeout(() => this.getPlayer(this.getState().token).play(this), 50)
  }

  public getPlayers(playerList: PlayerType[]): IPlayer[] {
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
          case PlayerType.Random:
            players.push(new PlayerRandom(++counter))
            break
            case PlayerType.Human:
            players.push(new Player(++counter))
            break
          case PlayerType.MCTS:
            players.push(new PlayerMCTS(++counter))
            break
          case PlayerType.AZ:
            players.push(new PlayerAZ(++counter))
            break
          default:
            ++counter
            players.push(null)
            break
        }
      }
    }
    return players
  }


  public findNextFild(i: number, j: number, count: number) {
    let result

    // Start field
    if (count === 6) {
      this.double = true
      for (const field of PlayerFilds[this.getState().token].start) {
        if (field[0] === j && field[1] === i) {
          result = PlayerFilds[this.getState().token].board[0]
          this.double = false
          break
        }
      }
    }

    if (!result) {
      // Set path
      let board = []
      for (const id of PlayerFilds[this.getState().token].order) {
        board = board.concat(PlayerFilds[id].board)
      }
      board = board.concat(PlayerFilds[this.getState().token].home)

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
    const filds = this.getState().filds
    if (result) {
      if (filds[result[1]][result[0]] !== this.getState().token) {
        filds[i][j] = 0
        if (filds[result[1]][result[0]]) {
          for (const field of PlayerFilds[filds[result[1]][result[0]]].start) {
            if (!filds[field[1]][field[0]]) {
              filds[field[1]][field[0]] = filds[result[1]][result[0]]
              break
            }
          }
        }
        filds[result[1]][result[0]] = this.getState().token
        this.setState({ filds })
        this.nextPlayer()
      }
    }
  }

  public moveStone(i: number, j: number, count: number) {
    const filds = this.getState().filds
    if (filds[i][j] && filds[i][j] === this.getState().token) {
      this.findNextFild(i, j, count)
    }
  }

  public onClick(i: number, j: number) {
    this.moveStone(i, j, this.getState().dice.state)
  }

  public noMoves(this) {
    this.nextPlayer(this)
  }

  public getPlayer(token): IPlayer {
    return this.getState().players[token - 1]
  }

  public startToken(players: IPlayer[], token: number) {
    if (token > 4) { token = 1 }
    while (!players[token - 1]) {
      token++
      if (token > 4) { token = 1 }
    }
    return token
  }

  public nextPlayer(this) {
    const winner = this.checkWiner()
    if (winner) {
      this.setState({ winner })
    } else {
      this.getState().dice.throw()
      const token = this.nextToken(this)
      this.setState({ token })
      if (!this.symulation && !this.stopGame) {
        setTimeout(() => this.getPlayer(token).play(this), 50)
      }
    }
  }

  public stoneOnStart() {
    const fields = this.getState().filds
    const token = this.getState().token
    const result = []

    for (const field of PlayerFilds[token].start) {
      const [x, y] = PlayerFilds[token].board[0]
      if (fields[field[1]][field[0]] === token && fields[y][x] !== token) {
        result.push(field)
      }
    }
    return result
  }

  public nextToken(this: Game): number {
    if (this.double) {
      this.double = false
      return this.getState().token
    }
    if (this.counter < 2 && this.stoneOnStart().length === 4) {
      this.counter++
      return this.getState().token
    } else {
      this.counter = 0
    }
    let token = this.getState().token + 1
    if (token > 4) { token = 1 }
    while (!this.getPlayer(token)) {
      token++
      if (token > 4) { token = 1 }
    }
    return token
  }

  public posibleActions() {
    const fields = this.getState().filds
    const token = this.getState().token
    const count = this.getState().dice.state
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
    const fields = this.getState().filds
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

  public complateStatus(): number {
    const fields = this.getState().filds
    const player = PlayerFilds[this.getState().token]
    let counter = 0
    for (const field of player.home) {
      if (fields[field[1]][field[0]] === this.getState().token) { ++counter }
    }
    return counter
  }

  public setPlayerType(this: Game, id: number, ai: PlayerType) {
    const playerList = this.getState().playerList
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
                checked={player === this.getState().playerList[i]} onChange={this.setPlayerType.bind(this, i, player)}/>
              <label htmlFor={Colors[i] + player}>{player}</label>
            </div>
          ))}
        </div>
      )
    }
    let playersCount = 0
    this.getState().playerList.forEach(player => player === PlayerType.None ? playersCount++ : null)
    return (
      <div className='setups'>
        {playersSetup}
        <div className='setup'>
          <button onClick={this.newGame.bind(this, this)} disabled={playersCount === 4}>
            New Game
          </button>
        </div>
        <button onClick={this.startGame.bind(this, this)} disabled={playersCount === 4}>
          Start Game
        </button>
      </div>
    )
  }

  public render() {
    const filds = this.getState().filds
    const actions = this.posibleActions()
    const winner = this.getState().winner
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
        <div className={'bg-' + Colors[this.getState().token]}>
          Player {this.getState().token} - {Colors[this.getState().token].toUpperCase()}</div>
        <div>Dice: {this.getState().dice.state}</div>
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
