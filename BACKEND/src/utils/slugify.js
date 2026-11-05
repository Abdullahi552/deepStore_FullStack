// Converts a name to a URL-safe slug.
//   "Blue T-Shirt!" → "blue-t-shirt"
export const slugify = (text) =>
  text
    .toString()
    .normalize('NFKD')                  // decompose accents
    .replace(/[\u0300-\u036f]/g, '')    // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')       // drop non-alphanumeric except spaces/hyphens
    .replace(/[\s_-]+/g, '-')           // collapse whitespace/underscores to single hyphen
    .replace(/^-+|-+$/g, '');           // trim leading/trailing hyphens