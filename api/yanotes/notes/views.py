from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    OpenApiTypes,
    extend_schema,
    extend_schema_view,
)
from rest_framework import filters, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAdminUser, IsAuthenticated

from ..common.serializers import ErrorSerializer
from ..users.permissions import IsOwner
from .models import Note
from .serializers import NoteSerializer


@extend_schema_view(
    list=extend_schema(
        operation_id="notes_list",
        summary="List notes",
        description=(
            "List notes visible to the current user. Regular users receive only"
            " their own notes. Administrators receive all notes.\n\n"
            "Supports limit/offset pagination and ordering by `title` or"
            " `updated_at`. Use a leading `-` for descending order. When multiple"
            " notes have the same ordering value, results are ordered"
            " deterministically by `id` in the same direction.\n\n"
            "**Access policy**: Authenticated"
        ),
        parameters=[
            OpenApiParameter(
                "limit",
                OpenApiTypes.INT,
                OpenApiParameter.QUERY,
                description="Number of results to return per page.",
            ),
            OpenApiParameter(
                "offset",
                OpenApiTypes.INT,
                OpenApiParameter.QUERY,
                description="Initial index from which to return results.",
            ),
            OpenApiParameter(
                "ordering",
                OpenApiTypes.STR,
                OpenApiParameter.QUERY,
                description=(
                    "Order results by `title` or `updated_at`. Prefix with `-` for"
                    " descending order. Ties are resolved deterministically by `id`"
                    " in the same direction."
                ),
            ),
        ],
        responses={
            200: OpenApiResponse(NoteSerializer, description="Success"),
            401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
            500: OpenApiResponse(ErrorSerializer, description="Server error"),
        },
    ),
    create=extend_schema(
        operation_id="notes_create",
        summary="Create note",
        description=(
            "Create a note. Regular users can create notes only for themselves."
            " Administrators can create notes for any owner.\n\n"
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
        operation_id="notes_retrieve",
        summary="Retrieve note",
        description=(
            "Retrieve a note. Regular users can access only their own notes."
            " Administrators can access any note.\n\n"
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
        operation_id="notes_update",
        summary="Update note",
        description=(
            "Replace a note. Regular users can update only their own notes and"
            " cannot change ownership. Administrators can update any note and change"
            " the owner.\n\n"
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
        operation_id="notes_partial_update",
        summary="Partially update note",
        description=(
            "Partially update a note. Regular users can update only their own notes"
            " and cannot change ownership. Administrators can update any note and"
            " change the owner.\n\n"
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
        operation_id="notes_destroy",
        summary="Delete note",
        description=(
            "Delete a note. Regular users can delete only their own notes."
            " Administrators can delete any note.\n\n"
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

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        ordering = self.request.query_params.get("ordering")
        if not ordering:
            return queryset

        ordering_fields = [
            field.strip()
            for field in ordering.split(",")
            if field.strip() and field.lstrip("-") in self.ordering_fields
        ]
        if not ordering_fields:
            return queryset

        tie_breaker = "-id" if ordering_fields[0].startswith("-") else "id"
        return queryset.order_by(*ordering_fields, tie_breaker)

    def ensure_owner_change_is_allowed(self, serializer):
        requested_owner = serializer.validated_data.get("owner")
        if requested_owner is None:
            return

        if (
            not self.request.user.is_staff
            and requested_owner.id != self.request.user.id
        ):
            raise PermissionDenied()

    def perform_create(self, serializer):
        self.ensure_owner_change_is_allowed(serializer)
        serializer.save()

    def perform_update(self, serializer):
        self.ensure_owner_change_is_allowed(serializer)
        serializer.save()
