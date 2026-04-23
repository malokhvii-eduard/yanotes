from datetime import datetime


def assert_iso_datetime_string(value):
    assert isinstance(value, str)

    try:
        datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise AssertionError(f"Expected ISO datetime string, got {value!r}") from exc


def assert_error_response(payload):
    assert "detail" in payload
    assert isinstance(payload["detail"], str)
    assert payload["detail"]


def assert_user_payload(payload, *, user):
    assert set(payload) == {
        "id",
        "username",
        "email",
        "first_name",
        "last_name",
        "is_staff",
    }
    assert payload["id"] == user.id
    assert payload["username"] == user.username
    assert payload["email"] == user.email
    assert payload["first_name"] == user.first_name
    assert payload["last_name"] == user.last_name
    assert payload["is_staff"] == user.is_staff


def assert_note_payload(payload, *, note):
    assert set(payload) == {
        "id",
        "title",
        "content",
        "created_at",
        "updated_at",
        "owner",
    }
    assert payload["id"] == note.id
    assert payload["title"] == note.title
    assert payload["content"] == note.content
    assert payload["owner"] == note.owner_id
    assert_iso_datetime_string(payload["created_at"])
    assert_iso_datetime_string(payload["updated_at"])


def assert_paginated_response(payload, *, count, results_length=None):
    assert set(payload) == {"count", "next", "previous", "results"}
    assert payload["count"] == count
    if results_length is not None:
        assert len(payload["results"]) == results_length


def assert_token_pair_payload(payload):
    assert set(payload) == {"access", "refresh"}
    assert payload["access"]
    assert payload["refresh"]
