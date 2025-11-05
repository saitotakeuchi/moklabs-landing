import requests
import json

API_URL = "https://pnld-ai-service.fly.dev/api/v1"

# Test query from one of the documents
test_query = "qual o prazo de prorrogação"
edital_id = "pnld-anos-iniciais-2027-2030"

print(f"Testing vector search with query: '{test_query}'")
print(f"Edital: {edital_id}\n")

# Test with chat endpoint
chat_payload = {
    "message": test_query,
    "edital_id": edital_id,
    "max_tokens": 200
}

print("Sending chat request...")
response = requests.post(f"{API_URL}/chat", json=chat_payload, timeout=30)

print(f"Status: {response.status_code}\n")

if response.status_code == 200:
    result = response.json()
    
    print(f"Sources found: {len(result.get('sources', []))}")
    print("-" * 80)
    
    for i, source in enumerate(result.get('sources', []), 1):
        print(f"\nSource {i}:")
        print(f"  Title: {source['title']}")
        print(f"  Page: {source.get('page_number', 'N/A')}")
        print(f"  Relevance: {source['relevance_score']:.4f}")
        print(f"  Content preview: {source['content_excerpt'][:150]}...")
    
    print("\n" + "=" * 80)
    print("Assistant Response:")
    print("=" * 80)
    print(result['message']['content'])
else:
    print(f"Error: {response.text}")

