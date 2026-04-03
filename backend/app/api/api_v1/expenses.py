import csv
import io

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.expense import Expense, Budget
from app.schemas.expense import (
    ExpenseCreate, ExpenseUpdate, ExpenseOut,
    BudgetCreate, BudgetUpdate, BudgetOut,
    ExpenseCsvUploadResult,
)

router = APIRouter(prefix="/expenses", tags=["Expenses"])


# ── Expenses ──

@router.get("", response_model=list[ExpenseOut])
def list_expenses(
    category: str | None = None,
    expense_type: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Expense).filter(Expense.user_id == current_user.id)
    if category:
        query = query.filter(Expense.category == category)
    if expense_type:
        query = query.filter(Expense.type == expense_type)
    return query.order_by(Expense.id.desc()).all()


@router.get("/{expense_id}", response_model=ExpenseOut)
def get_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id, Expense.user_id == current_user.id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.post("", response_model=ExpenseOut)
def create_expense(
    payload: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    expense = Expense(user_id=current_user.id, **payload.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.put("/{expense_id}", response_model=ExpenseOut)
def update_expense(
    expense_id: int,
    payload: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id, Expense.user_id == current_user.id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    for key, value in payload.model_dump(exclude_none=True).items():
        setattr(expense, key, value)
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id, Expense.user_id == current_user.id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted"}


import pandas as pd

@router.post("/upload-csv", response_model=ExpenseCsvUploadResult)
async def upload_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload CSV or Excel: category, description, amount, type, date"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing")
        
    filename = file.filename.lower()
    if not (filename.endswith(".csv") or filename.endswith(".xls") or filename.endswith(".xlsx")):
        raise HTTPException(status_code=400, detail="Only CSV, XLS, and XLSX files are accepted")

    content = await file.read()
    try:
        if filename.endswith(".csv"):
            try:
                text = content.decode("utf-8")
            except UnicodeDecodeError:
                text = content.decode("latin-1", errors="ignore")
                
            delimiter = ","
            first_line = text.split("\n")[0]
            if "\t" in first_line and "," not in first_line:
                delimiter = "\t"
            elif ";" in first_line and "," not in first_line:
                delimiter = ";"
                
            df = pd.read_csv(io.StringIO(text), sep=delimiter)
        else:
            df = pd.read_excel(io.BytesIO(content))
    except Exception as e:
         raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    if df.empty or len(df.columns) == 0:
        raise HTTPException(status_code=400, detail="File is empty or has no columns")

    df.columns = df.columns.astype(str).str.lower().str.strip()
    df = df.fillna("")

    success, failed = 0, 0
    errors: list[str] = []

    for i, row_data in df.iterrows():
        try:
            row = row_data.to_dict()
            category = str(row.get("category", "")).strip()
            amount_raw = str(row.get("amount", "0")).replace('.','',1).replace(',','')
            amount = float(row.get("amount", 0)) if "amount" in row and amount_raw.replace('-','',1).isdigit() else 0.0
            
            # Fallbacks
            if not category or amount <= 0:
                 # Try to find a string for category and a number for amount
                 for k, v in row.items():
                     v_str = str(v).strip()
                     v_num = v_str.replace('.','',1).replace(',','').replace('-','',1)
                     if not category and v_str and not v_num.isdigit():
                         category = v_str
                     if amount <= 0 and v_num.isdigit():
                         amt = float(v_str.replace(',',''))
                         if amt > 0: amount = amt
            
            if not category or amount <= 0:
                errors.append(f"Row {i+2}: Missing category or invalid amount")
                failed += 1
                continue

            expense = Expense(
                user_id=current_user.id,
                category=category,
                description=str(row.get("description", "")).strip(),
                amount=amount,
                type=str(row.get("type", "variable")).strip(),
                date=str(row.get("date", "")).strip(),
            )
            db.add(expense)
            success += 1
        except Exception as e:
            errors.append(f"Row {i+2}: {str(e)}")
            failed += 1

    db.commit()
    return ExpenseCsvUploadResult(success=success, failed=failed, errors=errors[:20])


# ── Budgets ──

@router.get("/budgets/all", response_model=list[BudgetOut])
def list_budgets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Budget).filter(Budget.user_id == current_user.id).all()


@router.post("/budgets", response_model=BudgetOut)
def create_budget(
    payload: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Upsert: update if category already exists
    existing = db.query(Budget).filter(
        Budget.user_id == current_user.id, Budget.category == payload.category
    ).first()
    if existing:
        existing.monthly_limit = payload.monthly_limit
        db.commit()
        db.refresh(existing)
        return existing

    budget = Budget(user_id=current_user.id, **payload.model_dump())
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


@router.delete("/budgets/{budget_id}")
def delete_budget(
    budget_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = db.query(Budget).filter(
        Budget.id == budget_id, Budget.user_id == current_user.id
    ).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(budget)
    db.commit()
    return {"message": "Budget deleted"}
