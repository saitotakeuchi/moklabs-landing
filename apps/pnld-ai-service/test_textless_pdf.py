"""
Unit tests for textless PDF handling.

Tests that the PDF processing code correctly handles:
1. PDFs with no extractable text (scanned documents)
2. PDFs with mixed pages (some with text, some without)
3. Pages where extract_text() returns None
4. Pages with only whitespace
"""

import sys
from pathlib import Path
from io import BytesIO
from unittest.mock import Mock, patch, MagicMock

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.embeddings import (
    extract_pages_from_pdf,
    process_pdf_to_chunks,
    TextlessPdfError,
)


def create_mock_pdf_reader(pages_data):
    """
    Create a mock PdfReader with specified page data.

    Args:
        pages_data: List of strings or None values representing text extraction results

    Returns:
        Mock PdfReader object
    """
    mock_reader = Mock()
    mock_pages = []

    for text in pages_data:
        mock_page = Mock()
        mock_page.extract_text.return_value = text
        mock_pages.append(mock_page)

    mock_reader.pages = mock_pages
    return mock_reader


def test_completely_textless_pdf():
    """Test that a completely textless PDF raises TextlessPdfError."""
    print("Test 1: Completely textless PDF (all pages return None)")

    # Mock a 5-page PDF where all pages return None
    pages_data = [None, None, None, None, None]

    with patch('app.services.embeddings.PdfReader') as mock_pdf_reader_class:
        mock_pdf_reader_class.return_value = create_mock_pdf_reader(pages_data)

        pdf_file = BytesIO(b"fake pdf content")

        try:
            chunks = extract_pages_from_pdf(pdf_file)
            print("  [FAIL] Expected TextlessPdfError but got result")
            return False
        except TextlessPdfError as e:
            error_msg = str(e)
            print(f"  [PASS] Raised TextlessPdfError: {error_msg}")

            # Verify error message contains useful information
            assert "5 page(s)" in error_msg, "Error should mention page count"
            assert "scanned document" in error_msg, "Error should mention scanned documents"
            assert "OCR" in error_msg, "Error should mention OCR solution"

            print("  [PASS] Error message contains actionable guidance")
            return True


def test_mixed_pages_pdf():
    """Test that a PDF with some textless pages processes the text pages."""
    print("\nTest 2: Mixed PDF (some pages with text, some without)")

    # Mock a 5-page PDF: pages 1, 3, 5 have text; pages 2, 4 return None
    pages_data = [
        "Page 1 content",
        None,
        "Page 3 content",
        None,
        "Page 5 content",
    ]

    with patch('app.services.embeddings.PdfReader') as mock_pdf_reader_class:
        mock_pdf_reader_class.return_value = create_mock_pdf_reader(pages_data)

        pdf_file = BytesIO(b"fake pdf content")
        chunks = extract_pages_from_pdf(pdf_file)

        print(f"  [PASS] Extracted {len(chunks)} chunks from pages with text")

        # Should have 3 chunks (pages 1, 3, 5)
        assert len(chunks) == 3, f"Expected 3 chunks, got {len(chunks)}"

        # Verify page numbers
        page_numbers = [chunk.page_number for chunk in chunks]
        assert page_numbers == [1, 3, 5], f"Expected pages [1, 3, 5], got {page_numbers}"

        # Verify content
        assert chunks[0].content == "Page 1 content"
        assert chunks[1].content == "Page 3 content"
        assert chunks[2].content == "Page 5 content"

        print("  [PASS] Correctly skipped None pages and extracted text pages")
        return True


def test_whitespace_only_pages():
    """Test that pages with only whitespace are skipped."""
    print("\nTest 3: Pages with only whitespace")

    # Mock pages with whitespace, empty strings, and actual content
    pages_data = [
        "   \n  \t  ",  # Only whitespace
        "",  # Empty string
        "Actual content here",
        "   ",  # Only spaces
    ]

    with patch('app.services.embeddings.PdfReader') as mock_pdf_reader_class:
        mock_pdf_reader_class.return_value = create_mock_pdf_reader(pages_data)

        pdf_file = BytesIO(b"fake pdf content")
        chunks = extract_pages_from_pdf(pdf_file)

        print(f"  [PASS] Extracted {len(chunks)} chunks, skipping whitespace-only pages")

        # Should only have 1 chunk (page 3 with actual content)
        assert len(chunks) == 1, f"Expected 1 chunk, got {len(chunks)}"
        assert chunks[0].page_number == 3
        assert chunks[0].content == "Actual content here"

        print("  [PASS] Correctly handled whitespace-only pages")
        return True


def test_all_whitespace_pdf():
    """Test that a PDF with only whitespace pages raises TextlessPdfError."""
    print("\nTest 4: PDF with only whitespace pages")

    pages_data = ["   ", "\n\n", "\t\t", "  \n  "]

    with patch('app.services.embeddings.PdfReader') as mock_pdf_reader_class:
        mock_pdf_reader_class.return_value = create_mock_pdf_reader(pages_data)

        pdf_file = BytesIO(b"fake pdf content")

        try:
            chunks = extract_pages_from_pdf(pdf_file)
            print("  [FAIL] Expected TextlessPdfError but got result")
            return False
        except TextlessPdfError as e:
            print(f"  [PASS] Raised TextlessPdfError for whitespace-only PDF")
            return True


def test_process_pdf_to_chunks_propagates_error():
    """Test that process_pdf_to_chunks propagates TextlessPdfError."""
    print("\nTest 5: process_pdf_to_chunks propagates TextlessPdfError")

    pages_data = [None, None]

    with patch('app.services.embeddings.PdfReader') as mock_pdf_reader_class:
        mock_pdf_reader_class.return_value = create_mock_pdf_reader(pages_data)

        pdf_file = BytesIO(b"fake pdf content")

        try:
            chunks = process_pdf_to_chunks(pdf_file)
            print("  [FAIL] Expected TextlessPdfError to propagate")
            return False
        except TextlessPdfError:
            print("  [PASS] TextlessPdfError correctly propagated from process_pdf_to_chunks")
            return True


def test_normal_pdf_still_works():
    """Test that normal text-based PDFs still process correctly."""
    print("\nTest 6: Normal text-based PDF (no regression)")

    pages_data = [
        "First page with lots of content",
        "Second page with more content",
        "Third page with final content",
    ]

    with patch('app.services.embeddings.PdfReader') as mock_pdf_reader_class:
        mock_pdf_reader_class.return_value = create_mock_pdf_reader(pages_data)

        pdf_file = BytesIO(b"fake pdf content")
        chunks = process_pdf_to_chunks(pdf_file)

        print(f"  [PASS] Processed normal PDF successfully: {len(chunks)} chunks")

        # Should have 3 chunks
        assert len(chunks) == 3
        assert all(chunk.content for chunk in chunks)

        print("  [PASS] No regression - normal PDFs work correctly")
        return True


def run_all_tests():
    """Run all unit tests and report results."""
    print("=" * 80)
    print("Testing Textless PDF Handling")
    print("=" * 80)

    tests = [
        test_completely_textless_pdf,
        test_mixed_pages_pdf,
        test_whitespace_only_pages,
        test_all_whitespace_pdf,
        test_process_pdf_to_chunks_propagates_error,
        test_normal_pdf_still_works,
    ]

    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"  [FAIL] Test raised unexpected exception: {e}")
            import traceback
            traceback.print_exc()
            results.append(False)

    print("\n" + "=" * 80)
    print(f"Results: {sum(results)}/{len(results)} tests passed")
    print("=" * 80)

    if all(results):
        print("\n[SUCCESS] All tests passed!")
        return True
    else:
        print("\n[FAILURE] Some tests failed")
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
