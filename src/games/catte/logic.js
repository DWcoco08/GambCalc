const DEFAULT_BASE_BET = 2000

export function createCattePlayerState() {
  return {
    streak: 0,
    loseStreak: 0,
    disabled: false,
  }
}

export function calculateWin(players, winnerId, isInstant, baseBet = DEFAULT_BASE_BET) {
  const winner = players.find(p => p.id === winnerId)
  if (!winner) return { players, changes: {} }

  const newStreak = (winner.gameState?.streak || 0) + 1
  const multiplier = newStreak * (isInstant ? 2 : 1)
  // Only active (not disabled) players participate
  const activePlayers = players.filter(p => !p.gameState?.disabled)
  const otherPlayers = activePlayers.filter(p => p.id !== winnerId)
  const winAmount = otherPlayers.length * baseBet * multiplier

  const changes = {}
  const updatedPlayers = players.map(p => {
    // Disabled players untouched
    if (p.gameState?.disabled) return p
    if (p.id === winnerId) {
      changes[p.id] = +winAmount
      return {
        ...p,
        money: p.money + winAmount,
        gameState: { ...p.gameState, streak: newStreak, loseStreak: 0 },
      }
    } else {
      const loss = baseBet * multiplier
      changes[p.id] = -loss
      return {
        ...p,
        money: p.money - loss,
        gameState: {
          ...p.gameState,
          streak: 0,
          loseStreak: (p.gameState?.loseStreak || 0) + 1,
        },
      }
    }
  })

  return {
    players: updatedPlayers,
    changes,
    details: {
      winnerId,
      winnerName: winner.name,
      action: isInstant ? 'Instant Win' : 'Win',
      streak: newStreak,
      multiplier,
      amount: winAmount,
      baseBet,
    },
  }
}

export const catteGame = {
  name: 'Cát Tê',
  icon: '🃏',
  slug: 'cat-te',
  defaultBaseBet: DEFAULT_BASE_BET,
  minPlayers: 2,
  maxPlayers: 8,
  hasStreak: true,
  createPlayerState: createCattePlayerState,
  actions: [
    { id: 'win', label: 'Thắng', color: 'green' },
    { id: 'instant', label: 'Thắng Tới Trắng', color: 'yellow' },
  ],
  executeAction(players, winnerId, actionId, baseBet) {
    const isInstant = actionId === 'instant'
    return calculateWin(players, winnerId, isInstant, baseBet)
  },
  getPlayerStats(player) {
    return [
      { label: 'Streak', value: player.gameState?.streak || 0 },
    ]
  },
  guide: {
    title: 'Hướng dẫn Cát Tê',
    sections: [
      {
        heading: '🎯 Cách chơi',
        items: [
          'Chọn người thắng ván → bấm Thắng hoặc Tới Trắng',
          'Người thắng nhận tiền từ tất cả người thua',
          'Người thua bị trừ tiền theo mức cược',
        ],
      },
      {
        heading: '💰 Cách tính tiền',
        items: [
          'Thắng thường: (số người thua) × cược × chuỗi thắng',
          'Tới trắng: (số người thua) × cược × chuỗi thắng × 2',
        ],
      },
      {
        heading: '📊 Ví dụ (4 người, cược 2k)',
        table: [
          ['Kiểu', 'Chuỗi', 'Thắng', 'Mỗi người thua'],
          ['Thường', '1', '+6k', '-2k'],
          ['Thường', '2', '+12k', '-4k'],
          ['Thường', '3', '+18k', '-6k'],
          ['Tới trắng', '1', '+12k', '-4k'],
          ['Tới trắng', '2', '+24k', '-8k'],
          ['Tới trắng', '3', '+36k', '-12k'],
        ],
      },
      {
        heading: '🔥 Chuỗi thắng (Win Streak)',
        items: [
          'Mỗi ván thắng liên tiếp +1 chuỗi',
          'Thua → reset chuỗi về 0',
          'Chuỗi càng cao, tiền thắng/thua càng lớn',
        ],
      },
      {
        heading: '🏆 Badge khi THẮNG',
        badges: [
          { icon: '🔥 1', desc: 'Bắt đầu chuỗi thắng', color: 'orange' },
          { icon: '🔥 2+', desc: 'Card phát sáng cam, badge lửa bùng nổ', color: 'orange' },
          { icon: '🔥 3-4', desc: 'Chuỗi lửa mạnh', color: 'red' },
          { icon: '👹 5+', desc: 'DEMON MODE — Aura đỏ tím bốc lửa, card rung, badge khủng bố', color: 'demon' },
        ],
      },
      {
        heading: '💀 Badge khi THUA',
        badges: [
          { icon: '📉 3-4', desc: 'Bắt đầu chuỗi thua', color: 'red-light' },
          { icon: '😰 5+', desc: 'Card phát sáng xanh', color: 'blue' },
          { icon: '😢 10+', desc: 'Badge rung lắc — Xui', color: 'red' },
          { icon: '😭 15+', desc: 'Thảm', color: 'purple' },
          { icon: '🥶 20+', desc: 'Đóng băng', color: 'blue' },
          { icon: '💀 25+', desc: 'Đen', color: 'gray' },
          { icon: '☠️ 30+', desc: 'Đen tuyệt đối', color: 'black' },
        ],
      },
      {
        heading: '💸 Mốc thua tiền',
        badges: [
          { icon: '📉 -30k', desc: 'Thua 30 ngàn', color: 'red-light' },
          { icon: '🔻 -50k', desc: 'Thua 50 ngàn', color: 'red' },
          { icon: '💸 -100k', desc: 'Thua 100 ngàn', color: 'red-dark' },
          { icon: '🏚️ -200k', desc: 'Thua 200 ngàn — Phá sản', color: 'black' },
        ],
      },
    ],
  },
}
