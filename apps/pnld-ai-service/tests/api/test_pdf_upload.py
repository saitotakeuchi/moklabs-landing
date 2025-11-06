#!/usr/bin/env python3
"""
Test script for the PDF upload endpoint.
Usage: python test_pdf_upload.py [--local|--production] <pdf_file_path>
"""

import requests
import sys
import os
import json
from pathlib import Path

def test_pdf_upload(base_url: str, pdf_path: str):
    """Test the PDF upload endpoint."""

    # Check if file exists
    if not os.path.exists(pdf_path):
        print(f"Error: File not found: {pdf_path}")
        return False

    # Get file size
    file_size = os.path.getsize(pdf_path)
    file_size_mb = file_size / (1024 * 1024)

    print(f"Testing PDF Upload Endpoint")
    print(f"Base URL: {base_url}")
    print(f"File: {pdf_path}")
    print(f"File size: {file_size_mb:.2f} MB")
    print("-" * 80)

    # Prepare the upload
    upload_url = f"{base_url}/api/v1/documents/upload-pdf"

    # Test data
    form_data = {
        "edital_id": "TEST-EDITAL-001",
        "title": f"Test Document - {Path(pdf_path).name}",
        "metadata": json.dumps({
            "test": True,
            "uploaded_via": "test_script",
            "source": "manual_upload"
        })
    }

    try:
        with open(pdf_path, 'rb') as pdf_file:
            files = {
                'file': (os.path.basename(pdf_path), pdf_file, 'application/pdf')
            }

            print(f"\nUploading to: {upload_url}")
            print(f"Form data: {json.dumps(form_data, indent=2)}\n")

            response = requests.post(
                upload_url,
                files=files,
                data=form_data,
                timeout=120  # 2 minutes timeout for large files
            )

            print(f"Response Status: {response.status_code}")
            print("-" * 80)

            if response.status_code == 201:
                result = response.json()
                print("✅ Upload successful!")
                print(json.dumps(result, indent=2))

                print("\n" + "=" * 80)
                print("Summary:")
                print(f"  Document ID: {result.get('document_id')}")
                print(f"  Edital ID: {result.get('edital_id')}")
                print(f"  Title: {result.get('title')}")
                print(f"  Filename: {result.get('filename')}")
                print(f"  Pages Processed: {result.get('pages_processed')}")
                print(f"  Chunks Created: {result.get('chunks_created')}")
                print(f"  Status: {result.get('status')}")
                print("=" * 80)

                return True
            else:
                print(f"❌ Upload failed!")
                print(f"Response: {response.text}")
                return False

    except requests.exceptions.ConnectionError:
        print(f"❌ Error: Could not connect to {base_url}")
        print("Make sure the service is running.")
        return False
    except requests.exceptions.Timeout:
        print("❌ Error: Request timed out")
        print("The file might be too large or the service is slow to respond.")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_validations(base_url: str):
    """Test various validation scenarios."""
    print("\n" + "=" * 80)
    print("Testing Validation Scenarios")
    print("=" * 80)

    upload_url = f"{base_url}/api/v1/documents/upload-pdf"

    # Test 1: No file
    print("\n1. Test: Missing file")
    try:
        response = requests.post(
            upload_url,
            data={
                "edital_id": "TEST",
                "title": "Test"
            }
        )
        print(f"   Status: {response.status_code}")
        print(f"   Expected: 422 (Validation Error)")
        print(f"   ✅ PASS" if response.status_code == 422 else f"   ❌ FAIL")
    except Exception as e:
        print(f"   ❌ Error: {e}")

    # Test 2: Invalid file type
    print("\n2. Test: Invalid file type (txt file)")
    try:
        # Create a temporary text file
        temp_file = "test_invalid.txt"
        with open(temp_file, 'w') as f:
            f.write("This is not a PDF")

        with open(temp_file, 'rb') as f:
            files = {'file': ('test.txt', f, 'text/plain')}
            data = {
                "edital_id": "TEST",
                "title": "Test"
            }
            response = requests.post(upload_url, files=files, data=data)

        os.remove(temp_file)

        print(f"   Status: {response.status_code}")
        print(f"   Expected: 400 (Bad Request)")
        print(f"   ✅ PASS" if response.status_code == 400 else f"   ❌ FAIL")
    except Exception as e:
        print(f"   ❌ Error: {e}")
        if os.path.exists(temp_file):
            os.remove(temp_file)

    # Test 3: Invalid JSON metadata
    print("\n3. Test: Invalid JSON metadata")
    try:
        # Create a minimal PDF for testing
        temp_pdf = "test_minimal.pdf"
        with open(temp_pdf, 'wb') as f:
            # Minimal PDF header
            f.write(b"%PDF-1.4\n%EOF\n")

        with open(temp_pdf, 'rb') as f:
            files = {'file': ('test.pdf', f, 'application/pdf')}
            data = {
                "edital_id": "TEST",
                "title": "Test",
                "metadata": "invalid json"
            }
            response = requests.post(upload_url, files=files, data=data)

        os.remove(temp_pdf)

        print(f"   Status: {response.status_code}")
        print(f"   Expected: 400 (Bad Request)")
        print(f"   ✅ PASS" if response.status_code == 400 else f"   ❌ FAIL")
    except Exception as e:
        print(f"   ❌ Error: {e}")
        if os.path.exists(temp_pdf):
            os.remove(temp_pdf)

    print("\n" + "=" * 80)


if __name__ == "__main__":
    # Parse arguments
    if len(sys.argv) < 2:
        print("Usage: python test_pdf_upload.py [--local|--production] [pdf_file_path]")
        print("\nExamples:")
        print("  python test_pdf_upload.py --local sample.pdf")
        print("  python test_pdf_upload.py --production sample.pdf")
        print("  python test_pdf_upload.py --validations  # Run validation tests only")
        sys.exit(1)

    # Determine environment
    if sys.argv[1] == "--production":
        base_url = "https://pnld-ai-service.fly.dev"
        pdf_path = sys.argv[2] if len(sys.argv) > 2 else None
    elif sys.argv[1] == "--local":
        base_url = "http://localhost:8000"
        pdf_path = sys.argv[2] if len(sys.argv) > 2 else None
    elif sys.argv[1] == "--validations":
        env = sys.argv[2] if len(sys.argv) > 2 else "--local"
        base_url = "https://pnld-ai-service.fly.dev" if env == "--production" else "http://localhost:8000"
        test_validations(base_url)
        sys.exit(0)
    else:
        # Default to local if no flag provided
        base_url = "http://localhost:8000"
        pdf_path = sys.argv[1]

    if pdf_path:
        success = test_pdf_upload(base_url, pdf_path)
        sys.exit(0 if success else 1)
    else:
        print("Error: PDF file path required")
        sys.exit(1)
