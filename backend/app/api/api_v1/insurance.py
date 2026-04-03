import csv
import io
import json

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.insurance import InsurancePolicy
from app.schemas.insurance import (
    InsurancePolicyCreate, InsurancePolicyUpdate, InsurancePolicyOut, CsvUploadResult,
)

router = APIRouter(prefix="/insurance", tags=["Insurance"])


@router.get("", response_model=list[InsurancePolicyOut])
def list_policies(
    policy_type: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(InsurancePolicy).filter(InsurancePolicy.user_id == current_user.id)
    if policy_type:
        query = query.filter(InsurancePolicy.type == policy_type)
    return query.order_by(InsurancePolicy.id.desc()).all()


@router.get("/{policy_id}", response_model=InsurancePolicyOut)
def get_policy(
    policy_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    policy = db.query(InsurancePolicy).filter(
        InsurancePolicy.id == policy_id, InsurancePolicy.user_id == current_user.id
    ).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy


@router.post("", response_model=InsurancePolicyOut)
def create_policy(
    payload: InsurancePolicyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    policy = InsurancePolicy(user_id=current_user.id, **payload.model_dump())
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy


@router.put("/{policy_id}", response_model=InsurancePolicyOut)
def update_policy(
    policy_id: int,
    payload: InsurancePolicyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    policy = db.query(InsurancePolicy).filter(
        InsurancePolicy.id == policy_id, InsurancePolicy.user_id == current_user.id
    ).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    for key, value in payload.model_dump(exclude_none=True).items():
        setattr(policy, key, value)
    db.commit()
    db.refresh(policy)
    return policy


@router.delete("/{policy_id}")
def delete_policy(
    policy_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    policy = db.query(InsurancePolicy).filter(
        InsurancePolicy.id == policy_id, InsurancePolicy.user_id == current_user.id
    ).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    db.delete(policy)
    db.commit()
    return {"message": "Policy deleted"}


import pandas as pd

@router.post("/upload-csv", response_model=CsvUploadResult)
async def upload_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload CSV or Excel: name, type, provider, sum_assured, premium, frequency, start_date, end_date, nominee, covers"""
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
            name = str(row.get("name", "")).strip()
            
            # Fallback for name mapping
            if not name:
                 val = next((str(v).strip() for v in row.values() if str(v).strip()), "")
                 if not val:
                    errors.append(f"Row {i+2}: Missing name")
                    failed += 1
                    continue
                 name = val

            policy = InsurancePolicy(
                user_id=current_user.id,
                name=name,
                type=str(row.get("type", "term")).strip(),
                provider=str(row.get("provider", "")).strip(),
                sum_assured=float(row.get("sum_assured", 0)) if "sum_assured" in row and str(row["sum_assured"]).replace('.','',1).isdigit() else 0.0,
                premium=float(row.get("premium", 0)) if "premium" in row and str(row["premium"]).replace('.','',1).isdigit() else 0.0,
                frequency=str(row.get("frequency", "Annual")).strip(),
                start_date=str(row.get("start_date", "")).strip(),
                end_date=str(row.get("end_date", "")).strip(),
                nominee=str(row.get("nominee", "")).strip(),
                covers=str(row.get("covers", "[]")).strip(),
            )
            db.add(policy)
            success += 1
        except Exception as e:
            errors.append(f"Row {i+2}: {str(e)}")
            failed += 1

    db.commit()
    return CsvUploadResult(success=success, failed=failed, errors=errors[:20])
