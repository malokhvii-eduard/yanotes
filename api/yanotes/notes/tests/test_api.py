from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone

from yanotes.notes.models import Note
from yanotes.tests.assertions import (
    assert_error_response,
    assert_note_payload,
    assert_paginated_response,
)

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize(
    ("view_method", "view_name", "payload"),
    [
        ("get", "note-list", None),
        ("get", "note-detail", None),
        ("patch", "note-detail", {"title": "Updated"}),
        ("delete", "note-detail", None),
        (
            "post",
            "note-list",
            {"title": "Anonymous note", "content": "Forbidden", "owner": 1},
        ),
    ],
    ids=[
        "get-note-list",
        "get-note-detail",
        "patch-note-detail",
        "delete-note-detail",
        "post-note-list",
    ],
)
def test_given_anonymous_when_accessing_endpoint_then_unauthorized(
    api_client,
    note_factory,
    user,
    view_method,
    view_name,
    payload,
):
    note = note_factory(owner=user)
    url = (
        reverse(view_name, args=[note.id])
        if view_name == "note-detail"
        else reverse(view_name)
    )

    response = (
        getattr(api_client, view_method)(url, payload)
        if payload is not None
        else getattr(api_client, view_method)(url)
    )

    assert response.status_code == 401
    assert_error_response(response.json())


def test_given_user_when_listing_then_returns_owned_notes(
    user_client,
    user,
    user_factory,
    note_factory,
    faker,
):
    own_notes = [
        note_factory(owner=user, title=faker.word()),
        note_factory(owner=user, title=faker.word()),
    ]
    note_factory(owner=user_factory(), title=faker.word())

    response = user_client.get(reverse("note-list"))

    assert response.status_code == 200
    payload = response.json()
    assert_paginated_response(payload, count=2, results_length=2)
    assert {item["id"] for item in payload["results"]} == {
        note.id for note in own_notes
    }


def test_given_user_without_notes_when_listing_then_returns_empty(
    user_client,
):
    response = user_client.get(reverse("note-list"))

    assert response.status_code == 200
    payload = response.json()
    assert_paginated_response(payload, count=0, results_length=0)
    assert payload["results"] == []


def test_given_admin_when_listing_then_returns_all_notes(
    admin_client,
    admin_user,
    note_factory,
    user_factory,
):
    assert admin_user.is_staff

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
    assert {item["id"] for item in payload["results"]} == {
        note.id for note in created_notes
    }


def test_given_multiple_notes_when_listing_asc_by_title_then_returns_ordered_notes(
    user_client,
    user,
    note_factory,
):
    note_factory(owner=user, title="Charlie")
    note_factory(owner=user, title="Alpha")
    note_factory(owner=user, title="Bravo")

    response = user_client.get(
        reverse("note-list"),
        {"limit": 2, "offset": 1, "ordering": "title"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert_paginated_response(payload, count=3, results_length=2)
    assert [item["title"] for item in payload["results"]] == ["Bravo", "Charlie"]
    assert payload["previous"] is not None


def test_given_multiple_notes_when_listing_desc_by_title_then_returns_ordered_notes(
    user_client,
    user,
    note_factory,
):
    note_factory(owner=user, title="Charlie")
    note_factory(owner=user, title="Alpha")
    note_factory(owner=user, title="Bravo")

    response = user_client.get(
        reverse("note-list"),
        {"limit": 2, "offset": 1, "ordering": "-title"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert_paginated_response(payload, count=3, results_length=2)
    assert [item["title"] for item in payload["results"]] == ["Bravo", "Alpha"]
    assert payload["previous"] is not None


def test_given_notes_with_same_title_when_listing_asc_by_title_then_orders_by_id(
    user_client,
    user,
    note_factory,
):
    notes = {
        "Alpha": note_factory(owner=user, title="Alpha"),
        "Bravo1": note_factory(owner=user, title="Bravo"),
        "Bravo2": note_factory(owner=user, title="Bravo"),
    }

    response = user_client.get(
        reverse("note-list"),
        {"ordering": "title"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert [item["id"] for item in payload["results"]] == [
        notes["Alpha"].id,
        notes["Bravo1"].id,
        notes["Bravo2"].id,
    ]


def test_given_notes_with_same_title_when_listing_desc_by_title_then_orders_by_id(
    user_client,
    user,
    note_factory,
):
    notes = {
        "Alpha": note_factory(owner=user, title="Alpha"),
        "Bravo1": note_factory(owner=user, title="Bravo"),
        "Bravo2": note_factory(owner=user, title="Bravo"),
    }

    response = user_client.get(
        reverse("note-list"),
        {"ordering": "-title"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert [item["id"] for item in payload["results"]] == [
        notes["Bravo2"].id,
        notes["Bravo1"].id,
        notes["Alpha"].id,
    ]


def test_given_multiple_notes_when_listing_asc_by_updated_at_then_returns_ordered_notes(
    user_client,
    user,
    note_factory,
):
    notes = {
        "Charlie": note_factory(owner=user, title="Charlie"),
        "Alpha": note_factory(owner=user, title="Alpha"),
        "Bravo": note_factory(owner=user, title="Bravo"),
    }
    now = timezone.now()
    notes["Charlie"].updated_at = now + timedelta(minutes=1)
    notes["Alpha"].updated_at = now
    notes["Bravo"].updated_at = now + timedelta(minutes=2)

    Note.objects.bulk_update(
        [
            notes["Charlie"],
            notes["Alpha"],
            notes["Bravo"],
        ],
        ["updated_at"],
    )

    response = user_client.get(
        reverse("note-list"),
        {"limit": 2, "offset": 1, "ordering": "updated_at"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert_paginated_response(payload, count=3, results_length=2)
    assert [item["title"] for item in payload["results"]] == ["Charlie", "Bravo"]
    assert payload["previous"] is not None


def test_given_multiple_notes_when_listing_desc_by_updated_at_then_returns_ordered_notes(
    user_client,
    user,
    note_factory,
):
    notes = {
        "Charlie": note_factory(owner=user, title="Charlie"),
        "Alpha": note_factory(owner=user, title="Alpha"),
        "Bravo": note_factory(owner=user, title="Bravo"),
    }
    now = timezone.now()
    notes["Charlie"].updated_at = now + timedelta(minutes=1)
    notes["Alpha"].updated_at = now
    notes["Bravo"].updated_at = now + timedelta(minutes=2)

    Note.objects.bulk_update(
        [
            notes["Charlie"],
            notes["Alpha"],
            notes["Bravo"],
        ],
        ["updated_at"],
    )

    response = user_client.get(
        reverse("note-list"),
        {"limit": 2, "offset": 1, "ordering": "-updated_at"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert_paginated_response(payload, count=3, results_length=2)
    assert [item["title"] for item in payload["results"]] == ["Charlie", "Alpha"]
    assert payload["previous"] is not None


def test_given_notes_with_same_updated_at_when_listing_asc_by_updated_at_then_orders_by_id(
    user_client,
    user,
    note_factory,
):
    notes = {
        "Alpha": note_factory(owner=user, title="Alpha"),
        "Bravo": note_factory(owner=user, title="Bravo"),
        "Charlie": note_factory(owner=user, title="Charlie"),
    }
    now = timezone.now()
    notes["Alpha"].updated_at = now
    notes["Bravo"].updated_at = now + timedelta(minutes=1)
    notes["Charlie"].updated_at = now + timedelta(minutes=1)

    Note.objects.bulk_update(
        [
            notes["Alpha"],
            notes["Bravo"],
            notes["Charlie"],
        ],
        ["updated_at"],
    )

    response = user_client.get(
        reverse("note-list"),
        {"ordering": "updated_at"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert [item["id"] for item in payload["results"]] == [
        notes["Alpha"].id,
        notes["Bravo"].id,
        notes["Charlie"].id,
    ]


def test_given_notes_with_same_updated_at_when_listing_desc_by_updated_at_then_orders_by_id(
    user_client,
    user,
    note_factory,
):
    notes = {
        "Alpha": note_factory(owner=user, title="Alpha"),
        "Bravo": note_factory(owner=user, title="Bravo"),
        "Charlie": note_factory(owner=user, title="Charlie"),
    }
    now = timezone.now()
    notes["Alpha"].updated_at = now
    notes["Bravo"].updated_at = now + timedelta(minutes=1)
    notes["Charlie"].updated_at = now + timedelta(minutes=1)

    Note.objects.bulk_update(
        [
            notes["Alpha"],
            notes["Bravo"],
            notes["Charlie"],
        ],
        ["updated_at"],
    )

    response = user_client.get(
        reverse("note-list"),
        {"ordering": "-updated_at"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert [item["id"] for item in payload["results"]] == [
        notes["Charlie"].id,
        notes["Bravo"].id,
        notes["Alpha"].id,
    ]


def test_given_user_when_retrieving_own_note_then_returns_note(
    user_client,
    user,
    note_factory,
    faker,
):
    note = note_factory(owner=user, title=faker.word())

    response = user_client.get(reverse("note-detail", args=[note.id]))

    assert response.status_code == 200
    assert_note_payload(response.json(), note=note)


def test_given_user_when_retrieving_foreign_note_then_not_found(
    user_client,
    user_factory,
    note_factory,
):
    foreign_note = note_factory(owner=user_factory())

    response = user_client.get(reverse("note-detail", args=[foreign_note.id]))

    assert response.status_code == 404
    assert_error_response(response.json())


def test_given_payload_when_creating_then_persists_note(
    user_client,
    user,
    faker,
):
    title = faker.word()
    content = faker.paragraph()
    payload = {
        "title": title,
        "content": content,
        "owner": user.id,
    }

    response = user_client.post(reverse("note-list"), payload)

    assert response.status_code == 201
    created_note = Note.objects.get(title=title)
    assert_note_payload(response.json(), note=created_note)


def test_given_payload_without_title_when_creating_then_bad_request(
    user_client,
    user,
    faker,
):
    response = user_client.post(
        reverse("note-list"),
        {
            "content": faker.paragraph(),
            "owner": user.id,
        },
    )

    assert response.status_code == 400
    payload = response.json()
    assert list(payload) == ["title"]
    assert isinstance(payload["title"], list)
    assert payload["title"]


def test_given_other_owner_when_creating_then_forbidden(
    user_client,
    user_factory,
    faker,
):
    other_user = user_factory()

    response = user_client.post(
        reverse("note-list"),
        {
            "title": faker.word(),
            "content": faker.paragraph(),
            "owner": other_user.id,
        },
    )

    assert response.status_code == 403
    assert_error_response(response.json())


def test_given_other_owner_when_admin_creating_then_persists_note(
    admin_client,
    admin_user,
    user,
    faker,
):
    assert admin_user.is_staff

    title = faker.sentence(nb_words=3).rstrip(".")
    response = admin_client.post(
        reverse("note-list"),
        {
            "title": title,
            "content": faker.paragraph(),
            "owner": user.id,
        },
    )

    assert response.status_code == 201
    created_note = Note.objects.get(title=title)
    assert created_note.owner_id == user.id
    assert_note_payload(response.json(), note=created_note)


def test_given_user_when_updating_own_note_then_persists_changes(
    user_client,
    user,
    note_factory,
    faker,
):
    note = note_factory(owner=user)
    updated_title = faker.sentence(nb_words=3).rstrip(".")
    updated_content = faker.paragraph()

    response = user_client.put(
        reverse("note-detail", args=[note.id]),
        {
            "title": updated_title,
            "content": updated_content,
            "owner": user.id,
        },
    )

    assert response.status_code == 200
    note.refresh_from_db()
    assert note.title == updated_title
    assert note.content == updated_content
    assert note.owner_id == user.id
    assert_note_payload(response.json(), note=note)


def test_given_blank_title_when_updating_then_bad_request(
    user_client,
    user,
    note_factory,
):
    note = note_factory(owner=user)

    response = user_client.patch(
        reverse("note-detail", args=[note.id]),
        {"title": ""},
    )

    assert response.status_code == 400
    payload = response.json()
    assert list(payload) == ["title"]
    assert isinstance(payload["title"], list)
    assert payload["title"]


def test_given_user_when_changing_own_note_owner_then_forbidden(
    user_client,
    user,
    user_factory,
    note_factory,
):
    note = note_factory(owner=user)
    other_user = user_factory()

    response = user_client.patch(
        reverse("note-detail", args=[note.id]),
        {"owner": other_user.id},
    )

    assert response.status_code == 403
    assert_error_response(response.json())
    note.refresh_from_db()
    assert note.owner_id == user.id


def test_given_user_when_updating_foreign_note_then_not_found(
    user_client,
    user_factory,
    note_factory,
    faker,
):
    foreign_note = note_factory(owner=user_factory())

    response = user_client.patch(
        reverse("note-detail", args=[foreign_note.id]),
        {"content": faker.paragraph()},
    )

    assert response.status_code == 404
    assert_error_response(response.json())


def test_given_admin_when_updating_foreign_note_then_persists_changes(
    admin_client,
    admin_user,
    user_factory,
    note_factory,
    faker,
):
    assert admin_user.is_staff

    foreign_note = note_factory(owner=user_factory())
    updated_content = faker.paragraph()

    response = admin_client.patch(
        reverse("note-detail", args=[foreign_note.id]),
        {"content": updated_content},
    )

    assert response.status_code == 200
    foreign_note.refresh_from_db()
    assert foreign_note.content == updated_content
    assert_note_payload(response.json(), note=foreign_note)


def test_given_admin_when_changing_note_owner_then_persists_changes(
    admin_client,
    admin_user,
    user_factory,
    note_factory,
):
    assert admin_user.is_staff

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


def test_given_user_when_deleting_own_note_then_removes_note(
    user_client,
    user,
    note_factory,
):
    note = note_factory(owner=user)

    response = user_client.delete(reverse("note-detail", args=[note.id]))

    assert response.status_code == 204
    assert not Note.objects.filter(pk=note.id).exists()


def test_given_user_when_deleting_foreign_note_then_not_found(
    user_client,
    user_factory,
    note_factory,
):
    foreign_note = note_factory(owner=user_factory())

    response = user_client.delete(reverse("note-detail", args=[foreign_note.id]))

    assert response.status_code == 404
    assert_error_response(response.json())


def test_given_admin_when_deleting_foreign_note_then_removes_note(
    admin_client,
    admin_user,
    user_factory,
    note_factory,
):
    assert admin_user.is_staff

    foreign_note = note_factory(owner=user_factory())

    response = admin_client.delete(reverse("note-detail", args=[foreign_note.id]))

    assert response.status_code == 204
    assert not Note.objects.filter(pk=foreign_note.id).exists()
