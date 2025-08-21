"use client"

export interface SiteContent {
  homepage: {
    heroTitle: string
    heroSubtitle: string
    heroDescription: string
    services: Array<{
      title: string
      description: string
      icon: string
    }>
  }
  about: {
    story: string[]
    values: Array<{
      title: string
      description: string
    }>
    team: Array<{
      name: string
      role: string
      experience: string
      specialty: string
    }>
  }
  projects: Array<{
    id: number
    title: string
    category: string
    description: string
    year: string
    coverImageId?: string
  }>
}

const DEFAULT_CONTENT: SiteContent = {
  homepage: {
    heroTitle: "AWTAD",
    heroSubtitle: "Advanced Steel Design & Engineering Solutions",
    heroDescription: "Precision craftsmanship meets cutting-edge technology in every project we deliver",
    services: [
      {
        title: "Structural Design",
        description:
          "Advanced structural engineering with precision calculations and innovative solutions for complex projects.",
        icon: "🏗️",
      },
      {
        title: "Fabrication Planning",
        description: "Detailed fabrication drawings and specifications optimized for efficiency and quality control.",
        icon: "⚙️",
      },
      {
        title: "Project Management",
        description: "End-to-end project coordination ensuring timely delivery and exceptional quality standards.",
        icon: "📊",
      },
    ],
  },
  about: {
    story: [
      'Founded in 2010, AWTAD emerged from a vision to revolutionize steel design and engineering through the integration of cutting-edge technology and traditional craftsmanship. Our name, derived from the Arabic word meaning "pillars," reflects our commitment to being the foundational support for ambitious architectural and industrial projects.',
      "Over the past decade, we have established ourselves as industry leaders, completing over 200 major projects across commercial, industrial, and residential sectors. Our expertise spans from intricate architectural steel work to massive industrial frameworks, each project executed with precision and attention to detail.",
      "Today, AWTAD stands at the forefront of steel engineering innovation, combining advanced computational design tools with deep structural engineering expertise to deliver solutions that push the boundaries of what's possible in steel construction.",
    ],
    values: [
      {
        title: "Precision",
        description:
          "Every calculation, every measurement, every detail executed with mathematical precision and engineering excellence.",
      },
      {
        title: "Innovation",
        description:
          "Pushing the boundaries of steel design through advanced technology and creative engineering solutions.",
      },
      {
        title: "Reliability",
        description: "Delivering projects on time, within budget, and exceeding quality expectations consistently.",
      },
    ],
    team: [
      {
        name: "Ahmed Al-Rashid",
        role: "Lead Structural Engineer",
        experience: "15+ years",
        specialty: "Complex Steel Frameworks",
      },
      {
        name: "Sarah Chen",
        role: "Design Director",
        experience: "12+ years",
        specialty: "Architectural Integration",
      },
      {
        name: "Marcus Thompson",
        role: "Project Manager",
        experience: "10+ years",
        specialty: "Large-Scale Projects",
      },
    ],
  },
  projects: [
    {
      id: 1,
      title: "Metropolitan Steel Complex",
      category: "Commercial",
      description:
        "Large-scale commercial steel framework with advanced engineering solutions and precision fabrication.",
      year: "2024",
    },
    {
      id: 2,
      title: "Industrial Manufacturing Hub",
      category: "Industrial",
      description: "Heavy-duty industrial steel structures designed for maximum efficiency and durability.",
      year: "2023",
    },
    {
      id: 3,
      title: "Residential Tower Framework",
      category: "Residential",
      description: "High-rise residential building with innovative steel design and seismic engineering.",
      year: "2023",
    },
    {
      id: 4,
      title: "Bridge Infrastructure Project",
      category: "Infrastructure",
      description: "Major bridge construction with complex steel engineering and environmental considerations.",
      year: "2022",
    },
    {
      id: 5,
      title: "Warehouse Distribution Center",
      category: "Commercial",
      description: "Expansive warehouse facility with optimized steel framework for logistics operations.",
      year: "2022",
    },
    {
      id: 6,
      title: "Energy Plant Structure",
      category: "Industrial",
      description: "Specialized steel structures for energy generation facility with safety-critical design.",
      year: "2021",
    },
  ],
}

export class ContentService {
  private static readonly STORAGE_KEY = "awtad_site_content"

  static getContent(): SiteContent {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        return { ...DEFAULT_CONTENT, ...JSON.parse(stored) }
      }
    } catch (error) {
      console.error("Error loading content:", error)
    }
    return DEFAULT_CONTENT
  }

  static saveContent(content: SiteContent): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(content))
    } catch (error) {
      console.error("Error saving content:", error)
    }
  }

  static resetContent(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }
}
