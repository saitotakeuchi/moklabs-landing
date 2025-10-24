# PDF Upload API Documentation

## Overview

The PDF Upload endpoint allows you to upload PDF documents directly for indexing and embedding generation. This endpoint provides comprehensive validation, automatic text extraction, and stores the content with page-level citations.

## Endpoint

**POST** `/api/v1/documents/upload-pdf`

## Request

### Headers
```
Content-Type: multipart/form-data
```

### Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | PDF file to upload (max 50MB) |
| `edital_id` | String | Yes | PNLD edital identifier |
| `title` | String | Yes | Document title |
| `metadata` | String (JSON) | No | Additional metadata as JSON string |

### Validation Rules

1. **File Type**: Must be a PDF file (`.pdf` extension)
2. **Content Type**: Must be `application/pdf` or `application/x-pdf`
3. **File Size**: Maximum 50MB
4. **File Content**: Must contain extractable text
5. **Metadata**: If provided, must be valid JSON object

## Response

### Success Response (201 Created)

```json
{
  "document_id": "uuid-string",
  "edital_id": "PNLD-2027-2030",
  "title": "Sample Document",
  "filename": "document.pdf",
  "pages_processed": 15,
  "chunks_created": 42,
  "status": "success"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `document_id` | String | Unique document identifier (UUID) |
| `edital_id` | String | PNLD edital identifier |
| `title` | String | Document title |
| `filename` | String | Original filename |
| `pages_processed` | Integer | Number of pages processed |
| `chunks_created` | Integer | Number of text chunks created |
| `status` | String | Processing status: "success", "processing", or "failed" |

## Error Responses

### 400 Bad Request

**Scenario 1: Invalid file type**
```json
{
  "detail": "Only PDF files are accepted. Please upload a file with .pdf extension"
}
```

**Scenario 2: Empty file**
```json
{
  "detail": "Uploaded file is empty"
}
```

**Scenario 3: Unreadable PDF**
```json
{
  "detail": "PDF file appears to be empty or unreadable. Please ensure the PDF contains extractable text"
}
```

**Scenario 4: Invalid metadata JSON**
```json
{
  "detail": "Invalid JSON in metadata field: Expecting value: line 1 column 1 (char 0)"
}
```

### 413 Request Entity Too Large

```json
{
  "detail": "File size (75.23MB) exceeds maximum allowed size of 50MB"
}
```

### 422 Validation Error

```json
{
  "detail": [
    {
      "loc": ["body", "file"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### 500 Internal Server Error

```json
{
  "detail": "Failed to process PDF upload: [error message] | Type: [error type]"
}
```

## Processing Flow

1. **Validation**
   - Validates file type and extension
   - Validates content type header
   - Checks file size (max 50MB)
   - Validates metadata JSON if provided

2. **Text Extraction**
   - Extracts text from each page
   - Preserves page numbers for citations

3. **Chunking**
   - Splits text into manageable chunks (max 1000 characters)
   - Maintains 200-character overlap between chunks
   - Tracks page number and chunk index

4. **Embedding Generation**
   - Generates embeddings for each chunk using OpenAI
   - Uses `text-embedding-3-small` model

5. **Database Storage**
   - Stores document metadata in `pnld_documents` table
   - Stores embeddings with page info in `pnld_embeddings` table
   - Enables vector similarity search

## Example Usage

### Using cURL

```bash
curl -X POST "http://localhost:8000/api/v1/documents/upload-pdf" \
  -H "accept: application/json" \
  -F "file=@/path/to/document.pdf" \
  -F "edital_id=PNLD-2027-2030" \
  -F "title=Educational Material Guide" \
  -F 'metadata={"category":"guidelines","year":2027}'
```

### Using Python (requests)

```python
import requests
import json

url = "http://localhost:8000/api/v1/documents/upload-pdf"

# Prepare the file and form data
files = {
    'file': ('document.pdf', open('document.pdf', 'rb'), 'application/pdf')
}

data = {
    'edital_id': 'PNLD-2027-2030',
    'title': 'Educational Material Guide',
    'metadata': json.dumps({
        'category': 'guidelines',
        'year': 2027
    })
}

# Upload the file
response = requests.post(url, files=files, data=data)

if response.status_code == 201:
    result = response.json()
    print(f"Upload successful!")
    print(f"Document ID: {result['document_id']}")
    print(f"Pages: {result['pages_processed']}")
    print(f"Chunks: {result['chunks_created']}")
else:
    print(f"Upload failed: {response.text}")
```

### Using JavaScript (Fetch API)

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('edital_id', 'PNLD-2027-2030');
formData.append('title', 'Educational Material Guide');
formData.append('metadata', JSON.stringify({
  category: 'guidelines',
  year: 2027
}));

const response = await fetch('/api/v1/documents/upload-pdf', {
  method: 'POST',
  body: formData
});

if (response.ok) {
  const result = await response.json();
  console.log('Upload successful!', result);
} else {
  const error = await response.json();
  console.error('Upload failed:', error.detail);
}
```

## Testing

A test script is provided at `test_pdf_upload.py`:

```bash
# Test locally
python test_pdf_upload.py --local sample.pdf

# Test on production
python test_pdf_upload.py --production sample.pdf

# Run validation tests
python test_pdf_upload.py --validations --local
```

## Metadata Storage

The endpoint stores comprehensive metadata about the uploaded file:

```json
{
  "filename": "document.pdf",
  "content_type": "application/pdf",
  "file_size_bytes": 1048576,
  "file_size_mb": 1.0,
  "total_pages": 15,
  "total_chunks": 42,
  "custom_field": "custom_value"  // From metadata parameter
}
```

## Performance Considerations

1. **File Size**: Larger files take longer to process
   - Small files (<1MB): ~5-10 seconds
   - Medium files (1-10MB): ~15-30 seconds
   - Large files (10-50MB): ~30-120 seconds

2. **Page Count**: More pages = more chunks = more embeddings
   - Each chunk requires an OpenAI API call
   - Calls are batched for efficiency

3. **Timeout**: Default timeout is 120 seconds
   - Adjust if processing very large files

## Differences from `/index-pdf` Endpoint

| Feature | `/index-pdf` | `/upload-pdf` |
|---------|--------------|---------------|
| File size validation | ❌ No | ✅ Yes (50MB limit) |
| Content type validation | ✅ Basic | ✅ Comprehensive |
| File size in metadata | ❌ No | ✅ Yes |
| Metadata JSON support | ❌ No | ✅ Yes |
| Detailed error messages | ✅ Basic | ✅ Enhanced |
| Response model | DocumentIndexResponse | PdfUploadResponse |
| Filename in response | ❌ No | ✅ Yes |
| Pages count in response | ❌ No | ✅ Yes |

## Best Practices

1. **Validate files client-side** before uploading to improve UX
2. **Show progress indicators** for large file uploads
3. **Handle errors gracefully** and display user-friendly messages
4. **Store document_id** for future reference and searching
5. **Use appropriate metadata** to categorize and filter documents
6. **Test with sample PDFs** before deploying to production

## Security Considerations

1. Files are validated before processing
2. Maximum file size prevents DoS attacks
3. Only PDF files are accepted
4. Files are processed in memory (BytesIO)
5. No files are permanently stored on disk
6. Original file content is not retained after processing

## Rate Limiting

Consider implementing rate limiting for production:
- Limit uploads per user per minute
- Limit concurrent uploads
- Monitor OpenAI API usage

## Next Steps

After uploading a document:
1. Use the `document_id` in chat queries with `edital_id` filter
2. The document becomes searchable via vector similarity
3. Citations include page numbers for easy reference
