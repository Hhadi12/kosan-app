from django.urls import path
from . import views

urlpatterns = [
    # Core CRUD endpoints
    path('', views.list_payments, name='list_payments'),
    path('create/', views.create_payment, name='create_payment'),
    path('<int:pk>/', views.payment_detail, name='payment_detail'),
    path('<int:pk>/update/', views.update_payment, name='update_payment'),
    path('<int:pk>/delete/', views.delete_payment, name='delete_payment'),

    # Special operations
    path('<int:pk>/mark-paid/', views.mark_as_paid, name='mark_as_paid'),
    path('tenant/<int:tenant_id>/', views.payments_by_tenant, name='payments_by_tenant'),
    path('statistics/', views.payment_statistics, name='payment_statistics'),
    path('generate-monthly/', views.generate_monthly_payments, name='generate_monthly_payments'),

    # File upload & PDF (Features A & C)
    path('<int:pk>/upload-proof/', views.upload_proof_of_payment, name='upload_proof'),
    path('<int:pk>/receipt/', views.download_receipt, name='download_receipt'),

    # Export (Feature E)
    path('export/', views.export_payments, name='export_payments'),
]
