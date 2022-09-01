from drf_spectacular.utils import extend_schema
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


token_obtain_pair = extend_schema(
    operation_id="auth_token_retrieve",
    summary="Authenticate a user",
    description=(
        "Takes a set of user credentials and returns an access and refresh JSON Web"
        " Token pair to prove the authentication of those credentials."
        "\n\n**Access policy**: Public"
    ),
)(TokenObtainPairView).as_view()

token_refresh = extend_schema(
    operation_id="auth_token_refresh",
    summary="Refresh an access token",
    description=(
        "Takes a refresh type JSON Web Token and returns an access type JSON Web"
        " Token if the refresh token is valid."
        + "\n\n**Access policy**: Public"
    ),
)(TokenRefreshView).as_view()
