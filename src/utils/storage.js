const STORAGE_KEYS = {
  MATCH: 'gambcalc_current_match',
  UNDO_STACK: 'gambcalc_undo_stack',
  HISTORY: 'gambcalc_history',
  SETTINGS: 'gambcalc_settings',
}

export function saveMatch(match) {
  localStorage.setItem(STORAGE_KEYS.MATCH, JSON.stringify(match))
}

export function loadMatch() {
  const data = localStorage.getItem(STORAGE_KEYS.MATCH)
  return data ? JSON.parse(data) : null
}

export function clearMatch() {
  localStorage.removeItem(STORAGE_KEYS.MATCH)
  localStorage.removeItem(STORAGE_KEYS.UNDO_STACK)
}

export function saveUndoStack(stack) {
  localStorage.setItem(STORAGE_KEYS.UNDO_STACK, JSON.stringify(stack))
}

export function loadUndoStack() {
  const data = localStorage.getItem(STORAGE_KEYS.UNDO_STACK)
  return data ? JSON.parse(data) : []
}

export function saveToHistory(match) {
  const history = loadHistory()
  history.unshift({ ...match, endedAt: new Date().toISOString() })
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history))
}

export function loadHistory() {
  const data = localStorage.getItem(STORAGE_KEYS.HISTORY)
  return data ? JSON.parse(data) : []
}

export function softDeleteMatch(matchId) {
  const history = loadHistory()
  const updated = history.map(m =>
    m.id === matchId ? { ...m, deleted: true, deletedAt: new Date().toISOString() } : m
  )
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated))
}

export function restoreMatch(matchId) {
  const history = loadHistory()
  const updated = history.map(m =>
    m.id === matchId ? { ...m, deleted: false, deletedAt: null } : m
  )
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated))
}

export function permanentDeleteMatch(matchId) {
  const history = loadHistory()
  const updated = history.filter(m => m.id !== matchId)
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated))
}

export function clearHistory() {
  const history = loadHistory()
  const updated = history.map(m => ({ ...m, deleted: true, deletedAt: new Date().toISOString() }))
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated))
}

export function restoreAllDeleted() {
  const history = loadHistory()
  const updated = history.map(m => m.deleted ? { ...m, deleted: false, deletedAt: null } : m)
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated))
}

export function permanentDeleteAllDeleted() {
  const history = loadHistory()
  const updated = history.filter(m => !m.deleted)
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated))
}

export function loadSettings() {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
  return data ? JSON.parse(data) : { darkMode: false }
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
}
