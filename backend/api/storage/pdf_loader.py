import fitz  # PyMuPDF
from langchain_core.documents import Document
import io

# Try to use pytesseract/pdf2image for OCR fallback
try:
    from pdf2image import convert_from_bytes
    import pytesseract
    HAS_OCR = True
except ImportError:
    HAS_OCR = False


def load_pdf(uploaded_file):
    """
    Load PDF from Django uploaded file (InMemoryUploadedFile or TemporaryUploadedFile)
    """
    pdf_bytes = uploaded_file.read()

    # 1. Try native text extraction
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    documents = []

    for i, page in enumerate(doc):
        text = page.get_text().strip()
        if len(text) >= 50:
            documents.append(
                Document(
                    page_content=text,
                    metadata={"page": i + 1}
                )
            )

    if documents:
        return documents

    # 2. OCR fallback (scanned PDFs)
    if HAS_OCR:
        images = convert_from_bytes(pdf_bytes)
        ocr_documents = []

        for i, image in enumerate(images):
            text = pytesseract.image_to_string(image).strip()
            if len(text) >= 50:
                ocr_documents.append(
                    Document(
                        page_content=text,
                        metadata={
                            "page": i + 1,
                            "source": "ocr"
                        }
                    )
                )

        if ocr_documents:
            return ocr_documents

    # 3. Hard failure
    raise ValueError(
        "Failed to extract text from the PDF. "
        "The file appears to be fully scanned or unreadable."
    )
