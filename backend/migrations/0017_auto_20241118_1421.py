# Generated by Django 3.1.14 on 2024-11-18 19:21

import django.contrib.gis.db.models.fields
import django.contrib.gis.geos.point
from django.db import migrations
from django.contrib.gis.geos import Point


def migrate_coordinates(apps, schema_editor):
    Location = apps.get_model('backend', 'Location')
    
    for loc in Location.objects.all():
        p = Point([loc.lng, loc.lat])
        loc.coordinates = p
        loc.save()


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0016_postgis'),
    ]

    operations = [
       migrations.AddField(
            model_name='location',
            name='coordinates',
            field=django.contrib.gis.db.models.fields.PointField(default=django.contrib.gis.geos.point.Point(0.0, 0.0), geography=True, srid=4326),
        ),
        migrations.RunPython(migrate_coordinates),
        migrations.RemoveField(
            model_name='location',
            name='lat',
        ),
        migrations.RemoveField(
            model_name='location',
            name='lng',
        ),
    ]
