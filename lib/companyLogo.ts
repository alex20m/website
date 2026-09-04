/**
 * Maps a company name to the filename it is stored under in `public/logos/`.
 * Diacritics are stripped (e.g. "Wartsila" from "Wärtsilä") because a raw
 * accented character in a request path is a common source of 404s that only
 * show up once someone's company name actually has one.
 */
export function companyLogoName(company: string): string {
  return company
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_');
}
