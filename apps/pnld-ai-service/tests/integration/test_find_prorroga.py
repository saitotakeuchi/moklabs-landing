import requests

API_URL = "https://pnld-ai-service.fly.dev/api/v1"

# Get document details
doc_id = "5f95625b-efe8-437e-99ee-a4e95a55160b"  # InformedeProrrogaoObjetos1e2AnosInicias

print(f"Getting details for document: {doc_id}\n")
response = requests.get(f"{API_URL}/documents/{doc_id}?include_chunks=true")

if response.status_code == 200:
    doc = response.json()
    print(f"Title: {doc['title']}")
    print(f"Chunks: {doc['chunks_count']}")
    print(f"Embeddings: {doc['embeddings_count']}")
    
    if doc.get('sample_chunks'):
        print(f"\nSample chunks:")
        for i, chunk in enumerate(doc['sample_chunks'], 1):
            print(f"\nChunk {i} (Page {chunk.get('page_number', 'N/A')}):")
            print(chunk['content'][:300])
            print("...")
else:
    print(f"Error: {response.status_code}")
    print(response.text)

