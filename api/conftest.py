from itertools import count

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from yanotes.notes.models import Note


DEFAULT_PASSWORD = "Passw0rd!123"


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user_password():
    return DEFAULT_PASSWORD


@pytest.fixture
def user_factory(db, user_password):
    sequence = count()
    user_model = get_user_model()

    def factory(**overrides):
        index = next(sequence)
        password = overrides.pop("password", user_password)
        is_staff = overrides.pop("is_staff", False)
        is_superuser = overrides.pop("is_superuser", False)

        user = user_model.objects.create_user(
            username=overrides.pop("username", f"user-{index}"),
            email=overrides.pop("email", f"user-{index}@example.com"),
            first_name=overrides.pop("first_name", f"User{index}"),
            last_name=overrides.pop("last_name", "Tester"),
            password=password,
            **overrides,
        )

        if is_staff or is_superuser:
            user.is_staff = is_staff or is_superuser
            user.is_superuser = is_superuser
            user.save(update_fields=["is_staff", "is_superuser"])

        return user

    return factory


@pytest.fixture
def user(user_factory):
    return user_factory()


@pytest.fixture
def admin_user(user_factory):
    return user_factory(
        username="admin",
        email="admin@example.com",
        first_name="Admin",
        last_name="User",
        is_staff=True,
        is_superuser=False,
    )


@pytest.fixture
def token_pair_for():
    def factory(user):
        refresh = RefreshToken.for_user(user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }

    return factory


@pytest.fixture
def client_for(token_pair_for):
    def factory(user):
        client = APIClient()
        tokens = token_pair_for(user)
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        return client

    return factory


@pytest.fixture
def auth_client(user, client_for):
    return client_for(user)


@pytest.fixture
def admin_client(admin_user, client_for):
    return client_for(admin_user)


@pytest.fixture
def note_factory(db, user_factory):
    sequence = count()

    def factory(**overrides):
        index = next(sequence)
        owner = overrides.pop("owner", user_factory())
        return Note.objects.create(
            title=overrides.pop("title", f"Note {index}"),
            content=overrides.pop("content", f"Note content {index}"),
            owner=owner,
            **overrides,
        )

    return factory
