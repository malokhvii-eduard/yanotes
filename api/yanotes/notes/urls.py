from django.urls import include, path
from rest_framework import routers

from .views import NoteViewSet


router = routers.SimpleRouter(trailing_slash=False)
router.register(r"notes", NoteViewSet, basename="note")

urlpatterns = [path("", include(router.urls))]
