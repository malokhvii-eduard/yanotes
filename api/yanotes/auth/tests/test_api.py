import pytest
from django.urls import reverse

from yanotes.tests.assertions import (
    assert_access_token_payload,
    assert_error_response,
    assert_user_payload,
)

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize("view_name", ["token_verify"], ids=["get-token-verify"])
def test_given_anonymous_when_accessing_endpoint_then_unauthorized(
    api_client,
    view_name,
):
    response = api_client.get(reverse(view_name))

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
    assert_access_token_payload(response.json())
    assert "refresh_token" in response.cookies
    assert response.cookies["refresh_token"].value


def test_given_invalid_credentials_when_logging_in_then_unauthorized(
    api_client,
    user,
):
    response = api_client.post(
        reverse("token"),
        {
            "username": user.username,
            "password": "wrong-password",  # pragma: allowlist secret # nosec B105
        },
    )

    assert response.status_code == 401
    assert_error_response(response.json())


def test_given_empty_payload_when_logging_in_then_bad_request(
    api_client,
):
    response = api_client.post(
        reverse("token"),
        {},
    )

    assert response.status_code == 400
    payload = response.json()
    assert "username" in payload
    assert "password" in payload
    assert isinstance(payload["username"], list)
    assert isinstance(payload["password"], list)
    assert payload["username"]
    assert payload["password"]


def test_given_user_when_retrieving_me_then_returns_profile(
    user_client,
    user,
):
    response = user_client.get(reverse("token_verify"))

    assert response.status_code == 200
    assert_user_payload(response.json(), user=user)


def test_given_valid_refresh_cookie_when_refreshing_then_rotates_tokens(
    api_client,
    user,
    token_pair_for,
):
    tokens = token_pair_for(user)
    api_client.cookies["refresh_token"] = tokens["refresh"]

    response = api_client.post(
        reverse("token_refresh"),
        {},
    )

    assert response.status_code == 200
    payload = response.json()
    assert_access_token_payload(payload)
    assert "refresh_token" in response.cookies
    assert response.cookies["refresh_token"].value != tokens["refresh"]


def test_given_missing_refresh_cookie_when_refreshing_then_bad_request(
    api_client,
):
    response = api_client.post(
        reverse("token_refresh"),
        {},
    )

    assert response.status_code == 400
    payload = response.json()
    assert list(payload) == ["refresh"]
    assert isinstance(payload["refresh"], list)
    assert payload["refresh"]


def test_given_invalid_refresh_token_when_refreshing_then_unauthorized(
    api_client,
):
    api_client.cookies["refresh_token"] = "invalid-token"  # nosec

    response = api_client.post(
        reverse("token_refresh"),
        {},
    )

    assert response.status_code == 401
    assert_error_response(response.json())


def test_given_blacklisted_refresh_token_when_refreshing_then_unauthorized(
    api_client,
    user,
    token_pair_for,
):
    tokens = token_pair_for(user)
    api_client.cookies["refresh_token"] = tokens["refresh"]

    blacklist_response = api_client.post(
        reverse("token_blacklist"),
        {},
    )
    api_client.cookies["refresh_token"] = tokens["refresh"]
    refresh_response = api_client.post(
        reverse("token_refresh"),
        {},
    )

    assert blacklist_response.status_code == 200
    assert refresh_response.status_code == 401
    assert_error_response(refresh_response.json())


def test_given_missing_refresh_cookie_when_blacklisting_then_bad_request(
    api_client,
):
    response = api_client.post(
        reverse("token_blacklist"),
        {},
    )

    assert response.status_code == 400
    payload = response.json()
    assert list(payload) == ["refresh"]
    assert isinstance(payload["refresh"], list)
    assert payload["refresh"]


def test_given_refresh_cookie_when_blacklisting_then_clears_cookie(
    api_client,
    user,
    token_pair_for,
):
    tokens = token_pair_for(user)
    api_client.cookies["refresh_token"] = tokens["refresh"]

    response = api_client.post(
        reverse("token_blacklist"),
        {},
    )

    assert response.status_code == 200
    assert response.cookies["refresh_token"].value == ""
