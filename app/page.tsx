"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useContent } from "@/hooks/use-content"
import { AnimatedBackground } from "@/components/animated-background"
import { AnimatedSection, AnimatedCard } from "@/components/animated-section"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ImageService } from "@/lib/images"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"


interface ProjectWithCover {
  id: number
  title: string
  category: string
  description: string
  year: string
  coverImageId?: string
  coverImageUrl?: string
  parent_id?: number | null
}

export default function HomePage() {
  const { content, isLoading, refreshContent } = useContent()
  const router = useRouter()
  const [projectsWithCover, setProjectsWithCover] = useState<ProjectWithCover[]>([])

  useEffect(() => {
    const loadFeaturedProjects = async () => {
      try {
        const { SupabaseContentService } = await import('@/lib/supabase-content')
        
        // Load featured projects for homepage
        const featuredProjects = await SupabaseContentService.getFeaturedProjects(6)
        
        // OPTIMIZATION: Batch fetch all cover images in ONE query
        const coverImageIds = featuredProjects
          .filter(p => p.cover_image_id)
          .map(p => Number(p.cover_image_id))
          .filter(id => !isNaN(id))
        
        let coverImagesMap = new Map<number, string>()
        if (coverImageIds.length > 0) {
          const { data: imagesData } = await supabase
            .from('images')
            .select('id, url')
            .in('id', coverImageIds)
          
          if (imagesData) {
            coverImagesMap = new Map(imagesData.map(img => [img.id, img.url]))
          }
        }
        
        // Map projects with their cover images
        const projectsWithCoverImages = featuredProjects.map(project => ({
          id: project.id,
          title: project.title,
          category: project.category,
          description: project.description,
          year: project.year,
          coverImageId: project.cover_image_id || undefined,
          coverImageUrl: project.cover_image_id ? coverImagesMap.get(Number(project.cover_image_id)) : undefined,
          parent_id: project.parent_id
        }))
        
        setProjectsWithCover(projectsWithCoverImages)
      } catch (error) {
        console.error('Error loading featured projects:', error)
      }
    }

    // Always load featured projects for homepage
    loadFeaturedProjects()
  }, [])

  // Remove this useEffect - we only want featured projects on homepage
  // useEffect(() => {
  //   if (content?.projects) {
  //     // Projects already have coverImageUrl from the content hook
  //     setProjectsWithCover(content.projects)
  //   }
  // }, [content])

  // Refresh content when the page becomes visible (disabled to prevent unwanted refreshes)
  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (!document.hidden) {
  //       refreshContent()
  //     }
  //   }

  //   document.addEventListener('visibilitychange', handleVisibilityChange)
  //   return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  // }, [refreshContent])

  const handleProjectClick = (projectId: number) => {
    router.push(`/projects/${projectId}`)
  }

  // REMOVED: Blocking loading spinner - page now renders immediately with skeletons

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Navigation />

      {/* Hero Section */}
      <section className="h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background">
        <div className="max-w-7xl mx-auto px-6 relative z-20">
          <AnimatedSection className="text-center space-y-8" direction="up">
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.h1 
                className="text-6xl md:text-8xl lg:text-9xl font-mono font-bold text-foreground"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
              >
                <span className="text-primary text-shadow-gold bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent drop-shadow-lg">
                  {content?.homepage?.heroTitle || "Advanced Steel Design"}
                </span>
              </motion.h1>
              <motion.p 
                className="text-2xl md:text-3xl lg:text-4xl text-foreground max-w-4xl mx-auto leading-relaxed drop-shadow-lg font-medium"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {content?.homepage?.heroSubtitle || "Engineering Excellence"}
              </motion.p>
              <motion.p 
                className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto drop-shadow-lg"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {content?.homepage?.heroDescription || "Innovative steel solutions for modern challenges"}
              </motion.p>
            </motion.div>

            <motion.div 
              className="flex justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="gold-gradient text-primary-foreground hover:opacity-90 transition-opacity px-10 py-6 text-lg shadow-lg"
                  onClick={() => {
                    document.getElementById('projects-section')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    })
                  }}
                >
                  View Our Projects
                </Button>
              </motion.div>
            </motion.div>
          </AnimatedSection>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          onClick={() => {
            document.getElementById('services-section')?.scrollIntoView({ 
              behavior: 'smooth' 
            })
          }}
        >
          <motion.div 
            className="w-6 h-10 border-2 border-primary rounded-full flex justify-center"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.1 }}
          >
            <motion.div 
              className="w-1 h-3 bg-primary rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section id="services-section" className="py-16 px-6 bg-secondary/30 relative">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center space-y-4 mb-12" direction="up">
            <motion.h2 
              className="text-3xl md:text-4xl font-mono font-bold text-foreground"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              Our <span className="text-primary bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">Services</span>
            </motion.h2>
            <motion.p 
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Comprehensive steel design solutions for modern industrial challenges
            </motion.p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {content?.homepage?.services?.map((service, index) => (
              <AnimatedCard
                key={index}
                className="bg-card border-border hover:border-primary/50 transition-colors steel-texture shadow-lg"
                delay={index * 0.2}
              >
                <CardContent className="p-8 text-center space-y-4">
                  <motion.div 
                    className="text-4xl mb-4"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {service.icon}
                  </motion.div>
                  <h3 className="text-xl font-mono font-semibold text-foreground">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                </CardContent>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects-section" className="py-16 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center space-y-4 mb-12" direction="up">
            <motion.h2 
              className="text-3xl md:text-4xl font-mono font-bold text-foreground"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              Featured <span className="text-primary bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">Projects</span>
            </motion.h2>
            <motion.p 
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Showcasing our expertise in steel design and engineering excellence
            </motion.p>
          </AnimatedSection>



          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projectsWithCover.length > 0 ? projectsWithCover.slice(0, 6).map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card
                  className="bg-card border-border hover:border-primary/50 transition-all hover:glow-gold group shadow-lg cursor-pointer"
                  onClick={() => handleProjectClick(project.id)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-video bg-muted overflow-hidden rounded-t-lg">
                      {project.coverImageUrl ? (
                        <img 
                          src={project.coverImageUrl} 
                          alt={project.title} 
                          className="w-full h-full object-cover object-center min-w-full min-h-full group-hover:scale-105 transition-transform duration-300" 
                          style={{ objectPosition: 'center center' }}
                        />
                      ) : (
                        <div className="w-full h-full steel-texture flex items-center justify-center">
                          <span className="text-muted-foreground font-mono text-sm">Project {project.id}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                          {project.category}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">{project.year}</span>
                      </div>
                      <h3 className="text-lg font-mono font-semibold text-foreground group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{project.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )) : (
              // Show skeleton placeholders while projects are loading
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="bg-card border-border shadow-lg">
                  <CardContent className="p-0">
                    <Skeleton className="aspect-video rounded-t-lg" />
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-12" />
                      </div>
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <AnimatedSection className="text-center mt-12" direction="up" delay={0.4}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/projects">
                <Button className="gold-gradient text-primary-foreground hover:opacity-90 transition-opacity shadow-lg">
                  View All Projects
                </Button>
              </Link>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  )
}
