import { catteGame } from './catte/logic'
import CatteBoard from './catte/components'

const gameRegistry = {
  catte: {
    ...catteGame,
    BoardComponent: CatteBoard,
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
