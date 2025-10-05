"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from accounts.views import login_view, profile_view
from accounts.views import profile_view, update_profile_picture, logout_view, add_stage, update_stage, delete_stage, add_group, update_group, delete_group, get_stages, get_schedules, add_scheduleList, delete_schedule



from accounts.conflict_utils import check_schedule_conflict




urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', include('accounts.urls')),
    path('accounts/', include('accounts.urls')), # Ajoute cette ligne

    path('login/', login_view, name='login'),
     path('accounts/profile/', profile_view, name='profile_view'),
    path('accounts/update-profile/', update_profile_picture, name='update_profile_picture'),
    path('accounts/logout/', logout_view, name="logout"),

    path("stages/add/", add_stage, name="add_stage"),  # Ajouter une étape
    path("stages/<int:stage_id>/update/", update_stage, name="update_stage"),  # Modifier une étape
    path("stages/<int:stage_id>/delete/", delete_stage, name="delete_stage"),  # Supprimer une étape

    path("stages/<int:stage_id>/groups/add/", add_group, name="add_group"),  # Ajouter un groupe
    path("groups/<int:group_id>/update/", update_group, name="update_group"),  # Modifier un groupe
    path("groups/<int:group_id>/delete/", delete_group, name="delete_group"),  # Supprimer un groupe

    path("stages/", get_stages, name="get_stages"),  # Récupérer toutes les étapes
    #path("stages/<int:stage_id>/groups/", get_groups_by_stage, name="get_groups_by_stage"),  # Récupérer les groupes d'une étape

    path("schedules/", get_schedules, name="get_schedules"),  # Récupérer les horaires
    path("schedules/add_scheduleList/", add_scheduleList, name="add_scheduleList"),  # Ajouter un cours
    path("schedules/<int:schedule_id>/delete/", delete_schedule, name="delete_schedule"),  # Supprimer un cours


    path('schedules/check_conflict/', check_schedule_conflict, name="check_schedule_conflict"),
   
] 



# Ajoute le support des fichiers médias en mode développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



