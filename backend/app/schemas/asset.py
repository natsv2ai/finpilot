from pydantic import BaseModel


class AssetCreate(BaseModel):
    name: str
    asset_type: str  # real_estate, gold, fd, ppf, nps, epf
    value: float = 0
    purchase_price: float = 0
    location: str = ""
    property_type: str = ""
    property_details: str = ""
    loan_outstanding: float = 0
    emi: float = 0
    interest_rate: float = 0
    maturity_date: str = ""
    purchase_date: str = ""


class AssetUpdate(BaseModel):
    name: str | None = None
    asset_type: str | None = None
    value: float | None = None
    purchase_price: float | None = None
    location: str | None = None
    property_type: str | None = None
    property_details: str | None = None
    loan_outstanding: float | None = None
    emi: float | None = None
    interest_rate: float | None = None
    maturity_date: str | None = None
    purchase_date: str | None = None


class AssetOut(BaseModel):
    id: int
    name: str
    asset_type: str
    value: float
    purchase_price: float
    location: str
    property_type: str
    property_details: str
    loan_outstanding: float
    emi: float
    interest_rate: float
    maturity_date: str
    purchase_date: str

    class Config:
        from_attributes = True


class AssetCsvUploadResult(BaseModel):
    success: int
    failed: int
    errors: list[str]
