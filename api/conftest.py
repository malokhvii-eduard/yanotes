import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from yanotes.notes.models import Note


def pytest_addoption(parser):
    parser.addini("faker_seed", "Seed for faker data used in tests.", default="42")


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user_password(faker):
    return faker.password(
        length=16,
        special_chars=False,
        digits=True,
        upper_case=True,
        lower_case=True,
    )


@pytest.fixture(scope="session")
def faker_seed(pytestconfig):
    return int(pytestconfig.getini("faker_seed"))


@pytest.fixture
def user_factory(db, user_password, faker):
    user_model = get_user_model()

    def factory(**overrides):
        password = overrides.pop("password", user_password)
        is_staff = overrides.pop("is_staff", False)
        is_superuser = overrides.pop("is_superuser", False)

        user = user_model.objects.create_user(
            username=overrides.pop("username", faker.unique.user_name()),
            email=overrides.pop("email", faker.unique.email()),
            first_name=overrides.pop("first_name", faker.first_name()),
            last_name=overrides.pop("last_name", faker.last_name()),
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
    return user_factory(is_staff=True, is_superuser=False)


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
def user_client(user, client_for):
    return client_for(user)


@pytest.fixture
def admin_client(admin_user, client_for):
    return client_for(admin_user)


@pytest.fixture
def note_factory(db, user_factory, faker):
    def factory(**overrides):
        owner = overrides.pop("owner", user_factory())
        return Note.objects.create(
            title=overrides.pop("title", faker.sentence(nb_words=4).rstrip(".")),
            content=overrides.pop("content", faker.text(max_nb_chars=120)),
            owner=owner,
            **overrides,
        )

    return factory
