const STARTING_CHIPS = 50

export function createPokerCalcPlayerState() {
  return {
    chips: STARTING_CHIPS,
    totalBuyIn: 0,
  }
}

// Transfer chips from one player to another
export function transferChips(players, fromId, toId, amount) {
  const from = players.find(p => p.id === fromId)
  const to = players.find(p => p.id === toId)
  if (!from || !to) return null
  const actual = Math.min(amount, from.gameState.chips)
  if (actual <= 0) return null

  const changes = { [fromId]: -actual, [toId]: actual }
  const updatedPlayers = players.map(p => {
    if (p.id === fromId) return { ...p, money: p.money - actual, gameState: { ...p.gameState, chips: p.gameState.chips - actual } }
    if (p.id === toId) return { ...p, money: p.money + actual, gameState: { ...p.gameState, chips: p.gameState.chips + actual } }
    return p
  })
  return {
    players: updatedPlayers,
    changes,
    details: { action: 'Transfer', fromId, fromName: from.name, toName: to.name, winnerId: toId, winnerName: to.name, amount: actual },
  }
}

// Collect chips from multiple players into a pot, then give to winner
export function collectAndAward(players, contributions, winnerId) {
  const winner = players.find(p => p.id === winnerId)
  if (!winner) return null

  const totalPot = Object.values(contributions).reduce((sum, c) => sum + c, 0)
  if (totalPot <= 0) return null

  const changes = {}
  const updatedPlayers = players.map(p => {
    const contrib = contributions[p.id] || 0
    if (p.id === winnerId) {
      const net = totalPot - contrib
      changes[p.id] = net
      return { ...p, money: p.money + net, gameState: { ...p.gameState, chips: p.gameState.chips + net } }
    } else if (contrib > 0) {
      changes[p.id] = -contrib
      return { ...p, money: p.money - contrib, gameState: { ...p.gameState, chips: p.gameState.chips - contrib } }
    }
    return p
  })
  return {
    players: updatedPlayers,
    changes,
    details: { action: 'Win Pot', winnerId, winnerName: winner.name, amount: totalPot },
  }
}

// Buy more chips
export function buyInChips(players, playerId) {
  const updatedPlayers = players.map(p => {
    if (p.id !== playerId) return p
    return {
      ...p,
      gameState: { ...p.gameState, chips: p.gameState.chips + STARTING_CHIPS, totalBuyIn: (p.gameState.totalBuyIn || 0) + STARTING_CHIPS },
    }
  })
  return {
    players: updatedPlayers,
    changes: {},
    details: { action: 'Buy-in', playerId, playerName: players.find(p => p.id === playerId)?.name, amount: STARTING_CHIPS },
  }
}

export const pokerCalcGame = {
  name: 'Poker Calc',
  icon: '🧮',
  slug: 'poker-calc',
  defaultBaseBet: 0,
  hideBaseBet: true,
  minPlayers: 2,
  maxPlayers: 8,
  hasStreak: false,
  startingChips: STARTING_CHIPS,
  createPlayerState: createPokerCalcPlayerState,
  actions: [],
  executeAction() { return null },
  getPlayerStats(player) {
    return [{ label: 'Chips', value: player.gameState?.chips || 0 }]
  },
  guide: {
    title: 'Poker Calc - Máy tính chip',
    sections: [
      {
        heading: '🎯 Cách dùng',
        items: [
          'Mỗi người bắt đầu với 50 chip',
          'Dùng để quản lý chip khi chơi poker thật',
          'Chuyển chip giữa người chơi hoặc gom pot',
        ],
      },
      {
        heading: '💰 Chức năng',
        badges: [
          { icon: '🔄 Chuyển', desc: 'Chuyển chip từ người này sang người kia', color: 'blue' },
          { icon: '🪙 Gom pot', desc: 'Thu chip nhiều người → chọn winner lấy hết', color: 'orange' },
          { icon: '🛒 Mua thêm', desc: 'Mua thêm 50 chip khi hết', color: 'purple' },
        ],
      },
      {
        heading: '📊 Cuối game',
        items: [
          'Chip còn lại - (50 + chip mua thêm) = lời/lỗ',
          'Kết thúc ván → xem bảng xếp hạng tổng kết',
        ],
      },
    ],
  },
}
