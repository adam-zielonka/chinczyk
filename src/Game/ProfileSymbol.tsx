import * as React from 'react'
import { PlayerType } from './PlayerProfiles'

// Profile icons describe the playing style; pawn symbols identify the seat.
const symbols: Record<PlayerType, React.ReactNode> = {
  [PlayerType.Human]: <><circle cx="12" cy="7" r="3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3"/></>,
  [PlayerType.FirstAI]: <><circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6Z"/></>,
  [PlayerType.LastAI]: <path d="m13 2-9 12h7l-1 8 10-13h-8Z"/>,
  [PlayerType.Random]: <><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7 7h.01M17 7h.01M12 12h.01M7 17h.01M17 17h.01" strokeWidth="3"/></>,
  [PlayerType.AZ]: <><path d="m12 2 8 3v6c0 5-4 9-8 11-4-2-8-6-8-11V5Z"/><path d="m8 12 3 3 5-6"/></>,
  [PlayerType.MCTS]: <><path d="M12 7v4M5 17v-6h14v6M12 11v6"/><circle cx="12" cy="4" r="3"/><circle cx="5" cy="20" r="2"/><circle cx="12" cy="20" r="2"/><circle cx="19" cy="20" r="2"/></>,
  [PlayerType.Hunter]: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 1v5M12 18v5M1 12h5M18 12h5"/></>,
  [PlayerType.Tactician]: <><path d="M6 20v-6a8 8 0 0 1 8-8h4M14 2l4 4-4 4M2 6l6 6M2 12l6-6"/><circle cx="6" cy="20" r="2"/></>,
  [PlayerType.None]: <><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/></>,
}

export default function ProfileSymbol({ type }: { type: PlayerType }) {
  return <svg className="profile-symbol" data-profile={type} viewBox="0 0 24 24" aria-hidden="true"
    focusable="false" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{symbols[type]}</svg>
}
