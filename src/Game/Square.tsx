import * as React from 'react'
import { Colors } from './Consts'
import { ColorNames } from './PlayerProfiles'

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
    aria-label={`${activeColor ? `Pionek: ${ColorNames[activeColor]}` : 'Puste pole'}, rząd ${y + 1}, kolumna ${x + 1}${movable ? ', możesz ruszyć' : ''}`}>
    {activeColor ? <span className={`stone color-${Colors[activeColor]}`}><span/></span> : <span className="field-mark"/>}
  </button>
}
export default Square
