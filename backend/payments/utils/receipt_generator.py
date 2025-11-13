"""
PDF Receipt Generator (Feature C)

Generates professional PDF receipts for payments.
Includes bank account information (Bank BCA - Rahman Hadi).
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from io import BytesIO
import calendar
from datetime import datetime


def generate_payment_receipt(payment):
    """
    Generate PDF receipt for a payment.

    Args:
        payment: Payment model instance

    Returns:
        BytesIO: PDF file buffer
    """

    # Create buffer
    buffer = BytesIO()

    # Create PDF document
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )

    # Container for PDF elements
    elements = []

    # Styles
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a56db'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )

    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#1f2937'),
        spaceAfter=12,
        fontName='Helvetica-Bold'
    )

    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.HexColor('#374151'),
        spaceAfter=6
    )

    # Header
    elements.append(Paragraph("KWITANSI PEMBAYARAN", title_style))
    elements.append(Paragraph("PAYMENT RECEIPT", title_style))
    elements.append(Spacer(1, 0.5*cm))

    # Receipt number and date
    receipt_info = f"<b>No. Kwitansi / Receipt No.:</b> {payment.id:06d}<br/>"
    receipt_info += f"<b>Tanggal / Date:</b> {payment.payment_date.strftime('%d %B %Y') if payment.payment_date else 'N/A'}"
    elements.append(Paragraph(receipt_info, normal_style))
    elements.append(Spacer(1, 0.5*cm))

    # Divider line
    elements.append(Spacer(1, 0.3*cm))

    # Payment Information
    elements.append(Paragraph("INFORMASI PEMBAYARAN / PAYMENT INFORMATION", heading_style))

    payment_data = [
        ['Penghuni / Tenant:', payment.tenant.user.get_full_name() or payment.tenant.user.email],
        ['Kamar / Room:', payment.room_number or 'N/A'],
        ['Periode / Period:', f"{calendar.month_name[payment.payment_period_month]} {payment.payment_period_year}"],
        ['Jumlah / Amount:', f"Rp {payment.amount:,.2f}"],
        ['Metode Pembayaran / Payment Method:', payment.get_payment_method_display() if payment.payment_method else 'N/A'],
        ['Referensi / Reference:', payment.payment_reference or 'N/A'],
        ['Status:', 'LUNAS / PAID' if payment.status == 'paid' else payment.get_status_display()],
    ]

    payment_table = Table(payment_data, colWidths=[6*cm, 11*cm])
    payment_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1f2937')),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
    ]))

    elements.append(payment_table)
    elements.append(Spacer(1, 0.7*cm))

    # Bank Information (Feature G)
    if payment.payment_method == 'transfer':
        elements.append(Paragraph("INFORMASI REKENING / BANK ACCOUNT INFORMATION", heading_style))

        bank_data = [
            ['Nama Bank / Bank Name:', payment.bank_name or 'Bank BCA'],
            ['Nama Rekening / Account Name:', payment.bank_account_name or 'Rahman Hadi'],
            ['Nomor Rekening / Account Number:', payment.bank_account_number or '1234567890'],
        ]

        bank_table = Table(bank_data, colWidths=[6*cm, 11*cm])
        bank_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#dbeafe')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1f2937')),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#93c5fd')),
        ]))

        elements.append(bank_table)
        elements.append(Spacer(1, 0.7*cm))

    # Notes
    if payment.notes:
        elements.append(Paragraph("CATATAN / NOTES", heading_style))
        elements.append(Paragraph(payment.notes, normal_style))
        elements.append(Spacer(1, 0.7*cm))

    # Footer - Processed by
    elements.append(Spacer(1, 1*cm))

    footer_data = [
        ['Diproses oleh / Processed by:', 'Penerima / Received by:'],
        ['', ''],
        ['', ''],
        [payment.paid_by.get_full_name() if payment.paid_by else 'Admin', payment.tenant.user.get_full_name()],
    ]

    footer_table = Table(footer_data, colWidths=[8.5*cm, 8.5*cm])
    footer_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('FONTSIZE', (0, 3), (-1, 3), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 30),
        ('LINEABOVE', (0, 3), (-1, 3), 1, colors.black),
    ]))

    elements.append(footer_table)
    elements.append(Spacer(1, 0.5*cm))

    # Timestamp
    timestamp_text = f"<i>Dicetak pada / Printed on: {datetime.now().strftime('%d %B %Y, %H:%M:%S')}</i>"
    timestamp_style = ParagraphStyle(
        'Timestamp',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#6b7280'),
        alignment=TA_CENTER
    )
    elements.append(Paragraph(timestamp_text, timestamp_style))

    # Build PDF
    doc.build(elements)

    # Get PDF data
    buffer.seek(0)
    return buffer
