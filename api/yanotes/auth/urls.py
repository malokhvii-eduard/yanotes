from django.urls import path

from . import views


urlpatterns = [
    path("auth/token", views.token_obtain_pair, name="token"),
    path("auth/token/refresh", views.token_refresh, name="token_refresh"),
]
