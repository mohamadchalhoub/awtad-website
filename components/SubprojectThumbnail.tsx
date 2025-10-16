import Link from 'next/link'
import { Tables } from '@/lib/supabase'

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
      <div className={`${sizeClasses[size]} rounded-md border border-gray-200 dark:border-border overflow-hidden bg-muted hover:border-gray-400 dark:hover:border-primary/50 transition-colors`}>
        {subproject.thumbnail_url ? (
          <img
            src={subproject.thumbnail_url}
            alt={subproject.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
            <span className="text-lg">📄</span>
          </div>
        )}
      </div>
      {showTitle && (
        <p className={`${titleSizeClasses[size]} text-gray-700 dark:text-gray-300 text-center mt-1 truncate group-hover:text-primary transition-colors`}>
          {subproject.title}
        </p>
      )}
    </Link>
  )
}
