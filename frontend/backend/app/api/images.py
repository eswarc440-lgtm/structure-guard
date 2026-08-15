from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Path
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import uuid
import os
from pathlib import Path as PathlibPath

from app.database.database import get_db
from app.models.images import InspectionImage
from app.models.infrastructure import InfrastructureAsset
from app.models.inspections import Inspection

router = APIRouter(prefix="/images", tags=["Images"])

# Configure upload directory
UPLOAD_DIR = PathlibPath("uploads/inspection_images")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Allowed MIME types
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    asset_id: str = Query(...),
    inspection_id: str = Query(None),
    location_description: str = Query(None),
    defect_type: str = Query(None),
    severity: str = Query(None),
    latitude: float = Query(None),
    longitude: float = Query(None),
    db: Session = Depends(get_db)
):
    """Upload inspection image"""
    
    # Verify asset exists
    asset = db.query(InfrastructureAsset).filter(InfrastructureAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")
    
    # Verify inspection if provided
    if inspection_id:
        inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
        if not inspection:
            raise HTTPException(status_code=404, detail=f"Inspection {inspection_id} not found")
    
    # Validate MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_MIME_TYPES)}"
        )
    
    # Read file content
    content = await file.read()
    
    # Validate file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024:.1f} MB"
        )
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1].lower()
    unique_filename = f"{uuid.uuid4().hex}_{asset_id}.{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    try:
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Create database record
    image_id = f"IMG-{uuid.uuid4().hex[:12].upper()}"
    
    image = InspectionImage(
        id=image_id,
        asset_id=asset_id,
        inspection_id=inspection_id,
        filename=unique_filename,
        original_filename=file.filename,
        file_path=str(file_path.relative_to(PathlibPath("."))),
        mime_type=file.content_type,
        file_size=len(content),
        location_description=location_description,
        defect_type=defect_type,
        severity=severity,
        latitude=latitude,
        longitude=longitude,
    )
    
    db.add(image)
    db.commit()
    db.refresh(image)
    
    return {
        "id": image.id,
        "asset_id": image.asset_id,
        "inspection_id": image.inspection_id,
        "filename": image.filename,
        "file_size": image.file_size,
        "mime_type": image.mime_type,
        "location_description": image.location_description,
        "defect_type": image.defect_type,
        "severity": image.severity,
        "uploaded_at": image.uploaded_at.isoformat(),
    }


@router.get("/{asset_id}")
def get_asset_images(
    asset_id: str = Path(...),
    inspection_id: str = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get images for an asset"""
    
    # Verify asset exists
    asset = db.query(InfrastructureAsset).filter(InfrastructureAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")
    
    query = db.query(InspectionImage).filter(InspectionImage.asset_id == asset_id)
    
    if inspection_id:
        query = query.filter(InspectionImage.inspection_id == inspection_id)
    
    total = query.count()
    images = query.order_by(InspectionImage.uploaded_at.desc()).offset(offset).limit(limit).all()
    
    return {
        "asset_id": asset_id,
        "total": total,
        "limit": limit,
        "offset": offset,
        "images": [
            {
                "id": img.id,
                "filename": img.filename,
                "file_size": img.file_size,
                "mime_type": img.mime_type,
                "location_description": img.location_description,
                "defect_type": img.defect_type,
                "severity": img.severity,
                "latitude": img.latitude,
                "longitude": img.longitude,
                "uploaded_at": img.uploaded_at.isoformat(),
            }
            for img in images
        ]
    }


@router.get("/detail/{image_id}")
def get_image_detail(
    image_id: str,
    db: Session = Depends(get_db)
):
    """Get image details"""
    
    image = db.query(InspectionImage).filter(InspectionImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    return {
        "id": image.id,
        "asset_id": image.asset_id,
        "inspection_id": image.inspection_id,
        "filename": image.filename,
        "original_filename": image.original_filename,
        "file_path": image.file_path,
        "file_size": image.file_size,
        "mime_type": image.mime_type,
        "image_width": image.image_width,
        "image_height": image.image_height,
        "location_description": image.location_description,
        "defect_type": image.defect_type,
        "severity": image.severity,
        "latitude": image.latitude,
        "longitude": image.longitude,
        "uploaded_at": image.uploaded_at.isoformat(),
        "is_validated": image.is_validated,
    }


@router.delete("/{image_id}")
def delete_image(
    image_id: str,
    db: Session = Depends(get_db)
):
    """Delete image"""
    
    image = db.query(InspectionImage).filter(InspectionImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Delete file
    try:
        if os.path.exists(image.file_path):
            os.remove(image.file_path)
    except Exception as e:
        # Log but don't fail
        print(f"Failed to delete file {image.file_path}: {str(e)}")
    
    # Delete database record
    db.delete(image)
    db.commit()
    
    return {"message": "Image deleted"}
