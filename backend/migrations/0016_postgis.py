from django.contrib.postgres.operations import CreateExtension
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('backend', '0015_auto_20241116_2334'),
    ]
    operations = [CreateExtension("postgis")]
