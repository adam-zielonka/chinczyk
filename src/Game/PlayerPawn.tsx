import * as React from 'react'
import { Colors } from './Consts'
import PlayerSymbol from './PlayerSymbol'

export const PawnSymbolsContext = React.createContext(false)

export default function PlayerPawn({ player }: { player: number }) {
  const showSymbols = React.useContext(PawnSymbolsContext)
  return <span className={`stone color-${Colors[player]}`} aria-hidden="true">{showSymbols && <PlayerSymbol player={player}/>}</span>
}
