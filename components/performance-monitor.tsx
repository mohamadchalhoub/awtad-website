"use client"

import { useEffect } from 'react'
import { usePerformance } from '@/hooks/use-performance'

export function PerformanceMonitor() {
  const metrics = usePerformance()

  useEffect(() => {
    // Only run in development or when explicitly enabled
    if (process.env.NODE_ENV !== 'development' && !process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING) {
      return
    }

    // Log performance metrics
    console.group('🚀 Performance Metrics')
    console.log('Page Load Time:', `${metrics.loadTime.toFixed(2)}ms`)
    console.log('DOM Content Loaded:', `${metrics.domContentLoaded.toFixed(2)}ms`)
    
    if (metrics.firstContentfulPaint) {
      console.log('First Contentful Paint:', `${metrics.firstContentfulPaint.toFixed(2)}ms`)
    }
    
    if (metrics.largestContentfulPaint) {
      console.log('Largest Contentful Paint:', `${metrics.largestContentfulPaint.toFixed(2)}ms`)
    }
    
    if (metrics.firstInputDelay) {
      console.log('First Input Delay:', `${metrics.firstInputDelay.toFixed(2)}ms`)
    }
    
    if (metrics.cumulativeLayoutShift) {
      console.log('Cumulative Layout Shift:', metrics.cumulativeLayoutShift.toFixed(4))
    }
    
    console.groupEnd()

    // Performance warnings
    if (metrics.loadTime > 3000) {
      console.warn('⚠️ Slow page load detected:', `${metrics.loadTime.toFixed(2)}ms`)
    }
    
    if (metrics.domContentLoaded > 2000) {
      console.warn('⚠️ Slow DOM content loaded:', `${metrics.domContentLoaded.toFixed(2)}ms`)
    }

  }, [metrics])

  // Don't render anything visible
  return null
}

// Component for measuring specific operations
export function PerformanceTimer({ 
  operation, 
  children 
}: { 
  operation: string
  children: React.ReactNode 
}) {
  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${operation}: ${duration.toFixed(2)}ms`)
      }
    }
  }, [operation])

  return <>{children}</>
}