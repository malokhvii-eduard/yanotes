import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse

from yanotes.notes.models import Note
from yanotes.tests.assertions import (
    assert_error_response,
    assert_paginated_response,
    assert_user_payload,
)

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize(
    ("method_name", "route_name", "payload"),
    [
        ("get", "user-list", None),
        ("get", "user-detail", None),
        ("patch", "user-detail", {"first_name": "Anonymous"}),
        ("delete", "user-detail", None),
        ("get", "user-list-notes", None),
    ],
    ids=[
        "get-user-list",
        "get-user-detail",
        "patch-user-detail",
        "delete-user-detail",
        "get-user-list-notes",
    ],
)
def test_given_anonymous_when_accessing_endpoint_then_unauthorized(
    api_client,
    user,
    method_name,
    route_name,
    payload,
):
    url = reverse(route_name, args=[user.id]) if route_name != "user-list" else reverse(route_name)
    response = (
        getattr(api_client, method_name)(url, payload)
        if payload is not None
        else getattr(api_client, method_name)(url)
    )

    assert response.status_code == 401
    assert_error_response(response.json())


def test_given_payload_when_creating_then_persists_user(
    api_client,
    faker,
):
    password = faker.password(
        length=16,
        special_chars=True,
        digits=True,
        upper_case=True,
        lower_case=True,
    )
    payload = {
        "username": faker.unique.user_name(),
        "email": faker.unique.email(),
        "first_name": faker.first_name(),
        "last_name": faker.last_name(),
        "password": password,  # pragma: allowlist secret
    }

    response = api_client.post(
        reverse("user-list"),
        payload,
    )

    assert response.status_code == 201
    user = get_user_model().objects.get(username=payload["username"])
    assert_user_payload(response.json(), user=user)
    assert user.check_password(password)


def test_given_admin_when_listing_then_returns_all_users(
    admin_client,
    admin_user,
    user_factory,
):
    listed_users = [admin_user, user_factory(), user_factory()]

    response = admin_client.get(reverse("user-list"))

    assert response.status_code == 200
    payload = response.json()
    assert_paginated_response(payload, count=3, results_length=3)
    assert {item["id"] for item in payload["results"]} == {
        user.id for user in listed_users
    }


def test_given_user_when_listing_then_forbidden(user_client):
    response = user_client.get(reverse("user-list"))

    assert response.status_code == 403
    assert_error_response(response.json())


def test_given_user_when_retrieving_self_then_returns_profile(
    user_client,
    user,
):
    response = user_client.get(reverse("user-detail", args=[user.id]))

    assert response.status_code == 200
    assert_user_payload(response.json(), user=user)


def test_given_user_when_retrieving_other_user_then_not_found(
    user_client,
    user_factory,
):
    other_user = user_factory()

    response = user_client.get(reverse("user-detail", args=[other_user.id]))

    assert response.status_code == 404
    assert_error_response(response.json())


def test_given_admin_when_retrieving_other_user_then_returns_profile(
    admin_client,
    user_factory,
):
    other_user = user_factory()

    response = admin_client.get(reverse("user-detail", args=[other_user.id]))

    assert response.status_code == 200
    assert_user_payload(response.json(), user=other_user)


def test_given_user_when_updating_self_then_persists_changes(
    user_client,
    user,
    faker,
):
    updated_first_name = faker.first_name()
    updated_last_name = faker.last_name()
    updated_email = faker.unique.email()

    response = user_client.patch(
        reverse("user-detail", args=[user.id]),
        {
            "first_name": updated_first_name,
            "last_name": updated_last_name,
            "email": updated_email,
        },
    )

    assert response.status_code == 200
    user.refresh_from_db()
    assert user.first_name == updated_first_name
    assert user.last_name == updated_last_name
    assert user.email == updated_email
    assert_user_payload(response.json(), user=user)


def test_given_user_when_updating_other_user_then_not_found(
    user_client,
    user_factory,
    faker,
):
    other_user = user_factory()

    response = user_client.patch(
        reverse("user-detail", args=[other_user.id]),
        {"first_name": faker.first_name()},
    )

    assert response.status_code == 404
    assert_error_response(response.json())


def test_given_admin_when_updating_other_user_then_persists_changes(
    admin_client,
    user_factory,
    faker,
):
    other_user = user_factory()
    updated_first_name = faker.first_name()

    response = admin_client.patch(
        reverse("user-detail", args=[other_user.id]),
        {"first_name": updated_first_name},
    )

    assert response.status_code == 200
    other_user.refresh_from_db()
    assert other_user.first_name == updated_first_name
    assert_user_payload(response.json(), user=other_user)


def test_given_user_with_notes_when_deleting_self_then_removes_user_and_notes(
    user_client,
    user,
    note_factory,
):
    note = note_factory(owner=user)

    response = user_client.delete(reverse("user-detail", args=[user.id]))

    assert response.status_code == 204
    assert not get_user_model().objects.filter(pk=user.id).exists()
    assert not Note.objects.filter(pk=note.id).exists()


def test_given_admin_when_deleting_other_user_then_removes_user(
    admin_client,
    user_factory,
):
    other_user = user_factory()

    response = admin_client.delete(reverse("user-detail", args=[other_user.id]))

    assert response.status_code == 204
    assert not get_user_model().objects.filter(pk=other_user.id).exists()


def test_given_user_when_listing_self_notes_then_returns_notes(
    user_client,
    user,
    user_factory,
    note_factory,
):
    own_notes = [
        note_factory(owner=user, title="One"),
        note_factory(owner=user, title="Two"),
    ]
    note_factory(owner=user_factory(), title="Foreign")

    response = user_client.get(reverse("user-list-notes", args=[user.id]))

    assert response.status_code == 200
    payload = response.json()
    assert_paginated_response(payload, count=2, results_length=2)
    assert {item["id"] for item in payload["results"]} == {
        note.id for note in own_notes
    }


def test_given_user_when_listing_other_user_notes_then_not_found(
    user_client,
    user_factory,
):
    other_user = user_factory()

    response = user_client.get(reverse("user-list-notes", args=[other_user.id]))

    assert response.status_code == 404
    assert_error_response(response.json())


def test_given_admin_when_listing_other_user_notes_then_returns_notes(
    admin_client,
    user_factory,
    note_factory,
):
    other_user = user_factory()
    other_user_notes = [
        note_factory(owner=other_user),
        note_factory(owner=other_user),
    ]

    response = admin_client.get(reverse("user-list-notes", args=[other_user.id]))

    assert response.status_code == 200
    payload = response.json()
    assert_paginated_response(payload, count=2, results_length=2)
    assert {item["id"] for item in payload["results"]} == {
        note.id for note in other_user_notes
    }


def test_given_admin_when_listing_missing_user_notes_then_not_found(
    admin_client,
):
    response = admin_client.get(reverse("user-list-notes", args=[999999]))

    assert response.status_code == 404
    assert_error_response(response.json())
