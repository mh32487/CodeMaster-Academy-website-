"""PDF certificate generation with QR code verification."""
import os
import io
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse, JSONResponse
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
import qrcode

from auth import get_current_user_payload

router = APIRouter(prefix="/api/certificates", tags=["certificates"])


def _gen_qr_image(data: str) -> ImageReader:
    qr = qrcode.QRCode(version=1, box_size=8, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#3B82F6", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return ImageReader(buf)


def render_certificate_pdf(student_name: str, course_title: str, level: str, language_name: str, cert_id: str, issued_at: str, verify_url: str) -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=landscape(A4))
    width, height = landscape(A4)

    # Background gradient bar
    c.setFillColor(HexColor("#3B82F6"))
    c.rect(0, height - 40, width, 40, fill=1, stroke=0)
    c.setFillColor(HexColor("#8B5CF6"))
    c.rect(0, 0, width, 40, fill=1, stroke=0)

    # Border
    c.setStrokeColor(HexColor("#3B82F6"))
    c.setLineWidth(3)
    c.rect(30, 60, width - 60, height - 130)

    # Header
    c.setFillColor(HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(width / 2, height - 110, "CERTIFICATO DI COMPLETAMENTO")

    c.setFont("Helvetica", 14)
    c.setFillColor(HexColor("#64748B"))
    c.drawCentredString(width / 2, height - 140, "CodeMaster Academy")

    # Recipient
    c.setFont("Helvetica", 16)
    c.setFillColor(HexColor("#0F172A"))
    c.drawCentredString(width / 2, height - 200, "Si certifica che")

    c.setFont("Helvetica-Bold", 40)
    c.setFillColor(HexColor("#3B82F6"))
    c.drawCentredString(width / 2, height - 250, student_name)

    c.setFont("Helvetica", 14)
    c.setFillColor(HexColor("#0F172A"))
    c.drawCentredString(width / 2, height - 285, "ha completato con successo il corso")

    c.setFont("Helvetica-Bold", 24)
    c.setFillColor(HexColor("#8B5CF6"))
    c.drawCentredString(width / 2, height - 325, f"{language_name} — Livello {level.title()}")

    # Footer / signature
    c.setFont("Helvetica", 11)
    c.setFillColor(HexColor("#64748B"))
    c.drawString(60, 90, f"Rilasciato il: {issued_at[:10]}")
    c.drawString(60, 75, f"Certificate ID: {cert_id}")
    c.drawString(60, 60, "Firma digitale: CodeMaster Academy")

    # QR code (right-bottom)
    try:
        qr_img = _gen_qr_image(verify_url)
        c.drawImage(qr_img, width - 140, 60, width=80, height=80)
        c.setFont("Helvetica", 8)
        c.drawString(width - 145, 50, "Verifica autenticità")
    except Exception:
        pass

    c.showPage()
    c.save()
    buf.seek(0)
    return buf.getvalue()


def _db(request: Request):
    return request.app.state.db


@router.get("/me")
async def my_certificates(request: Request, payload=Depends(get_current_user_payload)):
    db = _db(request)
    user_id = payload["sub"]
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    courses = await db.courses.find({}, {"_id": 0}).to_list(500)
    out = []
    for c in courses:
        total = len(c.get("lesson_ids", []))
        if total == 0:
            continue
        done = await db.progress.count_documents({"user_id": user_id, "course_id": c["id"], "type": "lesson", "completed": True})
        if done >= total:
            lang = await db.languages.find_one({"id": c["language_id"]}, {"_id": 0})
            cert_id = f"CMA-{c['id']}-{user_id[:8]}".upper()
            out.append({
                "id": cert_id,
                "course_id": c["id"],
                "course_title": c["title"],
                "language_name": lang["name"] if lang else c["language_id"],
                "level": c["level"],
                "issued_to": user["name"],
                "issued_at": user.get("created_at", datetime.now(timezone.utc).isoformat()),
                "pdf_url": f"/api/certificates/pdf/{c['id']}",
                "verify_url": f"/api/certificates/verify/{cert_id}",
            })
    return out


@router.get("/pdf/{course_id}")
async def get_certificate_pdf(course_id: str, request: Request, payload=Depends(get_current_user_payload)):
    db = _db(request)
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(404, "User not found")
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(404, "Course not found")

    total = len(course.get("lesson_ids", []))
    if total == 0:
        raise HTTPException(400, "Course has no lessons")
    done = await db.progress.count_documents({"user_id": user["id"], "course_id": course_id, "type": "lesson", "completed": True})
    if done < total:
        raise HTTPException(403, f"Course not completed yet ({done}/{total})")

    lang = await db.languages.find_one({"id": course["language_id"]}, {"_id": 0})
    cert_id = f"CMA-{course_id}-{user['id'][:8]}".upper()
    issued_at = datetime.now(timezone.utc).isoformat()
    verify_url = f"{str(request.base_url).rstrip('/')}/api/certificates/verify/{cert_id}"

    # Persist verification record (idempotent)
    await db.certificates_issued.update_one(
        {"cert_id": cert_id},
        {"$set": {
            "cert_id": cert_id,
            "user_id": user["id"],
            "user_name": user["name"],
            "course_id": course_id,
            "course_title": course["title"],
            "language_name": lang["name"] if lang else course["language_id"],
            "level": course["level"],
            "issued_at": issued_at,
        }},
        upsert=True,
    )

    pdf_bytes = render_certificate_pdf(
        student_name=user["name"],
        course_title=str(course["title"].get("it", "Corso")) if isinstance(course["title"], dict) else str(course["title"]),
        level=course["level"],
        language_name=lang["name"] if lang else course["language_id"],
        cert_id=cert_id,
        issued_at=issued_at,
        verify_url=verify_url,
    )
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="certificate_{cert_id}.pdf"'},
    )


@router.get("/verify/{cert_id}")
async def verify_certificate(cert_id: str, request: Request):
    db = _db(request)
    cert = await db.certificates_issued.find_one({"cert_id": cert_id}, {"_id": 0})
    if not cert:
        return JSONResponse({"valid": False, "message": "Certificato non trovato"}, status_code=404)
    return {"valid": True, "certificate": cert}
