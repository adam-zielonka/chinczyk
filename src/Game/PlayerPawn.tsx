import * as React from 'react'
import { Colors } from './Consts'
import PlayerSymbol from './PlayerSymbol'

export default function PlayerPawn({ player }: { player: number }) {
  return <span className={`stone color-${Colors[player]}`} aria-hidden="true"><PlayerSymbol player={player}/></span>
}
