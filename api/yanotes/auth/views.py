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
    summary="Authenticate a user",
    description=(
        "Take a set of user credentials and return an access and refresh JSON web"
        " token pair to prove the authentication of those credentials."
        "\n\n**Access policy**: Public"
    ),
    responses={
        200: OpenApiResponse(TokenObtainPairSerializer, description="Success"),
        401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
        500: OpenApiResponse(ErrorSerializer, description="Server error"),
    },
)(views.TokenObtainPairView)

TokenRefreshView = extend_schema(
    summary="Refresh an access token",
    description=(
        "Take a refresh type JSON web token and return an access type JSON web"
        " token if the refresh token is valid."
        + "\n\n**Access policy**: Public"
    ),
    responses={
        200: OpenApiResponse(TokenRefreshSerializer, description="Success"),
        401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
        500: OpenApiResponse(ErrorSerializer, description="Server error"),
    },
)(views.TokenRefreshView)

TokenBlacklistView = extend_schema(
    summary="Blacklist a refresh token",
    description=(
        "Take a refresh type JSON web token and blacklist it."
        + "\n\n**Access policy**: Public"
    ),
    responses={
        200: OpenApiResponse({}, description="Success"),
        401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
        500: OpenApiResponse(ErrorSerializer, description="Server error"),
    },
)(views.TokenBlacklistView)


@extend_schema(
    summary="Verify a user",
    description=(
        "Take an access type JSON web token and return a user’s details."
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
