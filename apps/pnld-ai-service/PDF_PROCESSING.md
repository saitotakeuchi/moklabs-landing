# PDF Processing Documentation

## Overview

The PNLD AI Service provides PDF document upload and indexing capabilities with vector search support. This document describes the PDF processing behavior, limitations, and error handling.

## Supported PDF Types

### ✅ Supported: Text-Based PDFs

The service accepts PDFs that contain **extractable/selectable text**:

- PDFs created from word processors (Word, Google Docs, etc.)
- PDFs exported from design tools with text layers
- PDFs with embedded fonts and text objects
- PDFs that allow text selection when opened in a PDF viewer

### ❌ Not Supported: Scanned/Image-Based PDFs

The service **rejects** PDFs that contain no extractable text:

- Scanned documents (photocopies, scans from physical documents)
- PDFs created from image files without OCR processing
- Image-only PDFs without a text layer
- Corrupted or malformed PDFs with unreadable text

## Error Handling

### TextlessPdfError (HTTP 422)

When a PDF contains no extractable text, the API returns a `422 Unprocessable Entity` error with a descriptive message:

```json
{
  "detail": "PDF contains no extractable text across 5 page(s). This typically indicates a scanned document or image-based PDF. Please provide a PDF with selectable text or use OCR software to convert the document first."
}
```

### How to Test if a PDF is Supported

Open the PDF in a PDF viewer (Adobe Acrobat, Preview, Chrome, etc.):
1. Try to select text with your mouse
2. If you can select and copy text → **Supported** ✅
3. If you can't select text (only images) → **Not Supported** ❌

## Converting Scanned PDFs

If you have a scanned or image-based PDF, you can convert it using OCR software:

### Recommended OCR Tools

- **Adobe Acrobat Pro**: Tools > Recognize Text > In This File
- **Online Services**:
  - [Adobe Online OCR](https://www.adobe.com/acrobat/online/ocr-pdf.html)
  - [OCRmyPDF](https://ocrmypdf.readthedocs.io/) (free, open-source)
  - [PDFTron](https://www.pdftron.com/pdf-tools/ocr/)
- **Command Line (OCRmyPDF)**:
  ```bash
  pip install ocrmypdf
  ocrmypdf input_scanned.pdf output_searchable.pdf
  ```

After OCR processing, the PDF will have a searchable text layer and can be uploaded to the service.

## API Endpoints

### POST /api/v1/documents/upload-pdf

Upload and index a PDF document with comprehensive validation.

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/documents/upload-pdf \
  -F "file=@document.pdf" \
  -F "edital_id=PNLD-2027-ANOS-INICIAIS" \
  -F "title=My Document"
```

**Success Response (200):**
```json
{
  "document_id": "uuid",
  "edital_id": "PNLD-2027-ANOS-INICIAIS",
  "title": "My Document",
  "filename": "document.pdf",
  "pages_processed": 10,
  "chunks_created": 15,
  "status": "success"
}
```

**Error Responses:**

- `400 Bad Request`: Invalid file type, empty file, or invalid metadata
- `413 Request Entity Too Large`: File exceeds 50MB limit
- `422 Unprocessable Entity`: **PDF contains no extractable text** (scanned/image-based)
- `500 Internal Server Error`: Processing error

## Code Implementation

### TextlessPdfError Exception

Located in `app/services/embeddings.py`:

```python
class TextlessPdfError(Exception):
    """
    Raised when a PDF file contains no extractable text.

    This typically occurs with:
    - Scanned documents (images without OCR)
    - PDFs created from images without text layer
    - Corrupted or malformed PDFs

    Resolution requires OCR processing to extract text from images.
    """
    pass
```

### PDF Processing Flow

1. **extract_pages_from_pdf()**: Extracts text from each PDF page
   - Checks if `extract_text()` returns `None`
   - Guards against `None` before calling `.strip()`
   - Raises `TextlessPdfError` if no pages have text

2. **process_pdf_to_chunks()**: Main PDF processing function
   - Calls `extract_pages_from_pdf()`
   - Splits large pages into chunks
   - Propagates `TextlessPdfError` to API layer

3. **API Endpoints**: Handle the exception
   - Catch `TextlessPdfError`
   - Return HTTP 422 with clear error message
   - Provide actionable guidance for users

## Testing

### Unit Tests

Test coverage includes:
- PDFs with mixed pages (some with text, some without)
- Completely textless PDFs
- Pages where `extract_text()` returns `None`
- Pages with only whitespace

### Integration Tests

See `test_textless_pdf.py` for end-to-end testing of:
- Upload endpoint rejection of scanned PDFs
- Error message clarity and actionability
- Successful processing of text-based PDFs

## Future Enhancements

Potential features for future consideration:

1. **OCR Integration**: Automatic OCR processing for scanned PDFs
   - Libraries: pytesseract, OCRmyPDF, Google Cloud Vision
   - Trade-offs: Processing time, cost, accuracy

2. **Partial Text Handling**: Accept PDFs with some textless pages
   - Current: Reject if *any* page is textless
   - Future: Process text pages, skip image-only pages

3. **Image Extraction**: Extract and process images separately
   - Use computer vision for charts/diagrams
   - Store images alongside text content

## Support

For questions or issues:
- Check PDF text extractability before upload
- Use OCR tools for scanned documents
- Contact support if text-based PDFs are being rejected

## Related Documentation

- [OpenAI Embeddings API](https://platform.openai.com/docs/guides/embeddings)
- [pypdf Documentation](https://pypdf.readthedocs.io/)
- [OCRmyPDF](https://ocrmypdf.readthedocs.io/)
