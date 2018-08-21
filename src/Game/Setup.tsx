import * as React from 'react'
import { Colors, Filds, PlayerFilds } from './Consts'
import Game from './Game'

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

export interface ISetupProps {
  game: Game,
  playerList: PlayerType[],
}

export default class Setup extends React.Component<ISetupProps, null> {

  public setPlayerType(game: Game, id: number, ai: PlayerType) {
    const playerList = game.state.playerList
    playerList[id] = ai
    game.setState({ playerList })
  }

  public render() {
    const playersSetup = []
    for (let i = 1; i < 5; ++i) {
      playersSetup.push(
        <div key={i} className='setup'>
          {Colors[i]}
          {PlayersTypes.map(player => (
            <div key={player + i}>
              <input type='radio' name={Colors[i]} id={Colors[i] + player} value={player}
                checked={player === this.props.playerList[i]} onChange={this.setPlayerType.bind(this, this.props.game , i, player)}/>
              <label htmlFor={Colors[i] + player}>{player}</label>
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className='setups'>
        {playersSetup}
        <button onClick={this.props.game.newGame.bind(this.props.game)}>
          New Game
        </button>
      </div>
    )
  }

}
