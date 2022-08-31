from django.conf import settings
from django.db import models


class Note(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=150, null=False, blank=False)
    content = models.TextField(null=False, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        db_table = "note"
