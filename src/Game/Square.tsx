import * as React from 'react'
import { Colors } from './Consts'

interface ISquareProps {
  color: number
  activeColor: number
  disabled: boolean
  player?: number
  x: number
  y: number
  onClick(): void
}

export default function Square(props: ISquareProps) {
const color = (props.color === undefined ? '' : 'bg-' + Colors[props.color])
const stone = (<div className={'p-' + Colors[props.activeColor]}>&#11044;</div>)
const numbers = '' // (<div className='numbers'>{props.x} {props.y}</div>)
return (
    <button className={'square ' + (color)} onClick={props.onClick} disabled={props.disabled}>
      {props.activeColor ? stone : props.color !== undefined ? numbers : ''}
      {/* {props.color !== undefined ? numbers : ''} */}
    </button>
)
}
