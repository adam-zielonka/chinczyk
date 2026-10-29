import { t, language, setLanguage, subscribe } from "../i18n"
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
import PlayerStrategic from './players/PlayerStrategic'
import { PlayerType, PlayersTypes, PlayerProfiles, ColorNames } from './PlayerProfiles'
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
  awaitingRoll: boolean
}

export default class Game extends React.Component<{}, IGameState> {

  symulation: boolean
  stopGame: boolean
  symulationState: IGameState
  double: boolean
  counter: number
  diceMove: boolean
  private turnTimer: ReturnType<typeof setTimeout>

  private unsubscribeLanguage?: () => void

  componentDidMount() {
    this.unsubscribeLanguage = subscribe(() => this.forceUpdate())
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
        awaitingRoll: game.getState().awaitingRoll
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
      this.state = {
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
    this.setState({ awaitingRoll: false })
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

  private finishedCount(id: number) {
    return PlayerFilds[id].home.filter(([x, y]) => this.state.filds[y][x] === id).length
  }

  private renderPlayers() {
    return <aside className="players-panel panel" aria-labelledby="players-title">
      <div className="section-heading"><span className="eyebrow">{t("DOBRE TOWARZYSTWO")}</span><span className="small-dots">● ● ● ●</span></div>
      <h2 id="players-title">{t("Kto siada do stołu?")}</h2>
      <p className="section-description">{t("Zaproś znajomych na jeden ekran albo poznaj naszych graczy.")}</p>
      <div className="player-list">{[1, 2, 3, 4].map(id => {
        const type = this.state.playerList[id]
        const profile = PlayerProfiles[type]
        const active = this.state.started && !this.state.winner && this.state.token === id
        return <div key={id} className={`player-card color-${Colors[id]} ${active ? 'is-current' : ''} ${type === PlayerType.None ? 'is-empty' : ''}`}>
          <div className="player-card-top"><span className="avatar">{t(profile.initial)}</span>
            <div><span className="player-color"><PlayerSymbol player={id}/>{t(ColorNames[id])}</span><span className="player-badge">{active ? t("Teraz gra") : t(profile.badge)}</span></div>
            {this.state.started && <span className="home-count" title={t("Pionki na mecie")}>{this.finishedCount(id)}<span> / 4</span></span>}
          </div>
          <label className="sr-only" htmlFor={`player-${id}`}>{t("Gracz:")}{" "}{t(ColorNames[id])}</label>
          <select id={`player-${id}`} value={type} disabled={this.state.started}
            onChange={event => this.setPlayerType(id, event.target.value as PlayerType)}>
            {PlayersTypes.map(player => <option key={player} value={player}>{t(PlayerProfiles[player].name)}</option>)}
          </select>
          <p>{t(profile.description)}</p>
          {this.state.started && type !== PlayerType.None && <div className="progress-track" aria-label={t("Postęp: {color}", { color: t(ColorNames[id]) })}><span style={{ width: `${Math.min(100, this.complateProcentT(id) * 100)}%` }} /></div>}
        </div>
      })}</div>
      <div className="local-note"><span aria-hidden="true">⌂</span><span>{t("Razem przy jednym ekranie.")}<br/>{t("Bez konta i bez pośpiechu.")}</span></div>
    </aside>
  }

  public render() {
    const state = this.state
    const { started, paused, winner, token, awaitingRoll } = state
    const human = this.isHumanTurn()
    const actions = this.posibleActions()
    const canMove = human && !awaitingRoll
    const playerCount = state.players.filter(Boolean).length
    const profile = PlayerProfiles[state.playerList[token]]
    const statusTitle = winner ? t("{color} wygrywają!", { color: t(ColorNames[winner]) }) : !started ? t("Wszystko gotowe do gry?") : paused ? t("Chwila oddechu") : human ? (awaitingRoll ? t("Twoja kolej. Rzuć kostką!") : actions.length ? t("Wybierz swój pionek") : t("Tym razem bez ruchu")) : t("{name} wykonuje ruch…", { name: t(profile.name).split(" · ")[0] })
    const statusDescription = winner ? t("Cztery pionki na mecie. Pora na rewanż?") : !started ? t("Wybierz towarzystwo i rozpocznij pierwszą rundę.") : paused ? t("Plansza poczeka. Wznów, kiedy zechcesz.") : human ? (awaitingRoll ? t("Zobaczmy, co przyniesie los.") : actions.length ? t("Podświetlone pionki mogą ruszyć. Kliknij jeden z nich.") : t("Nie masz dostępnych ruchów. Przekaż kostkę dalej.")) : t("Za moment kostka trafi do kolejnego gracza.")
    return <div className={`app-shell ${started ? 'is-playing' : 'is-setup'}`}>
      <header className="site-header">
        <a href="." className="brand" aria-label={t("Chińczyk — strona główna")}><span className="brand-mark" aria-hidden="true">⚄</span><span>{t("chińczyk")}<span className="brand-period">.</span></span></a>
        <span className="header-note">{t("Klasyczna gra. Dobre towarzystwo.")}</span>
        <a className="rules-link" href="#zasady"><span className="info-icon" aria-hidden="true">i</span> {" "}{t("Jak grać")}</a>
      </header>
      <main>
        <div className="intro"><div><span className="eyebrow">{t("ODŁÓŻ SPRAWY. RZUĆ KOSTKĄ.")}</span><h1>{t("Spotkajmy się przy planszy")}<span>.</span></h1><p>{t("Trochę szczęścia, odrobina strategii i jeszcze jedna partia.")}</p></div><span className="table-tag"><span/> {" "}{t("2–4 graczy · na jednym ekranie")}</span></div>
        <div className="game-layout">
          {this.renderPlayers()}
          <section className="board-panel panel" aria-label={t("Plansza do gry w chińczyka")}>
            <div className="board-heading"><div className="board-label"><span className={`status-dot ${started && !paused && !winner ? 'live' : ''}`}/>{winner ? t("Koniec partii") : !started ? t("Twój stół do gry") : paused ? t("Gra wstrzymana") : t("Partia w toku")}</div><span className="round-label">{started ? t("Ruch {count}", { count: state.movesCount + 1 }) : t("Zaczynają {color}", { color: t(ColorNames[state.players.find(Boolean)?.id || 1]).toLowerCase() })}</span></div>
            <div className="board-wrap"><div className="game-board">
              {[3, 4, 2, 1].map(id => <div key={id} aria-hidden="true" className={`base-zone base-${id} color-${Colors[id]}`}><span><PlayerSymbol player={id}/>{t(ColorNames[id])}</span><small>{t("BAZA")}</small></div>)}
              {Array.from({ length: 11 }, (_, y) => Array.from({ length: 11 }, (_, x) => {
                const color = Filds[y][x]
                const movable = canMove && actions.some(action => action[0] === x && action[1] === y)
                return <Square key={`${y}-${x}`} x={x} y={y} color={color} activeColor={state.filds[y][x]}
                  disabled={!movable} movable={movable} onClick={() => { if (movable) this.onClick(y, x) }} />
              }))}
              <div className="board-center" aria-hidden="true">✦</div>
            </div></div>
            <div className="board-caption"><span><i className="legend-pawn"/> {" "}{t("Cztery pionki. Jeden cel.")}</span><span>{t("Doprowadź je do domu.")}</span></div>
          </section>
          <aside className="turn-panel">
            <section className={`turn-card panel ${started ? 'color-' + Colors[winner || token] : ''}`} aria-labelledby="turn-title">
              <span className="eyebrow">{winner ? t("MAMY ZWYCIĘZCĘ") : started ? t("{color} PRZY KOSTCE", { color: t(ColorNames[token]).toUpperCase() }) : t("TWOJA NASTĘPNA PARTIA")}</span>
              <h2 id="turn-title" aria-live="polite">{statusTitle}</h2><p className="turn-description">{statusDescription}</p>
              <div className={`dice-stage ${!started || (human && awaitingRoll) ? 'dice-waiting' : ''}`}><div className="dice" role="img" aria-label={!started || (human && awaitingRoll) ? t("Kostka czeka na rzut") : t("Kostka: {value}", { value: state.dice.state })}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(dot => <i key={dot} className={this.diceDots(!started || (human && awaitingRoll) ? 5 : state.dice.state).includes(dot) ? 'dot visible' : 'dot'}/>)}
              </div><span>{winner ? t("Dobra partia!") : !started ? t("Wszystko zaczyna się od rzutu") : human && awaitingRoll ? t("Twój szczęśliwy rzut?") : t("Na kostce: {value}", { value: state.dice.state })}</span></div>
              {!started ? <><button className="button primary" disabled={playerCount < 2} onClick={() => this.startGame()}>{t("Zagrajmy")}{" "}<span aria-hidden="true">↗</span></button>{playerCount < 2 && <p className="validation-note" role="status">{t("Wybierz co najmniej dwóch graczy.")}</p>}</> : winner ? <button className="button primary" onClick={() => this.newGame()}>{t("Zagraj jeszcze raz")}{" "}<span aria-hidden="true">↻</span></button> : paused ? <button className="button primary" onClick={() => this.startGame()}>{t("Wznów grę")}{" "}<span aria-hidden="true">▶</span></button> : human ? <button className="button primary" disabled={!awaitingRoll && actions.length > 0} onClick={() => awaitingRoll ? this.rollDice() : this.noMoves()}>{awaitingRoll ? t("Rzuć kostką") : actions.length ? t("Wybierz pionek na planszy") : t("Przekaż kolejkę")} <span aria-hidden="true">{awaitingRoll ? '⚄' : '→'}</span></button> : <div className="thinking" role="status"><span/> {" "}{t("Przeciwnik gra")}</div>}
              {started && !winner && <div className="game-controls">{!paused && <button onClick={() => this.pauseGame()}>{t("Ⅱ Pauza")}</button>}<button onClick={() => this.newGame()}>{t("↻ Nowa partia")}</button></div>}
            </section>
            <section className="pace-card panel"><div><label htmlFor="playerDelay">{t("Tempo gry")}</label><span>{state.time < 350 ? t("Szybkie") : state.time > 1000 ? t("Spokojne") : t("Swobodne")}</span></div><input type="range" id="playerDelay" min="150" max="1500" step="50" value={state.time} onChange={event => this.setState({ time: Number(event.target.value) })}/><p>{t("Ustaw, jak szybko grają przeciwnicy.")}</p></section>
            <div className="little-note"><span aria-hidden="true">✳</span><p>{t("Szczęście sprzyja…")}<br/>{t("tym, którzy rzucają.")}</p></div>
          </aside>
        </div>
        <section className="rules-section" id="zasady"><div className="rules-title"><span className="eyebrow">{t("MINUTA I JUŻ GRASZ")}</span><h2>{t("Małe przypomnienie zasad")}</h2></div><div className="rule"><span>01</span><div><h3>{t("Szóstka na dobry początek")}</h3><p>{t("Wyrzuć 6, żeby wyprowadzić pionek z bazy. Gdy wszystkie są w bazie, masz do trzech prób.")}</p></div></div><div className="rule"><span>02</span><div><h3>{t("Ścigaj się i zbijaj")}</h3><p>{t("Ruszaj po torze. Wejście na pole rywala odsyła jego pionek do bazy.")}</p></div></div><div className="rule"><span>03</span><div><h3>{t("Wszyscy do domu")}</h3><p>{t("Wprowadź cztery pionki na kolorową metę. Potrzebujesz dokładnego rzutu.")}</p></div></div></section>
      </main>
      <footer><span>{t("chińczyk.")}{" "}<span className="footer-note">{t("Dobry ruch na wolną chwilę.")}</span></span><div className="language-switch" role="group" aria-label="Language / Język">
  <button type="button" lang="en" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>English</button>
  <span aria-hidden="true">/</span>
  <button type="button" lang="pl" aria-pressed={language === "pl"} onClick={() => setLanguage("pl")}>Polski</button>
</div>
<span>{t("Miłej gry")}{" "}<span aria-hidden="true">✦</span></span></footer>
    </div>
  }

  private diceDots(value: number) {
    return ({ 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] })[value] || []
  }
}
