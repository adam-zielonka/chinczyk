import { PlayerFilds } from '../Consts'
import Game from '../Game'
import Player from './Player'

export default class PlayerAZ extends Player {

  getZone(n: number) {
    return Math.floor(n / 10)
  }

  fieldsOfDestruction(game: Game) {
    const fields = game.getState().filds
    const token = game.getState().token
    const count = game.getState().dice.state
    let board = []
    for (const id of PlayerFilds[token].order) {
      board = board.concat(PlayerFilds[id].board)
    }
    board = board.concat(PlayerFilds[token].home)

    const stones = []
    const destruction = []

    let i = 0
    const result = board.map(field => {
      const fieldValue = fields[field[1]][field[0]]
      if (fieldValue !== token && fieldValue !== 0) {
        stones.push(i)

        const zone = this.getZone(i)
        const endZoneSteps = (10 * (zone + 1) - i) - 1
        // console.log(endZoneSteps)
        if (endZoneSteps >= 6) {
          destruction.push(6)
        } else {
          switch (true) {
            case fieldValue === 1 && PlayerFilds[this.id].order[zone] === 4:
            case fieldValue === 2 && PlayerFilds[this.id].order[zone] === 1:
            case fieldValue === 3 && PlayerFilds[this.id].order[zone] === 2:
            case fieldValue === 4 && PlayerFilds[this.id].order[zone] === 3:
              destruction.push(endZoneSteps)
              break
            default:
              destruction.push(6)
          }
        }
      }
      ++i
      return 0
    })

    console.log(stones)
    console.log(destruction)

    for (let n = 0; n < stones.length; ++n) {
      for (let k = 1; k <= destruction[n]; ++k) {
        if (result.length - 4 > stones[n] + k) {
          ++result[stones[n] + k]
        } else {
          ++result[stones[n] + k - result.length + 4]
        }
      }
    }

    let j = 0
    for (const playerid of PlayerFilds[this.id].order) {
      if (playerid !== token) {
        for (const field of PlayerFilds[playerid].start) {
          if (fields[field[1]][field[0]] === playerid) {
            result[10 * j] += 1
            break
          }
        }
      }
      ++j
    }

    return [result, board]
  }

  selectBestAction(result, metaResult): number {
    let selectedAction = 0
    let point = Number.MAX_VALUE
    const points = []
    let i = 0
    for (const fieldID of metaResult) {
      points.push(result[fieldID])
      if (result[fieldID] <= point) {
        selectedAction = i
        point = result[fieldID]
      }
      ++i
    }
    console.log(points)
    return selectedAction
  }

  selectDangerAction(result, metaStart): number {
    let selectedAction = 0
    let point = Number.MIN_VALUE
    const points = []
    let i = 0
    for (const fieldID of metaStart) {
      points.push(result[fieldID])
      if (result[fieldID] >= point) {
        selectedAction = i
        point = result[fieldID]
      }
      ++i
    }
    console.log(points)
    if (!point) {
      return selectedAction
    } else {
      return null
    }
  }


  play(game: Game) {
    super.play(game)
    const actions = game.posibleActions()
    const [metaResult, metaStart] = game.posibleActionsMetaData()
    switch (actions.length) {
      case 0:
        game.noMoves()
        break
      case 1:
        game.onClick(actions[0][1], actions[0][0])
        break
      default:
        console.log('AZ')
        const [result, board] = this.fieldsOfDestruction(game)
        console.log(result)
        let selectedAction = this.selectBestAction(result, metaResult)
        const dangerAction = this.selectDangerAction(result, metaStart)
        if (dangerAction) {
          selectedAction = dangerAction
        }
        game.onClick(actions[selectedAction][1], actions[selectedAction][0])
        break
    }


  }

}
