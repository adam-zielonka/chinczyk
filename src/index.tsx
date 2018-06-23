import * as React from 'react'
import * as ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from './registerServiceWorker'

import Game from './Game/Game'

ReactDOM.render(
  <Game />,
  document.getElementById('root') as HTMLElement
)
registerServiceWorker()
