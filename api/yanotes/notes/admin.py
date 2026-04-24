from django.contrib import admin

from .models import Note


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "content", "updated_at", "owner")
    list_display_links = ("id",)
    search_fields = ("title", "content", "owner")
    readonly_fields = ("created_at", "updated_at")
