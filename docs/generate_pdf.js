import puppeteer from 'puppeteer';
import { marked } from 'marked';
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

const files = [
  { name: 'privacy', out: 'privacy' },
  { name: 'terms', out: 'terms' },
  { name: 'cookie', out: 'cookie' },
  { name: 'refund', out: 'refund' },
  { name: 'security', out: 'security' },
  { name: 'dpa', out: 'dpa' },
  { name: 'scc-module-2', out: 'scc-module-2' },
  { name: 'scc-module-3', out: 'scc-module-3' },
  { name: 'transfer-assessment', out: 'transfer-assessment' }
];

// A document with an open placeholder is not published: the old PDF and page stay until the text is complete
const UNFINISHED = /\[TODO\b/;

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  timeZone: 'Europe/Kyiv',
  year: 'numeric'
});

const LAST_UPDATED = /^Last Updated:\s*(.*)$/m;

// Hash of the text without the date line: the date changes only when the text does
function sourceHash(markdown) {
  return createHash('sha256').update(markdown.replace(LAST_UPDATED, '')).digest('hex');
}

// Anchor of a section: "## 5. Account & Billing" -> "account-billing", stable when sections are renumbered
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/^\d+\.\s*/, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Headings get ids, so the website, the dashboard and the FAQ can link to a section
function createRenderer() {
  const used = new Map();
  const renderer = new marked.Renderer();
  renderer.heading = function ({ tokens, depth }) {
    const inner = this.parser.parseInline(tokens);
    const base = slugify(inner) || 'section';
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    const id = count ? `${base}-${count + 1}` : base;
    return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
  };
  return renderer;
}

/*
 * The page data of a policy for `@tuwaio/docs-ui`: the title, the date, the sections with their anchors and the body
 * as HTML without the title and the date line (the page shows them itself).
 */
function toPageData(markdown, hash) {
  const tokens = marked.lexer(markdown);
  const titleIndex = tokens.findIndex((token) => token.type === 'heading' && token.depth === 1);
  const title = titleIndex >= 0 ? tokens[titleIndex].text : '';
  const body = tokens.filter((token, index) => index !== titleIndex && !(token.type === 'paragraph' && LAST_UPDATED.test(token.raw)));
  body.links = tokens.links;
  const html = marked.parser(body, { renderer: createRenderer() });
  const sections = [...html.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)].map(([, id, inner]) => ({
    id,
    title: decodeEntities(inner.replace(/<[^>]+>/g, '')).replace(/^\d+\.\s*/, '')
  }));

  return {
    title,
    updated: (markdown.match(LAST_UPDATED)?.[1] ?? '').trim(),
    sections,
    html,
    sourceHash: hash
  };
}

function decodeEntities(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/*
 * Sets "Last Updated" to today when the text changed since the last run (by the hash saved in the JSON). A file that
 * was never generated keeps its date. Returns the Markdown and whether it changed.
 */
function updateLastUpdatedDate(markdown, previousHash, hash) {
  if (!previousHash || previousHash === hash) return markdown;
  const lastUpdated = `Last Updated: ${DATE_FORMATTER.format(new Date())}`;

  return markdown.replace(LAST_UPDATED, lastUpdated);
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;600;700&display=swap');

  body {
    font-family: Arial, sans-serif;
    color: #333;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  .header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 2rem;
  }
  .logo-box {
    width: auto;
    height: 40px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
  .logo-box svg {
    height: 100%;
    width: auto;
  }
  .header-email {
    color: #0ea5e9;
    text-decoration: none;
    font-size: 0.9rem;
    font-family: 'Geist Mono', monospace;
  }
  h1 {
    font-family: 'Geist Mono', monospace;
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  h2 {
    font-family: 'Geist Mono', monospace;
    font-size: 1.3rem;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
  p, li {
    font-size: 1rem;
    color: #444;
  }
  a {
    color: #0ea5e9;
    text-decoration: none;
  }
  /* Page breaks: a heading stays with its text, a list item or a table row is never split, no lone lines */
  h1, h2, h3 {
    break-after: avoid;
    page-break-after: avoid;
  }
  li, tr, blockquote {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  p, li {
    orphans: 3;
    widows: 3;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
    font-size: 0.85rem;
  }
  th, td {
    border: 1px solid #e5e7eb;
    padding: 6px 8px;
    text-align: left;
    vertical-align: top;
    color: #444;
  }
  th {
    background: #f9fafb;
    color: #333;
  }
  code {
    font-family: 'Geist Mono', monospace;
    font-size: 0.85em;
  }
  blockquote {
    margin: 1rem 0;
    padding: 0.5rem 1rem;
    border-left: 3px solid #e5e7eb;
    background: #f9fafb;
  }
`;

async function generate() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();

  const force = process.argv.includes('--force');
  const svgLogo = fs.readFileSync(path.join(process.cwd(), '../preview/logo_v2.svg'), 'utf8');

  for (const file of files) {
    const markdownPath = path.join(process.cwd(), file.name + '.md');
    const pdfPath = path.join(process.cwd(), file.out + '.pdf');
    const jsonPath = path.join(process.cwd(), file.out + '.json');
    if (!fs.existsSync(markdownPath)) {
      console.log(`Skipped: ${file.name}.md does not exist`);
      continue;
    }

    const originalMarkdown = fs.readFileSync(markdownPath, 'utf8');
    if (UNFINISHED.test(originalMarkdown)) {
      console.error(`Not generated: ${file.name}.md still has a [TODO] placeholder`);
      process.exitCode = 1;
      continue;
    }
    const hash = sourceHash(originalMarkdown);
    const previousHash = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath, 'utf8')).sourceHash : undefined;

    if (!force && previousHash === hash && fs.existsSync(pdfPath)) {
      console.log(`Unchanged: ${file.name}.md`);
      continue;
    }

    const md = updateLastUpdatedDate(originalMarkdown, previousHash, hash);
    if (md !== originalMarkdown) {
      fs.writeFileSync(markdownPath, md, 'utf8');
      console.log(`Updated date in ${file.name}.md`);
    }

    const htmlContent = marked.parse(md, { renderer: createRenderer() });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <style>${CSS}</style>
      </head>
      <body>
        <div class="header">
          <div class="logo-box">${svgLogo}</div>
          <a class="header-email" href="mailto:admin@tuwa.io">admin@tuwa.io</a>
        </div>
        ${htmlContent}
      </body>
      </html>
    `;

    await page.setContent(html);
    await page.evaluateHandle('document.fonts.ready');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
    });
    console.log('Generated ' + file.out + '.pdf');

    fs.writeFileSync(jsonPath, JSON.stringify(toPageData(md, hash), null, 2) + '\n', 'utf8');
    console.log('Generated ' + file.out + '.json');
  }

  await browser.close();
}

generate().catch(console.error);
