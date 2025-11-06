import asyncio
from app.services.embeddings import generate_embedding
from app.services.supabase import get_async_supabase_client

async def test():
    query = "prorrogação prazo inscrição"
    edital = "pnld-anos-iniciais-2027-2030"
    
    embedding = await generate_embedding(query)
    client = await get_async_supabase_client()
    
    response = await client.rpc(
        "match_documents",
        {
            "query_embedding": embedding,
            "match_threshold": 0.0,  # Show ALL results
            "match_count": 10,
            "edital_filter": edital,
        },
    ).execute()
    
    print(f"Testing query: '{query}'")
    print(f"Total results: {len(response.data)}\n")
    
    for i, doc in enumerate(response.data[:10], 1):
        print(f"{i}. {doc['document_title']}")
        print(f"   Similarity: {doc['similarity']:.4f}")
        print(f"   Page: {doc.get('page_number', 'N/A')}")
        print(f"   Content: {doc['content'][:100]}...")
        print()

asyncio.run(test())
