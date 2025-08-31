"use client"

import { Card, CardContent } from "@/components/ui/card"

export function ProjectCardSkeleton() {
  return (
    <Card className="bg-card border-border animate-pulse">
      <CardContent className="p-0">
        <div className="aspect-video bg-muted rounded-t-lg"></div>
        <div className="p-4 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-muted rounded w-16"></div>
              <div className="h-4 bg-muted rounded w-12"></div>
            </div>
            <div className="h-5 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="h-3 bg-muted rounded w-20"></div>
            <div className="h-3 bg-muted rounded w-24"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-8 bg-muted rounded flex-1"></div>
            <div className="h-8 bg-muted rounded flex-1"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProjectsGridSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <ProjectCardSkeleton key={index} />
      ))}
    </div>
  )
}








