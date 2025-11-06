import requests
import json

API_URL = "https://pnld-ai-service.fly.dev/api/v1/chat/stream"

payload = {
    "message": "What is PNLD?",
    "edital_id": None,
    "max_tokens": 100,
    "temperature": 0.7
}

print("Sending request to:", API_URL)
print("Payload:", json.dumps(payload, indent=2))
print("\n--- Streaming Response ---\n")

try:
    response = requests.post(API_URL, json=payload, stream=True, timeout=30)
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}\n")
    
    for line in response.iter_lines():
        if line:
            decoded_line = line.decode('utf-8')
            print(decoded_line)
            
except Exception as e:
    print(f"Error: {e}")
    print(f"Error type: {type(e).__name__}")
