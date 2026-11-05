import * as React from 'react'
import { Colors } from './Consts'

// Seat identity stays the same when a human is replaced by a computer player.
const symbols = [null,
  <circle cx="12" cy="12" r="7" />,
  <path d="M12 2.5 14.9 8.4 21.4 9.4 16.7 14 17.8 20.5 12 17.4 6.2 20.5 7.3 14 2.6 9.4 9.1 8.4Z" />,
  <rect x="5.5" y="5.5" width="13" height="13" rx="1" />,
  <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z" />,
]

export default function PlayerSymbol({ player }: { player: number }) {
  return <svg className={`player-symbol color-${Colors[player]}`} data-player={player} viewBox="0 0 24 24"
    aria-hidden="true" focusable="false" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round">{symbols[player]}</svg>
}
