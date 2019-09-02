import * as React from 'react'
import { Colors } from './Consts'

type Props = {
  color: number
  activeColor: number
  disabled: boolean
  player?: number
  x: number
  y: number
  onClick(): void
}

const Square: React.FC<Props> = ({ color, activeColor, disabled, player, x, y, onClick }) => {
  const bgColorClass = color === undefined ? '' : 'bg-' + Colors[color]

  return <button className={'square ' + bgColorClass} disabled={disabled} onClick={onClick}>
    {activeColor ? <Stone color={activeColor} /> :
      // color !== undefined ? <Numbers x={x} y={y} /> :
        ''}
  </button>
}

export default Square

const Stone: React.FC<{ color: number }> = ({ color }) => <div className={'p-' + Colors[color]}>&#11044;</div>
const Numbers: React.FC<{ x: number, y: number }> = ({ x, y }) => <div className='numbers'>{x} {y}</div>
