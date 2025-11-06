import asyncio
import sys
sys.path.insert(0, '/app')

from app.services.embeddings import generate_embedding
from app.services.supabase import get_async_supabase_client

async def test_search():
    query = "qual o prazo de prorrogação"
    edital_id = "pnld-anos-iniciais-2027-2030"
    
    print(f"Generating embedding for: '{query}'")
    query_embedding = await generate_embedding(query)
    print(f"Embedding generated: {len(query_embedding)} dimensions\n")
    
    print("Testing with different thresholds:")
    for threshold in [0.3, 0.4, 0.5, 0.6, 0.7]:
        print(f"\n--- Threshold: {threshold} ---")
        
        client = await get_async_supabase_client()
        response = await client.rpc(
            "match_documents",
            {
                "query_embedding": query_embedding,
                "match_threshold": threshold,
                "match_count": 5,
                "edital_filter": edital_id,
            },
        ).execute()
        
        if response.data:
            print(f"Found {len(response.data)} results:")
            for doc in response.data[:3]:
                print(f"  - {doc['document_title']}")
                print(f"    Similarity: {doc['similarity']:.4f}")
                print(f"    Content preview: {doc['content'][:100]}...")
        else:
            print("No results found")

if __name__ == "__main__":
    asyncio.run(test_search())

