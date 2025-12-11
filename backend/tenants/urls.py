from django.urls import path
from . import views

urlpatterns = [
    # Tenant Profile Endpoints
    path('', views.list_tenants, name='list_tenants'),
    path('me/', views.get_my_profile, name='get_my_profile'),
    path('active/', views.get_active_tenants, name='get_active_tenants'),
    path('<int:pk>/', views.get_tenant, name='get_tenant'),
    path('<int:pk>/update/', views.update_tenant, name='update_tenant'),
    path('<int:pk>/delete/', views.delete_tenant, name='delete_tenant'),

    # Room Assignment Endpoints
    path('<int:pk>/assign/', views.assign_room, name='assign_room'),
    path('<int:pk>/unassign/', views.unassign_room, name='unassign_room'),
    path('<int:pk>/change-room/', views.change_room, name='change_room'),

    # Utility Endpoints
    path('by-room/<str:room_id>/', views.get_tenant_by_room, name='get_tenant_by_room'),
]
