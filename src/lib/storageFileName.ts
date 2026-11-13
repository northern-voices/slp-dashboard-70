// Supabase Storage rejects object keys containing non-ASCII characters
// ("Invalid key"). macOS screenshot names include a narrow no-break space
// (U+202F) before AM/PM, and users often upload files with accented names,
// so build storage keys from an ASCII-only version of the file name. The
// original name is still stored separately for display.
export const toStorageSafeFileName = (fileName: string): string => {
  const safe = fileName
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')

  return safe || 'file'
}
