from pydantic import BaseModel


class InsurancePolicyCreate(BaseModel):
    name: str
    type: str  # term, health, ulip, endowment
    provider: str = ""
    sum_assured: float = 0
    premium: float = 0
    frequency: str = "Annual"
    start_date: str = ""
    end_date: str = ""
    nominee: str = ""
    covers: str = "[]"  # JSON string


class InsurancePolicyUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
    provider: str | None = None
    sum_assured: float | None = None
    premium: float | None = None
    frequency: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    nominee: str | None = None
    covers: str | None = None


class InsurancePolicyOut(BaseModel):
    id: int
    name: str
    type: str
    provider: str
    sum_assured: float
    premium: float
    frequency: str
    start_date: str
    end_date: str
    nominee: str
    covers: str

    class Config:
        from_attributes = True


class CsvUploadResult(BaseModel):
    success: int
    failed: int
    errors: list[str]
