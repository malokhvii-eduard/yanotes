import pytest
from django.urls import reverse

from yanotes.notes.models import Note
from yanotes.tests.assertions import (
    assert_error_response,
    assert_note_payload,
    assert_paginated_response,
)


pytestmark = pytest.mark.django_db


def test_given_regular_user_when_listing_notes_then_returns_owned_notes(
    auth_client,
    user,
    user_factory,
    note_factory,
):
    own_notes = [
        note_factory(owner=user, title="First"),
        note_factory(owner=user, title="Second"),
    ]
    other_user = user_factory()
    note_factory(owner=other_user, title="Foreign")

    response = auth_client.get(reverse("note-list"))

    assert response.status_code == 200
    payload = response.json()
    assert_paginated_response(payload, count=2, results_length=2)
    assert {item["id"] for item in payload["results"]} == {note.id for note in own_notes}


def test_given_staff_user_when_listing_notes_then_returns_all_notes(
    admin_client,
    admin_user,
    note_factory,
    user_factory,
):
    assert admin_user.is_staff
    assert not admin_user.is_superuser

    first_owner = user_factory()
    second_owner = user_factory()
    created_notes = [
        note_factory(owner=first_owner),
        note_factory(owner=second_owner),
        note_factory(owner=second_owner),
    ]

    response = admin_client.get(reverse("note-list"))

    assert response.status_code == 200
    payload = response.json()
    assert_paginated_response(payload, count=3, results_length=3)
    assert {item["id"] for item in payload["results"]} == {note.id for note in created_notes}


def test_given_multiple_notes_when_listing_with_pagination_then_returns_ordered_slice(
    auth_client,
    user,
    note_factory,
):
    note_factory(owner=user, title="Charlie")
    note_factory(owner=user, title="Alpha")
    note_factory(owner=user, title="Bravo")

    response = auth_client.get(
        reverse("note-list"),
        {"limit": 2, "offset": 1, "ordering": "title"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert_paginated_response(payload, count=3, results_length=2)
    assert [item["title"] for item in payload["results"]] == ["Bravo", "Charlie"]
    assert payload["previous"] is not None


def test_given_self_owned_payload_when_creating_note_then_succeeds(
    auth_client,
    user,
):
    payload = {
        "title": "Shopping list",
        "content": "Milk, bread, apples",
        "owner": user.id,
    }

    response = auth_client.post(reverse("note-list"), payload)

    assert response.status_code == 201
    created_note = Note.objects.get(title="Shopping list")
    assert_note_payload(response.json(), note=created_note)


def test_given_foreign_owner_payload_when_creating_note_then_403(
    auth_client,
    user_factory,
):
    other_user = user_factory()

    response = auth_client.post(
        reverse("note-list"),
        {
            "title": "Forbidden",
            "content": "This should be rejected",
            "owner": other_user.id,
        },
    )

    assert response.status_code == 403
    assert_error_response(response.json())


def test_given_staff_user_when_creating_note_for_another_user_then_succeeds(
    admin_client,
    admin_user,
    user,
):
    assert admin_user.is_staff
    assert not admin_user.is_superuser

    response = admin_client.post(
        reverse("note-list"),
        {
            "title": "Delegated note",
            "content": "Created by an admin",
            "owner": user.id,
        },
    )

    assert response.status_code == 201
    created_note = Note.objects.get(title="Delegated note")
    assert created_note.owner_id == user.id
    assert_note_payload(response.json(), note=created_note)


def test_given_foreign_note_when_staff_user_updates_content_then_persists_changes(
    admin_client,
    admin_user,
    user_factory,
    note_factory,
):
    assert admin_user.is_staff
    assert not admin_user.is_superuser

    foreign_note = note_factory(owner=user_factory(), content="Old content")

    response = admin_client.patch(
        reverse("note-detail", args=[foreign_note.id]),
        {"content": "Updated by admin"},
    )

    assert response.status_code == 200
    foreign_note.refresh_from_db()
    assert foreign_note.content == "Updated by admin"
    assert_note_payload(response.json(), note=foreign_note)


def test_given_owned_note_when_retrieving_then_returns_details(
    auth_client,
    user,
    note_factory,
):
    note = note_factory(owner=user, title="Private note")

    response = auth_client.get(reverse("note-detail", args=[note.id]))

    assert response.status_code == 200
    assert_note_payload(response.json(), note=note)


def test_given_foreign_note_when_retrieving_then_404(
    auth_client,
    user_factory,
    note_factory,
):
    foreign_note = note_factory(owner=user_factory())

    response = auth_client.get(reverse("note-detail", args=[foreign_note.id]))

    assert response.status_code == 404
    assert_error_response(response.json())


def test_given_owned_note_when_updating_then_persists_changes(
    auth_client,
    user,
    note_factory,
):
    note = note_factory(owner=user, title="Draft", content="Old content")

    response = auth_client.put(
        reverse("note-detail", args=[note.id]),
        {
            "title": "Draft v2",
            "content": "Updated content",
            "owner": user.id,
        },
    )

    assert response.status_code == 200
    note.refresh_from_db()
    assert note.title == "Draft v2"
    assert note.content == "Updated content"
    assert note.owner_id == user.id
    assert_note_payload(response.json(), note=note)


def test_given_owned_note_when_regular_user_changes_owner_then_persists_change(
    auth_client,
    user,
    user_factory,
    note_factory,
):
    note = note_factory(owner=user)
    other_user = user_factory()

    response = auth_client.patch(
        reverse("note-detail", args=[note.id]),
        {"owner": other_user.id},
    )

    assert response.status_code == 200
    note.refresh_from_db()
    assert note.owner_id == other_user.id
    assert_note_payload(response.json(), note=note)

    follow_up_response = auth_client.get(reverse("note-detail", args=[note.id]))

    assert follow_up_response.status_code == 404
    assert_error_response(follow_up_response.json())


def test_given_note_when_staff_user_changes_owner_then_persists_change(
    admin_client,
    admin_user,
    user_factory,
    note_factory,
):
    assert admin_user.is_staff
    assert not admin_user.is_superuser

    original_owner = user_factory()
    new_owner = user_factory()
    note = note_factory(owner=original_owner)

    response = admin_client.patch(
        reverse("note-detail", args=[note.id]),
        {"owner": new_owner.id},
    )

    assert response.status_code == 200
    note.refresh_from_db()
    assert note.owner_id == new_owner.id
    assert_note_payload(response.json(), note=note)


def test_given_foreign_note_when_updating_then_404(
    auth_client,
    user_factory,
    note_factory,
):
    foreign_note = note_factory(owner=user_factory())

    response = auth_client.patch(
        reverse("note-detail", args=[foreign_note.id]),
        {"content": "Attempted overwrite"},
    )

    assert response.status_code == 404
    assert_error_response(response.json())


def test_given_owned_note_when_deleting_then_removes_note(
    auth_client,
    user,
    note_factory,
):
    note = note_factory(owner=user)

    response = auth_client.delete(reverse("note-detail", args=[note.id]))

    assert response.status_code == 204
    assert not Note.objects.filter(pk=note.id).exists()


def test_given_foreign_note_when_deleting_then_404(
    auth_client,
    user_factory,
    note_factory,
):
    foreign_note = note_factory(owner=user_factory())

    response = auth_client.delete(reverse("note-detail", args=[foreign_note.id]))

    assert response.status_code == 404
    assert_error_response(response.json())
