#!/usr/bin/env python3
"""
Simple test script for the streaming chat endpoint.
Usage: python test_streaming.py
"""

import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:8000"
STREAM_ENDPOINT = f"{BASE_URL}/api/v1/chat/stream"

def test_streaming_chat():
    """Test the streaming chat endpoint with SSE."""

    # Test payload
    payload = {
        "message": "What is PNLD?",
        "edital_id": None,
        "max_tokens": 500,
        "temperature": 0.7
    }

    print("Testing streaming chat endpoint...")
    print(f"Endpoint: {STREAM_ENDPOINT}")
    print(f"Request: {json.dumps(payload, indent=2)}\n")

    try:
        # Make streaming request
        response = requests.post(
            STREAM_ENDPOINT,
            json=payload,
            stream=True,
            headers={"Accept": "text/event-stream"}
        )

        if response.status_code != 200:
            print(f"Error: HTTP {response.status_code}")
            print(response.text)
            return

        print("Streaming response:\n")
        print("-" * 80)

        conversation_id = None
        complete_message = ""

        # Process SSE stream
        for line in response.iter_lines():
            if not line:
                continue

            line = line.decode('utf-8')

            # Parse SSE format
            if line.startswith('event:'):
                event_type = line.split(':', 1)[1].strip()
            elif line.startswith('data:'):
                data = line.split(':', 1)[1].strip()

                try:
                    data_obj = json.loads(data)

                    if event_type == 'metadata':
                        conversation_id = data_obj.get('conversation_id')
                        print(f"\n[METADATA] Conversation ID: {conversation_id}\n")

                    elif event_type == 'sources':
                        print(f"\n[SOURCES] Found {len(data_obj)} source documents:")
                        for i, source in enumerate(data_obj, 1):
                            print(f"  {i}. {source.get('title')} (Page {source.get('page_number', 'N/A')})")
                            print(f"     Relevance: {source.get('relevance_score', 0):.2f}")
                        print("\n[RESPONSE]")

                    elif event_type == 'token':
                        content = data_obj.get('content', '')
                        complete_message += content
                        print(content, end='', flush=True)

                    elif event_type == 'done':
                        print(f"\n\n[DONE] Conversation ID: {data_obj.get('conversation_id')}")

                    elif event_type == 'error':
                        print(f"\n[ERROR] {data_obj.get('error')}")

                except json.JSONDecodeError as e:
                    print(f"\n[PARSE ERROR] {e}: {data}")

        print("\n" + "-" * 80)
        print(f"\nComplete message length: {len(complete_message)} characters")

    except requests.exceptions.ConnectionError:
        print(f"Error: Could not connect to {BASE_URL}")
        print("Make sure the service is running with: poetry run python -m app.main")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_streaming_chat()
