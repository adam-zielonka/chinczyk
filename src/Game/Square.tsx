import { t } from "../i18n"
import * as React from 'react'
import { Colors } from './Consts'
import { ColorNames } from './PlayerProfiles'
import PlayerSymbol from './PlayerSymbol'

type Props = {
  color: number
  activeColor: number
  disabled: boolean
  movable: boolean
  x: number
  y: number
  onClick(): void
}

const Square: React.FC<Props> = ({ color, activeColor, disabled, movable, x, y, onClick }) => {
  if (color === undefined) return <span className="square-void" aria-hidden="true" />
  return <button className={`square bg-${Colors[color]} ${movable ? 'can-move' : ''}`} disabled={disabled} onClick={onClick}
    aria-label={t("{piece}, rząd {row}, kolumna {col}{hint}", {
      piece: activeColor ? t("Pionek: {color}", { color: t(ColorNames[activeColor]) }) : t("Puste pole"),
      row: y + 1, col: x + 1, hint: movable ? t(", możesz ruszyć") : ""
    })}>
      {activeColor ? <span className={`stone color-${Colors[activeColor]}`}><PlayerSymbol player={activeColor}/></span>
        : color ? <PlayerSymbol player={color}/> : <span className="field-mark"/>}
  </button>
}
export default Square
