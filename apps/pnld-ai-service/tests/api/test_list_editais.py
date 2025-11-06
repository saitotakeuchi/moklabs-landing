import requests
import json

API_URL = "https://pnld-ai-service.fly.dev/api/v1/editais"

print("Fetching editais from API...")
response = requests.get(API_URL)
print(f"Status: {response.status_code}\n")

if response.status_code == 200:
    data = response.json()
    print(f"Total editais: {data.get('total', 0)}\n")
    print("Available Editais:")
    print("-" * 80)
    for edital in data.get('editais', []):
        print(json.dumps(edital, indent=2))
        print("-" * 80)
else:
    print(f"Error: {response.text}")
