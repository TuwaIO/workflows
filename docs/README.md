# TUWA Legal Documents

This directory contains the source Markdown files and the generated PDF files for TUWA's legal documents (Privacy Policy, Terms of Service, and Cookie Policy).

## How to edit and generate new PDFs

1. Open the corresponding `.md` file (e.g., `privacy.md`, `terms.md`, `cookie.md`) and make your text edits.
2. Ensure you have Node.js installed.
3. Open your terminal in this `docs` directory.
4. Run the following command to install dependencies (only needed once):

```bash
npm install
```

5. Run the script to transform the Markdown files into formatted PDFs with the TUWA logo and styles:

```bash
node generate_pdf.js
```

The script will automatically parse the Markdown files, apply the official CSS styles, and generate `privacy.pdf`, `terms.pdf`, and `cookie.pdf`.
