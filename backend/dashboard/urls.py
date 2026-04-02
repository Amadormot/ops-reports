from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DashboardViewSet, ProjectViewSet

router = DefaultRouter()
router.register(r'dashboard', DashboardViewSet, basename='dashboard')
router.register(r'projects', ProjectViewSet, basename='projects')

urlpatterns = [
    path('api/v1/', include(router.urls)),
]
