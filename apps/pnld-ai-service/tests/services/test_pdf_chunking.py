"""
Test script to verify PDF chunking functionality locally.
Run this before deploying to verify the PDF processing works.
"""

import sys
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.embeddings import process_pdf_to_chunks


def test_pdf_chunking(pdf_path: str):
    """Test PDF chunking with a real PDF file."""
    print(f"Testing PDF: {pdf_path}\n")

    try:
        # Open the PDF file
        with open(pdf_path, 'rb') as pdf_file:
            # Process the PDF
            chunks = process_pdf_to_chunks(pdf_file, max_chunk_size=1000, overlap=200)

            print(f"✅ Successfully processed PDF!")
            print(f"📄 Total chunks created: {len(chunks)}")

            # Get page statistics
            pages = set(chunk.page_number for chunk in chunks)
            print(f"📖 Total pages: {len(pages)}")

            # Show first few chunks as examples
            print(f"\n📋 First 3 chunks:\n")
            for i, chunk in enumerate(chunks[:3], 1):
                print(f"Chunk {i}:")
                print(f"  Page: {chunk.page_number}")
                print(f"  Chunk Index: {chunk.chunk_index}")
                print(f"  Content Length: {len(chunk.content)} chars")
                print(f"  Preview: {chunk.content[:150]}...")
                print(f"  Metadata: {chunk.metadata}")
                print()

            # Page distribution
            print(f"📊 Chunks per page (first 10 pages):")
            for page_num in sorted(pages)[:10]:
                count = sum(1 for c in chunks if c.page_number == page_num)
                print(f"  Page {page_num}: {count} chunk(s)")

            return True

    except FileNotFoundError:
        print(f"❌ Error: PDF file not found at {pdf_path}")
        return False
    except Exception as e:
        print(f"❌ Error processing PDF: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    # Test with the PNLD PDF
    pdf_path = "../../documents/Minuta Edital PNLD Anos Iniciais 2027-2030.pdf"

    if len(sys.argv) > 1:
        pdf_path = sys.argv[1]

    success = test_pdf_chunking(pdf_path)
    sys.exit(0 if success else 1)
