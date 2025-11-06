# Document Detail API Documentation

## Overview

The Document Detail endpoint retrieves comprehensive information about a specific document including metadata, statistics, and optionally sample chunks. This endpoint is essential for building document management and viewing UIs.

## Endpoint

**GET** `/api/v1/documents/{document_id}`

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `document_id` | string (UUID) | Yes | Unique document identifier |

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `include_chunks` | boolean | No | false | Include sample chunks in response |

## Response

### Success Response (200 OK)

**Without chunks (default):**

```json
{
  "id": "4d915c2d-22ff-4b1b-97f0-e2961b90677e",
  "edital_id": "PNLD-2027-2030-ANOS-INICIAIS",
  "title": "Minuta Edital PNLD Anos Iniciais 2027-2030",
  "metadata": {
    "filename": "edital_anos_iniciais.pdf",
    "total_pages": 15,
    "file_size_mb": 2.5
  },
  "created_at": "2025-10-18T17:28:09.483381Z",
  "updated_at": "2025-10-18T17:28:09.483381Z",
  "chunks_count": 70,
  "embeddings_count": 70,
  "sample_chunks": null
}
```

**With chunks (include_chunks=true):**

```json
{
  "id": "4d915c2d-22ff-4b1b-97f0-e2961b90677e",
  "edital_id": "PNLD-2027-2030-ANOS-INICIAIS",
  "title": "Minuta Edital PNLD Anos Iniciais 2027-2030",
  "metadata": {
    "filename": "edital_anos_iniciais.pdf",
    "total_pages": 15,
    "file_size_mb": 2.5
  },
  "created_at": "2025-10-18T17:28:09.483381Z",
  "updated_at": "2025-10-18T17:28:09.483381Z",
  "chunks_count": 70,
  "embeddings_count": 70,
  "sample_chunks": [
    {
      "content": "PROGRAMA NACIONAL DO LIVRO DIDÁTICO - PNLD 2027-2030. O presente documento estabelece...",
      "page_number": 1,
      "chunk_index": 0
    },
    {
      "content": "Os critérios de avaliação incluem adequação ao BNCC, qualidade pedagógica...",
      "page_number": 2,
      "chunk_index": 0
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (UUID) | Unique document identifier |
| `edital_id` | String | PNLD edital identifier |
| `title` | String | Document title |
| `metadata` | Object (nullable) | Additional document metadata (filename, pages, etc.) |
| `created_at` | String (ISO 8601) | Document creation timestamp |
| `updated_at` | String (ISO 8601) | Last update timestamp |
| `chunks_count` | Integer | Number of text chunks |
| `embeddings_count` | Integer | Number of embeddings generated |
| `sample_chunks` | Array (nullable) | Sample chunks (only if `include_chunks=true`) |
| `sample_chunks[].content` | String | Chunk text content |
| `sample_chunks[].page_number` | Integer (nullable) | Source page number |
| `sample_chunks[].chunk_index` | Integer (nullable) | Chunk index within page |

## Error Responses

### 404 Not Found

**Scenario: Document does not exist**

```json
{
  "detail": "Document 4d915c2d-22ff-4b1b-97f0-e2961b90677e not found"
}
```

### 422 Unprocessable Entity

**Scenario: Invalid UUID format**

```json
{
  "detail": [
    {
      "loc": ["path", "document_id"],
      "msg": "value is not a valid uuid",
      "type": "type_error.uuid"
    }
  ]
}
```

### 500 Internal Server Error

```json
{
  "detail": "Failed to retrieve document: [error message] | Type: [error type]"
}
```

## Usage Examples

### Example 1: Get Document Details (Basic)

```bash
curl -X GET "https://pnld-ai-service.fly.dev/api/v1/documents/4d915c2d-22ff-4b1b-97f0-e2961b90677e"
```

**Response:**

```json
{
  "id": "4d915c2d-22ff-4b1b-97f0-e2961b90677e",
  "edital_id": "PNLD-2027-2030-ANOS-INICIAIS",
  "title": "Minuta Edital PNLD Anos Iniciais 2027-2030",
  "metadata": {...},
  "created_at": "2025-10-18T17:28:09Z",
  "updated_at": "2025-10-18T17:28:09Z",
  "chunks_count": 70,
  "embeddings_count": 70,
  "sample_chunks": null
}
```

### Example 2: Get Document with Sample Chunks

```bash
curl -X GET "https://pnld-ai-service.fly.dev/api/v1/documents/4d915c2d-22ff-4b1b-97f0-e2961b90677e?include_chunks=true"
```

### Using Python

```python
import requests

base_url = "https://pnld-ai-service.fly.dev"
document_id = "4d915c2d-22ff-4b1b-97f0-e2961b90677e"

# Get basic document details
response = requests.get(f"{base_url}/api/v1/documents/{document_id}")

if response.status_code == 200:
    document = response.json()

    print(f"Title: {document['title']}")
    print(f"Edital: {document['edital_id']}")
    print(f"Chunks: {document['chunks_count']}")
    print(f"Created: {document['created_at']}")

    # Get metadata
    if document.get('metadata'):
        print(f"Filename: {document['metadata'].get('filename')}")
        print(f"Pages: {document['metadata'].get('total_pages')}")
elif response.status_code == 404:
    print("Document not found")
else:
    print(f"Error: {response.status_code}")

# Get document with sample chunks
response = requests.get(
    f"{base_url}/api/v1/documents/{document_id}",
    params={"include_chunks": True}
)

if response.status_code == 200:
    document = response.json()

    if document.get('sample_chunks'):
        print(f"\nSample chunks ({len(document['sample_chunks'])}):")
        for idx, chunk in enumerate(document['sample_chunks'], 1):
            print(f"{idx}. Page {chunk.get('page_number')}: {chunk['content'][:100]}...")
```

### Using JavaScript (Fetch API)

```javascript
const baseUrl = 'https://pnld-ai-service.fly.dev';
const documentId = '4d915c2d-22ff-4b1b-97f0-e2961b90677e';

// Get basic document details
const response = await fetch(`${baseUrl}/api/v1/documents/${documentId}`);

if (response.ok) {
  const document = await response.json();

  console.log('Title:', document.title);
  console.log('Edital:', document.edital_id);
  console.log('Chunks:', document.chunks_count);
  console.log('Created:', document.created_at);

  // Metadata
  if (document.metadata) {
    console.log('Filename:', document.metadata.filename);
    console.log('Pages:', document.metadata.total_pages);
  }
} else if (response.status === 404) {
  console.log('Document not found');
} else {
  console.log('Error:', response.status);
}

// Get document with sample chunks
const responseWithChunks = await fetch(
  `${baseUrl}/api/v1/documents/${documentId}?include_chunks=true`
);

if (responseWithChunks.ok) {
  const document = await responseWithChunks.json();

  if (document.sample_chunks) {
    console.log(`\nSample chunks (${document.sample_chunks.length}):`);
    document.sample_chunks.forEach((chunk, idx) => {
      console.log(`${idx + 1}. Page ${chunk.page_number}: ${chunk.content.substring(0, 100)}...`);
    });
  }
}
```

## Sample Chunks Behavior

### Default Behavior (include_chunks=false)

By default, `sample_chunks` is `null` to keep responses lightweight:

```json
{
  "id": "...",
  "title": "...",
  "sample_chunks": null
}
```

### With include_chunks=true

Returns up to **5 sample chunks** from the document:

```json
{
  "id": "...",
  "title": "...",
  "sample_chunks": [
    {"content": "...", "page_number": 1, "chunk_index": 0},
    {"content": "...", "page_number": 1, "chunk_index": 1},
    {"content": "...", "page_number": 2, "chunk_index": 0},
    {"content": "...", "page_number": 2, "chunk_index": 1},
    {"content": "...", "page_number": 3, "chunk_index": 0}
  ]
}
```

Chunks are returned in chronological order (by `created_at`) to show the beginning of the document.

## Integration with Other Endpoints

### Workflow: List → Detail → View

```python
import requests

base_url = "https://pnld-ai-service.fly.dev"

# 1. List documents to find one of interest
list_response = requests.get(f"{base_url}/api/v1/documents")
documents = list_response.json()['documents']

# 2. Get detailed information about a specific document
document_id = documents[0]['id']
detail_response = requests.get(f"{base_url}/api/v1/documents/{document_id}")
document = detail_response.json()

print(f"Document: {document['title']}")
print(f"Chunks: {document['chunks_count']}")

# 3. Get sample chunks to preview content
preview_response = requests.get(
    f"{base_url}/api/v1/documents/{document_id}?include_chunks=true"
)
preview = preview_response.json()

if preview.get('sample_chunks'):
    print("\nPreview:")
    for chunk in preview['sample_chunks'][:2]:
        print(f"- {chunk['content'][:150]}...")
```

### Comparing List vs Detail Endpoints

| Feature | List Endpoint | Detail Endpoint |
|---------|---------------|-----------------|
| Response size | Lightweight | Moderate (without chunks) / Large (with chunks) |
| Fields | Basic (id, title, chunks_count) | Complete (all metadata) |
| Use case | Browsing, searching | Viewing, analyzing |
| Pagination | Yes | N/A |
| Sample chunks | No | Optional |

## Use Cases

### Document Viewer UI

```typescript
// React example
import { useEffect, useState } from 'react';

function DocumentViewer({ documentId }: { documentId: string }) {
  const [document, setDocument] = useState(null);
  const [showChunks, setShowChunks] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const params = new URLSearchParams();
        if (showChunks) {
          params.append('include_chunks', 'true');
        }

        const response = await fetch(
          `/api/v1/documents/${documentId}?${params}`
        );

        if (response.ok) {
          const data = await response.json();
          setDocument(data);
        } else if (response.status === 404) {
          console.error('Document not found');
        }
      } catch (err) {
        console.error('Failed to load document:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId, showChunks]);

  if (loading) return <div>Loading...</div>;
  if (!document) return <div>Document not found</div>;

  return (
    <div>
      <h1>{document.title}</h1>
      <div className="metadata">
        <p>Edital: {document.edital_id}</p>
        <p>Chunks: {document.chunks_count}</p>
        <p>Created: {new Date(document.created_at).toLocaleString()}</p>
        {document.metadata && (
          <>
            <p>Filename: {document.metadata.filename}</p>
            <p>Pages: {document.metadata.total_pages}</p>
          </>
        )}
      </div>

      <button onClick={() => setShowChunks(!showChunks)}>
        {showChunks ? 'Hide' : 'Show'} Sample Chunks
      </button>

      {showChunks && document.sample_chunks && (
        <div className="chunks">
          <h2>Sample Chunks</h2>
          {document.sample_chunks.map((chunk, idx) => (
            <div key={idx} className="chunk">
              <span className="page">Page {chunk.page_number}</span>
              <p>{chunk.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Document Statistics Dashboard

```python
def get_document_statistics(document_id: str) -> dict:
    """Get statistics about a document."""
    response = requests.get(f"{base_url}/api/v1/documents/{document_id}")

    if response.status_code == 200:
        doc = response.json()

        return {
            "title": doc["title"],
            "total_chunks": doc["chunks_count"],
            "embeddings": doc["embeddings_count"],
            "pages": doc.get("metadata", {}).get("total_pages", 0),
            "file_size_mb": doc.get("metadata", {}).get("file_size_mb", 0),
            "created": doc["created_at"],
            "updated": doc["updated_at"],
        }

    return {}

# Usage
stats = get_document_statistics(document_id)
print(f"Document: {stats['title']}")
print(f"Chunks per page: {stats['total_chunks'] / stats['pages']:.1f}")
```

### Content Preview

```python
def preview_document_content(document_id: str, max_chars: int = 500):
    """Preview document content from sample chunks."""
    response = requests.get(
        f"{base_url}/api/v1/documents/{document_id}",
        params={"include_chunks": True}
    )

    if response.status_code == 200:
        doc = response.json()

        if doc.get('sample_chunks'):
            # Concatenate first chunks for preview
            preview_text = " ".join(
                chunk["content"] for chunk in doc['sample_chunks'][:3]
            )

            # Truncate to max_chars
            if len(preview_text) > max_chars:
                preview_text = preview_text[:max_chars] + "..."

            return preview_text

    return None

# Usage
preview = preview_document_content(document_id)
if preview:
    print(f"Preview: {preview}")
```

## Performance Notes

1. **Query Performance**
   - Without chunks: ~100-150ms (2 database queries)
   - With chunks: ~150-250ms (3 database queries)

2. **Response Size**
   - Without chunks: ~500 bytes - 2 KB (metadata only)
   - With chunks: ~5-15 KB (includes 5 sample chunks)

3. **Recommendations**
   - Use default (no chunks) for list views and quick lookups
   - Use `include_chunks=true` only when preview is needed
   - Cache document details client-side by document_id
   - Invalidate cache on document updates

## Testing

Test script provided at `test_document_detail.py`:

```bash
# Test locally
python test_document_detail.py

# Test on production
python test_document_detail.py --production
```

## Best Practices

1. **Check for existence** - Always handle 404 errors gracefully
2. **Use chunks sparingly** - Only request chunks when needed for preview
3. **Cache metadata** - Document metadata changes infrequently
4. **Display counts** - Show chunk/embedding counts to users
5. **Show metadata** - Display filename, pages, size when available
6. **Handle missing metadata** - Not all documents have complete metadata
7. **Validate UUIDs** - Ensure document_id is valid UUID before requesting

## Database Schema

### pnld_documents Table

```sql
CREATE TABLE pnld_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    edital_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### pnld_embeddings Table

```sql
CREATE TABLE pnld_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES pnld_documents(id),
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    page_number INTEGER,
    chunk_index INTEGER,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_embeddings_document ON pnld_embeddings(document_id);
```

## Future Enhancements

Potential improvements for future versions:

- [ ] Pagination for chunks (retrieve all chunks in pages)
- [ ] Filter chunks by page range
- [ ] Full-text search within document chunks
- [ ] Document version history
- [ ] Related documents suggestions
- [ ] Export document content to formats (TXT, JSON)
- [ ] Chunk highlighting for search results
- [ ] Document analytics (views, searches, citations)
