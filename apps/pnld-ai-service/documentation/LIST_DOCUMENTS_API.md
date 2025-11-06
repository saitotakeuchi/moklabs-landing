# List Documents API Documentation

## Overview

The List Documents endpoint provides a paginated list of all indexed documents with filtering and sorting capabilities. This endpoint is essential for building document management UIs.

## Endpoint

**GET** `/api/v1/documents`

## Query Parameters

| Parameter | Type | Required | Default | Validation | Description |
|-----------|------|----------|---------|------------|-------------|
| `edital_id` | string | No | - | - | Filter by PNLD edital identifier |
| `limit` | integer | No | 20 | 1-100 | Number of items per page |
| `offset` | integer | No | 0 | ≥0 | Offset for pagination |
| `sort_by` | string | No | created_at | created_at, updated_at, title | Field to sort by |

## Response

### Success Response (200 OK)

```json
{
  "documents": [
    {
      "id": "uuid-string",
      "edital_id": "PNLD-2027-2030",
      "title": "Educational Material Guidelines",
      "chunks_count": 42,
      "created_at": "2025-10-22T12:00:00Z",
      "updated_at": "2025-10-22T12:00:00Z",
      "metadata": {
        "filename": "guidelines.pdf",
        "total_pages": 15,
        "file_size_mb": 2.5
      }
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `documents` | Array | List of document items |
| `documents[].id` | String | Unique document identifier (UUID) |
| `documents[].edital_id` | String | PNLD edital identifier |
| `documents[].title` | String | Document title |
| `documents[].chunks_count` | Integer | Number of text chunks/embeddings |
| `documents[].created_at` | String (ISO 8601) | Creation timestamp |
| `documents[].updated_at` | String (ISO 8601) | Last update timestamp |
| `documents[].metadata` | Object | Additional document metadata |
| `total` | Integer | Total number of documents matching filters |
| `limit` | Integer | Number of items per page |
| `offset` | Integer | Current offset |

## Error Responses

### 400 Bad Request

**Scenario: Invalid sort_by field**

```json
{
  "detail": "Invalid sort_by field. Must be one of: created_at, updated_at, title"
}
```

### 422 Validation Error

**Scenario: Invalid query parameters**

```json
{
  "detail": [
    {
      "loc": ["query", "limit"],
      "msg": "ensure this value is less than or equal to 100",
      "type": "value_error.number.not_le"
    }
  ]
}
```

### 500 Internal Server Error

```json
{
  "detail": "Failed to list documents: [error message] | Type: [error type]"
}
```

## Usage Examples

### Example 1: Get First Page (Default)

```bash
curl -X GET "https://pnld-ai-service.fly.dev/api/v1/documents"
```

**Response:**

```json
{
  "documents": [...],
  "total": 50,
  "limit": 20,
  "offset": 0
}
```

### Example 2: Get Second Page

```bash
curl -X GET "https://pnld-ai-service.fly.dev/api/v1/documents?limit=20&offset=20"
```

### Example 3: Filter by Edital ID

```bash
curl -X GET "https://pnld-ai-service.fly.dev/api/v1/documents?edital_id=PNLD-2027-2030"
```

### Example 4: Sort by Title

```bash
curl -X GET "https://pnld-ai-service.fly.dev/api/v1/documents?sort_by=title&limit=10"
```

### Example 5: Combined Filters

```bash
curl -X GET "https://pnld-ai-service.fly.dev/api/v1/documents?edital_id=PNLD-2027&limit=10&offset=0&sort_by=created_at"
```

### Using Python

```python
import requests

base_url = "https://pnld-ai-service.fly.dev"
endpoint = f"{base_url}/api/v1/documents"

# Basic request
response = requests.get(endpoint)
data = response.json()

print(f"Total documents: {data['total']}")
print(f"Showing: {len(data['documents'])} documents")

for doc in data['documents']:
    print(f"- {doc['title']} ({doc['chunks_count']} chunks)")

# With filters
params = {
    "edital_id": "PNLD-2027-2030",
    "limit": 10,
    "offset": 0,
    "sort_by": "title"
}

response = requests.get(endpoint, params=params)
data = response.json()
```

### Using JavaScript (Fetch API)

```javascript
const baseUrl = 'https://pnld-ai-service.fly.dev';
const endpoint = `${baseUrl}/api/v1/documents`;

// Basic request
const response = await fetch(endpoint);
const data = await response.json();

console.log(`Total: ${data.total}`);
console.log(`Documents:`, data.documents);

// With filters
const params = new URLSearchParams({
  edital_id: 'PNLD-2027-2030',
  limit: '10',
  offset: '0',
  sort_by: 'title'
});

const filteredResponse = await fetch(`${endpoint}?${params}`);
const filteredData = await filteredResponse.json();
```

## Pagination Guide

### Out-of-Range Offsets

When the `offset` parameter exceeds the available documents, the endpoint returns an empty array with the total count:

```json
{
  "documents": [],
  "total": 1,
  "limit": 20,
  "offset": 5
}
```

This allows clients to handle pagination gracefully without errors.

### Calculating Total Pages

```python
import math

total_documents = data['total']
limit = data['limit']
total_pages = math.ceil(total_documents / limit)
```

### Iterating Through All Pages

```python
import requests

def get_all_documents(base_url, edital_id=None):
    """Fetch all documents across all pages."""
    all_documents = []
    offset = 0
    limit = 20

    while True:
        params = {"limit": limit, "offset": offset}
        if edital_id:
            params["edital_id"] = edital_id

        response = requests.get(f"{base_url}/api/v1/documents", params=params)
        data = response.json()

        all_documents.extend(data['documents'])

        # Check if there are more pages
        if offset + limit >= data['total']:
            break

        offset += limit

    return all_documents

# Usage
all_docs = get_all_documents("https://pnld-ai-service.fly.dev")
print(f"Fetched {len(all_docs)} documents")
```

## Sorting Details

### Available Sort Fields

1. **created_at** (default)
   - Sorts by document creation date
   - Newest first (descending)

2. **updated_at**
   - Sorts by last modification date
   - Recently updated first (descending)

3. **title**
   - Sorts alphabetically
   - A-Z (ascending)

## Performance Notes

1. **Query Performance**
   - The endpoint performs two database queries:
     - One for documents (with pagination)
     - One for chunk counts
   - Average response time: 100-300ms

2. **Recommended Pagination**
   - Default limit of 20 is optimal for most UIs
   - Maximum limit of 100 prevents excessive data transfer
   - Use smaller limits (10-20) for mobile devices

3. **Caching**
   - Consider client-side caching for frequently accessed pages
   - Cache invalidation needed after document upload/deletion

## Testing

Test script provided at `test_list_documents.py`:

```bash
# Test locally
python test_list_documents.py

# Test on production
python test_list_documents.py --production
```

## Use Cases

### Document Management UI

```typescript
// React example with pagination
const [documents, setDocuments] = useState([]);
const [page, setPage] = useState(0);
const [total, setTotal] = useState(0);
const limit = 20;

useEffect(() => {
  const fetchDocuments = async () => {
    const offset = page * limit;
    const response = await fetch(
      `/api/v1/documents?limit=${limit}&offset=${offset}`
    );
    const data = await response.json();

    setDocuments(data.documents);
    setTotal(data.total);
  };

  fetchDocuments();
}, [page]);

const totalPages = Math.ceil(total / limit);
```

### Edital Filtering

```typescript
const [editalId, setEditalId] = useState('');
const [documents, setDocuments] = useState([]);

useEffect(() => {
  const fetchDocuments = async () => {
    const params = new URLSearchParams({ limit: '20', offset: '0' });
    if (editalId) {
      params.append('edital_id', editalId);
    }

    const response = await fetch(`/api/v1/documents?${params}`);
    const data = await response.json();
    setDocuments(data.documents);
  };

  fetchDocuments();
}, [editalId]);
```

## Integration with Other Endpoints

### Workflow: Upload → List → View

```python
# 1. Upload a document
upload_response = requests.post(
    f"{base_url}/api/v1/documents/upload-pdf",
    files={'file': open('document.pdf', 'rb')},
    data={'edital_id': 'PNLD-2027', 'title': 'Guidelines'}
)
document_id = upload_response.json()['document_id']

# 2. List documents to verify upload
list_response = requests.get(
    f"{base_url}/api/v1/documents",
    params={'edital_id': 'PNLD-2027'}
)
documents = list_response.json()['documents']

# 3. Get document details
detail_response = requests.get(
    f"{base_url}/api/v1/documents/{document_id}"
)
```

## Best Practices

1. **Always use pagination** - Don't try to fetch all documents at once
2. **Filter when possible** - Use edital_id to reduce result sets
3. **Sort appropriately** - Use created_at for recent documents, title for browsing
4. **Handle empty results** - Check if `documents` array is empty
5. **Cache results** - Cache page results to reduce API calls
6. **Show loading states** - Indicate when fetching documents
7. **Error handling** - Handle network errors and validation errors

## Metadata Information

The `metadata` field contains additional information about each document:

- `filename`: Original PDF filename
- `total_pages`: Number of pages in the PDF
- `total_chunks`: Same as `chunks_count`
- `file_size_bytes`: File size in bytes
- `file_size_mb`: File size in megabytes
- Custom fields from upload

## Future Enhancements

Potential improvements for future versions:

- [ ] Search/filter by title
- [ ] Filter by date range
- [ ] Multiple sort fields
- [ ] Include sample chunks in response
- [ ] Aggregate statistics (total chunks, total pages)
- [ ] Export to CSV/JSON
