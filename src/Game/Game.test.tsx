// @vitest-environment happy-dom
import React, { act, createRef } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Game from './Game'
import { setLanguage } from '../i18n'
import { PlayerType } from './PlayerProfiles'
import { PlayerFilds } from './Consts'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

let container: HTMLDivElement
let root: Root
let game: Game
const button = (text: string) => [...container.querySelectorAll('button')].find(element => element.textContent.includes(text))!

beforeEach(async () => {
  setLanguage("pl")
  vi.useFakeTimers()
  vi.spyOn(Math, 'random').mockReturnValue(0)
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  const ref = createRef<Game>()
  await act(async () => root.render(<Game ref={ref} />))
  game = ref.current!
})
afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('player-facing game flow', () => {
  it('starts with a human and requires rolling before a legal pawn can be clicked', async () => {
    expect(game.state.playerList[1]).toBe(PlayerType.Human)
    expect(container.querySelectorAll('.can-move')).toHaveLength(0)
    await act(async () => button('Zagrajmy').click())
    await act(async () => { game.state.dice.state = 6; button('Rzuć kostką').click() })
    expect(container.querySelectorAll('.can-move')).toHaveLength(4)
    await act(async () => (container.querySelector('.can-move') as HTMLButtonElement).click())
    const [x, y] = PlayerFilds[1].board[0]
    expect(game.state.filds[y][x]).toBe(1)
    expect(game.state.token).toBe(2)
    expect(container.querySelectorAll('.can-move')).toHaveLength(0)
  })

  it('lets a human pass without a move and grants up to three initial attempts', async () => {
    await act(async () => game.startGame())
    for (let attempt = 0; attempt < 3; attempt++) {
      expect(game.state.token).toBe(1)
      await act(async () => button('Rzuć kostką').click())
      expect(container.querySelectorAll('.can-move')).toHaveLength(0)
      await act(async () => button('Przekaż kolejkę').click())
    }
    expect(game.state.token).toBe(2)
  })

  it('cancels queued computer turns on pause and resumes only once', async () => {
    await act(async () => game.setPlayerType(1, PlayerType.Hunter))
    await act(async () => game.startGame())
    await act(async () => game.pauseGame())
    await act(async () => vi.advanceTimersByTime(5000))
    expect(game.state.movesCount).toBe(0)
    await act(async () => game.startGame())
    await act(async () => vi.advanceTimersByTime(game.state.time))
    expect(game.state.movesCount).toBe(1)
    await act(async () => game.newGame())
    await act(async () => vi.advanceTimersByTime(5000))
    expect(game.state.started).toBe(false)
    expect(game.state.movesCount).toBe(0)
  })

  it('blocks starting with fewer than two players, removes their pieces and starts from the first active seat', async () => {
    for (const id of [1, 2, 3]) await act(async () => game.setPlayerType(id, PlayerType.None))
    expect(button('Zagrajmy').disabled).toBe(true)
    await act(async () => game.startGame())
    expect(game.state.started).toBe(false)
    expect(game.state.filds.flat().filter(piece => piece === 1)).toHaveLength(0)
    await act(async () => game.setPlayerType(3, PlayerType.Human))
    await act(async () => game.startGame())
    expect(game.state.token).toBe(3)
    expect(game.state.players.map(player => player?.id)).toEqual([undefined, undefined, 3, 4])
  })

  it('keeps player choices fixed during a match and unlocks them for the next one', async () => {
    await act(async () => game.startGame())
    expect([...container.querySelectorAll<HTMLSelectElement>('.player-list select')].every(select => select.disabled)).toBe(true)
    await act(async () => game.setPlayerType(1, PlayerType.None))
    expect(game.state.playerList[1]).toBe(PlayerType.Human)
    await act(async () => game.newGame())
    expect([...container.querySelectorAll<HTMLSelectElement>('.player-list select')].every(select => !select.disabled)).toBe(true)
  })

  it('finishes a match between the new opponents while preserving all pieces and skipping empty seats', async () => {
    let seed = 21
    vi.mocked(Math.random).mockImplementation(() => {
      seed = (seed * 1664525 + 1013904223) >>> 0
      return seed / 4294967296
    })
    await act(async () => game.setPlayerType(1, PlayerType.Hunter))
    await act(async () => game.setPlayerType(2, PlayerType.None))
    await act(async () => game.setPlayerType(3, PlayerType.Tactician))
    await act(async () => game.setPlayerType(4, PlayerType.None))
    await act(async () => game.startGame())
    for (let turn = 0; turn < 2000 && !game.state.winner; turn++) {
      await act(async () => vi.advanceTimersByTime(game.state.time))
      expect([1, 3]).toContain(game.state.token)
      const pieces = game.state.filds.flat()
      expect(pieces.filter(piece => piece === 1)).toHaveLength(4)
      expect(pieces.filter(piece => piece === 3)).toHaveLength(4)
    }
    expect([1, 3]).toContain(game.state.winner)
    expect(container.textContent).toContain('wygrywają!')
    expect(button('Zagraj jeszcze raz')).toBeDefined()
    const moves = game.state.movesCount
    await act(async () => vi.advanceTimersByTime(5000))
    expect(game.state.movesCount).toBe(moves)
  })

})

it('switches language during a match without changing pawns, dice or player choices', async () => {
  await act(async () => game.startGame());
  const before = JSON.stringify(game.state);
  const picker = container.querySelector('.language-picker') as HTMLSelectElement;
  await act(async () => {
    picker.value = 'en';
    picker.dispatchEvent(new Event('change', { bubbles: true }));
  });
  expect(JSON.stringify(game.state)).toBe(before);
  expect(container.querySelector('#turn-title')?.textContent).toBe('Your turn. Roll the dice!');
  expect(container.querySelector('#player-1')?.textContent).toContain('You · local player');
  expect(localStorage.getItem('chinczyk-language')).toBe('en');
  expect(document.documentElement.lang).toBe('en');
});
