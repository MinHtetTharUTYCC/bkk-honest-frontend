/**
 * Generate a URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a city slug (just the city name in slug format)
 */
export function generateCitySlug(cityName: string): string {
  return generateSlug(cityName);
}

/**
 * Generate a spot URL based on city name and spot name
 */
export function getSpotUrl(cityName: string, spotName: string): string {
  const citySlug = generateCitySlug(cityName);
  const spotSlug = generateSlug(spotName);
  return `/spots/${citySlug}/${spotSlug}`;
}

/**
 * Generate a scam alert URL based on city name and alert name
 */
export function getScamAlertUrl(cityName: string, scamName: string): string {
  const citySlug = generateCitySlug(cityName);
  const alertSlug = generateSlug(scamName);
  return `/scam-alerts/${citySlug}/${alertSlug}`;
}
