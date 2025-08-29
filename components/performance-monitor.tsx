"use client"

import { useEffect, useState } from 'react'

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    loadTime: 0
  })

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number

    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        setMetrics(prev => ({ ...prev, fps }))
        frameCount = 0
        lastTime = currentTime
      }
      
      animationId = requestAnimationFrame(measureFPS)
    }

    // Start FPS measurement
    measureFPS()

    // Measure memory usage (if available)
    if ('memory' in performance) {
      const updateMemory = () => {
        const memory = (performance as any).memory
        setMetrics(prev => ({ 
          ...prev, 
          memory: Math.round(memory.usedJSHeapSize / 1024 / 1024) 
        }))
      }
      
      const memoryInterval = setInterval(updateMemory, 2000)
      updateMemory()
      
      return () => {
        clearInterval(memoryInterval)
        cancelAnimationFrame(animationId)
      }
    }

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="space-y-1">
        <div>FPS: {metrics.fps}</div>
        <div>Memory: {metrics.memory}MB</div>
        <div>Load: {Math.round(performance.now())}ms</div>
      </div>
    </div>
  )
}




