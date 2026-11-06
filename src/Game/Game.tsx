import { t, subscribe } from "../i18n"
/* eslint-disable no-sparse-arrays */
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
import PlayerSymbol from './PlayerSymbol'
import { PawnSymbolsContext } from './PlayerPawn'
import PlayerBase from './PlayerBase'
import { LanguageSwitch, RulesHelp } from './GameHelp'
import PlayerStrategic from './players/PlayerStrategic'
import { PlayerType, PlayerProfiles, ColorNames } from './PlayerProfiles'
export { PlayerType, PlayersTypes } from './PlayerProfiles'

export interface IGameState {
  filds: number[][],
  token: number,
  dice: Dice,
  winner: number,
  players: IPlayer[],
  playerList: PlayerType[],
  movesCount: number,
  time: number,
  started: boolean,
  paused: boolean,
  awaitingRoll: boolean,
  showPawnSymbols: boolean
}

export default class Game extends React.Component<{}, IGameState> {

  symulation: boolean
  stopGame: boolean
  symulationState: IGameState
  double: boolean
  counter: number
  diceMove: boolean
  private turnTimer: ReturnType<typeof setTimeout>

  private boardRef = React.createRef<HTMLDivElement>()
  private unsubscribeLanguage?: () => void

  componentDidMount() {
    this.unsubscribeLanguage = subscribe(() => this.forceUpdate())
  }

  componentDidUpdate(_previousProps: {}, previousState: IGameState) {
    if (previousState.started !== this.state.started && window.matchMedia('(max-width: 700px)').matches) {
      this.boardRef.current?.closest('.board-panel')?.scrollIntoView({ block: 'start' })
    }
  }

  componentWillUnmount() {
    this.unsubscribeLanguage?.()
    this.stop()
  }

  public setState(state: any, callback?: () => void) {
    if (this.symulation) {
      this.symulationState = {...this.symulationState, ...state}
    } else {
      super.setState(state, callback)
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
        movesCount: game.getState().movesCount,
        winner: game.getState().winner,
        token: game.getState().token,
        dice: new Dice(game.getState().dice),
        filds: game.getState().filds.map(p => p.map(f => f)),
        players: game.getState().players.map(p => p),
        playerList: game.getState().playerList.map(p => p),
        time: game.getState().time,
        started: game.getState().started,
        paused: game.getState().paused,
        awaitingRoll: game.getState().awaitingRoll,
        showPawnSymbols: game.getState().showPawnSymbols
      }
      this.symulation = true
      this.stopGame = true
      this.double = game.double
      this.counter = game.counter
      this.diceMove = game.diceMove
    } else {
      const playerList = [,
        PlayerType.Human,
        PlayerType.Tactician,
        PlayerType.Hunter,
        PlayerType.Random
      ]
      const players: IPlayer[] = this.getPlayers(playerList)
      let showPawnSymbols = false
      try { showPawnSymbols = localStorage.getItem('chinczyk-pawn-symbols') === 'true' } catch { /* Storage may be blocked. */ }
      this.state = {
        showPawnSymbols,
        started: false,
        paused: false,
        awaitingRoll: true,
        time: 650,
        movesCount: 0,
        winner: 0,
        token: 1,
        dice: new Dice(),
        filds: this.clearInactivePlayers(players),
        players,
        playerList
      }
      this.diceMove = false
      this.double = false
      this.counter = 0
      this.symulation = false
      this.stopGame = true
    }
  }

  public stop() {
    this.stopGame = true
    clearTimeout(this.turnTimer)
  }

  public newGame(this: Game) {
    this.stop()
    const players: IPlayer[] = this.getPlayers(this.getState().playerList)
    const token = players.some(Boolean) ? this.startToken(players, 1) : 1
    this.counter = 0
    this.double = false
    this.diceMove = false
    this.setState({
      movesCount: 0,
      winner: 0,
      token,
      started: false,
      paused: false,
      awaitingRoll: true,
      dice: new Dice(),
      players,
      filds: this.clearInactivePlayers(players)
    })
  }

  private clearInactivePlayers(players: IPlayer[]) {
    const fields = Filds.map(row => Array.from({ length: 11 }, (_, x) => row[x] === undefined ? undefined : 0))
    players.forEach(player => {
      if (player) PlayerFilds[player.id].start.forEach(([x, y]) => { fields[y][x] = player.id })
    })
    return fields
  }

  private schedulePlayer() {
    clearTimeout(this.turnTimer)
    if (this.stopGame || this.getState().winner) return
    this.turnTimer = setTimeout(() => {
      if (!this.stopGame && !this.getState().winner) this.getPlayer(this.getState().token)?.play(this)
    }, this.getState().time)
  }

  public startGame() {
    if (this.getState().started && !this.getState().paused) return
    const players = this.getPlayers(this.getState().playerList)
    if (players.filter(Boolean).length < 2) return
    this.stopGame = false
    if (!this.getState().started) {
      this.counter = 0
      this.double = false
      const token = this.startToken(players, 1)
      this.setState({ players, token, filds: this.clearInactivePlayers(players), dice: new Dice(),
        movesCount: 0, winner: 0, started: true, paused: false, awaitingRoll: true }, () => this.schedulePlayer())
    } else {
      this.setState({ paused: false }, () => this.schedulePlayer())
    }
  }

  public pauseGame() {
    this.stop()
    this.setState({ paused: true })
  }

  public rollDice() {
    if (!this.isHumanTurn() || !this.getState().awaitingRoll) return
    this.setState({ awaitingRoll: false }, () => {
      this.boardRef.current?.querySelector<HTMLButtonElement>('.can-move')?.focus({ preventScroll: true })
    })
  }

  private isHumanTurn() {
    const state = this.getState()
    return state.started && !state.paused && !state.winner && state.playerList[state.token] === PlayerType.Human
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
          case PlayerType.Hunter:
            players.push(new PlayerStrategic(++counter, 'hunter'))
            break
          case PlayerType.Tactician:
            players.push(new PlayerStrategic(++counter, 'tactician'))
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

  public nextPlayer(this: Game) {
    const winner = this.checkWiner()
    if (winner) {
      if (!this.getState().winner) {
        this.setState({ winner })
        if (!this.symulation) this.stop()
      }
    } else {
      if (!this.symulation && !this.stopGame) {
        this.getState().dice.throw()
        const token = this.nextToken()
        const movesCount = this.getState().movesCount + 1
        this.setState({ token, movesCount, awaitingRoll: true }, () => this.schedulePlayer())
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

  public posibleActionsMetaData() {
    const fields = this.getState().filds
    const token = this.getState().token
    const count = this.getState().dice.state
    const result = []
    const start = []

    // Start field
    if (count === 6) {
      for (const field of PlayerFilds[token].start) {
        const [x, y] = PlayerFilds[token].board[0]
        if (fields[field[1]][field[0]] === token && fields[y][x] !== token) {
          result.push(0)
          start.push(40)
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
          result.push(i + count)
          start.push(i)
        }
      }
      ++i
    }
    return [result, start]
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

  public complateProcent(): number {
    const token = this.getState().token
    return this.complateProcentT(token)
  }

  public complateProcentT(token: number): number {
    const fields = this.getState().filds

    let board = []
    for (const id of PlayerFilds[token].order) {
      board = board.concat(PlayerFilds[id].board)
    }
    board = board.concat(PlayerFilds[token].home)

    let points = 0
    let i = 1
    for (const field of board) {
      if (fields[field[1]][field[0]] === token) {
        points += i
      }
      ++i
    }
    return points / (4 * 42.5) // (4 stones * avarage fields)
  }

  public setPlayerType(id: number, ai: PlayerType) {
    if (this.getState().started) return
    const playerList = [...this.getState().playerList]
    playerList[id] = ai
    const players = this.getPlayers(playerList)
    this.setState({ playerList, players, filds: this.clearInactivePlayers(players) })
  }

  private setPawnSymbols(showPawnSymbols: boolean) {
    try { localStorage.setItem('chinczyk-pawn-symbols', String(showPawnSymbols)) } catch { /* Keep the preference for this visit. */ }
    this.setState({ showPawnSymbols })
  }

  public render() {
    const state = this.state
    const { started, paused, winner, token, awaitingRoll } = state
    const human = this.isHumanTurn()
    const actions = this.posibleActions()
    const canMove = human && !awaitingRoll
    const renderSquare = (x: number, y: number) => {
      const movable = canMove && actions.some(action => action[0] === x && action[1] === y)
      return <Square key={`${y}-${x}`} x={x} y={y} color={Filds[y][x]} activeColor={state.filds[y][x]}
        disabled={!movable} movable={movable} onClick={() => { if (movable) this.onClick(y, x) }} />
    }
    const playerCount = state.players.filter(Boolean).length
    const profile = PlayerProfiles[state.playerList[token]]
    const hasComputer = state.playerList.some(type => type !== undefined && type !== PlayerType.None && type !== PlayerType.Human)
    const statusTitle = winner ? t("{color} wygrywają!", { color: t(ColorNames[winner]) }) : !started ? t("Gotowi do gry?") : paused ? t("Gra wstrzymana") : human ? (awaitingRoll ? t("Twój ruch") : actions.length ? t("Wybierz swój pionek") : t("Tym razem bez ruchu")) : t("{name} wykonuje ruch…", { name: t(profile.name).split(" · ")[0] })
    return <PawnSymbolsContext.Provider value={state.showPawnSymbols}><div className={`app-shell ${started ? 'is-playing' : 'is-setup'}`}>
      <main>
        <div className="game-layout">
          <section className="board-panel panel" aria-label={t("Plansza do gry w chińczyka")}>
            <div className="board-heading"><div className="board-label"><span className={`status-dot ${started && !paused && !winner ? 'live' : ''}`}/>{winner ? t("Koniec partii") : !started ? t("Twój stół do gry") : paused ? t("Gra wstrzymana") : t("Partia w toku")}</div><h1 className="board-title">{t("chińczyk")}<span>.</span></h1><span className="round-label">{started ? t("Ruch {count}", { count: state.movesCount + 1 }) : t("Zaczynają {color}", { color: t(ColorNames[state.players.find(Boolean)?.id || 1]).toLowerCase() })}</span></div>
            <div className="board-wrap"><div className="game-board" ref={this.boardRef}>
              {[3, 4, 2, 1].map(id => <PlayerBase key={id} id={id} type={state.playerList[id]} started={started}
                active={started && !winner && token === id} onSelect={type => this.setPlayerType(id, type)}/>)}
              {Array.from({ length: 11 }, (_, y) => Array.from({ length: 11 }, (_, x) => {
                const color = Filds[y][x]
                // Base slots keep their game coordinates but sit inside the bases visually.
                const inBase = color && PlayerFilds[color].start.some(([sx, sy]) => sx === x && sy === y)
                return inBase ? <span key={`${y}-${x}`} className="square-void" aria-hidden="true"/> : renderSquare(x, y)
              }))}
              {[3, 4, 2, 1].map(id => <div key={`pawns-${id}`} className={`base-pawns base-pawns-${id}`}>
                {PlayerFilds[id].start.map(([x, y]) => renderSquare(x, y))}
              </div>)}
              <div className="board-center" aria-hidden="true">✦</div>
            </div></div>
            {!started && <p className="board-setup-hint">{t("Kliknij bazę, aby wybrać gracza.")} <span>{t("2–4 graczy · na jednym ekranie")}</span></p>}
          </section>
          <aside className="turn-panel">
            <section className={`turn-card panel ${started ? 'color-' + Colors[winner || token] : ''}`} aria-labelledby="turn-title">
              <div className="turn-status" aria-live="polite" aria-atomic="true">
                {started && <span className="turn-player"><PlayerSymbol player={winner || token}/>{t(ColorNames[winner || token])}</span>}
                <h2 id="turn-title">{statusTitle}</h2>
              </div>
              <div className={`dice-stage ${!started || (human && awaitingRoll) ? 'dice-waiting' : ''}`}><div className="dice" role="img" aria-label={!started || (human && awaitingRoll) ? t("Kostka czeka na rzut") : t("Kostka: {value}", { value: state.dice.state })}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(dot => <i key={dot} className={this.diceDots(!started || (human && awaitingRoll) ? 5 : state.dice.state).includes(dot) ? 'dot visible' : 'dot'}/>)}
              </div></div>
              {!started ? <><button className="button primary" disabled={playerCount < 2} onClick={() => this.startGame()}>{t("Zagrajmy")}{" "}<span aria-hidden="true">↗</span></button>{playerCount < 2 && <p className="validation-note" role="status">{t("Wybierz co najmniej dwóch graczy.")}</p>}</> : winner ? <button className="button primary" onClick={() => this.newGame()}>{t("Zagraj jeszcze raz")}{" "}<span aria-hidden="true">↻</span></button> : paused ? <button className="button primary" onClick={() => this.startGame()}>{t("Wznów grę")}{" "}<span aria-hidden="true">▶</span></button> : human ? (awaitingRoll ? <button className="button primary" onClick={() => this.rollDice()}>{t("Rzuć kostką")} <span aria-hidden="true">⚄</span></button> : actions.length ? <p className="move-hint" role="status">{t("Kliknij podświetlony pionek.")}</p> : <button className="button primary" onClick={() => this.noMoves()}>{t("Przekaż kolejkę")} <span aria-hidden="true">→</span></button>) : <div className="thinking" role="status"><span/> {" "}{t("Przeciwnik gra")}</div>}
              {started && !winner && <div className="game-controls">{!paused && <button onClick={() => this.pauseGame()}>{t("Ⅱ Pauza")}</button>}<button onClick={() => this.newGame()}>{t("↻ Nowa partia")}</button></div>}
            </section>
            <RulesHelp onOpen={() => { if (started && !paused && !winner) this.pauseGame() }}/>
            <details className="settings panel"><summary>{t("Ustawienia")}</summary>
              {hasComputer && <div className="pace-card"><div><label htmlFor="playerDelay">{t("Tempo gry")}</label><span>{state.time < 350 ? t("Szybkie") : state.time > 1000 ? t("Spokojne") : t("Swobodne")}</span></div><input type="range" id="playerDelay" min="150" max="1500" step="50" value={state.time} onChange={event => this.setState({ time: Number(event.target.value) })}/><p>{t("Ustaw, jak szybko grają przeciwnicy.")}</p></div>}
              <div className="settings-content">
                <LanguageSwitch />
                <label className="setting-row" htmlFor="pawnSymbols"><span>{t('Symbole pionków i pól')}</span>
                  <input id="pawnSymbols" className="setting-switch" type="checkbox" role="switch" checked={state.showPawnSymbols}
                    onChange={event => this.setPawnSymbols(event.target.checked)}/>
                </label>
                <a className="setting-row source-link" href="https://github.com/adam-zielonka/chinczyk">{t("Kod źródłowy")}<span aria-hidden="true">↗</span></a>
              </div>
            </details>
          </aside>
        </div>
      </main>
    </div></PawnSymbolsContext.Provider>
  }

  private diceDots(value: number) {
    return ({ 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] })[value] || []
  }
}
