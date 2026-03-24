import { useState, useEffect } from 'react'
import { loadSettings, saveSettings } from '../utils/storage'

export default function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => {
    const settings = loadSettings()
    return settings.darkMode ?? false
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    saveSettings({ darkMode })
  }, [darkMode])

  const toggle = () => setDarkMode(prev => !prev)

  return [darkMode, toggle]
}
