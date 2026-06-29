/**
 * JsonLd — renders a JSON-LD <script> block for structured data.
 *
 * Centralises the `<script type="application/ld+json">` pattern that was being
 * hand-written in layout.tsx and the penalty calculator page. Pass any
 * schema.org object (or array of objects) built with the helpers in ./schema.
 */

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[]
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
