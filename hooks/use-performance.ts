"use client"

import { useEffect, useRef } from 'react'

interface PerformanceMetrics {
  loadTime: number
  domContentLoaded: number
  firstContentfulPaint?: number
  largestContentfulPaint?: number
  firstInputDelay?: number
  cumulativeLayoutShift?: number
}

export function usePerformance() {
  const metricsRef = useRef<PerformanceMetrics>({
    loadTime: 0,
    domContentLoaded: 0,
  })

  useEffect(() => {
    // Measure page load time
    const measureLoadTime = () => {
      if (typeof window !== 'undefined' && window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        if (navigation) {
          metricsRef.current.loadTime = navigation.loadEventEnd - navigation.loadEventStart
          metricsRef.current.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
        }

        // Measure Core Web Vitals
        if ('web-vitals' in window) {
          // This would require installing web-vitals package
          // import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'
        }

        // Log performance metrics
        console.log('Performance Metrics:', {
          loadTime: `${metricsRef.current.loadTime.toFixed(2)}ms`,
          domContentLoaded: `${metricsRef.current.domContentLoaded.toFixed(2)}ms`,
          timestamp: new Date().toISOString()
        })

        // Send to analytics (if configured)
        if (process.env.NODE_ENV === 'production') {
          // You can send these metrics to your analytics service
          // sendToAnalytics(metricsRef.current)
        }
      }
    }

    // Measure when page is fully loaded
    if (document.readyState === 'complete') {
      measureLoadTime()
    } else {
      window.addEventListener('load', measureLoadTime)
    }

    return () => {
      window.removeEventListener('load', measureLoadTime)
    }
  }, [])

  return metricsRef.current
}

// Utility function to measure API response times
export function measureApiCall<T>(
  apiCall: () => Promise<T>,
  endpoint: string
): Promise<T> {
  const startTime = performance.now()
  
  return apiCall().then(
    (result) => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      console.log(`API Call ${endpoint}: ${duration.toFixed(2)}ms`)
      
      // Log slow API calls
      if (duration > 1000) {
        console.warn(`Slow API call detected: ${endpoint} took ${duration.toFixed(2)}ms`)
      }
      
      return result
    },
    (error) => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      console.error(`API Call ${endpoint} failed after ${duration.toFixed(2)}ms:`, error)
      throw error
    }
  )
}

// Utility function to measure component render time
export function measureRenderTime(componentName: string) {
  const startTime = performance.now()
  
  return () => {
    const endTime = performance.now()
    const duration = endTime - startTime
    
    if (duration > 16) { // More than one frame (16ms at 60fps)
      console.warn(`Slow render detected: ${componentName} took ${duration.toFixed(2)}ms`)
    }
  }
}
