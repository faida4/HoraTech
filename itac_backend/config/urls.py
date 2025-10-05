"""
URL configuration for config project.

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
# config/urls.py
from django.contrib import admin
from django.urls import include, path
from django.urls import include, path, re_path
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from accounts.views import login_view, profile_view, update_profile_picture, logout_view, add_stage, update_stage, delete_stage, add_group, update_group, delete_group, get_stages,  get_schedules, add_scheduleList, delete_schedule, add_schedule
from accounts.views import get_professor_schedule
from accounts.conflict_utils import check_schedule_conflict #  Import du gestionnaire de conflits
from accounts import views as account_views



urlpatterns = [
    path('admin/', admin.site.urls),  #  Admin Django
   path('accounts/', include('accounts.urls')),
   #  Redirection vers la page de login si l’URL est vide (page d’accueil)
    re_path(r'^$', RedirectView.as_view(url='accounts/login/', permanent=True)),
    path('accounts/', include('accounts.urls')),
    #  Authentification  
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

    path("schedules/", get_schedules, name="get_schedules"),  # Récupérer les horaires
    path("schedules/add_scheduleList/", add_scheduleList, name="add_scheduleList"),   #  Ajouter un cours à la liste de planification
    path("schedules/<int:schedule_id>/delete/", delete_schedule, name="delete_schedule"),  #  Supprimer un horaire

    path("schedules/<int:schedule_id>/add/", add_schedule, name="add_schedule"),  #  Mettre à jour un horaire (changement de jour/heure)

      #  Vérifier les conflits d’horaire
    path('schedules/check_conflict/', check_schedule_conflict, name="check_schedule_conflict"),
    path("professors/<int:professor_id>/schedule/", get_professor_schedule, name="professor_schedule"),

    #  Programmes
    path('programs/', account_views.get_all_programs, name='get_all_programs'),
    path('programs/create/', account_views.create_program, name='create_program'),
    path('programs/<int:program_id>/edit/', account_views.edit_program, name='edit_program'),
    path('programs/<int:program_id>/delete/', account_views.delete_program),  

    #  Groupes
    path("groups/", account_views.list_groups, name="list_groups"),

   path("programs/<int:program_id>/courses/", account_views.get_courses_by_program), #  Lien entre un programme et ses cours
   path("stages/<int:stage_id>/groups/", account_views.get_stage_groups),    #  Lien entre une étape et ses groupes
   
] 
#  Afficher les  fichiers médias en mode développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)