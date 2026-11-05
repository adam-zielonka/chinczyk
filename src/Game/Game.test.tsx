// @vitest-environment happy-dom
import React, { act, createRef } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Game from './Game'
import { setLanguage } from '../i18n'
import { PlayerProfiles, PlayersTypes, PlayerType } from './PlayerProfiles'
import { PlayerFilds } from './Consts'
import Square from './Square'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

let container: HTMLDivElement
let root: Root
let game: Game
const seat = (id: number) => container.querySelector<HTMLButtonElement>(`#player-${id}`)!
const option = (name: string) => [...container.querySelectorAll<HTMLButtonElement>('.player-option')].find(element => element.textContent.includes(name))!
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
    expect(container.querySelector('.move-hint')?.textContent).toBe('Kliknij podświetlony pionek.')
    expect(container.querySelector('.turn-status')?.textContent).toContain('Wybierz swój pionek')
    expect(document.activeElement).toBe(container.querySelector('.can-move'))
    expect(container.querySelector('.turn-player')?.textContent).toBe('Zieloni')
    await act(async () => (container.querySelector('.can-move') as HTMLButtonElement).click())
    const [x, y] = PlayerFilds[1].board[0]
    expect(game.state.filds[y][x]).toBe(1)
    expect(container.querySelectorAll('.game-board .stone .player-symbol[data-player="1"]')).toHaveLength(4)
    expect(container.querySelector(`button[aria-label*="rząd ${y + 1}, kolumna ${x + 1}"] .player-symbol`)?.getAttribute('data-player')).toBe('1')
    expect(container.querySelectorAll('.bg-green > .player-symbol[data-player="1"]').length).toBeGreaterThan(4)
    expect(game.state.token).toBe(2)
    expect(container.querySelectorAll('.can-move')).toHaveLength(0)
  })

  it('keeps all four visible seat symbols consistent across profiles, pawns and the legend', async () => {
    const original = [1, 2, 3, 4].map(id => container.querySelector(`.game-board .stone .player-symbol[data-player="${id}"]`)!.innerHTML)
    expect(new Set(original).size).toBe(4)
    await act(async () => game.setPlayerType(1, PlayerType.Hunter))
    for (const id of [1, 2, 3, 4]) {
      expect(container.querySelectorAll(`.game-board .stone .player-symbol[data-player="${id}"]`)).toHaveLength(4)
      for (const symbol of container.querySelectorAll(`.player-symbol[data-player="${id}"]`)) {
        expect(symbol.innerHTML).toBe(original[id - 1])
      }
      expect(container.querySelector(`.pawn-avatar .player-symbol[data-player="${id}"]`)).not.toBeNull()
      expect(container.querySelector(`.base-${id} .player-symbol[data-player="${id}"]`)).not.toBeNull()
    }
    await act(async () => game.setPlayerType(1, PlayerType.None))
    expect(container.querySelector('.game-board .stone .player-symbol[data-player="1"]')).toBeNull()
    expect(container.querySelector('.pawn-avatar .player-symbol[data-player="1"]')?.innerHTML).toBe(original[0])
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

  it('keeps all four player cards locked throughout a match and unlocks them for the next one', async () => {
    expect(container.querySelectorAll('.player-card')).toHaveLength(4)
    await act(async () => game.startGame())
    for (const phase of ['playing', 'paused', 'finished']) {
      if (phase === 'paused') await act(async () => game.pauseGame())
      if (phase === 'finished') await act(async () => game.setState({ winner: 1 }))
      for (const id of [1, 2, 3, 4]) {
        expect(seat(id).disabled).toBe(true)
        await act(async () => seat(id).click())
        expect(container.querySelector('dialog')).toBeNull()
      }
    }
    await act(async () => game.setPlayerType(1, PlayerType.None))
    expect(game.state.playerList[1]).toBe(PlayerType.Human)
    await act(async () => game.newGame())
    for (const id of [1, 2, 3, 4]) expect(seat(id).disabled).toBe(false)
    await act(async () => seat(1).click())
    expect(container.querySelector('dialog[open]')).not.toBeNull()
  })

  it('offers every profile as a tile and applies the choice only to the clicked seat', async () => {
    const original = [...game.state.playerList]
    for (const type of PlayersTypes) {
      await act(async () => seat(2).click())
      const dialog = container.querySelector<HTMLDialogElement>('dialog')!
      expect(dialog.open).toBe(true)
      expect(dialog.getAttribute('aria-labelledby')).toBe('picker-title-2')
      expect(container.querySelectorAll('.player-option')).toHaveLength(9)
      const selected = container.querySelector('.player-option[aria-pressed="true"]')!
      expect(selected.textContent).toContain(PlayerProfiles[game.state.playerList[2]].name)
      expect(document.activeElement).toBe(selected)
      await act(async () => option(PlayerProfiles[type].name).click())
      expect(game.state.playerList[2]).toBe(type)
      for (const id of [1, 3, 4]) expect(game.state.playerList[id]).toBe(original[id])
      expect(seat(2).querySelector('.player-name')?.textContent).toBe(PlayerProfiles[type].name)
      expect(container.querySelector('dialog')).toBeNull()
      expect(document.activeElement).toBe(seat(2))
      expect(document.body.style.overflow).not.toBe('hidden')
    }
  })

  it('cancels by close button, Escape cancel event or backdrop without changing the game', async () => {
    const original = JSON.stringify(game.state)
    for (const method of ['close', 'escape', 'backdrop']) {
      await act(async () => seat(3).click())
      const dialog = container.querySelector<HTMLDialogElement>('dialog')!
      expect(document.body.style.overflow).toBe('hidden')
      await act(async () => (container.querySelector('.picker-hint') as HTMLElement).click())
      expect(dialog.open).toBe(true)
      await act(async () => {
        if (method === 'close') (dialog.querySelector('.dialog-close') as HTMLButtonElement).click()
        if (method === 'escape') dialog.dispatchEvent(new Event('cancel', { bubbles: false, cancelable: true }))
        if (method === 'backdrop') dialog.click()
      })
      expect(container.querySelector('dialog')).toBeNull()
      expect(JSON.stringify(game.state)).toBe(original)
      expect(document.activeElement).toBe(seat(3))
      expect(document.body.style.overflow).not.toBe('hidden')
    }
  })

  it('removes and restores empty seats through tiles and enforces the two-player minimum', async () => {
    for (const id of [1, 2, 3, 4]) {
      await act(async () => seat(id).click())
      await act(async () => option('Wolne miejsce').click())
      expect(game.state.filds.flat().filter(piece => piece === id)).toHaveLength(0)
    }
    expect(button('Zagrajmy').disabled).toBe(true)
    for (const id of [3, 4]) {
      await act(async () => seat(id).click())
      await act(async () => option('Ty · gracz lokalny').click())
      expect(game.state.filds.flat().filter(piece => piece === id)).toHaveLength(4)
      expect(button('Zagrajmy').disabled).toBe(id === 3)
    }
    await act(async () => button('Zagrajmy').click())
    expect(game.state.token).toBe(3)
  })

  it('translates the dialog and the chosen profile without changing the selection', async () => {
    await act(async () => setLanguage('en'))
    await act(async () => seat(1).click())
    expect(container.querySelector('#picker-title-1')?.textContent).toBe('Choose a player')
    expect(container.querySelector('#picker-hint-1')?.textContent).toBe('Click a tile to choose a player for this colour.')
    expect(container.querySelector('.dialog-close')?.getAttribute('aria-label')).toBe('Close player selection')
    expect(seat(1).getAttribute('aria-label')).toBe('Player: Green, You · local player')
    expect(container.querySelector('.player-option[aria-pressed="true"]')?.textContent).toContain('You · local player')
    await act(async () => option('Mila · tactician').click())
    expect(seat(1).querySelector('.player-name')?.textContent).toBe('Mila · tactician')
    expect(game.state.playerList[1]).toBe(PlayerType.Tactician)
  })

  it('pauses computer turns while rules are read and restores focus without restarting the game', async () => {
    await act(async () => game.setPlayerType(1, PlayerType.Hunter))
    await act(async () => game.startGame())
    const opener = button('Zasady gry')
    await act(async () => opener.click())
    expect(container.querySelector<HTMLDialogElement>('.rules-dialog')?.open).toBe(true)
    expect(game.state.paused).toBe(true)
    await act(async () => (container.querySelector('.rules-content') as HTMLElement).click())
    expect(container.querySelector<HTMLDialogElement>('.rules-dialog')?.open).toBe(true)
    const moves = game.state.movesCount
    await act(async () => vi.advanceTimersByTime(5000))
    expect(game.state.movesCount).toBe(moves)
    await act(async () => container.querySelector('.rules-dialog')!.dispatchEvent(new Event('cancel', { cancelable: true })))
    expect(container.querySelector('.rules-dialog')).toBeNull()
    expect(document.activeElement).toBe(opener)
    expect(document.body.style.overflow).not.toBe('hidden')
    expect(game.state.paused).toBe(true)
    await act(async () => button('Wznów grę').click())
    await act(async () => vi.advanceTimersByTime(game.state.time))
    expect(game.state.movesCount).toBe(moves + 1)
  })

  it('keeps descriptions in the picker and hides computer settings for a local-only match', async () => {
    expect(container.querySelectorAll('.player-card .player-description')).toHaveLength(0)
    await act(async () => seat(2).click())
    expect(container.querySelectorAll('.player-option .player-description')).toHaveLength(PlayersTypes.length)
    await act(async () => option('Ty · gracz lokalny').click())
    for (const id of [3, 4]) await act(async () => game.setPlayerType(id, PlayerType.None))
    expect(container.querySelector('.settings')).toBeNull()
    await act(async () => game.startGame())
    expect(container.querySelector('#players-title')?.textContent).toBe('Gracze')
    expect(container.querySelector('.turn-player')?.textContent).toBe('Zieloni')
    await act(async () => game.newGame())
    await act(async () => game.setPlayerType(2, PlayerType.Hunter))
    expect(container.querySelector<HTMLDetailsElement>('.settings')?.open).toBe(false)
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
  const english = container.querySelector('footer button[lang="en"]') as HTMLButtonElement;
  await act(async () => {
    english.click();
  });
  expect(JSON.stringify(game.state)).toBe(before);
  expect(container.querySelector('#turn-title')?.textContent).toBe('Your turn');
  expect(seat(1).querySelector('.player-name')?.textContent).toBe('You · local player');
  expect(localStorage.getItem('chinczyk-language')).toBe('en');
  expect(document.documentElement.lang).toBe('en');
});

it('shows the pawn identity instead of the owner mark on an occupied field, including home', async () => {
  for (const field of [0, 1, 2, 3, 4]) {
    await act(async () => root.render(<Square color={field} activeColor={4} disabled movable={false} x={0} y={0} onClick={() => {}}/>))
    expect(container.querySelectorAll('.player-symbol')).toHaveLength(1)
    expect(container.querySelector('.stone .player-symbol')?.getAttribute('data-player')).toBe('4')
    expect(container.querySelector('button')?.getAttribute('aria-label')).toContain('Niebiescy')
  }
});
