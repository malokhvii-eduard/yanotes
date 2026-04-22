from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt import views
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)

from ..common.serializers import ErrorSerializer
from ..users.serializers import UserSerializer

TokenObtainPairView = extend_schema(
    operation_id="auth_token_create",
    summary="Authenticate user",
    description=(
        "Exchange user credentials for an access and refresh token pair."
        "\n\n**Access policy**: Public"
    ),
    responses={
        200: OpenApiResponse(TokenObtainPairSerializer, description="Success"),
        401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
        500: OpenApiResponse(ErrorSerializer, description="Server error"),
    },
)(views.TokenObtainPairView)

TokenRefreshView = extend_schema(
    operation_id="auth_token_refresh",
    summary="Refresh access token",
    description=(
        "Exchange a valid refresh token for a new access token and refresh token."
        "\n\n**Access policy**: Public"
    ),
    responses={
        200: OpenApiResponse(TokenRefreshSerializer, description="Success"),
        401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
        500: OpenApiResponse(ErrorSerializer, description="Server error"),
    },
)(views.TokenRefreshView)

TokenBlacklistView = extend_schema(
    operation_id="auth_token_blacklist",
    summary="Blacklist refresh token",
    description=(
        "Blacklist a refresh token so it can no longer be used."
        "\n\n**Access policy**: Public"
    ),
    responses={
        200: OpenApiResponse({}, description="Success"),
        401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
        500: OpenApiResponse(ErrorSerializer, description="Server error"),
    },
)(views.TokenBlacklistView)


@extend_schema(
    operation_id="auth_me_retrieve",
    summary="Retrieve current user",
    description=(
        "Return the authenticated user's profile."
        "\n\n**Access policy**: Authenticated"
    ),
    responses={
        200: OpenApiResponse(UserSerializer, description="Success"),
        401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
        404: OpenApiResponse(ErrorSerializer, description="User not found"),
        500: OpenApiResponse(ErrorSerializer, description="Server error"),
    },
)
class TokenVerifyView(generics.RetrieveAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=self.request.user.id)
        return obj
