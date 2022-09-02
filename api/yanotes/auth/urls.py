from django.urls import path

from . import views


urlpatterns = [
    path("auth/me", views.token_verify, name="token_verify"),
    path("auth/token", views.token_obtain_pair, name="token"),
    path("auth/token/refresh", views.token_refresh, name="token_refresh"),
]
