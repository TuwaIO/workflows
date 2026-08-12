import puppeteer from 'puppeteer';
import { marked } from 'marked';
import fs from 'fs';
import path from 'path';

const files = [
  { name: 'privacy', out: 'privacy' },
  { name: 'terms', out: 'terms' },
  { name: 'cookie', out: 'cookie' },
  { name: 'cookie', out: 'сookie' } // Cyrillic 'с' for legacy URL support
];

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  timeZone: 'Europe/Kyiv',
  year: 'numeric'
});

function updateLastUpdatedDate(markdown) {
  const lastUpdated = `Last Updated: ${DATE_FORMATTER.format(new Date())}`;

  return markdown.replace(/^Last Updated:\s*.*$/m, lastUpdated);
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
`;

async function generate() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();

  for (const file of files) {
    const markdownPath = path.join(process.cwd(), file.name + '.md');
    const originalMarkdown = fs.readFileSync(markdownPath, 'utf8');
    const md = updateLastUpdatedDate(originalMarkdown);

    if (md !== originalMarkdown) {
      fs.writeFileSync(markdownPath, md, 'utf8');
      console.log(`Updated date in ${file.name}.md`);
    }

    const svgLogo = fs.readFileSync(path.join(process.cwd(), '../preview/logo_v2.svg'), 'utf8');
    const htmlContent = marked.parse(md);
    
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
          <a class="header-email" href="mailto:liastik@proton.me">liastik@proton.me</a>
        </div>
        ${htmlContent}
      </body>
      </html>
    `;

    await page.setContent(html);
    await page.evaluateHandle('document.fonts.ready');
    await page.pdf({
      path: path.join(process.cwd(), file.out + '.pdf'),
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
    });
    console.log('Generated ' + file.out + '.pdf');
  }

  await browser.close();
}

generate().catch(console.error);
