"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  FileText,
  Frame,
  Gift,
  Loader2,
  MessageCircle,
  PenLine,
  Sparkles,
  Upload,
  UserRound,
  X,
} from "lucide-react"
import { PageShell } from "@/components/site/page-shell"
import { useLocale } from "@/lib/i18n"
import { whatsappUrl } from "@/lib/site"
import { EASE } from "@/lib/motion"
import { cn } from "@/lib/utils"

type TypeKey = "wall-art" | "portrait" | "gift" | "business" | "calligraphy" | "other"
type FinishKey = "black" | "gold" | "other" | "unsure"

const TYPES: { key: TypeKey; icon: typeof Frame }[] = [
  { key: "wall-art", icon: Frame },
  { key: "portrait", icon: UserRound },
  { key: "gift", icon: Gift },
  { key: "business", icon: Building2 },
  { key: "calligraphy", icon: PenLine },
  { key: "other", icon: Sparkles },
]

const FINISHES: { key: FinishKey; swatch: string }[] = [
  { key: "black", swatch: "#1b1b1a" },
  { key: "gold", swatch: "#D9AF59" },
  { key: "other", swatch: "conic-gradient(#8a8982, #e8e5df, #7f5f22, #8a8982)" },
  { key: "unsure", swatch: "transparent" },
]

interface Upload {
  id: string
  name: string
  type: string
  preview?: string
  url?: string
  status: "uploading" | "done" | "error"
}

interface Draft {
  type: TypeKey | null
  idea: string
  width: string
  height: string
  finish: FinishKey | null
  name: string
  phone: string
  email: string
}

const EMPTY: Draft = { type: null, idea: "", width: "", height: "", finish: null, name: "", phone: "", email: "" }
const DRAFT_KEY = "awtad-idea-draft"
const TOTAL = 4

function Choice({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "relative flex items-center gap-3 rounded-[var(--radius)] border bg-surface-1 text-start transition-[border-color,background-color] duration-[var(--dur-fast)]",
        selected ? "border-charcoal ring-1 ring-charcoal" : "border-border hover:border-border-strong",
        className
      )}
    >
      {children}
      {selected && (
        <span className="absolute end-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-charcoal">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}
    </button>
  )
}

function Field({
  label,
  hint,
  error,
  children,
  id,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
  id: string
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {hint && <span className="ms-1.5 font-normal text-muted-foreground">({hint})</span>}
      </label>
      <div className="mt-2">{children}</div>
      {error && (
        <p className="mt-1.5 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

const inputCls =
  "h-13 w-full rounded-[var(--radius)] border border-input bg-surface-1 px-4 text-base outline-none transition-colors placeholder:text-subtle-foreground focus:border-charcoal focus:ring-1 focus:ring-charcoal"

function CustomizeFlow() {
  const { t, locale } = useLocale()
  const c = t.customize
  const params = useSearchParams()
  const refId = params.get("ref")

  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [step, setStep] = useState(1)
  const [uploads, setUploads] = useState<Upload[]>([])
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({})
  const [done, setDone] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Restore an unsent draft, then apply ?type= from a project page.
  useEffect(() => {
    let restored: Draft = EMPTY
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY)
      if (saved) restored = { ...EMPTY, ...JSON.parse(saved) }
    } catch {}
    const preset = params.get("type") as TypeKey | null
    if (preset && TYPES.some((x) => x.key === preset)) {
      restored = { ...restored, type: preset }
      setStep(2)
    }
    setDraft(restored)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch {}
  }, [draft])

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const go = (n: number) => {
    setStep(n)
    // Keep the question in view on phones after the layout changes.
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }))
  }

  const addFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((file) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined
      setUploads((u) => [...u, { id, name: file.name, type: file.type, preview, status: "uploading" }])
      const body = new FormData()
      body.append("file", file)
      fetch("/api/idea-upload", { method: "POST", body })
        .then(async (r) => {
          if (!r.ok) throw new Error(String(r.status))
          const { url } = await r.json()
          setUploads((u) => u.map((x) => (x.id === id ? { ...x, url, status: "done" } : x)))
        })
        .catch(() => setUploads((u) => u.map((x) => (x.id === id ? { ...x, status: "error" } : x))))
    })
  }

  const removeUpload = (id: string) =>
    setUploads((u) => {
      const gone = u.find((x) => x.id === id)
      if (gone?.preview) URL.revokeObjectURL(gone.preview)
      return u.filter((x) => x.id !== id)
    })

  const message = () => {
    const lines = ["Hello AWTAD, I have an idea for a custom piece.", ""]
    if (draft.type) lines.push(`Type: ${t.customize.types[draft.type]}`)
    if (draft.idea.trim()) lines.push(`Idea: ${draft.idea.trim()}`)
    if (draft.width || draft.height) lines.push(`Size: ${draft.width || "?"} × ${draft.height || "?"} cm`)
    if (draft.finish) lines.push(`Finish: ${t.customize.finishes[draft.finish]}`)
    const links = uploads.filter((u) => u.url).map((u) => u.url)
    if (links.length) lines.push("", "References:", ...links.map((l) => `• ${l}`))
    if (refId && typeof window !== "undefined") lines.push("", `Inspired by: ${window.location.origin}/projects/${refId}`)
    if (draft.name || draft.phone || draft.email) {
      lines.push("")
      if (draft.name) lines.push(`Name: ${draft.name}`)
      if (draft.phone) lines.push(`WhatsApp: ${draft.phone}`)
      if (draft.email) lines.push(`Email: ${draft.email}`)
    }
    return lines.join("\n")
  }

  const validateContact = () => {
    const e: typeof errors = {}
    if (!draft.name.trim()) e.name = c.required
    if (draft.phone.replace(/\D/g, "").length < 7) e.phone = c.phoneInvalid
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const send = () => {
    if (!validateContact()) return
    window.open(whatsappUrl(message()), "_blank", "noopener,noreferrer")
    setDone(true)
    try {
      sessionStorage.removeItem(DRAFT_KEY)
    } catch {}
    go(step)
  }

  const reset = () => {
    uploads.forEach((u) => u.preview && URL.revokeObjectURL(u.preview))
    setDraft(EMPTY)
    setUploads([])
    setDone(false)
    go(1)
  }

  const uploading = uploads.some((u) => u.status === "uploading")
  const canNext = step === 1 ? !!draft.type : !uploading

  const stepTitle = [c.q1, c.q2, c.q3, c.q4][step - 1]

  return (
    <div ref={topRef} className="scroll-mt-[calc(var(--header-h)+1rem)]">
      {done ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="rounded-[var(--radius)] border border-border bg-surface-1 p-6 sm:p-10"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-charcoal">
            <Check className="h-6 w-6" />
          </span>
          <h2 className="text-headline mt-6">{c.doneTitle}</h2>
          <p className="text-lede mt-4 max-w-lg text-muted-foreground">{c.doneBody}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href={whatsappUrl(message())} target="_blank" rel="noopener noreferrer" className="btn btn-gold">
              <MessageCircle className="h-4 w-4" />
              {c.doneRetry}
            </a>
            <button type="button" onClick={reset} className="btn btn-outline">
              {c.doneNew}
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Progress */}
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">
              {c.step} {step} <span className="text-muted-foreground">{c.of} {TOTAL}</span>
            </span>
            <a
              href={whatsappUrl(message())}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="link-underline">{c.continueWa}</span>
            </a>
          </div>
          <div className="mt-3 flex gap-1.5" aria-hidden>
            {Array.from({ length: TOTAL }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-[var(--dur-base)]",
                  i < step ? "bg-gold" : "bg-surface-3"
                )}
              />
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: locale === "ar" ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="mt-10"
            >
              <h2 className="text-title">{stepTitle}</h2>

              {step === 1 && (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {TYPES.map(({ key, icon: Icon }) => (
                    <Choice
                      key={key}
                      selected={draft.type === key}
                      onClick={() => {
                        set("type", key)
                        setTimeout(() => go(2), 180)
                      }}
                      className="min-h-28 flex-col items-start justify-between p-4 sm:min-h-32 sm:p-5"
                    >
                      <Icon className="h-6 w-6 text-gold-ink" strokeWidth={1.5} />
                      <span className="font-semibold leading-tight">{c.types[key]}</span>
                    </Choice>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="mt-6 space-y-6">
                  <textarea
                    id="idea"
                    value={draft.idea}
                    onChange={(e) => set("idea", e.target.value)}
                    placeholder={c.ideaPlaceholder}
                    rows={5}
                    aria-label={c.q2}
                    className={cn(inputCls, "h-auto min-h-36 resize-y py-3.5 leading-relaxed")}
                  />

                  <div>
                    <p className="text-sm font-semibold">{c.uploadTitle}</p>
                    <label
                      className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius)] border border-dashed border-border-strong bg-surface-1 px-6 py-8 text-center transition-colors hover:border-charcoal focus-within:border-charcoal"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        addFiles(e.dataTransfer.files)
                      }}
                    >
                      <Upload className="h-6 w-6 text-gold-ink" strokeWidth={1.5} />
                      <span className="font-semibold">{c.uploadCta}</span>
                      <span className="text-sm text-muted-foreground">{c.uploadHint}</span>
                      <input
                        ref={fileRef}
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        className="sr-only"
                        onChange={(e) => {
                          addFiles(e.target.files)
                          e.target.value = ""
                        }}
                      />
                    </label>

                    {uploads.length > 0 && (
                      <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                        {uploads.map((u) => (
                          <li key={u.id} className="relative">
                            <div
                              className={cn(
                                "relative flex aspect-square items-center justify-center overflow-hidden rounded-[var(--radius)] border bg-surface-2",
                                u.status === "error" ? "border-destructive" : "border-border"
                              )}
                            >
                              {u.preview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={u.preview} alt={u.name} className="h-full w-full object-cover" />
                              ) : (
                                <FileText className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
                              )}
                              {u.status === "uploading" && (
                                <span className="absolute inset-0 flex items-center justify-center bg-background/70" aria-label={c.uploading}>
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeUpload(u.id)}
                              aria-label={`${c.remove} ${u.name}`}
                              className="absolute -end-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-charcoal text-off-white"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                            <p className="mt-1 truncate text-xs text-muted-foreground">{u.name}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                    {uploads.some((u) => u.status === "error") && (
                      <p className="mt-2 text-sm text-destructive" role="alert">
                        {c.uploadFailed}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="mt-6 space-y-8">
                  <div>
                    <p className="text-sm font-semibold">{c.sizeLabel}</p>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      {(["width", "height"] as const).map((k) => (
                        <label key={k} className="relative block">
                          <span className="sr-only">{c[k]}</span>
                          <input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            value={draft[k]}
                            onChange={(e) => set(k, e.target.value)}
                            placeholder={c[k]}
                            className={cn(inputCls, "pe-12")}
                          />
                          <span className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            {c.cm}
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{c.sizeHint}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold">{c.finishLabel}</p>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      {FINISHES.map((f) => (
                        <Choice key={f.key} selected={draft.finish === f.key} onClick={() => set("finish", f.key)} className="min-h-16 px-4">
                          <span
                            className={cn("h-7 w-7 shrink-0 rounded-full", f.key === "unsure" && "border border-dashed border-border-strong")}
                            style={{ background: f.swatch }}
                          />
                          <span className="font-medium">{c.finishes[f.key]}</span>
                        </Choice>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="mt-6 space-y-5">
                  <Field id="name" label={c.name} error={errors.name}>
                    <input id="name" autoComplete="name" value={draft.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
                  </Field>
                  <Field id="phone" label={c.whatsapp} error={errors.phone}>
                    <input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      dir="ltr"
                      placeholder="+961 …"
                      value={draft.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      className={cn(inputCls, "text-start rtl:text-end")}
                    />
                  </Field>
                  <Field id="email" label={c.email} hint={c.optional}>
                    <input
                      id="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      dir="ltr"
                      value={draft.email}
                      onChange={(e) => set("email", e.target.value)}
                      className={cn(inputCls, "rtl:text-end")}
                    />
                  </Field>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Step navigation */}
          <div className="mt-10 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            {step > 1 ? (
              <button type="button" onClick={() => go(step - 1)} className="btn btn-outline sm:border-transparent sm:px-2">
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                {c.back}
              </button>
            ) : (
              <span />
            )}
            {step < TOTAL ? (
              <button
                type="button"
                disabled={!canNext}
                onClick={() => go(step + 1)}
                className="btn btn-ink group disabled:cursor-not-allowed disabled:opacity-40"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {step === 2 && !draft.idea.trim() && uploads.length === 0 ? c.skip : c.next}
                <ArrowRight className="arrow h-4 w-4" />
              </button>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={send} disabled={uploading} className="btn btn-gold group disabled:opacity-50">
                  {c.send}
                  <ArrowRight className="arrow h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function CustomizePage() {
  const { t } = useLocale()
  return (
    <PageShell hideStart>
      <section className="section">
        <div className="shell grid gap-12 lg:grid-cols-[1fr_1.25fr] lg:gap-24">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)] lg:self-start">
            <p className="eyebrow">{t.customize.eyebrow}</p>
            <h1 className="text-display mt-5">
              <span className="block">{t.customize.titleA}</span>
              <span className="font-editorial block text-gold-ink">{t.customize.titleB}</span>
            </h1>
            <p className="text-lede mt-6 max-w-md text-muted-foreground">{t.customize.intro}</p>
            <ul className="mt-8 hidden space-y-3 text-sm text-muted-foreground lg:block">
              {t.process.steps.map((s) => (
                <li key={s.n} className="flex gap-3">
                  <span className="font-semibold text-gold-ink">{s.n}</span>
                  {s.title}
                </li>
              ))}
            </ul>
          </div>
          <Suspense>
            <CustomizeFlow />
          </Suspense>
        </div>
      </section>
    </PageShell>
  )
}
