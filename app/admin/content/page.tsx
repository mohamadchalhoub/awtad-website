"use client"

import { AdminNavigation } from "@/components/admin-navigation"
import { AdminGuard } from "@/components/admin-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SupabaseContentService } from "@/lib/supabase-content"
import { useState, useEffect } from "react"
import { Save, RotateCcw, Plus, Trash2 } from "lucide-react"


interface HomepageContent {
  hero: {
    title: string
    subtitle: string
    description: string
  }
  services: Array<{
    title: string
    description: string
    icon: string
  }>
}

interface AboutContent {
  story: {
    content: string
  }
  values: Array<{
    title: string
    description: string
    icon: string
  }>
  team: Array<{
    name: string
    role: string
    bio: string
    avatar: string
  }>
}

export default function AdminContentPage() {
  const [homepageContent, setHomepageContent] = useState<HomepageContent>({
    hero: {
      title: "Advanced Steel Design",
      subtitle: "Engineering Excellence",
      description: "Innovative steel solutions for modern challenges"
    },
    services: [
      {
        title: "Structural Design",
        description: "Advanced structural analysis and design",
        icon: "🏗️"
      },
      {
        title: "Fabrication",
        description: "Precision steel fabrication services",
        icon: "⚙️"
      },
      {
        title: "Installation",
        description: "Professional installation and assembly",
        icon: "🔧"
      }
    ]
  })

  const [aboutContent, setAboutContent] = useState<AboutContent>({
    story: {
      content: "Our journey in steel engineering excellence began with a vision to transform the industry through innovative design, cutting-edge technology, and unwavering commitment to quality. Today, we stand as a leading force in steel engineering, delivering solutions that exceed expectations and drive progress in construction and infrastructure development."
    },
    values: [
      {
        title: "Innovation",
        description: "Pushing boundaries in steel design and engineering",
        icon: "💡"
      },
      {
        title: "Quality",
        description: "Uncompromising quality standards",
        icon: "⭐"
      },
      {
        title: "Safety",
        description: "Safety-first approach in all our operations",
        icon: "🛡️"
      }
    ],
    team: [
      {
        name: "Engineering Team",
        role: "Steel Design Specialists",
        bio: "Expert engineers with decades of experience in structural steel design and analysis",
        avatar: "👥"
      },
      {
        name: "Project Management",
        role: "Project Coordinators",
        bio: "Dedicated professionals ensuring smooth project execution and delivery",
        avatar: "📋"
      },
      {
        name: "Quality Assurance",
        role: "Quality Engineers",
        bio: "Committed to maintaining the highest standards in all our deliverables",
        avatar: "🔍"
      }
    ]
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      console.log('Loading content from database...')
      
      // Load homepage content
      const homepageData = await SupabaseContentService.getHomepageContent()
      console.log('Homepage data loaded:', homepageData)
      
      if (homepageData.hero) {
        setHomepageContent(prev => ({
          ...prev,
          hero: {
            title: homepageData.hero.title || prev.hero.title,
            subtitle: homepageData.hero.subtitle || prev.hero.subtitle,
            description: homepageData.hero.description || prev.hero.description
          }
        }))
      }
      if (homepageData.services?.services) {
        setHomepageContent(prev => ({
          ...prev,
          services: homepageData.services.services
        }))
      }

      // Load about content
      const aboutData = await SupabaseContentService.getAboutContent()
      console.log('About data loaded:', aboutData)
      
      if (aboutData.story?.content) {
        setAboutContent(prev => ({
          ...prev,
          story: {
            content: aboutData.story.content
          }
        }))
      }
      if (aboutData.values?.values) {
        setAboutContent(prev => ({
          ...prev,
          values: aboutData.values.values
        }))
      }
      if (aboutData.team?.team) {
        setAboutContent(prev => ({
          ...prev,
          team: aboutData.team.team
        }))
      }
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveAllChanges = async () => {
    try {
      setSaving(true)
      console.log('Starting to save content...')
      
      // Save homepage content
      console.log('Saving hero section...')
      const heroResult = await SupabaseContentService.updateHomepageContent('hero', {
        title: homepageContent.hero.title,
        subtitle: homepageContent.hero.subtitle,
        description: homepageContent.hero.description
      })
      console.log('Hero save result:', heroResult)
      
      console.log('Saving services section...')
      const servicesResult = await SupabaseContentService.updateHomepageContent('services', {
        services: homepageContent.services
      })
      console.log('Services save result:', servicesResult)

      // Save about content
      console.log('Saving story section...')
      const storyResult = await SupabaseContentService.updateAboutContent('story', {
        content: aboutContent.story.content
      })
      console.log('Story save result:', storyResult)
      
      console.log('Saving values section...')
      const valuesResult = await SupabaseContentService.updateAboutContent('values', {
        values: aboutContent.values
      })
      console.log('Values save result:', valuesResult)
      
      console.log('Saving team section...')
      const teamResult = await SupabaseContentService.updateAboutContent('team', {
        team: aboutContent.team
      })
      console.log('Team save result:', teamResult)

      // Check each result individually and provide specific feedback
      const results = [
        { name: 'Hero Section', result: heroResult },
        { name: 'Services Section', result: servicesResult },
        { name: 'Story Section', result: storyResult },
        { name: 'Values Section', result: valuesResult },
        { name: 'Team Section', result: teamResult }
      ]
      
      const failedSections = results.filter(r => !r.result).map(r => r.name)
      
      if (failedSections.length === 0) {
        alert('All changes saved successfully!')
        
        // Dispatch custom event to notify other components
        const event = new CustomEvent('contentUpdated', { 
          detail: { 
            type: 'content_saved',
            timestamp: new Date().toISOString()
          } 
        })
        window.dispatchEvent(event)
        
        // Reload content to show updated data
        await loadContent()
      } else {
        alert(`Failed to save: ${failedSections.join(', ')}. Please check the console for details.`)
        console.error('Failed sections:', failedSections)
        console.error('Individual results:', results)
      }
    } catch (error) {
      console.error('Error saving content:', error)
      alert('Error saving changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const resetToDefault = () => {
    if (confirm('Are you sure you want to reset all content to default values?')) {
      setHomepageContent({
        hero: {
          title: "Advanced Steel Design",
          subtitle: "Engineering Excellence",
          description: "Innovative steel solutions for modern challenges"
        },
        services: [
          {
            title: "Structural Design",
            description: "Advanced structural analysis and design",
            icon: "🏗️"
          },
          {
            title: "Fabrication",
            description: "Precision steel fabrication services",
            icon: "⚙️"
          },
          {
            title: "Installation",
            description: "Professional installation and assembly",
            icon: "🔧"
          }
        ]
      })

      setAboutContent({
        story: {
          content: "Our journey in steel engineering excellence began with a vision to transform the industry through innovative design, cutting-edge technology, and unwavering commitment to quality. Today, we stand as a leading force in steel engineering, delivering solutions that exceed expectations and drive progress in construction and infrastructure development."
        },
        values: [
          {
            title: "Innovation",
            description: "Pushing boundaries in steel design and engineering",
            icon: "💡"
          },
          {
            title: "Quality",
            description: "Uncompromising quality standards",
            icon: "⭐"
          },
          {
            title: "Safety",
            description: "Safety-first approach in all our operations",
            icon: "🛡️"
          }
        ],
        team: [
          {
            name: "Engineering Team",
            role: "Steel Design Specialists",
            bio: "Expert engineers with decades of experience in structural steel design and analysis",
            avatar: "👥"
          },
          {
            name: "Project Management",
            role: "Project Coordinators",
            bio: "Dedicated professionals ensuring smooth project execution and delivery",
            avatar: "📋"
          },
          {
            name: "Quality Assurance",
            role: "Quality Engineers",
            bio: "Committed to maintaining the highest standards in all our deliverables",
            avatar: "🔍"
          }
        ]
      })
    }
  }

  const addService = () => {
    setHomepageContent(prev => ({
      ...prev,
      services: [...prev.services, { title: '', description: '', icon: '🏗️' }]
    }))
  }

  const removeService = (index: number) => {
    setHomepageContent(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }))
  }

  const updateService = (index: number, field: 'title' | 'description' | 'icon', value: string) => {
    setHomepageContent(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }))
  }

  const addValue = () => {
    setAboutContent(prev => ({
      ...prev,
      values: [...prev.values, { title: '', description: '', icon: '💡' }]
    }))
  }

  const removeValue = (index: number) => {
    setAboutContent(prev => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index)
    }))
  }

  const updateValue = (index: number, field: 'title' | 'description' | 'icon', value: string) => {
    setAboutContent(prev => ({
      ...prev,
      values: prev.values.map((val, i) => 
        i === index ? { ...val, [field]: value } : val
      )
    }))
  }

  const addTeamMember = () => {
    setAboutContent(prev => ({
      ...prev,
      team: [...prev.team, { name: '', role: '', bio: '', avatar: '👤' }]
    }))
  }

  const removeTeamMember = (index: number) => {
    setAboutContent(prev => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index)
    }))
  }

  const updateTeamMember = (index: number, field: 'name' | 'role' | 'bio' | 'avatar', value: string) => {
    setAboutContent(prev => ({
      ...prev,
      team: prev.team.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation />
      <AdminGuard>
        <div className="pt-24 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl md:text-4xl font-mono font-bold text-foreground">
                Content <span className="text-primary">Management</span>
              </h1>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={loadContent}
                  className="text-sm"
                >
                  🔄 Refresh Content
                </Button>
                <div className="flex space-x-4">
                  <Button 
                    onClick={saveAllChanges} 
                    disabled={saving}
                    className="gold-gradient text-primary-foreground hover:opacity-90"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save All Changes'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetToDefault}
                    className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset to Default
                  </Button>
                </div>
              </div>
            </div>



            <div className="grid lg:grid-cols-2 gap-8">
              {/* Homepage Content */}
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-mono font-semibold text-foreground mb-6">
                    Homepage Content
                  </h2>
                  
                  {/* Hero Section */}
                  <div className="space-y-4 mb-6">
                    <h3 className="text-lg font-semibold text-foreground">Hero Section</h3>
                    <div>
                      <Label htmlFor="hero-title">Hero Title</Label>
                      <Input
                        id="hero-title"
                        value={homepageContent.hero.title}
                        onChange={(e) => setHomepageContent(prev => ({
                          ...prev,
                          hero: { ...prev.hero, title: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hero-subtitle">Hero Subtitle</Label>
                      <Input
                        id="hero-subtitle"
                        value={homepageContent.hero.subtitle}
                        onChange={(e) => setHomepageContent(prev => ({
                          ...prev,
                          hero: { ...prev.hero, subtitle: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hero-description">Hero Description</Label>
                      <Textarea
                        id="hero-description"
                        value={homepageContent.hero.description}
                        onChange={(e) => setHomepageContent(prev => ({
                          ...prev,
                          hero: { ...prev.hero, description: e.target.value }
                        }))}
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Services Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">Services</h3>
                      <Button size="sm" onClick={addService} variant="outline">
                        <Plus className="w-3 h-3 mr-1" />
                        Add Service
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {homepageContent.services.map((service, index) => (
                        <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Service {index + 1}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeService(index)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div>
                            <Label htmlFor={`service-title-${index}`}>Title</Label>
                            <Input
                              id={`service-title-${index}`}
                              value={service.title}
                              onChange={(e) => updateService(index, 'title', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`service-description-${index}`}>Description</Label>
                            <Textarea
                              id={`service-description-${index}`}
                              value={service.description}
                              onChange={(e) => updateService(index, 'description', e.target.value)}
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`service-icon-${index}`}>Icon (emoji)</Label>
                            <Input
                              id={`service-icon-${index}`}
                              value={service.icon}
                              onChange={(e) => updateService(index, 'icon', e.target.value)}
                              placeholder="🏗️"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* About Page Content */}
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-mono font-semibold text-foreground mb-6">
                    About Page Content
                  </h2>
                  
                  {/* Story Section */}
                  <div className="space-y-4 mb-6">
                    <h3 className="text-lg font-semibold text-foreground">Our Story</h3>
                    <div>
                      <Label htmlFor="story-content">Story Content</Label>
                      <Textarea
                        id="story-content"
                        value={aboutContent.story.content}
                        onChange={(e) => setAboutContent(prev => ({
                          ...prev,
                          story: { content: e.target.value }
                        }))}
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Values Section */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">Our Values</h3>
                      <Button size="sm" onClick={addValue} variant="outline">
                        <Plus className="w-3 h-3 mr-1" />
                        Add Value
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {aboutContent.values.map((value, index) => (
                        <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Value {index + 1}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeValue(index)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div>
                            <Label htmlFor={`value-title-${index}`}>Title</Label>
                            <Input
                              id={`value-title-${index}`}
                              value={value.title}
                              onChange={(e) => updateValue(index, 'title', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`value-description-${index}`}>Description</Label>
                            <Textarea
                              id={`value-description-${index}`}
                              value={value.description}
                              onChange={(e) => updateValue(index, 'description', e.target.value)}
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`value-icon-${index}`}>Icon (emoji)</Label>
                            <Input
                              id={`value-icon-${index}`}
                              value={value.icon}
                              onChange={(e) => updateValue(index, 'icon', e.target.value)}
                              placeholder="💡"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Team Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">Our Team</h3>
                      <Button size="sm" onClick={addTeamMember} variant="outline">
                        <Plus className="w-3 h-3 mr-1" />
                        Add Member
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {aboutContent.team.map((member, index) => (
                        <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Member {index + 1}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeTeamMember(index)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div>
                            <Label htmlFor={`member-name-${index}`}>Name</Label>
                            <Input
                              id={`member-name-${index}`}
                              value={member.name}
                              onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`member-role-${index}`}>Role</Label>
                            <Input
                              id={`member-role-${index}`}
                              value={member.role}
                              onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`member-bio-${index}`}>Bio</Label>
                            <Textarea
                              id={`member-bio-${index}`}
                              value={member.bio}
                              onChange={(e) => updateTeamMember(index, 'bio', e.target.value)}
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`member-avatar-${index}`}>Avatar (emoji)</Label>
                            <Input
                              id={`member-avatar-${index}`}
                              value={member.avatar}
                              onChange={(e) => updateTeamMember(index, 'avatar', e.target.value)}
                              placeholder="👤"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AdminGuard>
    </div>
  )
}
