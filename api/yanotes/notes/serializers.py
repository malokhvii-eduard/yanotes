from typing import ClassVar

from drf_spectacular.utils import OpenApiExample, extend_schema_serializer
from rest_framework import serializers

from .models import Note


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Note",
            value={
                "title": "Lorem ipsum dolor sit amet",
                "content": (
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do"
                    " eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut"
                    " enim ad minim veniam, quis nostrud exercitation ullamco laboris"
                    " nisi ut aliquip ex ea commodo consequat."
                ),
                "owner": 1,
            },
            request_only=True,
        ),
        OpenApiExample(
            "Note",
            value={
                "title": "Lorem ipsum dolor sit amet",
                "content": (
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do"
                    " eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut"
                    " enim ad minim veniam, quis nostrud exercitation ullamco laboris"
                    " nisi ut aliquip ex ea commodo consequat."
                ),
                "created_at": "2022-08-30T19:52:33.493Z",
                "updated_at": "2022-08-30T19:52:33.493Z",
                "owner": 1,
            },
            response_only=True,
        ),
    ]
)
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = "__all__"
        extra_kwargs: ClassVar[dict[str, dict[str, bool]]] = {
            "created_at": {"read_only": True},
            "updated_at": {"read_only": True},
        }
