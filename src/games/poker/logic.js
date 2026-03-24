const DEFAULT_BASE_BET = 2000
const STARTING_CHIPS = 50

export function createPokerPlayerState() {
  return {
    chips: STARTING_CHIPS,
    totalBuyIn: 0,
  }
}

// Place initial bets - deduct chips immediately
export function placeBets(players, bets) {
  const changes = {}
  const updatedPlayers = players.map(p => {
    const bet = bets[p.id] || 0
    if (bet <= 0) return p
    changes[p.id] = -bet
    return {
      ...p,
      money: p.money - bet,
      gameState: { ...p.gameState, chips: p.gameState.chips - bet },
    }
  })
  const totalPot = Object.values(bets).reduce((sum, b) => sum + b, 0)
  return {
    players: updatedPlayers,
    changes,
    details: { action: 'Bet', amount: totalPot, bets },
  }
}

// Raise - deduct chips from raiser immediately
export function placeRaise(players, playerId, amount) {
  const player = players.find(p => p.id === playerId)
  if (!player) return null
  const actual = Math.min(amount, player.gameState.chips)
  if (actual <= 0) return null

  const changes = { [playerId]: -actual }
  const updatedPlayers = players.map(p => {
    if (p.id !== playerId) return p
    return {
      ...p,
      money: p.money - actual,
      gameState: { ...p.gameState, chips: p.gameState.chips - actual },
    }
  })
  return {
    players: updatedPlayers,
    changes,
    details: { action: 'Raise', playerId, playerName: player.name, amount: actual },
  }
}

// Call raise - deduct chips from caller immediately
export function placeCall(players, playerId, amount) {
  const player = players.find(p => p.id === playerId)
  if (!player) return null
  const actual = Math.min(amount, player.gameState.chips)
  if (actual <= 0) return null

  const changes = { [playerId]: -actual }
  const updatedPlayers = players.map(p => {
    if (p.id !== playerId) return p
    return {
      ...p,
      money: p.money - actual,
      gameState: { ...p.gameState, chips: p.gameState.chips - actual },
    }
  })
  return {
    players: updatedPlayers,
    changes,
    details: { action: 'Call', playerId, playerName: player.name, amount: actual },
  }
}

// Award pot to winner - only add chips, no deduction (already deducted)
export function awardPot(players, winnerId, totalPot) {
  const winner = players.find(p => p.id === winnerId)
  if (!winner) return null

  const changes = { [winnerId]: totalPot }
  const updatedPlayers = players.map(p => {
    if (p.id !== winnerId) return p
    return {
      ...p,
      money: p.money + totalPot,
      gameState: { ...p.gameState, chips: p.gameState.chips + totalPot },
    }
  })
  return {
    players: updatedPlayers,
    changes,
    details: {
      winnerId,
      winnerName: winner.name,
      action: 'Win Pot',
      amount: totalPot,
    },
  }
}

// Buy more chips
export function buyInChips(players, playerId) {
  const updatedPlayers = players.map(p => {
    if (p.id !== playerId) return p
    return {
      ...p,
      gameState: {
        ...p.gameState,
        chips: p.gameState.chips + STARTING_CHIPS,
        totalBuyIn: (p.gameState.totalBuyIn || 0) + STARTING_CHIPS,
      },
    }
  })
  return {
    players: updatedPlayers,
    changes: {},
    details: {
      action: 'Buy-in',
      playerId,
      playerName: players.find(p => p.id === playerId)?.name,
      amount: STARTING_CHIPS,
    },
  }
}

export const pokerGame = {
  name: 'Poker',
  icon: '🎰',
  slug: 'poker',
  defaultBaseBet: 0,
  hideBaseBet: true,
  minPlayers: 2,
  maxPlayers: 8,
  hasStreak: false,
  startingChips: STARTING_CHIPS,
  createPlayerState: createPokerPlayerState,
  actions: [],
  executeAction() { return null },
  getPlayerStats(player) {
    return [
      { label: 'Chips', value: player.gameState?.chips || 0 },
    ]
  },
  guide: {
    title: 'Hướng dẫn Poker',
    sections: [
      {
        heading: '🎯 Luật chơi',
        items: [
          'Mỗi người bắt đầu với 50 chip',
          'Đặt chip vào pot → chip trừ liền',
          'Trải qua 3 vòng cược, cuối cùng so bài',
          'Ai thắng lấy hết pot',
        ],
      },
      {
        heading: '🃏 Flow mỗi ván',
        items: [
          '1. Đặt chip vào pot (mỗi người chọn số chip)',
          '2. Vòng 1: Xem 3 lá → có thể Tố / Bỏ',
          '3. Vòng 2: Lá thứ 4 → có thể Tố / Bỏ',
          '4. Vòng 3: Lá thứ 5 → So bài',
          '5. Chọn người thắng → pot gom về',
        ],
      },
      {
        heading: '⬆ Quy tắc Tố',
        items: [
          'Tố = đặt mức cược cho vòng (1-5 chip)',
          'Mức tố tối đa: 5 chip',
          'Khi bị tố: phải Theo (trả phần chênh lệch) hoặc Bỏ',
          'Có thể tố lại cao hơn (nếu chưa đạt mức 5)',
          'Chip trừ liền khi tố hoặc theo',
        ],
      },
      {
        heading: '📊 Ví dụ tố',
        table: [
          ['Hành động', 'Mức', 'Người khác'],
          ['A tố 1', '1', 'Phải theo 1 hoặc bỏ'],
          ['B theo 1', '1', '—'],
          ['C tố lên 5', '5', 'A,B phải theo thêm 4 hoặc bỏ'],
          ['A theo +4', '5', '—'],
          ['B bỏ', '—', 'Mất chip đã bỏ'],
        ],
      },
      {
        heading: '👁 Theo / ❌ Bỏ',
        badges: [
          { icon: '👁 Theo', desc: 'Trả phần chênh lệch để ở lại ván', color: 'blue' },
          { icon: '⬆ Tố', desc: 'Đặt mức mới (1-5), người khác phải theo hoặc bỏ', color: 'orange' },
          { icon: '❌ Bỏ', desc: 'Bỏ ván, mất chip đã đặt', color: 'red' },
        ],
      },
      {
        heading: '💰 Mua thêm chip',
        items: [
          'Hết chip → bấm "+Mua 50" bất kỳ lúc nào',
          'Có thể mua ngay giữa vòng cược để theo/tố tiếp',
          'Cuối game: chip còn - (50 + chip mua thêm) = lời/lỗ',
        ],
      },
    ],
  },
}
