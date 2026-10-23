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

const dateFormatter = (locale) =>
  new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', timeZone: 'Europe/Kyiv', year: 'numeric' });

/*
 * The languages of the documents. English is the original in this directory; a translation lives in a subdirectory
 * named after its language (`uk/terms.md`) and is generated next to it (`uk/terms.pdf`, `uk/terms.json`). Its date
 * line uses the label of its language. Every heading of a translation names the anchor of the English section
 * (`## 5. Облік і оплата {#account-billing}`), so a link to a section works in every language.
 */
const LANGUAGES = [
  { code: 'en', dir: '.', label: 'Last Updated', locale: 'en-US' },
  { code: 'uk', dir: 'uk', label: 'Останнє оновлення', locale: 'uk-UA' }
].map((language) => ({
  ...language,
  pattern: new RegExp(`^${language.label}:\\s*(.*)$`, 'm'),
  format: dateFormatter(language.locale)
}));

// Hash of the text without the date line: the date changes only when the text does
function sourceHash(markdown, language = LANGUAGES[0]) {
  return createHash('sha256').update(markdown.replace(language.pattern, '')).digest('hex');
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

// An anchor a heading names itself: `Title {#anchor}` (translations take the anchor of the English section)
const EXPLICIT_ANCHOR = /\s*\{#([a-z0-9-]+)\}\s*$/;

// Headings get ids, so the website, the dashboard and the FAQ can link to a section
function createRenderer() {
  const used = new Map();
  const renderer = new marked.Renderer();
  renderer.heading = function ({ tokens, depth }) {
    let inner = this.parser.parseInline(tokens);
    const explicit = inner.match(EXPLICIT_ANCHOR);
    if (explicit) inner = inner.replace(EXPLICIT_ANCHOR, '');
    const base = explicit?.[1] ?? (slugify(inner) || 'section');
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    const id = count ? `${base}-${count + 1}` : base;
    return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
  };
  return renderer;
}

// A dash stays on the line of the word before it: a line of the PDF or the page never starts with "—"
function keepDashesOnLine(html) {
  return html.replace(/>([^<]*)</g, (match, text) => `>${text.replace(/ —/g, '\u00a0—')}<`);
}

/*
 * The page data of a policy for `@tuwaio/docs-ui`: the title, the date, the sections with their anchors and the body
 * as HTML without the title and the date line (the page shows them itself).
 */
function toPageData(markdown, hash, language, languages) {
  const tokens = marked.lexer(markdown);
  const titleIndex = tokens.findIndex((token) => token.type === 'heading' && token.depth === 1);
  const title = titleIndex >= 0 ? tokens[titleIndex].text : '';
  const body = tokens.filter((token, index) => index !== titleIndex && !(token.type === 'paragraph' && language.pattern.test(token.raw)));
  body.links = tokens.links;
  const html = keepDashesOnLine(marked.parser(body, { renderer: createRenderer() }));
  const sections = [...html.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)].map(([, id, inner]) => ({
    id,
    title: decodeEntities(inner.replace(/<[^>]+>/g, '')).replace(/^\d+\.\s*/, '')
  }));

  return {
    title,
    updated: (markdown.match(language.pattern)?.[1] ?? '').trim(),
    language: language.code,
    languages,
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
function updateLastUpdatedDate(markdown, previousHash, hash, language) {
  if (!previousHash || previousHash === hash) return markdown;
  const lastUpdated = `${language.label}: ${language.format.format(new Date())}`;

  return markdown.replace(language.pattern, lastUpdated);
}

// The anchors of the level-2 sections of a document, in order
function sectionAnchors(markdown) {
  return [...marked.parse(markdown, { renderer: createRenderer() }).matchAll(/<h2 id="([^"]+)">/g)].map(([, id]) => id);
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
    // The languages this document exists in, for the language switch of the page
    const languages = LANGUAGES.filter((language) =>
      fs.existsSync(path.join(process.cwd(), language.dir, file.name + '.md'))
    ).map((language) => language.code);

    for (const language of LANGUAGES) {
      const dir = path.join(process.cwd(), language.dir);
      const markdownPath = path.join(dir, file.name + '.md');
      const pdfPath = path.join(dir, file.out + '.pdf');
      const jsonPath = path.join(dir, file.out + '.json');
      const name = path.join(language.dir, file.name + '.md').replace(/^\.\//, '');

      if (!fs.existsSync(markdownPath)) {
        if (language.code === 'en') console.log(`Skipped: ${name} does not exist`);
        continue;
      }

      const originalMarkdown = fs.readFileSync(markdownPath, 'utf8');

      if (UNFINISHED.test(originalMarkdown)) {
        console.error(`Not generated: ${name} still has a [TODO] placeholder`);
        process.exitCode = 1;
        continue;
      }

      // A translation keeps the sections and anchors of the English document
      if (language.code !== 'en') {
        const original = sectionAnchors(fs.readFileSync(path.join(process.cwd(), file.name + '.md'), 'utf8'));
        const translated = sectionAnchors(originalMarkdown);
        if (original.join(' ') !== translated.join(' ')) {
          console.error(`Not generated: the sections of ${name} (${translated.join(', ')}) differ from ${file.name}.md (${original.join(', ')})`);
          process.exitCode = 1;
          continue;
        }
      }

      const hash = sourceHash(originalMarkdown, language);
      const previous = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath, 'utf8')) : undefined;
      const previousHash = previous?.sourceHash;

      if (!force && previousHash === hash && fs.existsSync(pdfPath)) {
        // Same text: only the list of languages may have changed, and the page data says it without a new date
        if ((previous.languages ?? ['en']).join() !== languages.join()) {
          fs.writeFileSync(jsonPath, JSON.stringify(toPageData(originalMarkdown, hash, language, languages), null, 2) + '\n', 'utf8');
          console.log(`Updated the languages of ${path.join(language.dir, file.out + '.json').replace(/^\.\//, '')}`);
        } else {
          console.log(`Unchanged: ${name}`);
        }
        continue;
      }

      const md = updateLastUpdatedDate(originalMarkdown, previousHash, hash, language);

      if (md !== originalMarkdown) {
        fs.writeFileSync(markdownPath, md, 'utf8');
        console.log(`Updated date in ${name}`);
      }

      const htmlContent = keepDashesOnLine(marked.parse(md, { renderer: createRenderer() }));
      const html = `
      <!DOCTYPE html>
      <html lang="${language.code}">
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

      console.log('Generated ' + path.join(language.dir, file.out + '.pdf').replace(/^\.\//, ''));
      fs.writeFileSync(jsonPath, JSON.stringify(toPageData(md, hash, language, languages), null, 2) + '\n', 'utf8');
      console.log('Generated ' + path.join(language.dir, file.out + '.json').replace(/^\.\//, ''));
    }
  }

  await browser.close();
}

generate().catch(console.error);
