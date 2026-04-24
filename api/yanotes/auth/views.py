from django.conf import settings
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    extend_schema,
    extend_schema_view,
)
from rest_framework import exceptions, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt import views
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.serializers import TokenBlacklistSerializer

from ..common.serializers import ErrorSerializer
from ..users.serializers import UserSerializer
from .serializers import TokenCreateSerializer, TokenObtainSerializer


class RefreshCookieMixin:
    refresh_cookie_name = settings.REFRESH_COOKIE_NAME
    refresh_cookie_path = settings.REFRESH_COOKIE_PATH

    def set_refresh_cookie(self, response, refresh_token):
        response.set_cookie(
            self.refresh_cookie_name,
            refresh_token,
            httponly=True,
            path=self.refresh_cookie_path,
            samesite=settings.REFRESH_COOKIE_SAMESITE,
            secure=settings.REFRESH_COOKIE_SECURE,
            max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        )

    def delete_refresh_cookie(self, response):
        response.delete_cookie(
            self.refresh_cookie_name,
            path=self.refresh_cookie_path,
            samesite=settings.REFRESH_COOKIE_SAMESITE,
        )

    def get_refresh_token(self, request):
        refresh_token = request.COOKIES.get(self.refresh_cookie_name)

        if not refresh_token:
            raise exceptions.ValidationError({"refresh": ["This field is required."]})

        return refresh_token


@extend_schema_view(
    post=extend_schema(
        operation_id="auth_token_create",
        summary="Authenticate user",
        description=(
            "Exchange user credentials for an access token and refresh token pair."
            " The refresh token is stored in an HttpOnly cookie."
            "\n\n**Access policy**: Public"
        ),
        request=TokenCreateSerializer,
        responses={
            200: OpenApiResponse(TokenObtainSerializer, description="Success"),
            400: OpenApiResponse(ErrorSerializer, description="Bad request"),
            401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
            500: OpenApiResponse(ErrorSerializer, description="Server error"),
        },
    )
)
class TokenObtainPairCookieView(RefreshCookieMixin, views.TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        refresh_token = response.data.pop("refresh", None)

        if refresh_token:
            self.set_refresh_cookie(response, refresh_token)

        return response


TokenObtainPairView = TokenObtainPairCookieView


@extend_schema_view(
    post=extend_schema(
        operation_id="auth_token_refresh",
        summary="Refresh access token",
        description=(
            "Exchange the refresh token from the HttpOnly cookie for a new access"
            " token and rotate the refresh token cookie."
            "\n\n**Access policy**: Public"
        ),
        request=None,
        parameters=[
            OpenApiParameter(
                name=settings.REFRESH_COOKIE_NAME,
                type=str,
                location=OpenApiParameter.COOKIE,
                description="HttpOnly refresh token cookie issued by the login endpoint.",
            )
        ],
        responses={
            200: OpenApiResponse(TokenObtainSerializer, description="Success"),
            400: OpenApiResponse(ErrorSerializer, description="Bad request"),
            401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
            500: OpenApiResponse(ErrorSerializer, description="Server error"),
        },
    )
)
class TokenRefreshCookieView(RefreshCookieMixin, views.TokenRefreshView):
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data={"refresh": self.get_refresh_token(request)}
        )

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as exc:
            raise InvalidToken(exc.args[0]) from exc

        response = Response(serializer.validated_data)
        next_refresh_token = response.data.pop("refresh", None)

        if next_refresh_token:
            self.set_refresh_cookie(response, next_refresh_token)

        return response


TokenRefreshView = TokenRefreshCookieView


@extend_schema_view(
    post=extend_schema(
        operation_id="auth_token_blacklist",
        summary="Blacklist refresh token",
        description=(
            "Blacklist the refresh token from the HttpOnly cookie and clear that"
            " cookie."
            "\n\n**Access policy**: Public"
        ),
        request=None,
        parameters=[
            OpenApiParameter(
                name=settings.REFRESH_COOKIE_NAME,
                type=str,
                location=OpenApiParameter.COOKIE,
                description="HttpOnly refresh token cookie issued by the login endpoint.",
            )
        ],
        responses={
            200: OpenApiResponse({}, description="Success"),
            400: OpenApiResponse(ErrorSerializer, description="Bad request"),
            401: OpenApiResponse(ErrorSerializer, description="Unauthorized"),
            500: OpenApiResponse(ErrorSerializer, description="Server error"),
        },
    )
)
class TokenBlacklistCookieView(RefreshCookieMixin, views.TokenBlacklistView):
    serializer_class = TokenBlacklistSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data={"refresh": self.get_refresh_token(request)}
        )

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as exc:
            raise InvalidToken(exc.args[0]) from exc

        response = Response({})
        self.delete_refresh_cookie(response)
        return response


TokenBlacklistView = TokenBlacklistCookieView


@extend_schema_view(
    get=extend_schema(
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
)
class TokenVerifyView(generics.RetrieveAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=self.request.user.id)
        return obj
