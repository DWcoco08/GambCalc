import { supabase } from '../lib/supabase'
import {
  saveToHistory as localSaveToHistory,
  loadHistory as localLoadHistory,
  softDeleteMatch as localSoftDelete,
  restoreMatch as localRestore,
  permanentDeleteMatch as localPermanentDelete,
  clearHistory as localClearHistory,
  restoreAllDeleted as localRestoreAll,
  permanentDeleteAllDeleted as localPermanentDeleteAll,
} from '../utils/storage'

const PENDING_SYNC_KEY = 'gambcalc_pending_sync'

// --- Supabase operations ---

async function saveMatchToSupabase(match, userId) {
  if (!supabase) return

  // 1. Insert match
  const { error: matchError } = await supabase.from('matches').upsert({
    id: match.id,
    user_id: userId,
    game_id: match.gameId,
    game_name: match.gameName,
    base_bet: match.baseBet,
    total_rounds: match.round,
    started_at: match.startedAt,
    ended_at: match.endedAt,
    deleted: match.deleted || false,
    deleted_at: match.deletedAt || null,
  })
  if (matchError) throw matchError

  // 2. Insert players
  const ranking = match.ranking || [...match.players].sort((a, b) => b.money - a.money)
  const playerRows = ranking.map((p, i) => ({
    match_id: match.id,
    player_id: p.id,
    player_name: p.name,
    final_money: p.money,
    rank: i + 1,
    game_state: p.gameState || null,
  }))

  // Delete existing players first (for upsert-like behavior)
  await supabase.from('match_players').delete().eq('match_id', match.id)
  const { error: playersError } = await supabase.from('match_players').insert(playerRows)
  if (playersError) throw playersError

  // 3. Insert logs
  if (match.logs && match.logs.length > 0) {
    await supabase.from('match_logs').delete().eq('match_id', match.id)
    const logRows = match.logs.map(log => ({
      match_id: match.id,
      round: log.round,
      winner_id: log.winnerId,
      winner_name: log.winnerName,
      action: log.action,
      streak: log.streak,
      multiplier: log.multiplier,
      amount: log.amount,
      base_bet: log.baseBet,
      changes: log.changes,
      logged_at: log.timestamp,
    }))
    const { error: logsError } = await supabase.from('match_logs').insert(logRows)
    if (logsError) throw logsError
  }
}

async function loadHistoryFromSupabase(userId) {
  if (!supabase) return null

  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })

  if (error) throw error
  if (!matches || matches.length === 0) return []

  // Load players and logs for each match
  const matchIds = matches.map(m => m.id)

  const [{ data: allPlayers }, { data: allLogs }] = await Promise.all([
    supabase.from('match_players').select('*').in('match_id', matchIds).order('rank'),
    supabase.from('match_logs').select('*').in('match_id', matchIds).order('round'),
  ])

  return matches.map(m => {
    const players = (allPlayers || [])
      .filter(p => p.match_id === m.id)
      .map(p => ({
        id: p.player_id,
        name: p.player_name,
        money: p.final_money,
        gameState: p.game_state,
      }))

    const logs = (allLogs || [])
      .filter(l => l.match_id === m.id)
      .map(l => ({
        id: l.id.toString(),
        round: l.round,
        winnerId: l.winner_id,
        winnerName: l.winner_name,
        action: l.action,
        streak: l.streak,
        multiplier: l.multiplier,
        amount: l.amount,
        baseBet: l.base_bet,
        changes: l.changes,
        timestamp: l.logged_at,
      }))

    const ranking = [...players].sort((a, b) => b.money - a.money)

    return {
      id: m.id,
      gameId: m.game_id,
      gameName: m.game_name,
      baseBet: m.base_bet,
      round: m.total_rounds,
      startedAt: m.started_at,
      endedAt: m.ended_at,
      deleted: m.deleted,
      deletedAt: m.deleted_at,
      players,
      ranking,
      logs,
      active: false,
    }
  })
}

// --- Pending sync queue ---

function getPendingSyncs() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_SYNC_KEY) || '[]')
  } catch { return [] }
}

function addPendingSync(matchId) {
  const pending = getPendingSyncs()
  if (!pending.includes(matchId)) {
    pending.push(matchId)
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending))
  }
}

function removePendingSync(matchId) {
  const pending = getPendingSyncs().filter(id => id !== matchId)
  localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending))
}

// --- Public API ---

export async function saveCompletedMatch(match, userId) {
  // Always save locally
  localSaveToHistory(match)

  // If logged in, try to save to Supabase
  if (userId && supabase) {
    try {
      await saveMatchToSupabase(match, userId)
      removePendingSync(match.id)
    } catch (err) {
      console.warn('Failed to sync match to Supabase, queued for later:', err)
      addPendingSync(match.id)
    }
  }
}

export async function loadMatchHistory(userId) {
  if (userId && supabase) {
    try {
      // Logged in: use Supabase as source of truth
      const cloudHistory = await Promise.race([
        loadHistoryFromSupabase(userId),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
      ])
      return cloudHistory || []
    } catch {
      // Supabase failed: fallback to local
      return localLoadHistory()
    }
  }
  // Not logged in: use localStorage only
  return localLoadHistory()
}

export async function softDeleteMatchService(matchId, userId) {
  localSoftDelete(matchId)

  if (userId && supabase) {
    try {
      await supabase.from('matches').update({
        deleted: true,
        deleted_at: new Date().toISOString(),
      }).eq('id', matchId).eq('user_id', userId)
    } catch (err) {
      console.warn('Failed to soft delete on Supabase:', err)
    }
  }
}

export async function restoreMatchService(matchId, userId) {
  localRestore(matchId)

  if (userId && supabase) {
    try {
      await supabase.from('matches').update({
        deleted: false,
        deleted_at: null,
      }).eq('id', matchId).eq('user_id', userId)
    } catch (err) {
      console.warn('Failed to restore on Supabase:', err)
    }
  }
}

export async function permanentDeleteMatchService(matchId, userId) {
  localPermanentDelete(matchId)

  if (userId && supabase) {
    try {
      await supabase.from('matches').delete().eq('id', matchId).eq('user_id', userId)
    } catch (err) {
      console.warn('Failed to permanent delete on Supabase:', err)
    }
  }
}

export async function clearHistoryService(userId) {
  localClearHistory()

  if (userId && supabase) {
    try {
      await supabase.from('matches').update({
        deleted: true,
        deleted_at: new Date().toISOString(),
      }).eq('user_id', userId)
    } catch (err) {
      console.warn('Failed to clear history on Supabase:', err)
    }
  }
}

export async function restoreAllService(userId) {
  localRestoreAll()

  if (userId && supabase) {
    try {
      await supabase.from('matches').update({
        deleted: false,
        deleted_at: null,
      }).eq('user_id', userId).eq('deleted', true)
    } catch (err) {
      console.warn('Failed to restore all on Supabase:', err)
    }
  }
}

export async function permanentDeleteAllService(userId) {
  localPermanentDeleteAll()

  if (userId && supabase) {
    try {
      const { data } = await supabase.from('matches').select('id').eq('user_id', userId).eq('deleted', true)
      if (data && data.length > 0) {
        const ids = data.map(m => m.id)
        await supabase.from('matches').delete().in('id', ids).eq('user_id', userId)
      }
    } catch (err) {
      console.warn('Failed to permanent delete all on Supabase:', err)
    }
  }
}

// --- Sync pending matches ---

export async function syncPendingMatches(userId) {
  if (!userId || !supabase) return

  const pendingIds = getPendingSyncs()
  if (pendingIds.length === 0) return

  const history = localLoadHistory()

  for (const id of pendingIds) {
    const match = history.find(m => m.id === id)
    if (match) {
      try {
        await saveMatchToSupabase(match, userId)
        removePendingSync(id)
      } catch {
        // leave in queue
      }
    } else {
      // Match not found locally, remove from queue
      removePendingSync(id)
    }
  }
}

// --- Upload existing localStorage history to Supabase (first-login) ---

export async function uploadLocalHistoryToCloud(userId) {
  if (!userId || !supabase) return 0

  const localHistory = localLoadHistory()
  let synced = 0

  for (const match of localHistory) {
    try {
      await saveMatchToSupabase(match, userId)
      synced++
    } catch {
      // skip failed ones
    }
  }

  return synced
}
