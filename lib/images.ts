"use client"

export interface ImageData {
  id: string
  name: string
  url: string
  projectId?: number
  category: string
  uploadDate: string
  size: number
}

export interface ImageGallery {
  [category: string]: ImageData[]
}

export class ImageService {
  private static readonly STORAGE_KEY = "awtad_images"
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  static async uploadImage(file: File, category = "general", projectId?: number): Promise<ImageData | null> {
    try {
      if (file.size > this.MAX_FILE_SIZE) {
        throw new Error("File size too large. Maximum 5MB allowed.")
      }

      if (!file.type.startsWith("image/")) {
        throw new Error("Only image files are allowed.")
      }

      const base64 = await this.fileToBase64(file)
      const imageData: ImageData = {
        id: this.generateId(),
        name: file.name,
        url: base64,
        projectId,
        category,
        uploadDate: new Date().toISOString(),
        size: file.size,
      }

      this.saveImage(imageData)
      return imageData
    } catch (error) {
      console.error("Error uploading image:", error)
      return null
    }
  }

  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private static saveImage(imageData: ImageData): void {
    const images = this.getAllImages()
    images.push(imageData)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(images))
  }

  static getAllImages(): ImageData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  static getImagesByCategory(category: string): ImageData[] {
    return this.getAllImages().filter((img) => img.category === category)
  }

  static getImagesByProject(projectId: number): ImageData[] {
    return this.getAllImages().filter((img) => img.projectId === projectId)
  }

  static deleteImage(id: string): void {
    const images = this.getAllImages().filter((img) => img.id !== id)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(images))
  }

  static updateImage(id: string, updates: Partial<ImageData>): void {
    const images = this.getAllImages()
    const index = images.findIndex((img) => img.id === id)
    if (index !== -1) {
      images[index] = { ...images[index], ...updates }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(images))
    }
  }

  static getGalleryByCategory(): ImageGallery {
    const images = this.getAllImages()
    const gallery: ImageGallery = {}

    images.forEach((image) => {
      if (!gallery[image.category]) {
        gallery[image.category] = []
      }
      gallery[image.category].push(image)
    })

    return gallery
  }

  static clearAllImages(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }
}
