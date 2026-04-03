from pydantic import BaseModel


class ExpenseCreate(BaseModel):
    category: str
    description: str = ""
    amount: float
    type: str = "variable"  # recurring, variable
    date: str = ""


class ExpenseUpdate(BaseModel):
    category: str | None = None
    description: str | None = None
    amount: float | None = None
    type: str | None = None
    date: str | None = None


class ExpenseOut(BaseModel):
    id: int
    category: str
    description: str
    amount: float
    type: str
    date: str

    class Config:
        from_attributes = True


class BudgetCreate(BaseModel):
    category: str
    monthly_limit: float = 0


class BudgetUpdate(BaseModel):
    category: str | None = None
    monthly_limit: float | None = None


class BudgetOut(BaseModel):
    id: int
    category: str
    monthly_limit: float

    class Config:
        from_attributes = True


class ExpenseCsvUploadResult(BaseModel):
    success: int
    failed: int
    errors: list[str]
