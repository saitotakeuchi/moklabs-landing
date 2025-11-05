import requests
import json

API_URL = "https://pnld-ai-service.fly.dev/api/v1/chat/stream"

# Test with a real edital ID from the database
payload = {
    "message": "What documents are available for this edital?",
    "edital_id": "pnld-anos-iniciais-2027-2030",
    "max_tokens": 200,
    "temperature": 0.7
}

print("Testing with edital ID:", payload["edital_id"])
print("Sending request to:", API_URL)
print("\n--- Streaming Response ---\n")

try:
    response = requests.post(API_URL, json=payload, stream=True, timeout=30)
    print(f"Status Code: {response.status_code}\n")
    
    if response.status_code != 200:
        print("Error response:", response.text)
    else:
        for line in response.iter_lines():
            if line:
                decoded_line = line.decode('utf-8')
                print(decoded_line)
            
except Exception as e:
    print(f"Error: {e}")
    print(f"Error type: {type(e).__name__}")
