#!/usr/bin/env python3
"""
Test script for the list documents endpoint.
Usage: python test_list_documents.py [--local|--production]
"""

import requests
import json
import sys
import os

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    os.environ['PYTHONIOENCODING'] = 'utf-8'
    sys.stdout.reconfigure(encoding='utf-8')

def test_list_documents(base_url: str):
    """Test the list documents endpoint with various parameters."""

    print(f"Testing List Documents Endpoint")
    print(f"Base URL: {base_url}")
    print("=" * 80)

    endpoint = f"{base_url}/api/v1/documents"

    # Test 1: Basic list (no filters)
    print("\n1. Test: List all documents (default pagination)")
    print("-" * 80)
    try:
        response = requests.get(endpoint)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {response.status_code}")
            print(f"   Total documents: {data['total']}")
            print(f"   Returned: {len(data['documents'])}")
            print(f"   Limit: {data['limit']}")
            print(f"   Offset: {data['offset']}")

            if data['documents']:
                print(f"\n   Sample document:")
                doc = data['documents'][0]
                print(f"   - ID: {doc['id']}")
                print(f"   - Title: {doc['title']}")
                print(f"   - Edital ID: {doc['edital_id']}")
                print(f"   - Chunks: {doc['chunks_count']}")
                print(f"   - Created: {doc['created_at']}")
        else:
            print(f"❌ Status: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Test 2: Custom limit
    print("\n2. Test: List with limit=5")
    print("-" * 80)
    try:
        response = requests.get(f"{endpoint}?limit=5")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {response.status_code}")
            print(f"   Returned: {len(data['documents'])} documents")
            print(f"   Limit: {data['limit']}")
        else:
            print(f"❌ Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Test 3: Pagination with offset
    print("\n3. Test: Pagination with offset=5")
    print("-" * 80)
    try:
        response = requests.get(f"{endpoint}?limit=5&offset=5")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {response.status_code}")
            print(f"   Offset: {data['offset']}")
            print(f"   Returned: {len(data['documents'])} documents")
        else:
            print(f"❌ Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Test 4: Filter by edital_id (if we have one)
    print("\n4. Test: Filter by edital_id")
    print("-" * 80)
    try:
        # First get a document to know an edital_id
        response = requests.get(endpoint)
        if response.status_code == 200:
            data = response.json()
            if data['documents']:
                edital_id = data['documents'][0]['edital_id']

                # Now filter by that edital_id
                response = requests.get(f"{endpoint}?edital_id={edital_id}")
                if response.status_code == 200:
                    filtered_data = response.json()
                    print(f"✅ Status: {response.status_code}")
                    print(f"   Filter: edital_id={edital_id}")
                    print(f"   Matched: {filtered_data['total']} documents")
                    print(f"   Returned: {len(filtered_data['documents'])} documents")
                else:
                    print(f"❌ Status: {response.status_code}")
            else:
                print("⚠️  No documents available to test filtering")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Test 5: Sort by title
    print("\n5. Test: Sort by title")
    print("-" * 80)
    try:
        response = requests.get(f"{endpoint}?sort_by=title&limit=3")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {response.status_code}")
            print(f"   Sort: title (ascending)")
            if data['documents']:
                print(f"   Titles: {[doc['title'] for doc in data['documents']]}")
        else:
            print(f"❌ Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Test 6: Invalid sort_by parameter
    print("\n6. Test: Invalid sort_by parameter")
    print("-" * 80)
    try:
        response = requests.get(f"{endpoint}?sort_by=invalid_field")
        if response.status_code == 400:
            print(f"✅ Status: {response.status_code} (expected)")
            print(f"   Error handled correctly")
        else:
            print(f"❌ Status: {response.status_code} (expected 400)")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Test 7: Invalid limit (too large)
    print("\n7. Test: Invalid limit (>100)")
    print("-" * 80)
    try:
        response = requests.get(f"{endpoint}?limit=150")
        if response.status_code == 422:
            print(f"✅ Status: {response.status_code} (validation error expected)")
        else:
            print(f"❌ Status: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Test 8: Combined filters
    print("\n8. Test: Combined filters (limit + offset + edital_id)")
    print("-" * 80)
    try:
        response = requests.get(endpoint)
        if response.status_code == 200:
            data = response.json()
            if data['documents']:
                edital_id = data['documents'][0]['edital_id']

                response = requests.get(
                    f"{endpoint}?edital_id={edital_id}&limit=3&offset=0&sort_by=created_at"
                )
                if response.status_code == 200:
                    filtered_data = response.json()
                    print(f"✅ Status: {response.status_code}")
                    print(f"   Filters: edital_id={edital_id}, limit=3, offset=0, sort=created_at")
                    print(f"   Results: {len(filtered_data['documents'])} documents")
                else:
                    print(f"❌ Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")

    print("\n" + "=" * 80)
    print("Testing complete!")


if __name__ == "__main__":
    # Determine environment
    if len(sys.argv) > 1 and sys.argv[1] == "--production":
        base_url = "https://pnld-ai-service.fly.dev"
    else:
        base_url = "http://localhost:8000"

    try:
        test_list_documents(base_url)
    except requests.exceptions.ConnectionError:
        print(f"❌ Error: Could not connect to {base_url}")
        print("Make sure the service is running.")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
