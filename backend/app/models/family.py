from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, func

from app.db.base import Base


class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    relation = Column(String, default="self")  # self, spouse, child, parent
    dob = Column(String, default="")
    dependant = Column(Boolean, default=False)
    monthly_expense = Column(Float, default=0)
    avatar = Column(String, default="👤")
    created_at = Column(DateTime, server_default=func.now())
