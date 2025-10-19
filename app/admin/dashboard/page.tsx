"use client"

import { AdminGuard } from "@/components/admin-guard"
import { AdminNavigation } from "@/components/admin-navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { SupabaseContentService } from "@/lib/supabase-content"
import { useState, useEffect } from "react"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalImages: 0,
    totalProjects: 0,
    totalCategories: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load statistics from Supabase
    const loadStats = async () => {
      try {
        const [projects, images, categories] = await Promise.all([
          SupabaseContentService.getAllProjects(),
          SupabaseContentService.getAllImages(),
          SupabaseContentService.getAllCategories()
        ])
        
        setStats({
          totalImages: images.length,
          totalProjects: projects.length,
          totalCategories: categories.length
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadStats()
  }, [])

  const quickActions = [
    {
      title: "Manage Albums",
      description: "Add, edit, or delete image albums and categories",
      action: () => router.push("/admin/images"),
      icon: "📁",
      primary: true
    },
    {
      title: "Edit Projects",
      description: "Update project information and descriptions",
      action: () => router.push("/admin/projects"),
      icon: "🏗️",
      primary: false
    },
    {
      title: "Edit Homepage",
      description: "Update hero content and services",
      action: () => router.push("/admin/content"),
      icon: "🏠",
      primary: false
    },
    {
      title: "Edit About Page",
      description: "Update company story, values, and team",
      action: () => router.push("/admin/content"),
      icon: "ℹ️",
      primary: false
    }
  ]

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <AdminNavigation />

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-mono font-bold text-foreground">
                Content <span className="text-primary">Dashboard</span>
              </h1>
              <p className="text-muted-foreground">
                Manage your AWTAD website content, albums, and projects
              </p>
            </div>

            {/* Statistics */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Images</p>
                    <p className="text-2xl font-mono font-bold text-foreground">{stats.totalImages}</p>
                    <p className="text-xs text-primary">In all albums</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Projects</p>
                    <p className="text-2xl font-mono font-bold text-foreground">{stats.totalProjects}</p>
                    <p className="text-xs text-primary">Portfolio items</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Image Categories</p>
                    <p className="text-2xl font-mono font-bold text-foreground">{stats.totalCategories}</p>
                    <p className="text-xs text-primary">Album types</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="font-mono">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      onClick={action.action}
                      className={`w-full justify-start h-auto p-4 ${
                        action.primary 
                          ? 'gold-gradient text-primary-foreground hover:opacity-90' 
                          : 'border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground bg-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{action.icon}</span>
                        <div className="text-left">
                          <div className="font-semibold">{action.title}</div>
                          <div className="text-xs opacity-80">{action.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Content */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="font-mono">Recent Content Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: "Album 'Projects 2024' updated", time: "2 hours ago", type: "album" },
                    { action: "New project 'Steel Bridge' added", time: "1 day ago", type: "project" },
                    { action: "Homepage hero content modified", time: "3 days ago", type: "content" },
                    { action: "Team member 'Sarah Chen' updated", time: "1 week ago", type: "about" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-border/50 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          activity.type === 'album' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          activity.type === 'project' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          activity.type === 'content' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        }`}>
                          {activity.type}
                        </span>
                        <span className="text-sm text-foreground">{activity.action}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
