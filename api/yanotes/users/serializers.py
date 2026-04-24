from typing import ClassVar

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from drf_spectacular.utils import OpenApiExample, extend_schema_serializer
from rest_framework import serializers


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "User",
            value={
                "username": "jon-snow",
                "email": "jon.snow@example.com",
                "first_name": "Jon",
                "last_name": "Snow",
                "password": "example-password",  # pragma: allowlist secret # nosec B105
            },
            request_only=True,
        ),
        OpenApiExample(
            "User",
            value={
                "id": 1,
                "username": "jon-snow",
                "email": "jon.snow@example.com",
                "first_name": "Jon",
                "last_name": "Snow",
                "is_staff": False,
            },
            response_only=True,
        ),
    ]
)
class UserSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        validated_data["password"] = make_password(validated_data["password"])
        return super().create(validated_data)

    class Meta:
        model = get_user_model()
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_staff",
            "password",
        )
        extra_kwargs: ClassVar[dict[str, dict[str, bool]]] = {
            "id": {"read_only": True},
            "is_staff": {"read_only": True},
            "password": {"write_only": True},
        }
