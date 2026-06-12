import { useEffect, useRef } from 'react'

export function useAutoAdvance(callback: () => void, delayMs: number, trigger: boolean) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!trigger) return
    timerRef.current = setTimeout(() => callbackRef.current(), delayMs)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [trigger, delayMs])
}
