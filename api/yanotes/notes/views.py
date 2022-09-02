from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import filters, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAdminUser, IsAuthenticated

from ..common.serializers import ErrorSerializer
from ..users.permissions import IsOwner
from .models import Note
from .serializers import NoteSerializer


@extend_schema_view(
    list=extend_schema(
        summary="List notes",
        description=(
            "List notes. List all notes based on the current user authorizations."
            " Will return all notes if using an administrator account otherwise"
            " it will only return authorized notes.\n\n"
            "**Access policy**: Authenticated"
        ),
        responses={
            200: OpenApiResponse(NoteSerializer, description="Success"),
            401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
            500: OpenApiResponse(ErrorSerializer, description="Server error"),
        },
    ),
    create=extend_schema(
        summary="Create a new note",
        description=(
            "Create a new note. A regular user account can only create his notes.\n\n"
            "**Access policy**: Authenticated"
        ),
        responses={
            201: OpenApiResponse(NoteSerializer, description="Success"),
            400: OpenApiResponse(ErrorSerializer, description="Invalid request"),
            401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
            500: OpenApiResponse(ErrorSerializer, description="Server error"),
        },
    ),
    retrieve=extend_schema(
        summary="Inspect a note",
        description=(
            "Retrieve details about a note. A regular user account can only inspect"
            " his notes.\n\n"
            "**Access policy**: Authenticated"
        ),
        responses={
            200: OpenApiResponse(NoteSerializer, description="Success"),
            401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
            404: OpenApiResponse(ErrorSerializer, description="Note not found"),
            500: OpenApiResponse(ErrorSerializer, description="Server error"),
        },
    ),
    update=extend_schema(
        summary="Update a note",
        description=(
            "Update a note. A regular user account can only update his notes."
            " Only administrators can change note ownership.\n\n"
            "**Access policy**: Authenticated"
        ),
        responses={
            200: OpenApiResponse(NoteSerializer, description="Success"),
            400: OpenApiResponse(ErrorSerializer, description="Invalid request"),
            401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
            403: OpenApiResponse(ErrorSerializer, description="Forbidden"),
            404: OpenApiResponse(ErrorSerializer, description="Note not found"),
            500: OpenApiResponse(ErrorSerializer, description="Server error"),
        },
    ),
    partial_update=extend_schema(
        summary="Partial update a note",
        description=(
            "Partial update a note. A regular user account can only partial update his"
            " notes. Only administrators can change note ownership.\n\n"
            "**Access policy**: Authenticated"
        ),
        responses={
            200: OpenApiResponse(NoteSerializer, description="Success"),
            400: OpenApiResponse(ErrorSerializer, description="Invalid request"),
            401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
            403: OpenApiResponse(ErrorSerializer, description="Forbidden"),
            404: OpenApiResponse(ErrorSerializer, description="Note not found"),
            500: OpenApiResponse(ErrorSerializer, description="Server error"),
        },
    ),
    destroy=extend_schema(
        summary="Remove a note",
        description=(
            "Remove a note. A regular user account can only remove his notes.\n\n"
            "**Access policy**: Authenticated"
        ),
        responses={
            204: OpenApiResponse(None, description="Success"),
            401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
            404: OpenApiResponse(ErrorSerializer, description="Note not found"),
            500: OpenApiResponse(ErrorSerializer, description="Server error"),
        },
    ),
)
class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated, IsOwner | IsAdminUser]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["title", "updated_at"]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Note.objects.all()

        return Note.objects.filter(owner_id=self.request.user.id)

    def perform_create(self, serializer):
        if (
            not self.request.user.is_staff
            and serializer.validated_data["owner"].id != self.request.user.id
        ):
            raise PermissionDenied()

        serializer.save()
