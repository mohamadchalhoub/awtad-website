import manifest from "./web-images.json"

const WEB: Record<string, string> = manifest

/**
 * Web-sized copy of an uploaded image when one exists (see
 * scripts/optimize-blob-images.mts), otherwise the original URL.
 */
export function webUrl(url: string): string {
  return WEB[url] ?? url
}
