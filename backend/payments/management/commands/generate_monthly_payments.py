"""
Django management command to generate monthly payments.

Usage:
    python manage.py generate_monthly_payments --month 12 --year 2025
    python manage.py generate_monthly_payments --month 12 --year 2025 --due-day 10
"""

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from datetime import date
import calendar

from payments.models import Payment
from tenants.models import RoomAssignment


class Command(BaseCommand):
    help = 'Generate monthly rent payments for all active tenants'

    def add_arguments(self, parser):
        parser.add_argument(
            '--month',
            type=int,
            required=True,
            help='Payment period month (1-12)'
        )

        parser.add_argument(
            '--year',
            type=int,
            required=True,
            help='Payment period year (e.g., 2025)'
        )

        parser.add_argument(
            '--due-day',
            type=int,
            default=5,
            help='Due date day of month (default: 5)'
        )

        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be created without actually creating'
        )

    def handle(self, *args, **options):
        month = options['month']
        year = options['year']
        due_day = options['due_day']
        dry_run = options['dry_run']

        # Validate month
        if month < 1 or month > 12:
            raise CommandError('Month must be between 1 and 12')

        # Validate year
        if year < 2000 or year > 2100:
            raise CommandError('Year must be between 2000 and 2100')

        # Validate due_day
        if due_day < 1 or due_day > 31:
            raise CommandError('Due day must be between 1 and 31')

        # Display info
        period_str = f"{calendar.month_name[month]} {year}"
        self.stdout.write(self.style.NOTICE(f'\n{"="*60}'))
        self.stdout.write(self.style.NOTICE(f'Generating payments for: {period_str}'))
        self.stdout.write(self.style.NOTICE(f'Due date: {due_day}th of month'))
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No payments will be created'))
        self.stdout.write(self.style.NOTICE(f'{"="*60}\n'))

        # Get all active assignments
        active_assignments = RoomAssignment.objects.filter(
            is_current=True
        ).select_related('tenant__user', 'room')

        if not active_assignments.exists():
            self.stdout.write(self.style.WARNING('No active tenant assignments found.'))
            return

        self.stdout.write(f'Found {active_assignments.count()} active tenant(s)\n')

        # Calculate due date
        try:
            due_date = date(year, month, due_day)
        except ValueError:
            # Invalid date (e.g., Feb 31), use last day of month
            last_day = calendar.monthrange(year, month)[1]
            due_date = date(year, month, min(due_day, last_day))
            self.stdout.write(
                self.style.WARNING(
                    f'Due day {due_day} invalid for {calendar.month_name[month]}, '
                    f'using {due_date.day} instead\n'
                )
            )

        # Process each assignment
        created_count = 0
        skipped_count = 0
        error_count = 0

        for assignment in active_assignments:
            tenant_name = assignment.tenant.user.get_full_name() or assignment.tenant.user.email
            room_number = assignment.room.room_number if assignment.room else 'N/A'

            # Check if payment already exists
            existing = Payment.objects.filter(
                tenant=assignment.tenant,
                payment_period_month=month,
                payment_period_year=year
            ).first()

            if existing:
                skipped_count += 1
                self.stdout.write(
                    self.style.WARNING(
                        f'  ⊗ SKIPPED: {tenant_name} ({room_number}) - '
                        f'Payment already exists (ID: {existing.id})'
                    )
                )
                continue

            # Create payment (unless dry run)
            if not dry_run:
                try:
                    payment = Payment.objects.create(
                        tenant=assignment.tenant,
                        assignment=assignment,
                        payment_period_month=month,
                        payment_period_year=year,
                        amount=assignment.monthly_rent,
                        due_date=due_date,
                        status='pending'
                    )

                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'  ✓ CREATED: {tenant_name} ({room_number}) - '
                            f'Rp {assignment.monthly_rent:,.0f} (ID: {payment.id})'
                        )
                    )

                except Exception as e:
                    error_count += 1
                    self.stdout.write(
                        self.style.ERROR(
                            f'  ✗ ERROR: {tenant_name} ({room_number}) - {str(e)}'
                        )
                    )
            else:
                # Dry run - just show what would be created
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'  ○ WOULD CREATE: {tenant_name} ({room_number}) - '
                        f'Rp {assignment.monthly_rent:,.0f}'
                    )
                )

        # Summary
        self.stdout.write(self.style.NOTICE(f'\n{"="*60}'))
        self.stdout.write(self.style.NOTICE('SUMMARY'))
        self.stdout.write(self.style.NOTICE(f'{"="*60}'))

        if dry_run:
            self.stdout.write(self.style.SUCCESS(f'  Would create: {created_count} payment(s)'))
        else:
            self.stdout.write(self.style.SUCCESS(f'  Created: {created_count} payment(s)'))

        self.stdout.write(self.style.WARNING(f'  Skipped: {skipped_count} payment(s)'))

        if error_count > 0:
            self.stdout.write(self.style.ERROR(f'  Errors: {error_count} payment(s)'))

        self.stdout.write(self.style.NOTICE(f'{"="*60}\n'))

        if not dry_run and created_count > 0:
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully generated {created_count} payment(s) for {period_str}!'
                )
            )
        elif dry_run and created_count > 0:
            self.stdout.write(
                self.style.WARNING(
                    f'Dry run complete. Run without --dry-run to create {created_count} payment(s).'
                )
            )
        elif skipped_count > 0 and created_count == 0:
            self.stdout.write(
                self.style.WARNING(
                    f'All payments for {period_str} already exist. Nothing to create.'
                )
            )
