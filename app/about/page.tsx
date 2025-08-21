"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useContent } from "@/hooks/use-content"
import { useState } from "react"
import { Send, X } from "lucide-react"

export default function AboutPage() {
  const { content, isLoading } = useContent()
  const [showContactForm, setShowContactForm] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    projectType: "",
    message: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", formData)
    alert("Thank you for your message! We'll get back to you soon.")
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      projectType: "",
      message: ""
    })
    setShowContactForm(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-mono font-bold text-foreground">
            About <span className="text-primary text-shadow-gold">AWTAD</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Leading the future of steel design and engineering with precision, innovation, and unwavering commitment to
            excellence.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <Card className="bg-card border-border steel-texture">
            <CardContent className="p-8 space-y-6">
              <h2 className="text-2xl font-mono font-bold text-foreground">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                {content?.about?.story ? (
                  <p>{content.about.story}</p>
                ) : (
                  <p>Our story is being written as we continue to innovate and excel in steel design and engineering.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Values Section */}
          <div className="grid md:grid-cols-3 gap-6">
            {content?.about?.values?.map((value, index) => (
              <Card key={index} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="text-3xl mb-2">{value.icon}</div>
                  <h3 className="text-lg font-mono font-semibold text-primary">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-6 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-mono font-bold text-foreground">
              Our <span className="text-primary">Team</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Expert engineers and designers dedicated to delivering exceptional steel design solutions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {content?.about?.team?.map((member, index) => (
              <Card
                key={index}
                className="bg-card border-border hover:border-primary/50 transition-all hover:glow-gold"
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-20 h-20 bg-muted steel-texture rounded-full mx-auto flex items-center justify-center">
                    <span className="text-2xl">{member.avatar}</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-mono font-semibold text-foreground">{member.name}</h3>
                    <p className="text-sm text-primary font-medium">{member.role}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.bio}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-secondary/30">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-mono font-bold text-foreground">
              Ready to Build <span className="text-primary">Together?</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Let's discuss your steel design and engineering needs. Our team is ready to bring your vision to life with
              precision and excellence.
            </p>
          </div>
          <Button 
            size="lg" 
            className="gold-gradient text-primary-foreground hover:opacity-90 transition-opacity px-8"
            onClick={() => setShowContactForm(true)}
          >
            Start Your Project
          </Button>
        </div>
      </section>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-mono font-bold text-foreground">Start Your Project</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowContactForm(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input 
                      id="firstName" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John" 
                      className="mt-1" 
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input 
                      id="lastName" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe" 
                      className="mt-1" 
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com" 
                    className="mt-1" 
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    name="phone"
                    type="tel" 
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567" 
                    className="mt-1" 
                  />
                </div>
                
                <div>
                  <Label htmlFor="projectType">Project Type *</Label>
                  <select 
                    id="projectType" 
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    required
                  >
                    <option value="">Select a project type</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="message">Project Details *</Label>
                  <Textarea 
                    id="message" 
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your project requirements, timeline, and any specific needs..." 
                    rows={4} 
                    className="mt-1"
                    required
                  />
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    className="flex-1 gold-gradient text-primary-foreground hover:opacity-90"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowContactForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <footer className="py-12 px-6 bg-secondary/50 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-primary-foreground font-mono font-bold text-xs">A</span>
            </div>
            <span className="text-lg font-mono font-bold text-primary">AWTAD</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 AWTAD. Advanced Steel Design & Engineering Solutions.</p>
        </div>
      </footer>
    </div>
  )
}
