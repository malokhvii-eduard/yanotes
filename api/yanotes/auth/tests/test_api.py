import pytest
from django.urls import reverse

from yanotes.tests.assertions import (
    assert_error_response,
    assert_token_pair_payload,
    assert_user_payload,
)

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize("route_name", ["token_verify", "note-list", "user-list"])
def test_given_anonymous_when_accessing_protected_route_then_returns_401(
    api_client,
    route_name,
):
    response = api_client.get(reverse(route_name))

    assert response.status_code == 401
    assert_error_response(response.json())


def test_given_valid_credentials_when_logging_in_then_returns_tokens(
    api_client,
    user,
    user_password,
):
    response = api_client.post(
        reverse("token"),
        {
            "username": user.username,
            "password": user_password,
        },
    )

    assert response.status_code == 200
    assert_token_pair_payload(response.json())


def test_given_invalid_credentials_when_logging_in_then_returns_401(
    api_client,
    user,
):
    response = api_client.post(
        reverse("token"),
        {
            "username": user.username,
            "password": "wrong-password",  # pragma: allowlist secret
        },
    )

    assert response.status_code == 401
    assert_error_response(response.json())


def test_given_valid_refresh_token_when_refreshing_then_rotates_tokens(
    api_client,
    user,
    token_pair_for,
):
    tokens = token_pair_for(user)

    response = api_client.post(
        reverse("token_refresh"),
        {"refresh": tokens["refresh"]},
    )

    assert response.status_code == 200
    payload = response.json()
    assert_token_pair_payload(payload)
    assert payload["refresh"] != tokens["refresh"]


def test_given_blacklisted_refresh_token_when_refreshing_then_returns_401(
    api_client,
    user,
    token_pair_for,
):
    tokens = token_pair_for(user)

    blacklist_response = api_client.post(
        reverse("token_blacklist"),
        {"refresh": tokens["refresh"]},
    )
    refresh_response = api_client.post(
        reverse("token_refresh"),
        {"refresh": tokens["refresh"]},
    )

    assert blacklist_response.status_code == 200
    assert refresh_response.status_code == 401
    assert_error_response(refresh_response.json())


def test_given_user_when_retrieving_me_then_returns_profile(
    auth_client,
    user,
):
    response = auth_client.get(reverse("token_verify"))

    assert response.status_code == 200
    assert_user_payload(response.json(), user=user)
