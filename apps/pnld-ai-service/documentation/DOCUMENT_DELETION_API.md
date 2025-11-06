# Document Deletion API Documentation

## Overview

The Document Deletion endpoint permanently deletes a document and all its related embeddings. This endpoint provides confirmation with deletion counts and is essential for document management systems.

**⚠️ WARNING:** This operation is irreversible. All document data and embeddings will be permanently deleted.

## Endpoint

**DELETE** `/api/v1/documents/{document_id}`

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `document_id` | string (UUID) | Yes | Unique document identifier |

## Response

### Success Response (200 OK)

```json
{
  "message": "Document and related embeddings successfully deleted",
  "document_id": "4d915c2d-22ff-4b1b-97f0-e2961b90677e",
  "embeddings_deleted": 70
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `message` | String | Deletion confirmation message |
| `document_id` | String (UUID) | ID of the deleted document |
| `embeddings_deleted` | Integer | Number of embeddings that were deleted |

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
  "detail": "Failed to delete document: [error message] | Type: [error type]"
}
```

## Deletion Process

The endpoint follows this sequence:

1. **Verify Existence** - Checks if document exists in `pnld_documents`
2. **Count Embeddings** - Counts related embeddings in `pnld_embeddings`
3. **Delete Embeddings** - Removes all embeddings associated with the document
4. **Delete Document** - Removes the document from `pnld_documents`
5. **Return Confirmation** - Returns success message with deletion counts

This ensures data consistency and provides accurate feedback about what was deleted.

## Usage Examples

### Example 1: Delete a Document

```bash
curl -X DELETE "https://pnld-ai-service.fly.dev/api/v1/documents/4d915c2d-22ff-4b1b-97f0-e2961b90677e"
```

**Response:**

```json
{
  "message": "Document and related embeddings successfully deleted",
  "document_id": "4d915c2d-22ff-4b1b-97f0-e2961b90677e",
  "embeddings_deleted": 70
}
```

### Using Python

```python
import requests

base_url = "https://pnld-ai-service.fly.dev"
document_id = "4d915c2d-22ff-4b1b-97f0-e2961b90677e"

# Delete document
response = requests.delete(f"{base_url}/api/v1/documents/{document_id}")

if response.status_code == 200:
    data = response.json()

    print(f"✅ {data['message']}")
    print(f"Document ID: {data['document_id']}")
    print(f"Embeddings deleted: {data['embeddings_deleted']}")
elif response.status_code == 404:
    print("❌ Document not found")
else:
    print(f"❌ Error: {response.status_code}")
    print(response.text)
```

### Using JavaScript (Fetch API)

```javascript
const baseUrl = 'https://pnld-ai-service.fly.dev';
const documentId = '4d915c2d-22ff-4b1b-97f0-e2961b90677e';

// Delete document
const response = await fetch(`${baseUrl}/api/v1/documents/${documentId}`, {
  method: 'DELETE'
});

if (response.ok) {
  const data = await response.json();

  console.log('✅', data.message);
  console.log('Document ID:', data.document_id);
  console.log('Embeddings deleted:', data.embeddings_deleted);
} else if (response.status === 404) {
  console.log('❌ Document not found');
} else {
  console.log('❌ Error:', response.status);
  const error = await response.json();
  console.log(error.detail);
}
```

## Safety Considerations

### Pre-Deletion Checks

Always verify the document before deletion:

```python
def safe_delete_document(document_id: str) -> bool:
    """Safely delete a document with confirmation."""
    # 1. Check if document exists
    detail_response = requests.get(f"{base_url}/api/v1/documents/{document_id}")

    if detail_response.status_code == 404:
        print("Document not found")
        return False

    # 2. Show document details
    document = detail_response.json()
    print(f"About to delete:")
    print(f"  Title: {document['title']}")
    print(f"  Edital: {document['edital_id']}")
    print(f"  Embeddings: {document['embeddings_count']}")

    # 3. Confirm deletion
    confirm = input("Are you sure? (yes/no): ")
    if confirm.lower() != 'yes':
        print("Deletion cancelled")
        return False

    # 4. Delete document
    delete_response = requests.delete(f"{base_url}/api/v1/documents/{document_id}")

    if delete_response.status_code == 200:
        data = delete_response.json()
        print(f"✅ {data['message']}")
        print(f"   Embeddings deleted: {data['embeddings_deleted']}")
        return True
    else:
        print(f"❌ Deletion failed: {delete_response.status_code}")
        return False

# Usage
safe_delete_document(document_id)
```

### Bulk Deletion with Safeguards

```python
def bulk_delete_documents(document_ids: list[str], confirm: bool = True):
    """Delete multiple documents with optional confirmation."""
    if confirm:
        print(f"About to delete {len(document_ids)} documents")
        response = input("Continue? (yes/no): ")
        if response.lower() != 'yes':
            print("Bulk deletion cancelled")
            return

    results = {
        "success": [],
        "not_found": [],
        "errors": []
    }

    for doc_id in document_ids:
        try:
            response = requests.delete(f"{base_url}/api/v1/documents/{doc_id}")

            if response.status_code == 200:
                data = response.json()
                results["success"].append({
                    "id": doc_id,
                    "embeddings": data["embeddings_deleted"]
                })
            elif response.status_code == 404:
                results["not_found"].append(doc_id)
            else:
                results["errors"].append({
                    "id": doc_id,
                    "error": response.text
                })
        except Exception as e:
            results["errors"].append({
                "id": doc_id,
                "error": str(e)
            })

    # Summary
    print(f"\nBulk Deletion Summary:")
    print(f"  ✅ Success: {len(results['success'])}")
    print(f"  ❌ Not found: {len(results['not_found'])}")
    print(f"  ⚠️  Errors: {len(results['errors'])}")

    return results

# Usage
ids_to_delete = ["uuid1", "uuid2", "uuid3"]
bulk_delete_documents(ids_to_delete)
```

## Integration with Other Endpoints

### Workflow: List → Confirm → Delete

```python
import requests

base_url = "https://pnld-ai-service.fly.dev"

# 1. List documents to find one to delete
list_response = requests.get(f"{base_url}/api/v1/documents")
documents = list_response.json()['documents']

# 2. Select document to delete
document_to_delete = documents[0]
document_id = document_to_delete['id']

print(f"Selected: {document_to_delete['title']}")
print(f"Chunks: {document_to_delete['chunks_count']}")

# 3. Get full details for confirmation
detail_response = requests.get(f"{base_url}/api/v1/documents/{document_id}")
details = detail_response.json()

# 4. Delete the document
delete_response = requests.delete(f"{base_url}/api/v1/documents/{document_id}")

if delete_response.status_code == 200:
    result = delete_response.json()
    print(f"Deleted: {result['embeddings_deleted']} embeddings")
```

### Cleanup Old Documents

```python
from datetime import datetime, timedelta

def cleanup_old_documents(days_old: int = 90):
    """Delete documents older than specified days."""
    # 1. Get all documents
    response = requests.get(f"{base_url}/api/v1/documents")
    documents = response.json()['documents']

    # 2. Filter old documents
    cutoff_date = datetime.now() - timedelta(days=days_old)
    old_docs = []

    for doc in documents:
        created_at = datetime.fromisoformat(doc['created_at'].replace('Z', '+00:00'))
        if created_at < cutoff_date:
            old_docs.append(doc)

    print(f"Found {len(old_docs)} documents older than {days_old} days")

    # 3. Delete old documents
    for doc in old_docs:
        print(f"Deleting: {doc['title']} (created {doc['created_at']})")
        response = requests.delete(f"{base_url}/api/v1/documents/{doc['id']}")

        if response.status_code == 200:
            print(f"  ✅ Deleted")
        else:
            print(f"  ❌ Failed: {response.status_code}")

# Usage
cleanup_old_documents(days_old=90)
```

## Use Cases

### Document Management UI

```typescript
// React example
import { useState } from 'react';

function DocumentActions({ documentId, documentTitle, onDeleted }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/v1/documents/${documentId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        const data = await response.json();
        alert(`Document deleted. ${data.embeddings_deleted} embeddings removed.`);
        onDeleted(documentId);
      } else if (response.status === 404) {
        alert('Document not found');
      } else {
        alert('Failed to delete document');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
      >
        Delete Document
      </button>

      {showConfirm && (
        <div className="confirm-dialog">
          <p>Delete "{documentTitle}"?</p>
          <p>This action cannot be undone.</p>
          <button onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Yes, Delete'}
          </button>
          <button onClick={() => setShowConfirm(false)} disabled={isDeleting}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
```

### Admin Panel

```python
def admin_document_manager():
    """Interactive document deletion tool."""
    while True:
        # List documents
        response = requests.get(f"{base_url}/api/v1/documents")
        documents = response.json()['documents']

        print("\n=== Document Manager ===")
        for idx, doc in enumerate(documents, 1):
            print(f"{idx}. {doc['title']} ({doc['chunks_count']} chunks)")

        print("\n0. Exit")

        choice = input("\nSelect document to delete (number): ")

        if choice == "0":
            break

        try:
            doc_idx = int(choice) - 1
            if 0 <= doc_idx < len(documents):
                selected = documents[doc_idx]

                # Confirm
                confirm = input(f"Delete '{selected['title']}'? (yes/no): ")
                if confirm.lower() == 'yes':
                    # Delete
                    response = requests.delete(
                        f"{base_url}/api/v1/documents/{selected['id']}"
                    )

                    if response.status_code == 200:
                        data = response.json()
                        print(f"✅ Deleted ({data['embeddings_deleted']} embeddings)")
                    else:
                        print(f"❌ Failed: {response.status_code}")
            else:
                print("Invalid selection")
        except ValueError:
            print("Invalid input")

# Usage
admin_document_manager()
```

## Performance Notes

1. **Deletion Time**
   - Small documents (<100 embeddings): ~100-200ms
   - Medium documents (100-500 embeddings): ~200-500ms
   - Large documents (>500 embeddings): ~500ms - 2s

2. **Database Operations**
   - 1 query to verify existence
   - 1 query to count embeddings
   - 1 DELETE for embeddings
   - 1 DELETE for document
   - Total: 4 database operations

3. **Recommendations**
   - For bulk deletions, use batch processing with delays
   - Consider implementing soft deletes for recovery options
   - Log all deletions for audit trails

## Testing

Test script provided at `test_document_deletion.py`:

```bash
# Test locally
python test_document_deletion.py

# Test on production (⚠️ WILL DELETE A DOCUMENT!)
python test_document_deletion.py --production
```

**⚠️ WARNING:** The production test will actually delete a document. Use with caution!

## Best Practices

1. **Always confirm before deletion** - Implement user confirmation dialogs
2. **Log deletions** - Keep audit trails of what was deleted and when
3. **Check permissions** - Ensure user has authorization to delete
4. **Backup before bulk deletion** - Create backups before mass deletions
5. **Handle 404 gracefully** - Document may have been deleted already
6. **Show deletion counts** - Display how many embeddings were removed
7. **Provide undo option** - Consider implementing soft deletes with recovery

## Soft Delete Alternative

Consider implementing soft deletes for recoverability:

```python
# Instead of permanent deletion, mark as deleted
def soft_delete_document(document_id: str):
    """Mark document as deleted without removing it."""
    # Update document metadata to mark as deleted
    response = requests.patch(
        f"{base_url}/api/v1/documents/{document_id}",
        json={
            "metadata": {
                "deleted": True,
                "deleted_at": datetime.now().isoformat()
            }
        }
    )
    return response.status_code == 200

# Recover soft-deleted document
def recover_document(document_id: str):
    """Recover a soft-deleted document."""
    response = requests.patch(
        f"{base_url}/api/v1/documents/{document_id}",
        json={
            "metadata": {
                "deleted": False,
                "recovered_at": datetime.now().isoformat()
            }
        }
    )
    return response.status_code == 200
```

## Database Schema

### Foreign Key Constraints

The database should have foreign key constraints to ensure referential integrity:

```sql
-- Embeddings table references documents
ALTER TABLE pnld_embeddings
ADD CONSTRAINT fk_embeddings_document
FOREIGN KEY (document_id)
REFERENCES pnld_documents(id)
ON DELETE CASCADE;  -- Optional: auto-delete embeddings when document deleted
```

With `ON DELETE CASCADE`, deleting a document automatically removes embeddings. Without it, embeddings must be manually deleted first (as this endpoint does).

## Future Enhancements

Potential improvements for future versions:

- [ ] Soft delete with recovery period
- [ ] Bulk deletion endpoint
- [ ] Scheduled deletion (mark for deletion, clean up later)
- [ ] Deletion with backup export
- [ ] Audit log integration
- [ ] Permission-based deletion (admin only)
- [ ] Deletion confirmation via email
- [ ] Cascade to related entities (conversations, etc.)
