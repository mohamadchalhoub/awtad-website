import { Reveal } from "@/components/site/reveal"
import { cn } from "@/lib/utils"

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "start",
  className,
  action,
}: {
  eyebrow?: string
  title: React.ReactNode
  body?: string
  align?: "start" | "center"
  className?: string
  action?: React.ReactNode
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center",
        className
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="text-headline mt-4">{title}</h2>
        {body && <p className="text-lede mt-4 text-muted-foreground">{body}</p>}
      </div>
      {action}
    </Reveal>
  )
}
