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


def test_given_registration_payload_when_creating_user_then_hashes_password(
    api_client,
):
    response = api_client.post(
        reverse("user-list"),
        {
            "username": "new-user",
            "email": "new-user@example.com",
            "first_name": "New",
            "last_name": "User",
            "password": "Sup3rSecret!",
        },
    )

    assert response.status_code == 201
    user = get_user_model().objects.get(username="new-user")
    assert_user_payload(response.json(), user=user)
    assert user.check_password("Sup3rSecret!")


def test_given_admin_when_listing_users_then_returns_all(
    admin_client,
    admin_user,
    user_factory,
):
    listed_users = [admin_user, user_factory(), user_factory()]

    response = admin_client.get(reverse("user-list"))

    assert response.status_code == 200
    payload = response.json()
    assert_paginated_response(payload, count=3, results_length=3)
    assert {item["id"] for item in payload["results"]} == {user.id for user in listed_users}


def test_given_regular_user_when_listing_users_then_returns_403(auth_client):
    response = auth_client.get(reverse("user-list"))

    assert response.status_code == 403
    assert_error_response(response.json())


def test_given_regular_user_when_retrieving_self_then_returns_profile(
    auth_client,
    user,
):
    response = auth_client.get(reverse("user-detail", args=[user.id]))

    assert response.status_code == 200
    assert_user_payload(response.json(), user=user)


def test_given_other_user_when_regular_user_retrieves_then_404(
    auth_client,
    user_factory,
):
    other_user = user_factory()

    response = auth_client.get(reverse("user-detail", args=[other_user.id]))

    assert response.status_code == 404
    assert_error_response(response.json())


def test_given_other_user_when_admin_retrieves_then_returns_profile(
    admin_client,
    user_factory,
):
    other_user = user_factory()

    response = admin_client.get(reverse("user-detail", args=[other_user.id]))

    assert response.status_code == 200
    assert_user_payload(response.json(), user=other_user)


def test_given_regular_user_when_updating_self_then_persists_changes(
    auth_client,
    user,
):
    response = auth_client.patch(
        reverse("user-detail", args=[user.id]),
        {
            "first_name": "Updated",
            "last_name": "Name",
            "email": "updated@example.com",
        },
    )

    assert response.status_code == 200
    user.refresh_from_db()
    assert user.first_name == "Updated"
    assert user.last_name == "Name"
    assert user.email == "updated@example.com"
    assert_user_payload(response.json(), user=user)


def test_given_other_user_when_regular_user_updates_then_404(
    auth_client,
    user_factory,
):
    other_user = user_factory()

    response = auth_client.patch(
        reverse("user-detail", args=[other_user.id]),
        {"first_name": "Hijacked"},
    )

    assert response.status_code == 404
    assert_error_response(response.json())


def test_given_other_user_when_admin_updates_then_persists_changes(
    admin_client,
    user_factory,
):
    other_user = user_factory()

    response = admin_client.patch(
        reverse("user-detail", args=[other_user.id]),
        {"first_name": "Promoted"},
    )

    assert response.status_code == 200
    other_user.refresh_from_db()
    assert other_user.first_name == "Promoted"
    assert_user_payload(response.json(), user=other_user)


def test_given_regular_user_with_notes_when_deleting_self_then_removes_account_and_notes(
    auth_client,
    user,
    note_factory,
):
    note = note_factory(owner=user)

    response = auth_client.delete(reverse("user-detail", args=[user.id]))

    assert response.status_code == 204
    assert not get_user_model().objects.filter(pk=user.id).exists()
    assert not Note.objects.filter(pk=note.id).exists()


def test_given_other_user_when_admin_deletes_then_removes_user(
    admin_client,
    user_factory,
):
    other_user = user_factory()

    response = admin_client.delete(reverse("user-detail", args=[other_user.id]))

    assert response.status_code == 204
    assert not get_user_model().objects.filter(pk=other_user.id).exists()


def test_given_current_user_notes_when_listing_user_notes_then_returns_owned_page(
    auth_client,
    user,
    user_factory,
    note_factory,
):
    own_notes = [
        note_factory(owner=user, title="One"),
        note_factory(owner=user, title="Two"),
    ]
    note_factory(owner=user_factory(), title="Foreign")

    response = auth_client.get(reverse("user-list-notes", args=[user.id]))

    assert response.status_code == 200
    payload = response.json()
    assert_paginated_response(payload, count=2, results_length=2)
    assert {item["id"] for item in payload["results"]} == {note.id for note in own_notes}


def test_given_other_user_notes_when_regular_user_lists_then_404(
    auth_client,
    user_factory,
):
    other_user = user_factory()

    response = auth_client.get(reverse("user-list-notes", args=[other_user.id]))

    assert response.status_code == 404
    assert_error_response(response.json())


def test_given_other_user_notes_when_admin_lists_then_returns_page(
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


def test_given_missing_user_when_admin_lists_user_notes_then_404(
    admin_client,
):
    response = admin_client.get(reverse("user-list-notes", args=[999999]))

    assert response.status_code == 404
    assert_error_response(response.json())
