import { useEffect, useLayoutEffect, useRef, useState } from 'react'

interface AutoScale {
  outerRef: React.RefObject<HTMLDivElement | null>
  innerRef: React.RefObject<HTMLDivElement | null>
  scale: number
  height: number
}

/** Scales a fixed-width "paper" so it always fits its column. */
export function useAutoScale(designWidth = 794): AutoScale {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState(0)

  useLayoutEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    const update = () => {
      const available = outer.clientWidth
      if (available > 0) setScale(Math.min(1, available / designWidth))
      setHeight(inner.offsetHeight)
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(outer)
    ro.observe(inner)
    return () => ro.disconnect()
  }, [designWidth])

  useEffect(() => {
    setHeight(innerRef.current?.offsetHeight ?? 0)
  }, [scale])

  return { outerRef, innerRef, scale, height }
}
