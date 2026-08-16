const SURROUNDING_QUOTES = /^[\s"'`“”‘’«»]+|[\s"'`“”‘’«»]+$/g;

export function normalizeEmail(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .trim()
    .replace(SURROUNDING_QUOTES, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .toLowerCase();
}
