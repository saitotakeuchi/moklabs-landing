#!/usr/bin/env python3
"""
Integration test for textless PDF upload rejection.

Tests that the API correctly rejects PDFs with no extractable text
and returns appropriate HTTP 422 error with actionable guidance.
"""

import sys
import os
import tempfile
from pathlib import Path
from io import BytesIO
from unittest.mock import patch, Mock
import requests

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))


def create_mock_textless_pdf():
    """
    Create a mock PDF that simulates a scanned document.

    Uses mocking to simulate PdfReader behavior where extract_text() returns None.
    """
    # Create a minimal valid PDF structure
    # This is just a placeholder - the mock will handle the actual behavior
    pdf_content = b"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>
endobj
xref
0 4
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
trailer
<< /Size 4 /Root 1 0 R >>
startxref
190
%%EOF
"""
    return BytesIO(pdf_content)


def test_textless_pdf_upload_api(base_url: str):
    """
    Test that uploading a textless PDF returns HTTP 422 with clear error message.

    This test mocks PdfReader to simulate a scanned PDF.
    """
    print("=" * 80)
    print("Integration Test: Textless PDF Upload Rejection")
    print("=" * 80)
    print(f"Base URL: {base_url}")
    print()

    # Create a temporary mock PDF file
    with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_pdf:
        temp_pdf.write(create_mock_textless_pdf().read())
        temp_pdf_path = temp_pdf.name

    try:
        # Mock PdfReader to return None for extract_text()
        def mock_pdf_reader(pdf_file):
            mock_reader = Mock()
            mock_page = Mock()
            mock_page.extract_text.return_value = None  # Simulate scanned page
            mock_reader.pages = [mock_page, mock_page, mock_page]  # 3 pages, all scanned
            return mock_reader

        with patch('app.services.embeddings.PdfReader', side_effect=mock_pdf_reader):
            # Prepare the upload
            upload_url = f"{base_url}/api/v1/documents/upload-pdf"

            with open(temp_pdf_path, 'rb') as pdf_file:
                files = {
                    'file': ('scanned_document.pdf', pdf_file, 'application/pdf')
                }
                data = {
                    'edital_id': 'TEST-EDITAL-001',
                    'title': 'Test Scanned Document'
                }

                print("Uploading textless (scanned) PDF...")
                response = requests.post(
                    upload_url,
                    files=files,
                    data=data,
                    timeout=30
                )

                print(f"Response Status: {response.status_code}")
                print("-" * 80)

                # Verify HTTP 422 response
                if response.status_code == 422:
                    print("[PASS] Received HTTP 422 (Unprocessable Entity)")

                    response_data = response.json()
                    error_detail = response_data.get('detail', '')

                    print(f"\nError message:\n{error_detail}\n")

                    # Verify error message contains helpful information
                    checks = [
                        ("page count", "page(s)" in error_detail),
                        ("scanned document mention", "scanned document" in error_detail.lower()),
                        ("OCR mention", "OCR" in error_detail),
                        ("actionable guidance", "selectable text" in error_detail or "text layer" in error_detail),
                    ]

                    all_passed = True
                    print("Error Message Quality Checks:")
                    for check_name, passed in checks:
                        status = "[PASS]" if passed else "[FAIL]"
                        print(f"  {status} {check_name}")
                        if not passed:
                            all_passed = False

                    print("-" * 80)

                    if all_passed:
                        print("\n[SUCCESS] Textless PDF correctly rejected with helpful error message")
                        return True
                    else:
                        print("\n[PARTIAL] PDF rejected but error message could be improved")
                        return False

                else:
                    print(f"[FAIL] Expected HTTP 422, got {response.status_code}")
                    print(f"Response: {response.text}")
                    return False

    except requests.exceptions.ConnectionError:
        print(f"[ERROR] Could not connect to {base_url}")
        print("Make sure the service is running:")
        print("  cd apps/pnld-ai-service")
        print("  python -m uvicorn app.main:app --reload --port 8000")
        return False
    except Exception as e:
        print(f"[ERROR] Test failed with exception: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        # Clean up temporary file
        if os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)


def test_textless_pdf_local():
    """
    Local unit test without requiring the API to be running.

    Tests the service layer directly with a mock textless PDF.
    """
    print("=" * 80)
    print("Unit Test: Textless PDF Processing (Service Layer)")
    print("=" * 80)

    from app.services.embeddings import process_pdf_to_chunks, TextlessPdfError

    # Mock PdfReader to return None for extract_text()
    def mock_pdf_reader(pdf_file):
        mock_reader = Mock()
        mock_page = Mock()
        mock_page.extract_text.return_value = None
        mock_reader.pages = [mock_page, mock_page, mock_page]
        return mock_reader

    with patch('app.services.embeddings.PdfReader', side_effect=mock_pdf_reader):
        pdf_file = create_mock_textless_pdf()

        try:
            chunks = process_pdf_to_chunks(pdf_file)
            print("[FAIL] Expected TextlessPdfError to be raised")
            return False
        except TextlessPdfError as e:
            error_msg = str(e)
            print(f"[PASS] TextlessPdfError raised: {error_msg}\n")

            # Verify error message quality
            checks = [
                ("page count mention", "3 page(s)" in error_msg),
                ("scanned document mention", "scanned" in error_msg.lower()),
                ("OCR solution", "OCR" in error_msg),
            ]

            all_passed = True
            print("Error Message Quality Checks:")
            for check_name, passed in checks:
                status = "[PASS]" if passed else "[FAIL]"
                print(f"  {status} {check_name}")
                if not passed:
                    all_passed = False

            if all_passed:
                print("\n[SUCCESS] Service layer correctly rejects textless PDFs")
                return True
            else:
                print("\n[PARTIAL] TextlessPdfError raised but message needs improvement")
                return False


def test_normal_pdf_still_works():
    """Test that normal PDFs with text still process successfully."""
    print("\n" + "=" * 80)
    print("Unit Test: Normal PDF Processing (No Regression)")
    print("=" * 80)

    from app.services.embeddings import process_pdf_to_chunks

    # Mock PdfReader to return text for extract_text()
    def mock_pdf_reader(pdf_file):
        mock_reader = Mock()
        mock_pages = []
        for i in range(3):
            mock_page = Mock()
            mock_page.extract_text.return_value = f"Page {i+1} content with actual text"
            mock_pages.append(mock_page)
        mock_reader.pages = mock_pages
        return mock_reader

    with patch('app.services.embeddings.PdfReader', side_effect=mock_pdf_reader):
        pdf_file = create_mock_textless_pdf()

        try:
            chunks = process_pdf_to_chunks(pdf_file)
            print(f"[PASS] Normal PDF processed successfully: {len(chunks)} chunks created")

            # Verify chunks have content
            if all(chunk.content for chunk in chunks):
                print("[PASS] All chunks have content")
                print("\n[SUCCESS] No regression - normal PDFs work correctly")
                return True
            else:
                print("[FAIL] Some chunks have no content")
                return False

        except Exception as e:
            print(f"[FAIL] Normal PDF processing failed: {e}")
            return False


def run_all_tests(base_url: str = "http://localhost:8000", run_api_tests: bool = False):
    """Run all integration and unit tests."""
    print("\n" + "=" * 80)
    print("TEXTLESS PDF HANDLING - INTEGRATION & UNIT TESTS")
    print("=" * 80 + "\n")

    results = []

    # Always run unit tests (don't require API)
    results.append(("Unit Test: Service Layer", test_textless_pdf_local()))
    results.append(("Unit Test: No Regression", test_normal_pdf_still_works()))

    # Only run API tests if requested
    if run_api_tests:
        results.append(("Integration Test: API", test_textless_pdf_upload_api(base_url)))
    else:
        print("\n" + "=" * 80)
        print("Skipping API integration test (use --api flag to enable)")
        print("=" * 80)

    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)

    for test_name, passed in results:
        status = "[PASS]" if passed else "[FAIL]"
        print(f"{status} {test_name}")

    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)

    print("-" * 80)
    print(f"Results: {passed_count}/{total_count} tests passed")
    print("=" * 80)

    return all(passed for _, passed in results)


if __name__ == "__main__":
    # Parse arguments
    run_api_tests = "--api" in sys.argv
    base_url = "http://localhost:8000"

    if "--production" in sys.argv:
        base_url = "https://pnld-ai-service.fly.dev"

    if "--help" in sys.argv or "-h" in sys.argv:
        print("Usage: python test_textless_pdf_upload.py [options]")
        print("\nOptions:")
        print("  --api           Run API integration tests (requires service to be running)")
        print("  --local         Use local server (default: http://localhost:8000)")
        print("  --production    Use production server")
        print("  --help, -h      Show this help message")
        print("\nExamples:")
        print("  python test_textless_pdf_upload.py")
        print("  python test_textless_pdf_upload.py --api")
        print("  python test_textless_pdf_upload.py --api --local")
        print("  python test_textless_pdf_upload.py --api --production")
        sys.exit(0)

    success = run_all_tests(base_url, run_api_tests)
    sys.exit(0 if success else 1)
