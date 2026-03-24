import { useEffect } from 'react'

export default function useDarkMode() {
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])
}
