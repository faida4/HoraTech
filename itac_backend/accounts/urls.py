# accounts/urls.py
from django.urls import path, include
from .views import login_view, profile_view
from .views import course_list, course_detail
from rest_framework.routers import DefaultRouter
from .views import ProfessorViewSet
from .views import profile_view, update_profile_picture, logout_view, add_stage, update_stage
from .views import delete_stage, add_group, update_group, delete_group, get_stages, get_schedules, add_scheduleList, delete_schedule, add_schedule
from .views import get_professor_schedule
from . import views

#  Fonction pour vérifier les conflits d'horaire (prof/groupe)
from .conflict_utils import check_schedule_conflict

#  Router DRF pour les vues ViewSet (CRUD auto pour les professeurs )
router = DefaultRouter()
router.register(r'professors', ProfessorViewSet) 

#  Déclaration des routes disponibles dans l'application
urlpatterns = [
    #  Authentification
    path('login/', login_view, name='login'),
    path('courses/', course_list, name='course-list'),
    path('courses/<int:course_id>/', course_detail, name='course-detail'),
     path('', include(router.urls)),
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
    path("schedules/add_scheduleList/", add_scheduleList, name="add_scheduleList"),  # Ajouter un cours à planifier
    path("schedules/<int:schedule_id>/delete/", delete_schedule, name="delete_schedule"),  # Supprimer un horaire
    path("schedules/<int:schedule_id>/add/", add_schedule, name="add_schedule"),    # Mettre à jour horaire d’un cour
    

    #  Vérification des conflits d’horaire
    path('schedules/check_conflict/', check_schedule_conflict, name="check_schedule_conflict"),
    path("professors/<int:professor_id>/schedule/", get_professor_schedule, name="professor_schedule"),

    #  Programmes (CRUD complet)
    path('programs/', views.get_all_programs, name='get_all_programs'),
    path('programs/create/', views.create_program, name='create_program'),
    path('programs/<int:program_id>/edit/', views.edit_program, name='edit_program'),
    path('programs/<int:program_id>/delete/', views.delete_program),  

  
   path("groups/", views.list_groups, name="list_groups"),  # Liste tous les groupes

   path("programs/<int:program_id>/courses/", views.get_courses_by_program),    #  Cours liés à un programme (pour filtrage dynamique)
   path("stages/<int:stage_id>/groups/", views.get_stage_groups),   # Groupes d’une étape

]




