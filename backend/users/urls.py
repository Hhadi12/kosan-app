from django.urls import path
from . import views

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),
    path('auth/logout/', views.logout_user, name='logout'),
    path('auth/me/', views.get_current_user, name='current-user'),

    # Profile endpoints (current user)
    path('users/profile/', views.get_profile, name='profile'),
    path('users/profile/update/', views.update_profile, name='profile-update'),
    path('users/profile/change-email/', views.change_email, name='change-email'),
    path('users/profile/change-password/', views.change_password, name='change-password'),
    path('users/profile/history/', views.get_tenant_history, name='own-history'),

    # User management endpoints (admin)
    path('users/', views.list_users, name='list-users'),
    path('users/<str:pk>/', views.get_user, name='get-user'),
    path('users/<str:pk>/update/', views.update_user, name='update-user'),
    path('users/<str:pk>/delete/', views.delete_user, name='delete-user'),
    path('users/<str:user_id>/history/', views.get_tenant_history, name='user-history'),
]