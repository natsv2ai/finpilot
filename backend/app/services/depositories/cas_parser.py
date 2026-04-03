"""
CAS (Consolidated Account Statement) PDF Parser.
Parses NSDL/CDSL CAS PDFs to extract holdings.
Uses pdfplumber for text extraction.
"""

import re
from dataclasses import dataclass


@dataclass
class CASHolding:
    """A holding extracted from a CAS PDF."""
    isin: str
    name: str
    quantity: float
    current_value: float = 0.0
    source: str = ""  # "NSDL" or "CDSL"
    folio: str = ""
    asset_type: str = "stock"  # stock, mutual_fund


def parse_cas_pdf(file_bytes: bytes, password: str = "") -> list[CASHolding]:
    """
    Parse a NSDL/CDSL CAS PDF and extract holdings.
    CAS PDFs are typically password-protected with PAN + DOB (e.g., ABCDE1234F01-Jan-1990).
    """
    try:
        import pdfplumber
    except ImportError:
        raise RuntimeError("pdfplumber not installed. Run: pip install pdfplumber")

    import io

    holdings: list[CASHolding] = []
    current_source = ""

    try:
        with pdfplumber.open(io.BytesIO(file_bytes), password=password) as pdf:
            full_text = ""
            for page in pdf.pages:
                text = page.extract_text() or ""
                full_text += text + "\n"

            # Detect source
            if "NSDL" in full_text.upper():
                current_source = "NSDL"
            elif "CDSL" in full_text.upper():
                current_source = "CDSL"

            # Parse equity holdings
            # Common CAS format: ISIN | Company Name | Quantity | Value
            isin_pattern = re.compile(
                r'(IN[A-Z0-9]{10})\s+(.+?)\s+(\d+[\.,]?\d*)\s+[\d,]+\.?\d*',
                re.MULTILINE
            )
            for match in isin_pattern.finditer(full_text):
                isin = match.group(1)
                name = match.group(2).strip()
                qty_str = match.group(3).replace(",", "")
                try:
                    quantity = float(qty_str)
                except ValueError:
                    continue

                if quantity <= 0:
                    continue

                holdings.append(CASHolding(
                    isin=isin,
                    name=name,
                    quantity=quantity,
                    source=current_source,
                    asset_type="stock" if isin.startswith("INE") else "mutual_fund",
                ))

            # Parse mutual fund holdings (NAV-based)
            # Format: Folio No: XXXXX | Scheme Name | Units | NAV | Value
            mf_pattern = re.compile(
                r'Folio\s*(?:No)?\.?\s*:?\s*(\S+).*?\n\s*(.+?)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+([\d,]+\.?\d*)',
                re.MULTILINE | re.IGNORECASE
            )
            for match in mf_pattern.finditer(full_text):
                folio = match.group(1)
                scheme = match.group(2).strip()
                units = float(match.group(3))
                nav = float(match.group(4))
                value = float(match.group(5).replace(",", ""))

                if units <= 0:
                    continue

                holdings.append(CASHolding(
                    isin="",
                    name=scheme,
                    quantity=units,
                    current_value=value,
                    source=current_source,
                    folio=folio,
                    asset_type="mutual_fund",
                ))

    except Exception as e:
        if "password" in str(e).lower() or "encrypted" in str(e).lower():
            raise ValueError(
                "CAS PDF is password-protected. "
                "Password is usually: PAN + DOB (e.g., ABCDE1234F01-Jan-1990)"
            )
        raise ValueError(f"Failed to parse CAS PDF: {str(e)}")

    return holdings
