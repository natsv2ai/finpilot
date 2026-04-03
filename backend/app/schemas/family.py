from pydantic import BaseModel


class FamilyMemberCreate(BaseModel):
    name: str
    relation: str = "self"
    dob: str = ""
    dependant: bool = False
    monthly_expense: float = 0
    avatar: str = "👤"


class FamilyMemberUpdate(BaseModel):
    name: str | None = None
    relation: str | None = None
    dob: str | None = None
    dependant: bool | None = None
    monthly_expense: float | None = None
    avatar: str | None = None


class FamilyMemberOut(BaseModel):
    id: int
    name: str
    relation: str
    dob: str
    dependant: bool
    monthly_expense: float
    avatar: str

    class Config:
        from_attributes = True
