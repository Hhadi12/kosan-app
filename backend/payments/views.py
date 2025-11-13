from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q, Sum, Count, Case, When, DecimalField, Value
from datetime import date, datetime
from decimal import Decimal
import calendar

from .models import Payment
from .serializers import (
    PaymentSerializer,
    PaymentListSerializer,
    PaymentCreateSerializer,
    PaymentUpdateSerializer,
    PaymentStatsSerializer,
)
from tenants.models import TenantProfile, RoomAssignment


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def is_admin(user):
    """Check if user is admin."""
    return user.role == 'admin'


def can_view_payment(user, payment):
    """Check if user can view this payment."""
    if is_admin(user):
        return True
    # Tenant can only view own payments
    if hasattr(user, 'tenant_profile'):
        return payment.tenant == user.tenant_profile
    return False


# ============================================================
# CORE CRUD ENDPOINTS
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_payments(request):
    """
    GET /api/payments/

    List all payments (admin) or own payments (tenant).

    Supports filtering:
    - status: pending, paid, cancelled, overdue
    - tenant: tenant ID
    - payment_period_month: 1-12
    - payment_period_year: e.g., 2025
    - due_date_from, due_date_to: date range

    Supports searching:
    - tenant_name: search in tenant name
    - payment_reference: search in reference

    Supports sorting:
    - sort: due_date, payment_date, amount, created_at (prefix with - for desc)
    """

    # Base query
    if is_admin(request.user):
        queryset = Payment.objects.select_related(
            'tenant__user',
            'assignment__room',
            'paid_by'
        ).all()
    else:
        # Tenant sees only own payments
        if not hasattr(request.user, 'tenant_profile'):
            return Response(
                {'error': 'User does not have a tenant profile'},
                status=status.HTTP_403_FORBIDDEN
            )
        queryset = Payment.objects.filter(
            tenant=request.user.tenant_profile
        ).select_related(
            'tenant__user',
            'assignment__room',
            'paid_by'
        )

    # Filters
    payment_status = request.query_params.get('status')
    tenant_id = request.query_params.get('tenant')
    month = request.query_params.get('payment_period_month')
    year = request.query_params.get('payment_period_year')
    due_date_from = request.query_params.get('due_date_from')
    due_date_to = request.query_params.get('due_date_to')

    # Search
    tenant_name = request.query_params.get('tenant_name')
    reference = request.query_params.get('payment_reference')

    # Apply filters
    if payment_status:
        if payment_status == 'overdue':
            # Filter pending payments with due_date < today
            queryset = queryset.filter(
                status='pending',
                due_date__lt=timezone.now().date()
            )
        else:
            queryset = queryset.filter(status=payment_status)

    if tenant_id:
        queryset = queryset.filter(tenant_id=tenant_id)

    if month:
        queryset = queryset.filter(payment_period_month=month)

    if year:
        queryset = queryset.filter(payment_period_year=year)

    if due_date_from:
        queryset = queryset.filter(due_date__gte=due_date_from)

    if due_date_to:
        queryset = queryset.filter(due_date__lte=due_date_to)

    # Apply search
    if tenant_name:
        queryset = queryset.filter(
            Q(tenant__user__first_name__icontains=tenant_name) |
            Q(tenant__user__last_name__icontains=tenant_name) |
            Q(tenant__user__email__icontains=tenant_name)
        )

    if reference:
        queryset = queryset.filter(payment_reference__icontains=reference)

    # Sorting
    sort_by = request.query_params.get('sort', '-due_date')
    allowed_sorts = ['due_date', '-due_date', 'payment_date', '-payment_date',
                     'amount', '-amount', 'created_at', '-created_at']
    if sort_by in allowed_sorts:
        queryset = queryset.order_by(sort_by)

    # Serialize
    serializer = PaymentListSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request):
    """
    POST /api/payments/create/

    Create a new payment (admin only).

    Required fields:
    - tenant: tenant ID
    - payment_period_month: 1-12
    - payment_period_year: e.g., 2025
    - amount: payment amount

    Optional fields:
    - assignment: room assignment ID
    - due_date: defaults to 5th of month
    - status: defaults to 'pending'
    - payment_date: if status is 'paid'
    - payment_method: cash, transfer, other
    - payment_reference: reference number
    - bank details
    - notes
    """

    if not is_admin(request.user):
        return Response(
            {'error': 'Only admins can create payments'},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = PaymentCreateSerializer(data=request.data)
    if serializer.is_valid():
        payment = serializer.save()

        # Return detailed payment
        response_serializer = PaymentSerializer(payment)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_detail(request, pk):
    """
    GET /api/payments/{id}/

    Get payment detail.

    Permissions:
    - Admin: can view any payment
    - Tenant: can view own payment only
    """

    payment = get_object_or_404(
        Payment.objects.select_related(
            'tenant__user',
            'assignment__room',
            'paid_by'
        ),
        pk=pk
    )

    # Permission check
    if not can_view_payment(request.user, payment):
        return Response(
            {'error': 'You do not have permission to view this payment'},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = PaymentSerializer(payment)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_payment(request, pk):
    """
    PUT/PATCH /api/payments/{id}/update/

    Update a payment (admin only).

    Can update:
    - payment_date
    - status
    - payment_method
    - payment_reference
    - bank details
    - notes

    Cannot update:
    - tenant
    - period
    - amount
    """

    if not is_admin(request.user):
        return Response(
            {'error': 'Only admins can update payments'},
            status=status.HTTP_403_FORBIDDEN
        )

    payment = get_object_or_404(Payment, pk=pk)

    partial = request.method == 'PATCH'
    serializer = PaymentUpdateSerializer(payment, data=request.data, partial=partial)

    if serializer.is_valid():
        serializer.save()

        # Return detailed payment
        response_serializer = PaymentSerializer(payment)
        return Response(response_serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_payment(request, pk):
    """
    DELETE /api/payments/{id}/delete/

    Delete a payment (admin only).

    Can only delete:
    - Pending payments
    - Cancelled payments

    Cannot delete:
    - Paid payments (to maintain audit trail)
    """

    if not is_admin(request.user):
        return Response(
            {'error': 'Only admins can delete payments'},
            status=status.HTTP_403_FORBIDDEN
        )

    payment = get_object_or_404(Payment, pk=pk)

    # Cannot delete paid payments
    if payment.status == 'paid':
        return Response(
            {'error': 'Cannot delete paid payments. Cancel them instead.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    payment.delete()
    return Response(
        {'message': 'Payment deleted successfully'},
        status=status.HTTP_204_NO_CONTENT
    )


# ============================================================
# SPECIAL OPERATION ENDPOINTS
# ============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_as_paid(request, pk):
    """
    POST /api/payments/{id}/mark-paid/

    Mark a payment as paid (admin only).

    Request body:
    - payment_date: date payment received (optional, defaults to today)
    - payment_method: cash, transfer, other (optional)
    - payment_reference: reference number (optional)
    - notes: additional notes (optional)
    """

    if not is_admin(request.user):
        return Response(
            {'error': 'Only admins can mark payments as paid'},
            status=status.HTTP_403_FORBIDDEN
        )

    payment = get_object_or_404(Payment, pk=pk)

    # Check if already paid
    if payment.status == 'paid':
        return Response(
            {'error': 'Payment is already marked as paid'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Get data from request
    payment_date = request.data.get('payment_date')
    if payment_date:
        # Parse date string if provided
        if isinstance(payment_date, str):
            try:
                payment_date = datetime.strptime(payment_date, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Invalid date format. Use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )
    else:
        payment_date = timezone.now().date()

    payment_method = request.data.get('payment_method')
    payment_reference = request.data.get('payment_reference')
    notes = request.data.get('notes')

    # Mark as paid
    success = payment.mark_as_paid(
        payment_date=payment_date,
        payment_method=payment_method,
        paid_by=request.user,
        notes=notes
    )

    if success:
        # Update payment_reference if provided
        if payment_reference:
            payment.payment_reference = payment_reference
            payment.save()

        serializer = PaymentSerializer(payment)
        return Response({
            'message': 'Payment marked as paid successfully',
            'payment': serializer.data
        })
    else:
        return Response(
            {'error': 'Failed to mark payment as paid'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payments_by_tenant(request, tenant_id):
    """
    GET /api/payments/tenant/{tenant_id}/

    Get all payments for a specific tenant.

    Permissions:
    - Admin: can view any tenant's payments
    - Tenant: can view own payments only
    """

    tenant = get_object_or_404(TenantProfile, pk=tenant_id)

    # Permission check
    if not is_admin(request.user):
        if not hasattr(request.user, 'tenant_profile') or request.user.tenant_profile != tenant:
            return Response(
                {'error': 'You can only view your own payments'},
                status=status.HTTP_403_FORBIDDEN
            )

    payments = Payment.objects.filter(tenant=tenant).select_related(
        'tenant__user',
        'assignment__room',
        'paid_by'
    ).order_by('-payment_period_year', '-payment_period_month')

    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_statistics(request):
    """
    GET /api/payments/statistics/

    Get payment statistics (admin only).

    Returns:
    - Total counts (all, paid, pending, overdue, cancelled)
    - Total amounts (all, paid, pending, overdue)
    - Monthly revenue data (last 12 months) for charts
    - This month statistics
    """

    if not is_admin(request.user):
        return Response(
            {'error': 'Only admins can view statistics'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Get all payments
    all_payments = Payment.objects.all()

    # Today's date
    today = timezone.now().date()

    # Count by status
    total_payments = all_payments.count()
    paid_count = all_payments.filter(status='paid').count()
    pending_count = all_payments.filter(status='pending', due_date__gte=today).count()
    overdue_count = all_payments.filter(status='pending', due_date__lt=today).count()
    cancelled_count = all_payments.filter(status='cancelled').count()

    # Sum amounts
    total_amount = all_payments.aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
    paid_amount = all_payments.filter(status='paid').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')

    pending_amount = all_payments.filter(
        status='pending',
        due_date__gte=today
    ).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')

    overdue_amount = all_payments.filter(
        status='pending',
        due_date__lt=today
    ).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')

    # Monthly revenue (last 12 months) - Feature J
    monthly_revenue = []
    current_date = today

    for i in range(12):
        year = current_date.year
        month = current_date.month

        month_revenue = all_payments.filter(
            status='paid',
            payment_period_year=year,
            payment_period_month=month
        ).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')

        monthly_revenue.insert(0, {
            'year': year,
            'month': month,
            'month_name': calendar.month_name[month],
            'revenue': float(month_revenue)
        })

        # Go back one month
        if month == 1:
            current_date = current_date.replace(year=year - 1, month=12, day=1)
        else:
            current_date = current_date.replace(month=month - 1, day=1)

    # This month statistics
    this_month_paid = all_payments.filter(
        status='paid',
        payment_period_year=today.year,
        payment_period_month=today.month
    ).count()

    this_month_pending = all_payments.filter(
        status='pending',
        payment_period_year=today.year,
        payment_period_month=today.month
    ).count()

    this_month_revenue = all_payments.filter(
        status='paid',
        payment_period_year=today.year,
        payment_period_month=today.month
    ).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')

    # Prepare statistics data
    stats_data = {
        'total_payments': total_payments,
        'paid_count': paid_count,
        'pending_count': pending_count,
        'overdue_count': overdue_count,
        'cancelled_count': cancelled_count,
        'total_amount': total_amount,
        'paid_amount': paid_amount,
        'pending_amount': pending_amount,
        'overdue_amount': overdue_amount,
        'monthly_revenue': monthly_revenue,
        'this_month_paid': this_month_paid,
        'this_month_pending': this_month_pending,
        'this_month_revenue': this_month_revenue,
    }

    serializer = PaymentStatsSerializer(stats_data)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_monthly_payments(request):
    """
    POST /api/payments/generate-monthly/

    Generate monthly payments for all active tenants (admin only).

    Request body:
    - month: 1-12
    - year: e.g., 2025
    - due_day: day of month (default: 5)

    Creates pending payments for all tenants with is_current=True assignments.
    Idempotent: won't create duplicates.

    Returns:
    - created_count: number of payments created
    - skipped_count: number skipped (already exist)
    - details: list of created payments
    """

    if not is_admin(request.user):
        return Response(
            {'error': 'Only admins can generate monthly payments'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Get parameters
    month = request.data.get('month')
    year = request.data.get('year')
    due_day = request.data.get('due_day', 5)

    # Validate
    if not month or not year:
        return Response(
            {'error': 'Month and year are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        month = int(month)
        year = int(year)
        due_day = int(due_day)
    except ValueError:
        return Response(
            {'error': 'Month, year, and due_day must be integers'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if month < 1 or month > 12:
        return Response(
            {'error': 'Month must be between 1 and 12'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if due_day < 1 or due_day > 31:
        return Response(
            {'error': 'Due day must be between 1 and 31'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Get all active assignments
    active_assignments = RoomAssignment.objects.filter(
        is_current=True
    ).select_related('tenant', 'room')

    created_payments = []
    skipped_tenants = []

    for assignment in active_assignments:
        # Check if payment already exists
        existing = Payment.objects.filter(
            tenant=assignment.tenant,
            payment_period_month=month,
            payment_period_year=year
        ).exists()

        if existing:
            skipped_tenants.append({
                'tenant': assignment.tenant.user.get_full_name() or assignment.tenant.user.email,
                'reason': 'Payment already exists'
            })
            continue

        # Create payment
        try:
            due_date = date(year, month, due_day)
        except ValueError:
            # Invalid date (e.g., Feb 31), use last day of month
            import calendar
            last_day = calendar.monthrange(year, month)[1]
            due_date = date(year, month, min(due_day, last_day))

        payment = Payment.objects.create(
            tenant=assignment.tenant,
            assignment=assignment,
            payment_period_month=month,
            payment_period_year=year,
            amount=assignment.monthly_rent,
            due_date=due_date,
            status='pending'
        )

        created_payments.append({
            'id': payment.id,
            'tenant': payment.tenant.user.get_full_name() or payment.tenant.user.email,
            'room': payment.room_number,
            'amount': float(payment.amount),
            'due_date': payment.due_date.strftime('%Y-%m-%d')
        })

    return Response({
        'message': f'Generated payments for {calendar.month_name[month]} {year}',
        'created_count': len(created_payments),
        'skipped_count': len(skipped_tenants),
        'created_payments': created_payments,
        'skipped_tenants': skipped_tenants
    })


# ============================================================
# FILE UPLOAD & PDF GENERATION (Features A & C)
# ============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_proof_of_payment(request, pk):
    """
    POST /api/payments/{id}/upload-proof/

    Upload proof of payment file (Feature A).

    Accepts: JPG, PNG, PDF files (max 5MB)

    Permissions:
    - Admin: can upload for any payment
    - Tenant: can upload for own payment only
    """

    payment = get_object_or_404(Payment, pk=pk)

    # Permission check
    if not can_view_payment(request.user, payment):
        return Response(
            {'error': 'You do not have permission to upload proof for this payment'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Check if file provided
    if 'proof_of_payment' not in request.FILES:
        return Response(
            {'error': 'No file provided. Use key "proof_of_payment"'},
            status=status.HTTP_400_BAD_REQUEST
        )

    file = request.FILES['proof_of_payment']

    # Validate file size (max 5MB)
    max_size = 5 * 1024 * 1024  # 5MB
    if file.size > max_size:
        return Response(
            {'error': 'File size exceeds 5MB limit'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate file extension
    allowed_extensions = ['jpg', 'jpeg', 'png', 'pdf']
    file_extension = file.name.split('.')[-1].lower()
    if file_extension not in allowed_extensions:
        return Response(
            {'error': f'Invalid file type. Allowed: {", ".join(allowed_extensions)}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Save file
    payment.proof_of_payment = file
    payment.save()

    serializer = PaymentSerializer(payment)
    return Response({
        'message': 'Proof of payment uploaded successfully',
        'payment': serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_receipt(request, pk):
    """
    GET /api/payments/{id}/receipt/

    Generate and download PDF receipt (Feature C).

    Only available for paid payments.

    Permissions:
    - Admin: can download any receipt
    - Tenant: can download own receipt only
    """

    from django.http import HttpResponse
    from .utils.receipt_generator import generate_payment_receipt

    payment = get_object_or_404(Payment, pk=pk)

    # Permission check
    if not can_view_payment(request.user, payment):
        return Response(
            {'error': 'You do not have permission to download this receipt'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Only paid payments can have receipts
    if payment.status != 'paid':
        return Response(
            {'error': 'Receipt only available for paid payments'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Generate PDF
    pdf_buffer = generate_payment_receipt(payment)

    # Return PDF as download
    response = HttpResponse(pdf_buffer, content_type='application/pdf')
    filename = f"kwitansi_{payment.id:06d}_{payment.tenant.user.last_name or 'receipt'}.pdf"
    response['Content-Disposition'] = f'attachment; filename="{filename}"'

    return response


# ============================================================
# EXPORT ENDPOINTS (Feature E)
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_payments(request):
    """
    GET /api/payments/export/

    Export payments to CSV or PDF (Feature E).

    Query parameters:
    - format: csv or pdf (required)
    - All list_payments filters apply

    Admin only.
    """

    from django.http import HttpResponse
    from .utils.export_utils import export_payments_csv, export_payments_pdf

    if not is_admin(request.user):
        return Response(
            {'error': 'Only admins can export payments'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Get format
    export_format = request.query_params.get('format', 'csv').lower()
    if export_format not in ['csv', 'pdf']:
        return Response(
            {'error': 'Invalid format. Use "csv" or "pdf"'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Get payments (reuse list_payments filters)
    queryset = Payment.objects.select_related(
        'tenant__user',
        'assignment__room',
        'paid_by'
    ).all()

    # Apply filters (same as list_payments)
    payment_status = request.query_params.get('status')
    tenant_id = request.query_params.get('tenant')
    month = request.query_params.get('payment_period_month')
    year = request.query_params.get('payment_period_year')
    due_date_from = request.query_params.get('due_date_from')
    due_date_to = request.query_params.get('due_date_to')

    if payment_status:
        if payment_status == 'overdue':
            queryset = queryset.filter(
                status='pending',
                due_date__lt=timezone.now().date()
            )
        else:
            queryset = queryset.filter(status=payment_status)

    if tenant_id:
        queryset = queryset.filter(tenant_id=tenant_id)

    if month:
        queryset = queryset.filter(payment_period_month=month)

    if year:
        queryset = queryset.filter(payment_period_year=year)

    if due_date_from:
        queryset = queryset.filter(due_date__gte=due_date_from)

    if due_date_to:
        queryset = queryset.filter(due_date__lte=due_date_to)

    # Sort
    queryset = queryset.order_by('-payment_period_year', '-payment_period_month', '-due_date')

    # Generate export
    if export_format == 'csv':
        csv_buffer = export_payments_csv(queryset)
        response = HttpResponse(csv_buffer, content_type='text/csv')
        filename = f"payments_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

    elif export_format == 'pdf':
        # Build title based on filters
        title = "Payment Report"
        if month and year:
            title = f"Payment Report - {calendar.month_name[int(month)]} {year}"
        elif year:
            title = f"Payment Report - {year}"

        pdf_buffer = export_payments_pdf(list(queryset), title=title)
        response = HttpResponse(pdf_buffer, content_type='application/pdf')
        filename = f"payments_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
