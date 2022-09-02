from django.contrib.auth import get_user_model
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    OpenApiTypes,
    extend_schema,
    extend_schema_view,
)
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.serializers import api_settings

from ..common.serializers import ErrorSerializer
from ..notes.models import Note
from ..notes.serializers import NoteSerializer
from .permissions import IsUser
from .serializers import UserSerializer


@extend_schema_view(
    list=extend_schema(
        summary="List users",
        description=(
            "List users. Only administrators can list user accounts.\n\n"
            "**Access policy**: Administrator"
        ),
        responses={
            200: OpenApiResponse(UserSerializer, description="Success"),
            401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
            403: OpenApiResponse(ErrorSerializer, description="Forbidden"),
            500: OpenApiResponse(ErrorSerializer, description="Server error"),
        },
    ),
    create=extend_schema(
        summary="Create a new user",
        description=(
            "Create a new user. Anyone can create a non-administrator user. Only"
            " administrators can create an administrator user account via the"
            " admin panel.\n\n"
            "**Access policy**: Public"
        ),
        auth=[],
        responses={
            201: OpenApiResponse(UserSerializer, description="Success"),
            400: OpenApiResponse(ErrorSerializer, description="Invalid request"),
            500: OpenApiResponse(ErrorSerializer, description="Server error"),
        },
    ),
    retrieve=extend_schema(
        summary="Inspect a user",
        description=(
            "Retrieve details about a user.\n\n**Access policy**: Authenticated"
        ),
        responses={
            200: OpenApiResponse(UserSerializer, description="Success"),
            401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
            404: OpenApiResponse(ErrorSerializer, description="User not found"),
            500: OpenApiResponse(ErrorSerializer, description="Server error"),
        },
    ),
    update=extend_schema(
        summary="Update a user",
        description=(
            "Update user details. A regular user account can only update his"
            " details.\n\n"
            "**Access policy**: Authenticated"
        ),
        responses={
            200: OpenApiResponse(UserSerializer, description="Success"),
            400: OpenApiResponse(ErrorSerializer, description="Invalid request"),
            401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
            404: OpenApiResponse(ErrorSerializer, description="User not found"),
            500: OpenApiResponse(ErrorSerializer, description="Server error"),
        },
    ),
    partial_update=extend_schema(
        summary="Partial update a user",
        description=(
            "Partial update user details. A regular user account can only update his"
            " details.\n\n"
            "**Access policy**: Authenticated"
        ),
        responses={
            200: OpenApiResponse(UserSerializer, description="Success"),
            400: OpenApiResponse(ErrorSerializer, description="Invalid request"),
            401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
            404: OpenApiResponse(ErrorSerializer, description="User not found"),
            500: OpenApiResponse(ErrorSerializer, description="Server error"),
        },
    ),
    destroy=extend_schema(
        summary="Remove a user",
        description=(
            "Remove a user. A regular user account can only remove his"
            " details and other related resources.\n\n"
            "**Access policy**: Authenticated"
        ),
        responses={
            204: OpenApiResponse(None, description="Success"),
            401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
            404: OpenApiResponse(ErrorSerializer, description="User not found"),
            500: OpenApiResponse(ErrorSerializer, description="Server error"),
        },
    ),
    list_notes=extend_schema(
        operation_id="users_notes_list",
        summary="Inspect a user notes",
        description="Inspect a user notes.\n\n**Access policy**: Authenticated",
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
                description="The initial index from which to return the results.",
            ),
        ],
        responses={
            200: OpenApiResponse(NoteSerializer(many=True), description="Success"),
            401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
            404: OpenApiResponse(ErrorSerializer, description="User not found"),
            500: OpenApiResponse(ErrorSerializer, description="Server error"),
        },
    ),
)
class UserViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        User = get_user_model()  # noqa
        if self.request.user.is_staff:
            return User.objects.all()

        return User.objects.filter(pk=self.request.user.id)

    def get_serializer_class(self):
        match self.action:
            case "list_notes":
                return NoteSerializer
            case _:
                return UserSerializer

    def get_permission_classes(self):
        match self.action:
            case "create":
                return [AllowAny]
            case "list":
                return [IsAuthenticated, IsAdminUser]
            case _:
                return [IsAuthenticated, IsUser | IsAdminUser]

    def get_permissions(self):
        self.permission_classes = self.get_permission_classes()
        return super().get_permissions()

    @action(
        detail=True,
        methods=["get"],
        url_path="notes",
        pagination_class=api_settings.DEFAULT_PAGINATION_CLASS,
    )
    def list_notes(self, *args, pk, **kwargs):
        is_this_user = pk == str(self.request.user.id)

        if not self.request.user.is_staff and not is_this_user:
            raise NotFound()

        if self.request.user.is_staff and not is_this_user:
            # Check that other user exists
            User = get_user_model()  # noqa
            if not User.objects.filter(pk=pk).exists():
                raise NotFound()

        notes = Note.objects.filter(owner_id=pk)
        page = self.paginate_queryset(notes)
        serializer = self.get_serializer(page if page else notes, many=True)
        return self.get_paginated_response(serializer.data)
