import { describe, expect, it } from 'vitest'
import Game from '../Game'
import Dice from '../Dice'
import { Filds, PlayerFilds } from '../Consts'
import PlayerStrategic from './PlayerStrategic'

function position(roll = 1) {
  const game = new Game(new Game())
  game.setState({ token: 1, dice: new Dice(roll), filds: Filds.map(row => Array.from({ length: 11 }, (_, x) => row[x] === undefined ? undefined : 0)) })
  return game
}

const path = PlayerFilds[1].order.flatMap(id => PlayerFilds[id].board).concat(PlayerFilds[1].home)
function put(game: Game, index: number, player = 1) {
  const [x, y] = path[index]
  game.getState().filds[y][x] = player
  return path[index]
}

describe('named strategic opponents', () => {
  it('Leon chooses a capture over ordinary progress', () => {
    const game = position()
    const hunter = new PlayerStrategic(1, 'hunter')
    const capturingPawn = put(game, 3)
    put(game, 4, 2)
    put(game, 25)
    expect(hunter.chooseAction(game)).toEqual(capturingPawn)
  })

  it('Mila avoids a square in range of an enemy pawn', () => {
    const game = position()
    put(game, 5)
    put(game, 4, 2)
    const safePawn = put(game, 20)
    expect(new PlayerStrategic(1, 'tactician').chooseAction(game)).toEqual(safePawn)
  })

  it.each(['hunter', 'tactician'] as const)('%s prioritizes entering home over ordinary progress', style => {
    const game = position()
    const homePawn = put(game, 39)
    put(game, 10)
    expect(new PlayerStrategic(1, style).chooseAction(game)).toEqual(homePawn)
  })

  it.each(['hunter', 'tactician'] as const)('%s launches a pawn on six and returns no move without six', style => {
    const game = position(6)
    const [x, y] = PlayerFilds[1].start[0]
    game.getState().filds[y][x] = 1
    const player = new PlayerStrategic(1, style)
    expect(player.chooseAction(game)).toEqual([x, y])
    game.getState().dice.state = 3
    expect(player.chooseAction(game)).toBeUndefined()
  })
})
