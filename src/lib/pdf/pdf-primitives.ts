/**
 * Shared low-level PDF primitives.
 *
 * jsPDF's default Helvetica font cannot render non-ASCII glyphs (they appear
 * as blank boxes). Every string passed to doc.text() must be sanitised first.
 * This canonical sanitiser is shared by the unified report generator and the
 * auto-dealer server-side generator so the rule lives in exactly one place
 * (see CLAUDE.md sec 5).
 */

export function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[‘’‚‛]/g, "'")   // smart single quotes
    .replace(/[“”„‟]/g, '"')   // smart double quotes
    .replace(/–/g, '-')         // en-dash
    .replace(/—/g, '--')        // em-dash
    .replace(/―/g, '--')        // horizontal bar
    .replace(/•/g, '*')         // bullet
    .replace(/ /g, ' ')         // non-breaking space
    .replace(/·/g, '-')         // middle dot
    .replace(/…/g, '...')       // ellipsis
    .replace(/₹/g, 'Rs.')       // rupee (escape)
    .replace(/₹/g, 'Rs.')       // rupee (literal)
    .replace(/§/g, 'S.')        // section sign
    .replace(/✓/g, '[Y]')
    .replace(/✔/g, '[Y]')
    .replace(/✗/g, '[X]')
    .replace(/✘/g, '[X]')
    .replace(/→/g, '->')        // right arrow
    .replace(/←/g, '<-')        // left arrow
    .replace(/[^\x00-\x7F]/g, ''); // strip remaining non-ASCII
}
