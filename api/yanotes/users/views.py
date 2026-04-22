from django.contrib.auth import get_user_model
from drf_spectacular.utils import (
    OpenApiResponse,
    extend_schema,
    extend_schema_view,
)
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated

from ..common.serializers import ErrorSerializer
from .permissions import IsUser
from .serializers import UserSerializer


@extend_schema_view(
    list=extend_schema(
        operation_id="users_list",
        summary="List users",
        description=("List all users.\n\n**Access policy**: Administrator"),
        responses={
            200: OpenApiResponse(UserSerializer, description="Success"),
            401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
            403: OpenApiResponse(ErrorSerializer, description="Forbidden"),
            500: OpenApiResponse(ErrorSerializer, description="Server error"),
        },
    ),
    create=extend_schema(
        operation_id="users_create",
        summary="Create user",
        description=(
            "Create a user profile. This endpoint creates regular users only;"
            " elevated flags such as administrator or superuser are not granted through"
            " this API.\n\n"
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
        operation_id="users_retrieve",
        summary="Retrieve user",
        description=(
            "Retrieve a user profile. Regular users can retrieve only their own"
            " profile. Administrators can retrieve any user.\n\n"
            "**Access policy**: Authenticated"
        ),
        responses={
            200: OpenApiResponse(UserSerializer, description="Success"),
            401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
            404: OpenApiResponse(ErrorSerializer, description="User not found"),
            500: OpenApiResponse(ErrorSerializer, description="Server error"),
        },
    ),
    update=extend_schema(
        operation_id="users_update",
        summary="Update user",
        description=(
            "Replace a user profile. Regular users can update only their own"
            " profile. Administrators can update any user.\n\n"
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
        operation_id="users_partial_update",
        summary="Partially update user",
        description=(
            "Partially update a user profile. Regular users can update only their"
            " own profile. Administrators can update any user.\n\n"
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
        operation_id="users_destroy",
        summary="Delete user",
        description=(
            "Delete a user profile. Regular users can delete only their own"
            " profile. Administrators can delete any user.\n\n"
            "**Access policy**: Authenticated"
        ),
        responses={
            204: OpenApiResponse(None, description="Success"),
            401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
            404: OpenApiResponse(ErrorSerializer, description="User not found"),
            500: OpenApiResponse(ErrorSerializer, description="Server error"),
        },
    ),
)
class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        User = get_user_model()  # noqa
        if self.request.user.is_staff:
            return User.objects.all()

        return User.objects.filter(pk=self.request.user.id)

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
