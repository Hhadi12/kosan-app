"""
Payment Export Utilities (Feature E)

Export payment data to CSV and PDF formats.
"""

import csv
from io import BytesIO, StringIO
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from datetime import datetime
import calendar


def export_payments_csv(payments):
    """
    Export payments to CSV format.

    Args:
        payments: QuerySet of Payment objects

    Returns:
        StringIO: CSV file buffer
    """

    output = StringIO()
    writer = csv.writer(output)

    # Header row
    writer.writerow([
        'ID',
        'Receipt No',
        'Tenant Name',
        'Tenant Email',
        'Room Number',
        'Period',
        'Amount (Rp)',
        'Due Date',
        'Payment Date',
        'Status',
        'Payment Method',
        'Payment Reference',
        'Bank Name',
        'Notes',
        'Created At',
    ])

    # Data rows
    for payment in payments:
        writer.writerow([
            payment.id,
            f"{payment.id:06d}",
            payment.tenant.user.get_full_name() or payment.tenant.user.email,
            payment.tenant.user.email,
            payment.room_number or 'N/A',
            f"{calendar.month_name[payment.payment_period_month]} {payment.payment_period_year}",
            f"{payment.amount:,.2f}",
            payment.due_date.strftime('%Y-%m-%d'),
            payment.payment_date.strftime('%Y-%m-%d') if payment.payment_date else '',
            payment.get_status_display(),
            payment.get_payment_method_display() if payment.payment_method else '',
            payment.payment_reference or '',
            payment.bank_name or '',
            payment.notes or '',
            payment.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        ])

    output.seek(0)
    return output


def export_payments_pdf(payments, title="Payment Report"):
    """
    Export payments to PDF format.

    Args:
        payments: QuerySet of Payment objects
        title: Report title

    Returns:
        BytesIO: PDF file buffer
    """

    buffer = BytesIO()

    # Create PDF document (landscape for table)
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        rightMargin=1*cm,
        leftMargin=1*cm,
        topMargin=1.5*cm,
        bottomMargin=1.5*cm
    )

    elements = []
    styles = getSampleStyleSheet()

    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#1a56db'),
        spaceAfter=20,
        alignment=1,  # CENTER
        fontName='Helvetica-Bold'
    )

    elements.append(Paragraph(title, title_style))
    elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%d %B %Y, %H:%M')}", styles['Normal']))
    elements.append(Spacer(1, 0.5*cm))

    # Summary statistics
    total_payments = len(payments)
    total_amount = sum(p.amount for p in payments)
    paid_count = sum(1 for p in payments if p.status == 'paid')
    pending_count = sum(1 for p in payments if p.status == 'pending')

    summary_text = f"""
    <b>Summary:</b><br/>
    Total Payments: {total_payments}<br/>
    Total Amount: Rp {total_amount:,.2f}<br/>
    Paid: {paid_count} | Pending: {pending_count}
    """

    elements.append(Paragraph(summary_text, styles['Normal']))
    elements.append(Spacer(1, 0.5*cm))

    # Payment table
    table_data = [
        ['No', 'Tenant', 'Room', 'Period', 'Amount (Rp)', 'Due Date', 'Status']
    ]

    for idx, payment in enumerate(payments, 1):
        table_data.append([
            str(idx),
            payment.tenant.user.get_full_name() or payment.tenant.user.email[:20],
            payment.room_number or 'N/A',
            f"{calendar.month_abbr[payment.payment_period_month]} {payment.payment_period_year}",
            f"{payment.amount:,.0f}",
            payment.due_date.strftime('%d/%m/%Y'),
            payment.get_status_display(),
        ])

    table = Table(table_data, colWidths=[1.5*cm, 5*cm, 2*cm, 3*cm, 3*cm, 3*cm, 2.5*cm])
    table.setStyle(TableStyle([
        # Header row
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a56db')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),

        # Data rows
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('ALIGN', (0, 1), (0, -1), 'CENTER'),  # No column
        ('ALIGN', (4, 1), (4, -1), 'RIGHT'),   # Amount column
        ('ALIGN', (5, 1), (5, -1), 'CENTER'),  # Date column
        ('ALIGN', (6, 1), (6, -1), 'CENTER'),  # Status column
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
    ]))

    elements.append(table)

    # Build PDF
    doc.build(elements)

    buffer.seek(0)
    return buffer
