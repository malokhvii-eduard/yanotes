from rest_framework import permissions


class IsUser(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return bool(request.user and obj.id == request.user.id)


class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return bool(request.user and obj.owner.id == request.user.id)
