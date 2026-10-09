# lib — software the pages use, kept here so nothing is fetched from the internet

The redaction, split and naming tools need software to read PDFs, read scanned
pages and write PDFs and zips. Copies live in this folder so those tools work the
same on the live site and on a downloaded copy with the internet switched off.

| File(s) | What it is | Version | Licence |
|---|---|---|---|
| `pdfjs/pdf.min.js`, `pdfjs/pdf.worker.min.js` | PDF.js — reads PDFs | 3.11.174 | Apache-2.0 (`pdfjs/LICENSE.txt`) |
| `pdfjs/legacy/pdf.min.js`, `pdfjs/legacy/pdf.worker.js` | PDF.js legacy build, for older phone and tablet browsers that cannot run the standard one | 3.11.174 | Apache-2.0 |
| `pdf-lib.min.js` | pdf-lib — splits PDFs, writes the redacted PDF | 1.17.1 | MIT (`pdf-lib-LICENSE.md`) |
| `jszip.min.js` | JSZip — makes zip files | 3.10.2 | MIT or GPLv3 (`jszip-LICENSE.md`) |
| `tesseract/tesseract.min.js`, `tesseract/worker.min.js` | Tesseract.js — reads scanned pages (OCR) | 7.0.0 | Apache-2.0 (`tesseract/LICENSE-tesseract.js.md`) |
| `tesseract/tesseract-core-*lstm.wasm.js` | Tesseract engine | tesseract.js-core 7.0.0 | Apache-2.0 (`tesseract/LICENSE-tesseract-core.txt`) |
| `tesseract/eng.traineddata.gz` | English reading data (tessdata) | 4.x | Apache-2.0 |

Savvy Renter's own files here:

- `sr-pdfjs.js` — points PDF.js at this folder, and loads the legacy build when the standard one fails to start. Opened from a file, it runs PDF.js on the page itself, because browsers will not start a worker from a file.
- `sr-ocr.js` — the one place a page starts the text reader (`SROcr.create()`).
- `tesseract/offline-worker.js`, `tesseract/offline-eng.js` — the reader, its engine and the English data packed as strings, used only when the site is opened from a file. Built from the files above with one fix to `worker.min.js` (a language passed in as data was named by its data rather than its code). Rebuild them if the reader is ever updated.
