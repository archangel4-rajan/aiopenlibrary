/**
 * Sanitize a search query for use in PostgREST filter expressions.
 *
 * PostgREST uses commas to separate filter conditions and dots/parens
 * for nested operators. Unescaped special characters in user input
 * can break the filter syntax or produce unexpected results.
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/\\/g, "\\\\") // escape backslashes first
    .replace(/%/g, "\\%") // escape literal percent signs
    .replace(/_/g, "\\_") // escape underscore (wildcard in ILIKE)
    .replace(/'/g, "''") // escape single quotes
    .replace(/,/g, "") // remove commas (PostgREST condition separator)
    .replace(/\(/g, "") // remove open parens (PostgREST operator syntax)
    .replace(/\)/g, ""); // remove close parens
}
