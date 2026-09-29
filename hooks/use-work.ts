"use client"

import { useEffect, useState } from "react"
import { getWork, type WorkItem } from "@/lib/work"

export function useWork() {
  const [items, setItems] = useState<WorkItem[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let alive = true
    getWork()
      .then((w) => alive && setItems(w))
      .catch((e) => {
        console.error("Failed to load work", e)
        if (alive) setError(true)
      })
    return () => {
      alive = false
    }
  }, [])

  return { items, loading: items === null && !error, error }
}
