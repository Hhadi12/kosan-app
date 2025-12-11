from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    """
    Custom User Manager to handle custom ID generation.
    """

    def _generate_user_id(self):
        """
        Generate the next USR-XXX ID.
        Finds the highest existing ID and increments.
        """
        # Get all existing user IDs that match our format
        from django.db import connection

        # Get the highest numeric part of existing IDs
        last_user = self.model.objects.order_by('-id').first()

        if last_user and last_user.id.startswith('USR-'):
            try:
                # Extract number from USR-XXX format
                last_num = int(last_user.id.split('-')[1])
                next_num = last_num + 1
            except (ValueError, IndexError):
                next_num = 1
        else:
            next_num = 1

        # Format with leading zeros (minimum 3 digits)
        return f"USR-{next_num:03d}"

    def create_user(self, email, username, password=None, **extra_fields):
        """
        Create and save a regular user with the given email and password.
        """
        if not email:
            raise ValueError('The Email field must be set')

        email = self.normalize_email(email)

        # Generate custom ID if not provided
        if 'id' not in extra_fields or not extra_fields.get('id'):
            extra_fields['id'] = self._generate_user_id()

        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        """
        Create and save a superuser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, username, password, **extra_fields)


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.

    Uses custom string ID format: USR-XXX (e.g., USR-001, USR-002)
    Adds custom fields: phone, role
    Role options: 'admin' or 'user'
    """

    # Custom primary key
    id = models.CharField(
        max_length=20,
        primary_key=True,
        editable=False,
        help_text="Unique user identifier (USR-XXX format)"
    )

    # Role choices
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('user', 'User'),
    ]

    # Custom fields
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Phone number"
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='user',
        help_text="User role: admin or user"
    )

    # Override email to make it required and unique
    email = models.EmailField(
        unique=True,
        help_text="Email address for login"
    )

    # Use email as username field for login
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    # Use custom manager
    objects = UserManager()

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']

    def __str__(self):
        return self.email

    def get_full_name(self):
        """Returns the first_name plus the last_name, with a space in between."""
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name or self.username

    def is_admin(self):
        """Check if user is admin"""
        return self.role == 'admin'