"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Send, X } from "lucide-react"
import { EASE } from "@/lib/motion"

const PROJECT_TYPES = [
  { value: "metal-portrait", label: "Metal portrait" },
  { value: "wall-art", label: "Metal wall art" },
  { value: "calligraphy", label: "Calligraphy" },
  { value: "sign-plaque", label: "Sign / plaque" },
  { value: "custom-steel", label: "Custom steel work" },
  { value: "other", label: "Something else" },
]

const EMPTY = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  projectType: "",
  message: "",
}

/**
 * Commission enquiry modal. Previously this exact form was duplicated
 * verbatim in the About page and the Footer; both now render this.
 *
 * The submit behaviour is unchanged — it still composes a mailto: link
 * and hands off to the visitor's mail client.
 */
export function ContactDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { toast } = useToast()
  const [formData, setFormData] = useState(EMPTY)

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onOpenChange])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const subject = `New Project Inquiry from ${formData.firstName} ${formData.lastName}`
    const body = `New project inquiry received:

Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}
Project Type: ${formData.projectType}

Message:
${formData.message}

---
This message was sent from the AWTAD website contact form.`

    window.open(
      `mailto:husseinnouraldeen5@gmail.com?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`
    )

    toast({
      title: "Message ready to send",
      description: "Your email app will open with the enquiry filled in.",
    })

    setFormData(EMPTY)
    onOpenChange(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: EASE }}
        >
          <div
            className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-md"
            onClick={() => onOpenChange(false)}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-dialog-title"
            className="panel grain relative my-8 w-full max-w-2xl overflow-hidden rounded-3xl"
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.38, ease: EASE }}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-32"
              style={{
                background:
                  "radial-gradient(ellipse 70% 100% at 50% 0%, var(--primary-muted) 0%, transparent 70%)",
              }}
            />

            <div className="relative p-7 sm:p-9">
              <div className="mb-7 flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Commission</p>
                  <h3
                    id="contact-dialog-title"
                    className="text-title mt-2 text-foreground"
                  >
                    Tell us what you&apos;d like made
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close"
                  onClick={() => onOpenChange(false)}
                  className="-mr-2 -mt-1 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="First name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                  <Field
                    label="Last name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <Field
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />

                <Field
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                />

                <div className="space-y-1.5">
                  <label
                    htmlFor="projectType"
                    className="block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    What are we making <span className="text-primary">*</span>
                  </label>
                  <select
                    id="projectType"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleInputChange}
                    required
                    className="h-11 w-full rounded-xl border border-input bg-surface-2/60 px-3.5 text-sm text-foreground outline-none transition-all duration-[var(--dur-fast)] focus:border-primary/60 focus:ring-4 focus:ring-[var(--primary-muted)]"
                  >
                    <option value="">Choose one…</option>
                    {PROJECT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="message"
                    className="block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    Details <span className="text-primary">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    placeholder="Sizes, materials, the occasion, when you need it…"
                    className="w-full resize-y rounded-xl border border-input bg-surface-2/60 px-3.5 py-3 text-sm text-foreground outline-none transition-all duration-[var(--dur-fast)] placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-4 focus:ring-[var(--primary-muted)]"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <Button
                    type="submit"
                    className="gold-gradient h-11 flex-1 rounded-full text-primary-foreground shadow-[var(--shadow-md)] transition-shadow hover:shadow-[0_8px_30px_var(--primary-glow)]"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send enquiry
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="h-11 rounded-full border-border sm:w-32"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
      >
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="h-11 w-full rounded-xl border border-input bg-surface-2/60 px-3.5 text-sm text-foreground outline-none transition-all duration-[var(--dur-fast)] placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-4 focus:ring-[var(--primary-muted)]"
      />
    </div>
  )
}
