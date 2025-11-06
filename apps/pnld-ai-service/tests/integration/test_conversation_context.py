"""
Test script to verify conversation context is preserved across messages (MOK-52).

This test verifies that:
1. First message creates a new conversation
2. Follow-up messages in the same conversation have access to previous messages
3. The AI can reference earlier parts of the conversation
"""

import asyncio
import httpx
import json

API_BASE = "http://localhost:8000/api/v1"


async def test_conversation_context():
    """
    Test that conversation history is properly loaded and used.

    This test:
    1. Sends an initial message and gets a conversation_id
    2. Sends a follow-up message that references the first
    3. Verifies the conversation history endpoint returns both messages
    4. Checks that the AI response demonstrates context awareness
    """
    print("\n" + "="*60)
    print("Testing Conversation Context Preservation (MOK-52)")
    print("="*60 + "\n")

    async with httpx.AsyncClient(timeout=30.0) as client:
        conversation_id = None

        # Step 1: Send initial message
        print("1. Sending initial message...")
        request1 = {
            "message": "My name is Alice and I'm interested in PNLD.",
            "max_tokens": 100,
            "temperature": 0.7,
        }

        response1 = await client.post(
            f"{API_BASE}/chat",
            json=request1
        )

        if response1.status_code != 200:
            print(f"   ERROR: First message failed (status {response1.status_code})")
            print(f"   Response: {response1.text}")
            return False

        data1 = response1.json()
        conversation_id = data1.get("conversation_id")
        assistant_response1 = data1.get("message", {}).get("content", "")

        print(f"   Conversation ID: {conversation_id}")
        print(f"   Assistant: {assistant_response1[:100]}...")
        print()

        if not conversation_id:
            print("   ERROR: No conversation_id returned")
            return False

        # Step 2: Send follow-up message that references the first
        print("2. Sending follow-up message...")
        request2 = {
            "message": "What's my name?",
            "conversation_id": conversation_id,
            "max_tokens": 100,
            "temperature": 0.7,
        }

        response2 = await client.post(
            f"{API_BASE}/chat",
            json=request2
        )

        if response2.status_code != 200:
            print(f"   ERROR: Follow-up message failed (status {response2.status_code})")
            print(f"   Response: {response2.text}")
            return False

        data2 = response2.json()
        assistant_response2 = data2.get("message", {}).get("content", "")

        print(f"   User: What's my name?")
        print(f"   Assistant: {assistant_response2}")
        print()

        # Step 3: Verify conversation history endpoint
        print("3. Retrieving conversation history...")
        history_response = await client.get(
            f"{API_BASE}/chat/{conversation_id}"
        )

        if history_response.status_code != 200:
            print(f"   ERROR: Failed to retrieve history (status {history_response.status_code})")
            return False

        history = history_response.json()
        messages = history.get("messages", [])

        print(f"   Total messages in history: {len(messages)}")
        for i, msg in enumerate(messages, 1):
            role = msg.get("role")
            content = msg.get("content", "")[:50]
            print(f"   [{i}] {role}: {content}...")
        print()

        # Step 4: Validate context awareness
        print("4. Validating context awareness...")

        # Should have 4 messages: user1, assistant1, user2, assistant2
        if len(messages) != 4:
            print(f"   ERROR: Expected 4 messages, got {len(messages)}")
            return False

        # Check that the assistant's response mentions "Alice"
        # (indicating it understood the context from the first message)
        if "alice" in assistant_response2.lower():
            print("   [PASS] Assistant correctly referenced 'Alice' from conversation history")
            context_aware = True
        else:
            print("   [FAIL] Assistant did not reference 'Alice' in response")
            print(f"   Response was: {assistant_response2}")
            context_aware = False

        # Verify message order
        expected_roles = ["user", "assistant", "user", "assistant"]
        actual_roles = [msg.get("role") for msg in messages]

        if actual_roles == expected_roles:
            print("   [PASS] Message roles in correct order")
        else:
            print(f"   [FAIL] Message order incorrect")
            print(f"   Expected: {expected_roles}")
            print(f"   Got: {actual_roles}")
            return False

        return context_aware


async def test_streaming_conversation_context():
    """
    Test that conversation history works with streaming endpoint.
    """
    print("\n" + "="*60)
    print("Testing Streaming Conversation Context (MOK-52)")
    print("="*60 + "\n")

    async with httpx.AsyncClient(timeout=30.0) as client:
        conversation_id = None

        # Step 1: Send initial message via streaming
        print("1. Sending initial streaming message...")
        request1 = {
            "message": "My favorite color is blue.",
            "max_tokens": 100,
            "temperature": 0.7,
        }

        response1 = await client.post(
            f"{API_BASE}/chat/stream",
            json=request1
        )

        if response1.status_code != 200:
            print(f"   ERROR: Streaming failed (status {response1.status_code})")
            return False

        # Parse SSE stream to get conversation_id
        buffer = ""
        async for line in response1.aiter_lines():
            buffer += line + "\n"

            if line.startswith("event: metadata"):
                continue
            if line.startswith("data: "):
                try:
                    data = json.loads(line[6:])
                    if "conversation_id" in data:
                        conversation_id = data["conversation_id"]
                        print(f"   Conversation ID: {conversation_id}")
                        break
                except json.JSONDecodeError:
                    pass

        if not conversation_id:
            print("   ERROR: No conversation_id received from stream")
            return False

        # Consume the rest of the stream
        async for _ in response1.aiter_lines():
            pass

        print()

        # Step 2: Send follow-up via streaming
        print("2. Sending follow-up streaming message...")
        request2 = {
            "message": "What's my favorite color?",
            "conversation_id": conversation_id,
            "max_tokens": 100,
            "temperature": 0.7,
        }

        response2 = await client.post(
            f"{API_BASE}/chat/stream",
            json=request2
        )

        if response2.status_code != 200:
            print(f"   ERROR: Follow-up streaming failed (status {response2.status_code})")
            return False

        # Collect the assistant's response
        assistant_response = ""
        async for line in response2.aiter_lines():
            if line.startswith("event: token"):
                continue
            if line.startswith("data: "):
                try:
                    data = json.loads(line[6:])
                    if "content" in data:
                        assistant_response += data["content"]
                except json.JSONDecodeError:
                    pass

        print(f"   User: What's my favorite color?")
        print(f"   Assistant: {assistant_response}")
        print()

        # Step 3: Validate context awareness
        print("3. Validating streaming context awareness...")

        if "blue" in assistant_response.lower():
            print("   [PASS] Streaming assistant correctly referenced 'blue' from history")
            return True
        else:
            print("   [FAIL] Streaming assistant did not reference 'blue'")
            print(f"   Response was: {assistant_response}")
            return False


async def main():
    """Run conversation context tests."""
    print("\nStarting Conversation Context Tests for MOK-52")
    print("="*60)

    # Test non-streaming endpoint
    success1 = await test_conversation_context()

    # Test streaming endpoint
    success2 = await test_streaming_conversation_context()

    print("\n" + "="*60)
    if success1 and success2:
        print("[SUCCESS] ALL TESTS PASSED: Conversation context working correctly")
    else:
        print("[FAILED] TESTS FAILED:")
        if not success1:
            print("   - Non-streaming context test failed")
        if not success2:
            print("   - Streaming context test failed")
    print("="*60 + "\n")

    return success1 and success2


if __name__ == "__main__":
    result = asyncio.run(main())
    exit(0 if result else 1)
