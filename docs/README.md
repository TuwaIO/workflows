# TUWA Legal Documents

This directory contains the source Markdown files and the generated files of TUWA's legal documents: Terms of Service, Privacy Policy, Cookie Policy, Refund Policy and Security Policy.

For every document, `generate_pdf.js` writes:

- `<name>.pdf` — the official document with the TUWA logo, linked by the Download PDF button;
- `<name>.json` — the page content for `@tuwaio/docs-ui` (`loadPolicy` and `PolicyDocument`): the title, the date, the sections with their anchors and the body as HTML. The website and the Quasar dashboard render the policy pages from it.

A document with an unfinished placeholder (`[TODO: …]`) is not generated: its previous PDF and page stay in place until the text is complete, and the script exits with an error. Placeholders that are part of a document, such as the fields of the model withdrawal form in the Refund Policy (`[date]`, `[name]`), are not affected.

## Languages

English is the original: `<name>.md` in this directory. A translation lives in a directory named after its language — Ukrainian in `uk/` (`uk/terms.md`) — and is generated next to it (`uk/terms.pdf`, `uk/terms.json`). Its date line uses the label of its language (`Останнє оновлення: 23 жовтня 2026 р.`), and it changes, like the English one, only when that text changes.

Every section heading of a translation names the anchor of the English section: `## 5. Облік і оплата {#account-billing}`. A link to a section (`/refund#how-to-request-a-refund`) then works in every language. The script refuses a translation whose sections or anchors differ from the English document. Each page data file lists the languages its document exists in (`"languages": ["en", "uk"]`), and `@tuwaio/docs-ui` shows a language switch from it.

Update a translation together with its English document: a translation that was not updated keeps its older date, and the page shows it.

The website, the docs hub and the Quasar dashboard read these files from `main`, and `@tuwaio/docs-ui` lists every policy (`policies`): a new document needs an entry there too. Footers show a policy once its entry is `published: true`; until then it is listed only on the docs hub (`/policies`, marked "In review").

## How to edit and generate new files

1. Open the corresponding `.md` file (e.g., `privacy.md`, `terms.md`, `cookie.md`, `refund.md`, `security.md`) and make your text edits. Keep section headings as `## <number>. <Title>`: the anchor of a section comes from its title without the number (`## 7. How to Request a Refund` → `#how-to-request-a-refund`), so renumbering keeps links working, and renaming a section changes its anchor.
2. Ensure you have Node.js installed.
3. Open your terminal in this `docs` directory.
4. Run the following command to install dependencies (only needed once):

```bash
npm install
```

5. Run the script to transform the Markdown files into PDFs and page data:

```bash
npm run generate
```

It regenerates only the documents whose text changed (and sets their "Last Updated" date). To regenerate every document, for example after a change of the layout in `generate_pdf.js`, run:

```bash
npm run generate:force
```

Commit the generated files only when no document has a `[TODO]` left: the script reports each one and exits with an error.

The script regenerates only the documents whose text changed since the last run (it compares the text with the `sourceHash` saved in the JSON) and sets their `Last Updated` date to today. Add `--force` to regenerate every document; dates still change only where the text changed. The PDF styles keep a heading with its text and never split a list item, a table row or a quote between pages.
