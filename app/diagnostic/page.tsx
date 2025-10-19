"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SupabaseContentService } from "@/lib/supabase-content"
import { supabase } from "@/lib/supabase"

export default function DiagnosticPage() {
  const [results, setResults] = useState<any[]>([])
  const [testing, setTesting] = useState(false)

  const runDiagnostics = async () => {
    setTesting(true)
    setResults([])
    const diagnostics: any[] = []

    // Test 1: Raw Supabase connection
    const t1 = performance.now()
    try {
      const { data, error } = await supabase.from('projects').select('count').limit(1)
      const time = performance.now() - t1
      diagnostics.push({
        test: "Raw Supabase Connection",
        time: `${time.toFixed(0)}ms`,
        status: error ? "❌ FAILED" : "✅ PASSED",
        details: error ? error.message : `Success`
      })
    } catch (error: any) {
      diagnostics.push({
        test: "Raw Supabase Connection",
        time: `${(performance.now() - t1).toFixed(0)}ms`,
        status: "❌ ERROR",
        details: error.message
      })
    }

    // Test 2: Fetch all projects (should be <100ms for 6 projects)
    const t2 = performance.now()
    try {
      const projects = await SupabaseContentService.getAllProjects()
      const time = performance.now() - t2
      diagnostics.push({
        test: "Fetch All Projects",
        time: `${time.toFixed(0)}ms`,
        status: time < 500 ? "✅ PASSED" : "⚠️ SLOW",
        details: `${projects.length} projects - Expected <500ms for 6 projects`
      })
    } catch (error: any) {
      diagnostics.push({
        test: "Fetch All Projects",
        time: `${(performance.now() - t2).toFixed(0)}ms`,
        status: "❌ ERROR",
        details: error.message
      })
    }

    // Test 3: Fetch all images (should be <100ms for 8 images)
    const t3 = performance.now()
    try {
      const images = await SupabaseContentService.getAllImages()
      const time = performance.now() - t3
      diagnostics.push({
        test: "Fetch All Images",
        time: `${time.toFixed(0)}ms`,
        status: time < 500 ? "✅ PASSED" : "⚠️ SLOW",
        details: `${images.length} images - Expected <500ms for 8 images`
      })
    } catch (error: any) {
      diagnostics.push({
        test: "Fetch All Images",
        time: `${(performance.now() - t3).toFixed(0)}ms`,
        status: "❌ ERROR",
        details: error.message
      })
    }

    // Test 4: Fetch parent projects with subprojects (should be <500ms total)
    const t4 = performance.now()
    try {
      const projects = await SupabaseContentService.getParentProjectsWithSubprojects()
      const time = performance.now() - t4
      diagnostics.push({
        test: "Fetch Parent Projects with Subprojects",
        time: `${time.toFixed(0)}ms`,
        status: time < 1000 ? "✅ PASSED" : "⚠️ SLOW",
        details: `${projects.length} parent projects - Expected <1000ms for tiny database`
      })
    } catch (error: any) {
      diagnostics.push({
        test: "Fetch Parent Projects with Subprojects",
        time: `${(performance.now() - t4).toFixed(0)}ms`,
        status: "❌ ERROR",
        details: error.message
      })
    }

    // Test 5: Cache test - fetch projects again (should be <10ms)
    const t5 = performance.now()
    try {
      const projects = await SupabaseContentService.getAllProjects()
      const time = performance.now() - t5
      diagnostics.push({
        test: "Cache Test - Fetch Projects Again",
        time: `${time.toFixed(0)}ms`,
        status: time < 50 ? "✅ CACHED" : "⚠️ NO CACHE",
        details: time < 50 ? "Cache is working!" : "Cache not working - should be <50ms"
      })
    } catch (error: any) {
      diagnostics.push({
        test: "Cache Test",
        time: `${(performance.now() - t5).toFixed(0)}ms`,
        status: "❌ ERROR",
        details: error.message
      })
    }

    // Test 6: Network latency test
    const t6 = performance.now()
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL || '')
      const time = performance.now() - t6
      diagnostics.push({
        test: "Network Latency to Supabase",
        time: `${time.toFixed(0)}ms`,
        status: time < 200 ? "✅ GOOD" : time < 500 ? "⚠️ MODERATE" : "❌ SLOW",
        details: time < 200 ? "Good connection" : time < 500 ? "Moderate latency" : "High latency - consider region"
      })
    } catch (error: any) {
      diagnostics.push({
        test: "Network Latency",
        time: `${(performance.now() - t6).toFixed(0)}ms`,
        status: "❌ ERROR",
        details: error.message
      })
    }

    setResults(diagnostics)
    setTesting(false)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Performance Diagnostic Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This tool will test your database connection and performance.
              <br />
              Expected results for your tiny database (6 projects + 8 images):
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Raw connection: <strong>&lt;100ms</strong></li>
              <li>Fetch projects: <strong>&lt;500ms</strong></li>
              <li>Fetch images: <strong>&lt;500ms</strong></li>
              <li>Complex query: <strong>&lt;1000ms</strong></li>
              <li>Cached queries: <strong>&lt;10ms</strong></li>
            </ul>
            
            <Button 
              onClick={runDiagnostics} 
              disabled={testing}
              className="w-full"
            >
              {testing ? "Running Diagnostics..." : "Run Performance Test"}
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{result.test}</h3>
                        <p className="text-sm text-muted-foreground">{result.details}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl mb-1">{result.status}</div>
                        <div className="text-lg font-mono font-bold">{result.time}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">💡 What do the results mean?</h4>
                <ul className="text-sm space-y-1">
                  <li><strong>If ALL tests are SLOW (&gt;1s):</strong> Network issue or Supabase region is far from you</li>
                  <li><strong>If CACHE test is slow:</strong> Caching is not working properly</li>
                  <li><strong>If FIRST fetch is slow but CACHE is fast:</strong> Database indexes might help</li>
                  <li><strong>If Network Latency is high:</strong> Your Supabase region is far from your location</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

