from rest_framework import serializers


class TokenObtainSerializer(serializers.Serializer):
    access = serializers.CharField()


class TokenCreateSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})
