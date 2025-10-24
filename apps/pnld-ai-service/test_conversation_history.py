#!/usr/bin/env python3
"""
Test script for the conversation history endpoint.
Usage: python test_conversation_history.py [--local|--production]
"""

import requests
import json
import sys
import os

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    os.environ['PYTHONIOENCODING'] = 'utf-8'
    sys.stdout.reconfigure(encoding='utf-8')


def test_conversation_history(base_url: str):
    """Test the conversation history endpoint."""

    print(f"Testing Conversation History Endpoint")
    print(f"Base URL: {base_url}")
    print("=" * 80)

    # Step 1: Create a new conversation by sending a chat message
    print("\n1. Test: Create new conversation with chat message")
    print("-" * 80)
    try:
        chat_endpoint = f"{base_url}/api/v1/chat"
        chat_request = {
            "message": "What are the main evaluation criteria for educational materials?",
            "edital_id": "PNLD-2027-2030-ANOS-INICIAIS"
        }

        response = requests.post(chat_endpoint, json=chat_request)
        if response.status_code == 200:
            data = response.json()
            conversation_id = data.get('conversation_id')
            print(f"✅ Status: {response.status_code}")
            print(f"   Conversation ID: {conversation_id}")
            print(f"   Response preview: {data['message']['content'][:100]}...")
        else:
            print(f"❌ Status: {response.status_code}")
            print(f"   Response: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error: {e}")
        return

    # Step 2: Send another message to the same conversation
    print("\n2. Test: Continue conversation with follow-up message")
    print("-" * 80)
    try:
        chat_request = {
            "message": "Can you provide more details about accessibility requirements?",
            "conversation_id": conversation_id,
            "edital_id": "PNLD-2027-2030-ANOS-INICIAIS"
        }

        response = requests.post(chat_endpoint, json=chat_request)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {response.status_code}")
            print(f"   Same conversation: {data.get('conversation_id') == conversation_id}")
            print(f"   Response preview: {data['message']['content'][:100]}...")
        else:
            print(f"❌ Status: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Step 3: Retrieve full conversation history
    print("\n3. Test: Retrieve full conversation history")
    print("-" * 80)
    try:
        history_endpoint = f"{base_url}/api/v1/chat/{conversation_id}"
        response = requests.get(history_endpoint)

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {response.status_code}")
            print(f"   Conversation ID: {data['conversation_id']}")
            print(f"   Edital ID: {data.get('edital_id')}")
            print(f"   Created at: {data['created_at']}")
            print(f"   Updated at: {data['updated_at']}")
            print(f"   Total messages: {len(data['messages'])}")

            # Display messages
            print(f"\n   Messages (chronological order):")
            for idx, msg in enumerate(data['messages'], 1):
                print(f"   {idx}. [{msg['role']}] {msg['content'][:80]}...")
                print(f"      Timestamp: {msg.get('timestamp')}")

            # Verify message order
            if len(data['messages']) >= 2:
                is_chronological = data['messages'][0]['timestamp'] <= data['messages'][1]['timestamp']
                print(f"\n   Messages in chronological order: {is_chronological}")
        else:
            print(f"❌ Status: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Step 4: Test 404 for non-existent conversation
    print("\n4. Test: Request non-existent conversation (404 expected)")
    print("-" * 80)
    try:
        fake_id = "00000000-0000-0000-0000-000000000000"
        history_endpoint = f"{base_url}/api/v1/chat/{fake_id}"
        response = requests.get(history_endpoint)

        if response.status_code == 404:
            print(f"✅ Status: {response.status_code} (expected)")
            print(f"   Error message: {response.json().get('detail')}")
        else:
            print(f"❌ Status: {response.status_code} (expected 404)")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Step 5: Test invalid conversation ID format
    print("\n5. Test: Invalid conversation ID format")
    print("-" * 80)
    try:
        invalid_id = "invalid-uuid-format"
        history_endpoint = f"{base_url}/api/v1/chat/{invalid_id}"
        response = requests.get(history_endpoint)

        if response.status_code in [400, 404, 422]:
            print(f"✅ Status: {response.status_code} (error handled)")
            error_data = response.json()
            print(f"   Error: {error_data.get('detail')}")
        else:
            print(f"❌ Status: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Step 6: Verify conversation metadata structure
    print("\n6. Test: Verify response structure matches ConversationHistory model")
    print("-" * 80)
    try:
        history_endpoint = f"{base_url}/api/v1/chat/{conversation_id}"
        response = requests.get(history_endpoint)

        if response.status_code == 200:
            data = response.json()

            # Check required fields
            required_fields = ['conversation_id', 'messages', 'created_at', 'updated_at']
            missing_fields = [field for field in required_fields if field not in data]

            if not missing_fields:
                print(f"✅ All required fields present")

                # Verify messages structure
                if data['messages']:
                    msg = data['messages'][0]
                    msg_fields = ['role', 'content']
                    missing_msg_fields = [field for field in msg_fields if field not in msg]

                    if not missing_msg_fields:
                        print(f"✅ Message structure valid")
                    else:
                        print(f"❌ Missing message fields: {missing_msg_fields}")
            else:
                print(f"❌ Missing required fields: {missing_fields}")
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
        test_conversation_history(base_url)
    except requests.exceptions.ConnectionError:
        print(f"❌ Error: Could not connect to {base_url}")
        print("Make sure the service is running.")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
