from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


# =============================================================================
# User Display Serializers
# =============================================================================

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model.
    Used for displaying user data.
    """
    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'email', 
            'first_name', 
            'last_name', 
            'phone', 
            'role', 
            'is_active',
            'date_joined'
        ]
        read_only_fields = ['id', 'date_joined']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    Handles password hashing.
    """
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'username',
            'email', 
            'password',
            'password_confirm',
            'first_name', 
            'last_name', 
            'phone'
        ]
    
    def validate(self, data):
        """
        Check that passwords match.
        """
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match'
            })
        return data
    
    def create(self, validated_data):
        """
        Create user with hashed password.
        """
        # Remove password_confirm (not needed for user creation)
        validated_data.pop('password_confirm')
        
        # Create user with hashed password
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    """
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, data):
        """
        Validate credentials and return user if valid.
        """
        email = data.get('email')
        password = data.get('password')
        
        if email and password:
            # Authenticate user
            user = authenticate(
                request=self.context.get('request'),
                username=email,  # We use email as username
                password=password
            )
            
            if not user:
                raise serializers.ValidationError(
                    'Unable to log in with provided credentials.'
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    'User account is disabled.'
                )

            data['user'] = user
            return data
        else:
            raise serializers.ValidationError(
                'Must include "email" and "password".'
            )


# =============================================================================
# Profile Serializers
# =============================================================================

class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for viewing user profile.
    Includes tenant profile data if user is a tenant.
    """
    tenant_profile = serializers.SerializerMethodField()
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'username',
            'first_name',
            'last_name',
            'full_name',
            'phone',
            'role',
            'date_joined',
            'tenant_profile'
        ]
        read_only_fields = ['id', 'email', 'role', 'date_joined']

    def get_tenant_profile(self, obj):
        """Get tenant profile data if user has one"""
        if hasattr(obj, 'tenant_profile'):
            try:
                from tenants.serializers import TenantProfileSerializer
                return TenantProfileSerializer(obj.tenant_profile).data
            except obj.tenant_profile.RelatedObjectDoesNotExist:
                return None
        return None


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating profile (name, phone).
    Email and password changes are handled separately.
    """
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone']

    def validate_phone(self, value):
        """Validate phone number format if provided"""
        if value:
            import re
            # Allow numbers, spaces, +, -, ()
            if not re.match(r'^[\d\s\+\-\(\)]+$', value):
                raise serializers.ValidationError(
                    "Nomor telepon hanya boleh berisi angka, spasi, +, -, dan ()"
                )
        return value.strip() if value else value


class EmailChangeSerializer(serializers.Serializer):
    """
    Serializer for changing email with password confirmation.
    """
    new_email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_new_email(self, value):
        """Check if email is already in use"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email sudah digunakan.")
        return value

    def validate_password(self, value):
        """Verify current password"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Password salah.")
        return value


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for changing password.
    Requires current password and confirmation.
    """
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate_current_password(self, value):
        """Verify current password is correct"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Password saat ini salah.")
        return value

    def validate(self, data):
        """Check that new passwords match"""
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': "Password baru tidak cocok."
            })
        return data


# =============================================================================
# History Serializers (Phase 8.4)
# =============================================================================

class PaymentHistorySerializer(serializers.Serializer):
    """
    Monthly payment summary for history display.
    Shows payment status and whether it was paid on time or late.
    """
    month = serializers.IntegerField()
    year = serializers.IntegerField()
    month_name = serializers.CharField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    status = serializers.CharField()
    payment_date = serializers.DateField(allow_null=True)
    due_date = serializers.DateField()
    is_late = serializers.BooleanField()


class ComplaintHistorySerializer(serializers.Serializer):
    """
    Monthly complaint summary for history display.
    Groups complaints by month with category and status breakdown.
    """
    month = serializers.IntegerField()
    year = serializers.IntegerField()
    month_name = serializers.CharField()
    count = serializers.IntegerField()
    categories = serializers.ListField(child=serializers.CharField())
    statuses = serializers.DictField()


class TenantHistorySerializer(serializers.Serializer):
    """
    Complete tenant history summary combining payments and complaints.
    Used for the profile page 12-month history view.
    """
    # User info
    user_id = serializers.CharField()
    user_name = serializers.CharField()

    # Payment summary
    payment_summary = serializers.DictField()
    payment_history = PaymentHistorySerializer(many=True)

    # Complaint summary
    complaint_summary = serializers.DictField()
    complaint_history = ComplaintHistorySerializer(many=True)