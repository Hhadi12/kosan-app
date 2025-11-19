from django.urls import path
from .views import (
    ComplaintListView,
    ComplaintCreateView,
    ComplaintDetailView,
    ComplaintUpdateView,
    ComplaintDeleteView,
    CommentListView,
    CommentCreateView,
    CommentDeleteView,
    ComplaintStatsView,
)

app_name = 'complaints'

urlpatterns = [
    # Complaint endpoints
    path('', ComplaintListView.as_view(), name='complaint-list'),
    path('create/', ComplaintCreateView.as_view(), name='complaint-create'),
    path('<int:pk>/', ComplaintDetailView.as_view(), name='complaint-detail'),
    path('<int:pk>/update/', ComplaintUpdateView.as_view(), name='complaint-update'),
    path('<int:pk>/delete/', ComplaintDeleteView.as_view(), name='complaint-delete'),

    # Comment endpoints
    path('<int:complaint_id>/comments/', CommentListView.as_view(), name='comment-list'),
    path('<int:complaint_id>/comments/create/', CommentCreateView.as_view(), name='comment-create'),
    path('comments/<int:pk>/delete/', CommentDeleteView.as_view(), name='comment-delete'),

    # Statistics
    path('stats/', ComplaintStatsView.as_view(), name='complaint-stats'),
]
