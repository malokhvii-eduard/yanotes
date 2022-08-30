from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Used to create a superuser if none exists."

    def add_arguments(self, parser):
        parser.add_argument(
            "--username", help="Specifies the username for the superuser."
        )
        parser.add_argument("--email", help="Specifies the email for the superuser.")
        parser.add_argument(
            "--password", help="Specifies the password for the superuser."
        )

    def handle(self, *args, **options):
        User = get_user_model()  # noqa

        if not User.objects.filter(username=options["username"]).exists():
            username = options["username"]
            email = options["email"]

            self.stdout.write(f"Superuser '${username}' was created")

            User.objects.create_superuser(
                username=username, email=email, password=options["password"]
            )
