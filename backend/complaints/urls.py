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

    # Statistics - MUST be before <str:pk> to avoid being matched as an ID
    path('stats/', ComplaintStatsView.as_view(), name='complaint-stats'),

    # Comment delete - MUST be before <str:pk> patterns
    path('comments/<str:pk>/delete/', CommentDeleteView.as_view(), name='comment-delete'),

    # Detail/Update/Delete with string ID
    path('<str:pk>/', ComplaintDetailView.as_view(), name='complaint-detail'),
    path('<str:pk>/update/', ComplaintUpdateView.as_view(), name='complaint-update'),
    path('<str:pk>/delete/', ComplaintDeleteView.as_view(), name='complaint-delete'),

    # Comment endpoints (nested under complaint ID)
    path('<str:complaint_id>/comments/', CommentListView.as_view(), name='comment-list'),
    path('<str:complaint_id>/comments/create/', CommentCreateView.as_view(), name='comment-create'),
]
