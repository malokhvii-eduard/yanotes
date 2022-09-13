from django.urls import path

from .views import (
    TokenBlacklistView,
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)


urlpatterns = [
    path("auth/me", TokenVerifyView.as_view(), name="token_verify"),
    path("auth/token", TokenObtainPairView.as_view(), name="token"),
    path("auth/token/refresh", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/token/blacklist", TokenBlacklistView.as_view(), name="token_blacklist"),
]
