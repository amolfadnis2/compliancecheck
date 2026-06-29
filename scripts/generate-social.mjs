/**
 * generate-social.mjs — turn each published blog post into ready-to-schedule
 * social drafts so syndication needs no manual writing.
 *
 * Reads  content/blog/*.mdx
 * Writes content/social/<slug>.json  (LinkedIn, X, Reddit, Quora, WhatsApp)
 *
 * Run:  node scripts/generate-social.mjs
 *
 * These are deterministic, template-based drafts — accurate and safe to review
 * at a glance before posting. (An optional LLM-rewrite step can be layered on
 * later; kept out here so the script needs no API key to run.)
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const SITE_URL = 'https://compliancecheck.co.in'
const ROOT = process.cwd()
const BLOG_DIR = path.join(ROOT, 'content', 'blog')
const OUT_DIR = path.join(ROOT, 'content', 'social')

function tagToHashtag(tag) {
  return '#' + tag.replace(/[^a-zA-Z0-9]/g, '')
}

function headings(content) {
  return content
    .split('\n')
    .filter((l) => /^##\s+/.test(l) && !/^###/.test(l))
    .map((l) => l.replace(/^##\s+/, '').trim())
    .slice(0, 4)
}

function truncate(s, n) {
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…'
}

function buildDrafts(slug, data, content) {
  const url = `${SITE_URL}/blog/${slug}`
  const title = data.title
  const desc = data.description
  const tags = Array.isArray(data.tags) ? data.tags : []
  const hashtags = ['#compliance', '#India', ...tags.map(tagToHashtag)]
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(' ')
  const points = headings(content)
  const bullets = points.map((p) => `• ${p}`).join('\n')

  const linkedin = [
    title,
    '',
    desc,
    '',
    bullets,
    '',
    `Full guide → ${url}`,
    '',
    hashtags,
  ].join('\n')

  const x = truncate(`${title}\n\n${desc}`, 240) + `\n${url}`

  const reddit = {
    title: truncate(title, 300),
    body: [
      desc,
      '',
      points.length ? `What it covers:\n${bullets}` : '',
      '',
      `I put together a fuller breakdown here (no signup to read): ${url}`,
      '',
      'Happy to answer questions in the comments.',
    ]
      .filter(Boolean)
      .join('\n'),
  }

  const quora = [
    desc,
    '',
    points.length ? `Key points:\n${bullets}` : '',
    '',
    `For a step-by-step version, see: ${url}`,
  ]
    .filter(Boolean)
    .join('\n')

  const whatsapp = `${title}\n\n${truncate(desc, 220)}\n\nRead: ${url}`

  return { slug, url, generatedAt: new Date().toISOString(), linkedin, x, reddit, quora, whatsapp }
}

function main() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.error(`No blog directory at ${BLOG_DIR}`)
    process.exit(0)
  }
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'))
  let count = 0
  for (const file of files) {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8')
    const { data, content } = matter(raw)
    if (data.draft) continue
    const slug = file.replace(/\.mdx$/, '')
    const drafts = buildDrafts(slug, data, content)
    fs.writeFileSync(
      path.join(OUT_DIR, `${slug}.json`),
      JSON.stringify(drafts, null, 2) + '\n',
    )
    count++
    console.log(`✓ ${slug}.json`)
  }
  console.log(`\nGenerated ${count} social draft file(s) in content/social/`)
}

main()
