import os
import re
import io
import httpx
import pdfplumber
from docx import Document
from pathlib import Path


def extract_text_from_pdf_bytes(file_bytes: bytes) -> str:
    """Extract text from PDF byte content using pdfplumber."""
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {str(e)}")
    return clean_text(text)


def extract_text_from_docx_bytes(file_bytes: bytes) -> str:
    """Extract text from DOCX byte content."""
    try:
        doc = Document(io.BytesIO(file_bytes))
        paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
        return clean_text("\n".join(paragraphs))
    except Exception as e:
        raise ValueError(f"Failed to parse DOCX: {str(e)}")


def clean_text(text: str) -> str:
    """Clean extracted text for AI processing."""
    # Remove excessive whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {2,}', ' ', text)
    # Remove non-printable characters
    text = re.sub(r'[^\x20-\x7E\n]', ' ', text)
    return text.strip()


async def fetch_and_extract(resume_url: str | None, resume_key: str | None) -> str:
    """Fetch resume from URL (S3 presigned or direct) and extract text."""
    if not resume_url:
        return ""

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(resume_url)
        response.raise_for_status()

    file_bytes = response.content
    content_type = response.headers.get("content-type", "").lower()

    if "pdf" in content_type or (resume_url and resume_url.lower().endswith(".pdf")):
        return extract_text_from_pdf_bytes(file_bytes)
    elif "word" in content_type or "docx" in content_type or (resume_url and resume_url.lower().endswith(".docx")):
        return extract_text_from_docx_bytes(file_bytes)
    else:
        # Try PDF first, then DOCX
        try:
            return extract_text_from_pdf_bytes(file_bytes)
        except Exception:
            return extract_text_from_docx_bytes(file_bytes)
