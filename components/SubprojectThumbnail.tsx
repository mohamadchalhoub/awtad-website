import Link from 'next/link'
import { Tables } from '@/lib/supabase'
import { SmartImage } from '@/components/smart-image'

interface SubprojectThumbnailProps {
  subproject: {
    id: number
    title: string
    slug: string
    thumbnail_url?: string
  }
  parentSlug: string
  size?: 'sm' | 'md' | 'lg'
  showTitle?: boolean
  className?: string
}

export default function SubprojectThumbnail({
  subproject,
  parentSlug,
  size = 'sm',
  showTitle = true,
  className = ''
}: SubprojectThumbnailProps) {
  const sizeClasses = {
    sm: 'w-20 h-14',
    md: 'w-32 h-24',
    lg: 'w-48 h-36'
  }

  const titleSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <Link
      href={`/projects/${subproject.slug || subproject.id}`}
      className={`flex-shrink-0 group ${className}`}
      aria-label={`View ${subproject.title} subproject`}
    >
      <div className={`${sizeClasses[size]} overflow-hidden rounded-lg border border-border bg-surface-2 transition-all duration-[var(--dur-base)] ease-[var(--ease-out-soft)] group-hover:border-primary/50 group-hover:shadow-[var(--shadow-md)]`}>
        <div className="relative h-full w-full">
          <SmartImage
            src={subproject.thumbnail_url}
            alt={subproject.title}
            sizes="192px"
            quality={65}
            className="object-cover transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out-soft)] group-hover:scale-110"
            fallback={
              <div className="steel-texture flex h-full w-full items-center justify-center bg-surface-2">
                <span className="font-display text-base text-muted-foreground/50">
                  {subproject.title?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            }
          />
        </div>
      </div>
      {showTitle && (
        <p className={`${titleSizeClasses[size]} mt-1.5 truncate text-center text-muted-foreground transition-colors group-hover:text-primary`}>
          {subproject.title}
        </p>
      )}
    </Link>
  )
}
