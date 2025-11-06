#!/usr/bin/env python3
"""
Test script for the document detail endpoint.
Usage: python test_document_detail.py [--local|--production]
"""

import requests
import json
import sys
import os

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    os.environ['PYTHONIOENCODING'] = 'utf-8'
    sys.stdout.reconfigure(encoding='utf-8')


def test_document_detail(base_url: str):
    """Test the document detail endpoint."""

    print(f"Testing Document Detail Endpoint")
    print(f"Base URL: {base_url}")
    print("=" * 80)

    # Step 1: Get list of documents to find a valid document_id
    print("\n1. Test: Get existing document ID from list")
    print("-" * 80)
    try:
        list_endpoint = f"{base_url}/api/v1/documents"
        response = requests.get(list_endpoint)

        if response.status_code == 200:
            data = response.json()
            if data['documents']:
                document_id = data['documents'][0]['id']
                document_title = data['documents'][0]['title']
                print(f"✅ Status: {response.status_code}")
                print(f"   Found document: {document_title}")
                print(f"   Document ID: {document_id}")
            else:
                print("⚠️  No documents available for testing")
                print("   Please upload a document first using the upload endpoint")
                return
        else:
            print(f"❌ Status: {response.status_code}")
            print(f"   Could not retrieve document list")
            return
    except Exception as e:
        print(f"❌ Error: {e}")
        return

    # Step 2: Get document detail without chunks
    print("\n2. Test: Get document detail (without chunks)")
    print("-" * 80)
    try:
        detail_endpoint = f"{base_url}/api/v1/documents/{document_id}"
        response = requests.get(detail_endpoint)

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {response.status_code}")
            print(f"   ID: {data['id']}")
            print(f"   Title: {data['title']}")
            print(f"   Edital ID: {data['edital_id']}")
            print(f"   Created: {data['created_at']}")
            print(f"   Updated: {data['updated_at']}")
            print(f"   Chunks count: {data['chunks_count']}")
            print(f"   Embeddings count: {data['embeddings_count']}")
            print(f"   Sample chunks included: {data.get('sample_chunks') is not None}")

            # Verify sample_chunks is None
            if data.get('sample_chunks') is None:
                print(f"   ✅ Sample chunks correctly excluded by default")
            else:
                print(f"   ⚠️  Sample chunks should be None by default")
        else:
            print(f"❌ Status: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Step 3: Get document detail with chunks
    print("\n3. Test: Get document detail (with chunks)")
    print("-" * 80)
    try:
        detail_endpoint = f"{base_url}/api/v1/documents/{document_id}?include_chunks=true"
        response = requests.get(detail_endpoint)

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {response.status_code}")
            print(f"   Document: {data['title']}")
            print(f"   Chunks count: {data['chunks_count']}")

            if data.get('sample_chunks'):
                print(f"   Sample chunks returned: {len(data['sample_chunks'])}")
                print(f"\n   Sample chunk details:")
                for idx, chunk in enumerate(data['sample_chunks'][:2], 1):  # Show first 2
                    print(f"   {idx}. Page: {chunk.get('page_number', 'N/A')}, "
                          f"Index: {chunk.get('chunk_index', 'N/A')}")
                    print(f"      Content preview: {chunk['content'][:80]}...")
            else:
                print(f"   ⚠️  No sample chunks returned (expected if document has no chunks)")
        else:
            print(f"❌ Status: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Step 4: Test 404 for non-existent document
    print("\n4. Test: Request non-existent document (404 expected)")
    print("-" * 80)
    try:
        fake_id = "00000000-0000-0000-0000-000000000000"
        detail_endpoint = f"{base_url}/api/v1/documents/{fake_id}"
        response = requests.get(detail_endpoint)

        if response.status_code == 404:
            print(f"✅ Status: {response.status_code} (expected)")
            print(f"   Error message: {response.json().get('detail')}")
        else:
            print(f"❌ Status: {response.status_code} (expected 404)")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Step 5: Test invalid document ID format
    print("\n5. Test: Invalid document ID format")
    print("-" * 80)
    try:
        invalid_id = "invalid-uuid-format"
        detail_endpoint = f"{base_url}/api/v1/documents/{invalid_id}"
        response = requests.get(detail_endpoint)

        if response.status_code in [400, 404, 422, 500]:
            print(f"✅ Status: {response.status_code} (error handled)")
            error_data = response.json()
            print(f"   Error: {error_data.get('detail', 'N/A')[:100]}")
        else:
            print(f"❌ Status: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Step 6: Verify response structure
    print("\n6. Test: Verify response structure matches DocumentDetail model")
    print("-" * 80)
    try:
        detail_endpoint = f"{base_url}/api/v1/documents/{document_id}"
        response = requests.get(detail_endpoint)

        if response.status_code == 200:
            data = response.json()

            # Check required fields
            required_fields = [
                'id', 'edital_id', 'title', 'created_at', 'updated_at',
                'chunks_count', 'embeddings_count'
            ]
            missing_fields = [field for field in required_fields if field not in data]

            if not missing_fields:
                print(f"✅ All required fields present")

                # Verify data types
                type_checks = []
                type_checks.append(("id", isinstance(data['id'], str)))
                type_checks.append(("edital_id", isinstance(data['edital_id'], str)))
                type_checks.append(("title", isinstance(data['title'], str)))
                type_checks.append(("chunks_count", isinstance(data['chunks_count'], int)))
                type_checks.append(("embeddings_count", isinstance(data['embeddings_count'], int)))

                all_types_correct = all(check[1] for check in type_checks)
                if all_types_correct:
                    print(f"✅ All field types correct")
                else:
                    failed = [check[0] for check in type_checks if not check[1]]
                    print(f"❌ Incorrect types for: {failed}")
            else:
                print(f"❌ Missing required fields: {missing_fields}")
        else:
            print(f"❌ Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Step 7: Test with include_chunks=false explicitly
    print("\n7. Test: Explicit include_chunks=false")
    print("-" * 80)
    try:
        detail_endpoint = f"{base_url}/api/v1/documents/{document_id}?include_chunks=false"
        response = requests.get(detail_endpoint)

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {response.status_code}")

            if data.get('sample_chunks') is None:
                print(f"   ✅ Sample chunks correctly excluded")
            else:
                print(f"   ⚠️  Sample chunks should be None with include_chunks=false")
        else:
            print(f"❌ Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Step 8: Compare metadata with list endpoint
    print("\n8. Test: Compare metadata consistency with list endpoint")
    print("-" * 80)
    try:
        # Get from list
        list_response = requests.get(f"{base_url}/api/v1/documents")
        list_doc = next((d for d in list_response.json()['documents'] if d['id'] == document_id), None)

        # Get detail
        detail_response = requests.get(f"{base_url}/api/v1/documents/{document_id}")
        detail_doc = detail_response.json()

        if list_doc and detail_response.status_code == 200:
            # Compare fields
            matches = []
            matches.append(("id", list_doc['id'] == detail_doc['id']))
            matches.append(("title", list_doc['title'] == detail_doc['title']))
            matches.append(("edital_id", list_doc['edital_id'] == detail_doc['edital_id']))
            matches.append(("chunks_count", list_doc['chunks_count'] == detail_doc['chunks_count']))

            all_match = all(m[1] for m in matches)
            if all_match:
                print(f"✅ Metadata consistent between list and detail endpoints")
            else:
                mismatches = [m[0] for m in matches if not m[1]]
                print(f"❌ Mismatches in fields: {mismatches}")
        else:
            print(f"⚠️  Could not compare endpoints")
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
        test_document_detail(base_url)
    except requests.exceptions.ConnectionError:
        print(f"❌ Error: Could not connect to {base_url}")
        print("Make sure the service is running.")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
