import { catteGame } from './catte/logic'
import CatteBoard from './catte/components'
import { pokerGame } from './poker/logic'
import PokerBoard from './poker/components'
import { pokerCalcGame } from './pokercalc/logic'
import PokerCalcBoard from './pokercalc/components'

const gameRegistry = {
  catte: {
    ...catteGame,
    BoardComponent: CatteBoard,
  },
  poker: {
    ...pokerGame,
    BoardComponent: PokerBoard,
  },
  pokercalc: {
    ...pokerCalcGame,
    BoardComponent: PokerCalcBoard,
  },
}

export function getGame(gameId) {
  return gameRegistry[gameId] || null
}

export function getAllGames() {
  return Object.entries(gameRegistry).map(([id, game]) => ({
    id,
    name: game.name,
    icon: game.icon,
  }))
}

export default gameRegistry
