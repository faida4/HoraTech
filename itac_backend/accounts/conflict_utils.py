from django.views.decorators.csrf import csrf_exempt    # Pour désactiver CSRF temporairement 
import json
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from datetime import datetime
from .models import Schedule, Professor, Group      # Import des modèles utilisés


#  Vérifie si un professeur a un conflit d'horaire (même jour, chevauchement de plage horaire)
def check_schedule_conflict_prof(professor, start_time, end_time, day, exclude_id=None):
    """ Vérifie si un professeur a un conflit d'horaire le même jour."""
    conflicts = Schedule.objects.filter(
        professor=professor,
        day=day,  #  Vérifie que le conflit est le même jour !
        start_time__lt=end_time,  # Début du cours existant avant la fin du nouveau
        end_time__gt=start_time   # Fin du cours existant après le début du nouveau
    )
     # Ignore l'événement en cours (utile pour la modification :Quand on modifie un cours déjà existant dans le calendrier,
    # on vérifie les conflits... mais sans que le système considère ce même cours comme un conflit avec lui-même.)
    if exclude_id:
        conflicts = conflicts.exclude(id=exclude_id)    
    return conflicts.exists()
   
#  Vérifie si un groupe a un conflit d’horaire
def check_schedule_conflict_group(group, start_time, end_time, day, exclude_id=None):
    """ Vérifie si un groupe a un conflit d'horaire le même jour. """
    conflicts = Schedule.objects.filter(
        group=group,
        day=day,  #  Vérifie que le conflit est le même jour !
        start_time__lt=end_time,  # Début du cours existant avant la fin du nouveau
        end_time__gt=start_time   # Fin du cours existant après le début du nouveau
    )
    if exclude_id:
        conflicts = conflicts.exclude(id=exclude_id)
    return conflicts.exists()
   


#  Vue qui vérifie les conflits d’un horaire donné (professeur et groupe)
@csrf_exempt        # Permet les requêtes POST sans token CSRF
def check_schedule_conflict(request):
    """ Vérifie les conflits d'horaire pour un professeur et un groupe en ignorant l'événement en cours (si fourni). """
    if request.method == "POST":
        try:
            data = json.loads(request.body)     # Récupère les données JSON du body

             #  Récupère les objets liés à partir des IDs fournis
            professor = get_object_or_404(Professor, id=data["professor_id"])
            group = get_object_or_404(Group, id=data["group_id"])
            
            # Conversion des dates/horaires ISO en objets datetime Python
            start_time = datetime.fromisoformat(data["start_time"].replace("Z", ""))
            end_time = datetime.fromisoformat(data["end_time"].replace("Z", ""))
            day = data.get("day", None)
            exclude_id = data.get("event_id", None)  

             #  Vérification des conflits avec les horaires existants
            prof_conflicts = Schedule.objects.filter(
                professor=professor,
                day=day,
                start_time__lt=end_time,
                end_time__gt=start_time
            )
            group_conflicts = Schedule.objects.filter(
                group=group,
                day=day,
                start_time__lt=end_time,
                end_time__gt=start_time
            )

             #  Ignore l’événement courant (s’il est fourni)
            if exclude_id:
                prof_conflicts = prof_conflicts.exclude(id=exclude_id)
                group_conflicts = group_conflicts.exclude(id=exclude_id)
            
            #  Réponse JSON : indique s’il y a un conflit de prof, de groupe, ou les deux
            return JsonResponse({
                "professor_conflict": prof_conflicts.exists(),
                "group_conflict": group_conflicts.exists(),
                "conflict": prof_conflicts.exists() or group_conflicts.exists()
            }, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Méthode non autorisée"}, status=405)
