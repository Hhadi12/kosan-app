from django.urls import path
from . import views

urlpatterns = [
    # Core CRUD endpoints
    path('', views.list_payments, name='list_payments'),
    path('create/', views.create_payment, name='create_payment'),

    # Static paths MUST be before <str:pk> to avoid being matched as an ID
    path('statistics/', views.payment_statistics, name='payment_statistics'),
    path('generate-monthly/', views.generate_monthly_payments, name='generate_monthly_payments'),
    path('export/', views.export_payments, name='export_payments'),
    path('tenant/<int:tenant_id>/', views.payments_by_tenant, name='payments_by_tenant'),

    # Dynamic paths with string ID (PAY-XXX format)
    path('<str:pk>/', views.payment_detail, name='payment_detail'),
    path('<str:pk>/update/', views.update_payment, name='update_payment'),
    path('<str:pk>/delete/', views.delete_payment, name='delete_payment'),
    path('<str:pk>/mark-paid/', views.mark_as_paid, name='mark_as_paid'),
    path('<str:pk>/upload-proof/', views.upload_proof_of_payment, name='upload_proof'),
    path('<str:pk>/receipt/', views.download_receipt, name='download_receipt'),
]
