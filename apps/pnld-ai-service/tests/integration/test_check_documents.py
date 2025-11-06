import requests
import json

API_URL = "https://pnld-ai-service.fly.dev/api/v1"

print("=== Checking Documents and Embeddings ===\n")

# 1. List all documents
print("1. Listing all documents...")
docs_response = requests.get(f"{API_URL}/documents")
docs_data = docs_response.json()

print(f"Total documents: {docs_data['total']}\n")

if docs_data['documents']:
    for doc in docs_data['documents']:
        print(f"Document: {doc['title']}")
        print(f"  ID: {doc['id']}")
        print(f"  Edital: {doc['edital_id']}")
        print(f"  Chunks: {doc['chunks_count']}")
        print(f"  Created: {doc['created_at']}")
        print()
        
        # Get document details
        detail_response = requests.get(f"{API_URL}/documents/{doc['id']}?include_chunks=true")
        if detail_response.status_code == 200:
            detail = detail_response.json()
            print(f"  Embeddings count: {detail['embeddings_count']}")
            if detail.get('sample_chunks'):
                print(f"  Sample chunks: {len(detail['sample_chunks'])}")
                for i, chunk in enumerate(detail['sample_chunks'][:2], 1):
                    print(f"    Chunk {i} preview: {chunk['content'][:100]}...")
        print("-" * 80)
else:
    print("No documents found!")

# 2. Test a search query
print("\n2. Testing vector search...")
test_query = input("Enter a test query (or press Enter to skip): ").strip()
if test_query:
    # Try to find which edital to use
    if docs_data['documents']:
        test_edital = docs_data['documents'][0]['edital_id']
        print(f"Testing with edital_id: {test_edital}")
        
        chat_payload = {
            "message": test_query,
            "edital_id": test_edital,
            "max_tokens": 100
        }
        
        print(f"Sending chat request...")
        chat_response = requests.post(f"{API_URL}/chat", json=chat_payload)
        
        if chat_response.status_code == 200:
            result = chat_response.json()
            print(f"\nSources found: {len(result.get('sources', []))}")
            for source in result.get('sources', []):
                print(f"  - {source['title']} (page {source.get('page_number', 'N/A')}, score: {source['relevance_score']:.2f})")
        else:
            print(f"Chat request failed: {chat_response.status_code}")
            print(chat_response.text)

