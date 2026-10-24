/**
 * Generate a URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate a spot URL based on city slug and spot slug
 * NOTE: citySlug should come from API (city.slug), not generated from city name
 */
export function getSpotUrl(citySlug: string, spotSlug: string): string {
  return `/spots/${citySlug}/${spotSlug}/tips`;
}

/**
 * Generate a scam alert URL based on city slug and alert slug
 * NOTE: citySlug should come from API (city.slug), not generated from city name
 */
export function getScamAlertUrl(citySlug: string, alertSlug: string): string {
  return `/scam-alerts/${citySlug}/${alertSlug}`;
}
