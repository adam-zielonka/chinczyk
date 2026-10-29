import * as React from 'react'

// Seat identity stays the same when a human is replaced by a computer player.
const symbols = [null,
  <circle cx="12" cy="12" r="7" />,
  <path d="M12 3 22 21H2Z" />,
  <rect x="4" y="4" width="16" height="16" rx="1" />,
  <path d="M8 2h8v6h6v8h-6v6H8v-6H2V8h6Z" />,
]

export default function PlayerSymbol({ player }: { player: number }) {
  return <svg className="player-symbol" data-player={player} viewBox="0 0 24 24"
    aria-hidden="true" focusable="false" fill="currentColor">{symbols[player]}</svg>
}
