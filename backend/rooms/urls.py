from django.urls import path
from . import views

urlpatterns = [
    # Room list and create
    path('rooms/', views.list_rooms, name='list-rooms'),
    path('rooms/create/', views.create_room, name='create-room'),

    # Available rooms
    path('rooms/available/', views.get_available_rooms, name='available-rooms'),

    # Room detail, update, and delete
    path('rooms/<int:pk>/', views.get_room, name='get-room'),
    path('rooms/<int:pk>/update/', views.update_room, name='update-room'),
    path('rooms/<int:pk>/delete/', views.delete_room, name='delete-room'),
]
