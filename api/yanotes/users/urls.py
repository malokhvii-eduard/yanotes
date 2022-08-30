from django.urls import include, path
from rest_framework import routers

from .views import UserViewSet


router = routers.SimpleRouter(trailing_slash=False)
router.register(r"users", UserViewSet, basename="user")

urlpatterns = [path("", include(router.urls))]
