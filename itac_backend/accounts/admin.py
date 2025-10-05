#  Fichier pour enregistrer les modèles dans l’interface d’administration Django
from django.contrib import admin

# Register your models here.

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser
from .models import Course
from .models import Professor

admin.site.register(CustomUser, UserAdmin)

admin.site.register(Course)     # Liste des cours
admin.site.register(Professor)  # Liste des professeurs




from django.contrib import admin
from .models import Stage, Group, Schedule

admin.site.register(Stage)  # Liste des étapes
admin.site.register(Group)  # Liste des groupes
admin.site.register(Schedule) # Liste des horaires planifiés

