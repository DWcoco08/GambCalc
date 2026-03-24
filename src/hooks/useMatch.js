import { useState, useCallback, useEffect, useRef } from 'react'
import { getGame } from '../games/registry'
import { saveMatch, loadMatch, clearMatch, saveUndoStack, loadUndoStack } from '../utils/storage'
import { saveCompletedMatch, syncPendingMatches } from '../services/matchService'
import useAuth from './useAuth'

const REDO_STORAGE_KEY = 'gambcalc_redo_stack'

let nextPlayerId = 1

function createPlayer(name, createPlayerState) {
  return {
    id: nextPlayerId++,
    name,
    money: 0,
    gameState: createPlayerState(),
    lastChange: null,
    animClass: '',
  }
}

export default function useMatch() {
  const { user } = useAuth()
  const [match, setMatch] = useState(null)
  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])
  const animTimerRef = useRef(null)

  // Load saved state on mount
  useEffect(() => {
    const saved = loadMatch()
    if (saved) {
      setMatch(saved)
      nextPlayerId = Math.max(...saved.players.map(p => p.id), 0) + 1
    }
    const savedUndo = loadUndoStack()
    if (savedUndo.length > 0) setUndoStack(savedUndo)

    const savedRedo = localStorage.getItem(REDO_STORAGE_KEY)
    if (savedRedo) {
      try { setRedoStack(JSON.parse(savedRedo)) } catch {}
    }
  }, [])

  // Persist
  useEffect(() => {
    if (match) saveMatch(match)
  }, [match])

  useEffect(() => {
    saveUndoStack(undoStack)
  }, [undoStack])

  useEffect(() => {
    localStorage.setItem(REDO_STORAGE_KEY, JSON.stringify(redoStack))
  }, [redoStack])

  const startMatch = useCallback((gameId, playerNames, baseBet) => {
    const game = getGame(gameId)
    if (!game) return

    const players = playerNames.map(name => createPlayer(name, game.createPlayerState))
    const newMatch = {
      id: Date.now().toString(),
      gameId,
      gameName: game.name,
      players,
      baseBet: baseBet || game.defaultBaseBet,
      round: 0,
      logs: [],
      startedAt: new Date().toISOString(),
      active: true,
    }
    setMatch(newMatch)
    setUndoStack([])
    setRedoStack([])
  }, [])

  const executeAction = useCallback((playerId, actionId) => {
    if (!match || !match.active) return

    const game = getGame(match.gameId)
    if (!game) return

    // Save current state for undo, clear redo (new action breaks redo chain)
    setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(match))])
    setRedoStack([])

    const result = game.executeAction(match.players, playerId, actionId, match.baseBet)
    const newRound = match.round + 1

    const playersWithAnim = result.players.map(p => ({
      ...p,
      lastChange: result.changes[p.id] || 0,
      animClass: result.changes[p.id] > 0 ? 'animate-pulse-green' : result.changes[p.id] < 0 ? 'animate-pulse-red' : '',
    }))

    // Clear previous animation timer to avoid race condition
    if (animTimerRef.current) clearTimeout(animTimerRef.current)
    animTimerRef.current = setTimeout(() => {
      animTimerRef.current = null
      setMatch(prev => {
        if (!prev) return prev
        return {
          ...prev,
          players: prev.players.map(p => ({ ...p, lastChange: null, animClass: '' })),
        }
      })
    }, 2000)

    const logEntry = {
      id: Date.now().toString(),
      round: newRound,
      ...result.details,
      changes: result.changes,
      timestamp: new Date().toISOString(),
    }

    setMatch(prev => ({
      ...prev,
      players: playersWithAnim,
      round: newRound,
      logs: [...prev.logs, logEntry],
    }))
  }, [match])

  const undo = useCallback(() => {
    if (undoStack.length === 0) return
    // Push current state to redo
    setRedoStack(prev => [...prev, JSON.parse(JSON.stringify(match))])
    const previousState = undoStack[undoStack.length - 1]
    setMatch(previousState)
    setUndoStack(prev => prev.slice(0, -1))
  }, [undoStack, match])

  const redo = useCallback(() => {
    if (redoStack.length === 0) return
    // Push current state to undo
    setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(match))])
    const nextState = redoStack[redoStack.length - 1]
    setMatch(nextState)
    setRedoStack(prev => prev.slice(0, -1))
  }, [redoStack, match])

  // Sync pending matches when user logs in
  useEffect(() => {
    if (user?.id) {
      syncPendingMatches(user.id)
    }
  }, [user?.id])

  const endMatch = useCallback(() => {
    if (!match) return null

    const summary = {
      ...match,
      active: false,
      endedAt: new Date().toISOString(),
      ranking: [...match.players].sort((a, b) => b.money - a.money),
    }

    // Save via service layer (localStorage + Supabase if logged in)
    saveCompletedMatch(summary, user?.id)

    clearMatch()
    localStorage.removeItem(REDO_STORAGE_KEY)
    setMatch(null)
    setUndoStack([])
    setRedoStack([])
    return summary
  }, [match, user?.id])

  const addPlayer = useCallback((name) => {
    if (!match) return
    const game = getGame(match.gameId)
    if (!game || match.players.length >= game.maxPlayers) return

    setMatch(prev => ({
      ...prev,
      players: [...prev.players, createPlayer(name, game.createPlayerState)],
    }))
  }, [match])

  const removePlayer = useCallback((playerId) => {
    if (!match || match.players.length <= 2) return
    setMatch(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== playerId),
    }))
  }, [match])

  const editPlayerName = useCallback((playerId, newName) => {
    if (!match) return
    setMatch(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === playerId ? { ...p, name: newName } : p),
    }))
  }, [match])

  const resetStreak = useCallback((playerId) => {
    if (!match) return
    // Save for undo
    setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(match))])
    setRedoStack([])
    setMatch(prev => ({
      ...prev,
      players: prev.players.map(p =>
        p.id === playerId
          ? { ...p, gameState: { ...p.gameState, streak: 1 } }
          : p
      ),
    }))
  }, [match])

  return {
    match,
    startMatch,
    executeAction,
    undo,
    redo,
    endMatch,
    addPlayer,
    removePlayer,
    editPlayerName,
    resetStreak,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  }
}
