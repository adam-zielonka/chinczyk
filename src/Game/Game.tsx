import * as React from 'react'
import './Game.css'


const Colors = [
  'empty', 'green', 'yellow', 'red', 'blue'
]

const Filds = [
  [3,3, , ,0,0,4, , ,4,4,],
  [3,3, , ,0,4,0, , ,4,4,],
  [ , , , ,0,4,0, , , , ,],
  [ , , , ,0,4,0, , , , ,],
  [3,0,0,0,0,4,0,0,0,0,0,],
  [0,3,3,3,3,0,1,1,1,1,0,],
  [0,0,0,0,0,2,0,0,0,0,1,],
  [ , , , ,0,2,0, , , , ,],
  [ , , , ,0,2,0, , , , ,],
  [2,2, , ,0,2,0, , ,1,1,],
  [2,2, , ,2,0,0, , ,1,1,]
]

interface ISquareProps {
    color : number | undefined
    player? : number | undefined
}

function Square(props : ISquareProps) {
  const color = (props.color === undefined ? '' : 'bg-' + Colors[props.color])
  return (
      <button className={"square "+(color)}>
          &nbsp;
      </button>
  )
}

export default class Game extends React.Component {
  public render() {
    const row = []
    let squares = []
    for(let i = 0; i < Filds.length; i++) {
      for(let j = 0; j < Filds[i].length; j++) {
        squares.push(<Square key={`${i}-${j}`} color={Filds[i][j]} />)
      }
      row.push(<div key={`r-${i}`} className="board-row">{squares}</div>)
      squares = []
    }

    return (
      <div>
        {row}
      </div>
    )
  }
}