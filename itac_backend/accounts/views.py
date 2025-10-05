# views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
import json
from django.shortcuts import get_object_or_404
from rest_framework import generics
from .serializers import ProfessorSerializer, ProgramSerializer
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.utils.timezone import make_aware
from datetime import datetime
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Program, Schedule, Professor, Stage, Group, Course
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser

# ---------------------- Authentification ----------------------
@csrf_exempt  #  Désactive CSRF
def login_view(request):
     # Authentifie l'utilisateur à partir du nom d'utilisateur et du mot de passe

    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")
            user = authenticate(request, username=username, password=password)

            if user:
                login(request, user)
                return JsonResponse({
                    "message": "Connexion réussie",
                    "user": {
                        "first_name": user.first_name or "Non renseigné",
                        "last_name": user.last_name or "Non renseigné",
                        "email": user.email,
                        "role": user.role,
                        "phone_number":user.phone_number,
                        "profile_picture": request.build_absolute_uri(user.profile_picture.url if user.profile_picture else "/media/default-avatar.png"),
                    }
                }, status=200)
            else:
                return JsonResponse({"error": "Nom d'utilisateur ou mot de passe incorrect"}, status=401)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Données JSON invalides"}, status=400)

    return JsonResponse({"error": "Utilisez une requête POST pour vous connecter"}, status=405)

@csrf_exempt
def logout_view(request):
     # Déconnecte l'utilisateur (session terminée)
    if request.method == "POST":
        logout(request)
        return JsonResponse({"message": "Déconnexion réussie"}, status=200)

    return JsonResponse({"error": "Méthode non autorisée"}, status=405)

# ---------------------- Profils Utilisateurs ----------------------
@csrf_exempt
@login_required
def profile_view(request):
    """
    🔹 Gère la récupération et la mise à jour du profil utilisateur.
    - `GET` : Récupère les informations du profil.
    - `PUT` : Met à jour les informations (nom, prénom, téléphone).
    """

    user = request.user

    if request.method == "GET":
        return JsonResponse({
            "id": user.id,
            "first_name": user.first_name or "Non renseigné",
            "last_name": user.last_name or "Non renseigné",
            "email": user.email, 
            "role": user.role,
            "phone_number": user.phone_number or "Non renseigné",
            "profile_picture": request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else "/media/default-avatar.png"
        })

    elif request.method == "PUT":
        try:
            data = json.loads(request.body)
            user.first_name = data.get("first_name", user.first_name)
            user.last_name = data.get("last_name", user.last_name)
            user.phone_number = data.get("phone_number", user.phone_number)
            user.email = data.get("email", user.email)
            user.save()
            return JsonResponse({"message": "Profil mis à jour avec succès"}, status=200)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Données invalides"}, status=400)

    return JsonResponse({"error": "Méthode non autorisée"}, status=405)

@csrf_exempt
@login_required
def update_profile_picture(request):
    """
    🔹 Met à jour la photo de profil.
    - `POST` : Envoie une nouvelle image et la remplace.
    """

    if request.method == "POST":
        if 'profile_picture' in request.FILES:
            user = request.user
            new_image = request.FILES['profile_picture']

            # Supprime l'ancienne image (même si c'était l'avatar par défaut)
            if user.profile_picture:
                default_storage.delete(user.profile_picture.name)

            # Enregistre la nouvelle image
            user.profile_picture.save(new_image.name, ContentFile(new_image.read()))
            user.save()

            return JsonResponse({
                "message": "Photo de profil mise à jour avec succès",
                "profile_picture": request.build_absolute_uri(user.profile_picture.url)
            }, status=200)

        return JsonResponse({"error": "Aucune image fournie"}, status=400)

    return JsonResponse({"error": "Méthode non autorisée"}, status=405)


# ---------------------- CRUD des cours ----------------------
@csrf_exempt
def course_list(request):
      # GET → retourne la liste des cours
    # POST → ajoute un nouveau cours (avec validation du code unique)
    if request.method == 'GET':
        courses = Course.objects.all()
        data = []
        for course in courses:
            data.append({
                "id": course.id,
                "course_code": course.course_code,
                "name": course.name,
                "description": course.description,
                "credits": course.credits,
                "program_ids": [p.id for p in course.programs.all()],  # important pour le filtre
            })
        return JsonResponse(data, safe=False)

    elif request.method == 'POST':
        data = json.loads(request.body)
        if Course.objects.filter(course_code=data['course_code']).exists():
            return JsonResponse({'error': 'Le code du cours existe déjà'}, status=400)

        course = Course.objects.create(
            course_code=data['course_code'],
            name=data['name'],
            description=data['description'],
            credits=data['credits']
        )
        #  Lier les programmes fournis dans la requête
        if 'program_ids' in data:
            course.programs.set(data['program_ids'])

        return JsonResponse({'message': 'Cours ajouté avec succès', 'id': course.id}, status=201)

@csrf_exempt
def course_detail(request, course_id):
    # GET → détails d’un cours
    # PUT → mise à jour d’un cours
    # DELETE → suppression d’un cours
    course = get_object_or_404(Course, id=course_id)
    if request.method == 'GET':
        return JsonResponse({
            'id': course.id,
            'course_code': course.course_code,
            'name': course.name,
            'description': course.description,
            'credits': course.credits,
            'programs': list(course.programs.values('id', 'name'))  
        })

    elif request.method == 'PUT':
        data = json.loads(request.body)
        course.course_code = data.get('course_code', course.course_code)
        course.name = data.get('name', course.name)
        course.description = data.get('description', course.description)
        course.credits = data.get('credits', course.credits)
        course.save()

        #  Mettre à jour les programmes
        if 'program_ids' in data:
            course.programs.set(data['program_ids'])

        return JsonResponse({'message': 'Cours mis à jour avec succès'})

    elif request.method == 'DELETE':
        course.delete()
        return JsonResponse({'message': 'Cours supprimé avec succès'}, status=204)

# ---------------------- API REST : Professeurs ----------------------    
class ProfessorViewSet(viewsets.ModelViewSet):
    # Vue RESTful complète pour gérer les professeurs (CRUD)
    queryset = Professor.objects.all()
    serializer_class = ProfessorSerializer
    parser_classes = [MultiPartParser, FormParser] 


@csrf_exempt
def add_stage(request):
     # Ajoute une nouvelle étape
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            number = data.get("number")
            session = data.get("session")

            if not number or not session:
                return JsonResponse({"error": "Tous les champs sont requis"}, status=400)

            # Vérifier si l'étape existe déjà
            if Stage.objects.filter(number=number, session=session, year=2025).exists():
                return JsonResponse({"error": "Cette étape existe déjà"}, status=400)

            stage = Stage.objects.create(number=number, session=session)
            return JsonResponse({"message": "Étape ajoutée avec succès", "id": stage.id}, status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Méthode non autorisée"}, status=405)



@csrf_exempt
def update_stage(request, stage_id):
     # Met à jour une étape
    if request.method == "PUT":
        try:
            data = json.loads(request.body)
            stage = Stage.objects.get(id=stage_id)

            stage.number = data.get("number", stage.number)
            stage.session = data.get("session", stage.session)

            stage.save()
            return JsonResponse({"message": "Étape mise à jour avec succès"}, status=200)

        except Stage.DoesNotExist:
            return JsonResponse({"error": "Étape non trouvée"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Méthode non autorisée"}, status=405)


@csrf_exempt
def delete_stage(request, stage_id):
     # Supprime une étape
    if request.method == "DELETE":
        try:
            stage = Stage.objects.get(id=stage_id)
            stage.delete()
            return JsonResponse({"message": "Étape supprimée avec succès"}, status=200)
        except Stage.DoesNotExist:
            return JsonResponse({"error": "Étape non trouvée"}, status=404)

    return JsonResponse({"error": "Méthode non autorisée"}, status=405)


@csrf_exempt
def add_group(request, stage_id):
    # Ajoute un groupe à une étape précise, en lien avec un programme
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            name = data.get("name")
            program_id = data.get("program_id")  

            if not name or not program_id:
                return JsonResponse({"error": "Le nom du groupe et le programme sont requis"}, status=400)

            stage = Stage.objects.get(id=stage_id)
            program = Program.objects.get(id=program_id)

            if Group.objects.filter(name=name, stage=stage, program=program).exists():
                return JsonResponse({"error": "Ce groupe existe déjà dans cette étape pour ce programme"}, status=400)

            group = Group.objects.create(name=name, stage=stage, program=program)
            return JsonResponse({"message": "Groupe ajouté avec succès", "id": group.id}, status=201)

        except (Stage.DoesNotExist, Program.DoesNotExist):
            return JsonResponse({"error": "Étape ou programme non trouvé"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
def update_group(request, group_id):
      # Met à jour un groupe (nom ou programme)
    if request.method == "PUT":
        try:
            data = json.loads(request.body)
            group = Group.objects.get(id=group_id)

            # Mise à jour du nom du groupe
            group.name = data.get("name", group.name)

            # Mise à jour du programme 
            program_id = data.get("program_id")
            if program_id:
                try:
                    program = Program.objects.get(id=program_id)
                    group.program = program
                except Program.DoesNotExist:
                    return JsonResponse({"error": "Programme non trouvé"}, status=404)

            group.save()
            return JsonResponse({"message": "Groupe mis à jour avec succès"}, status=200)

        except Group.DoesNotExist:
            return JsonResponse({"error": "Groupe non trouvé"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Méthode non autorisée"}, status=405)


@api_view(["GET"])
def list_groups(request):
    groups = Group.objects.select_related("program", "stage").all()
    data = [
        {
            "id": g.id,
            "name": g.name,
            "program_id": g.program.id,
            "program_name": g.program.name,  
            "stage_id": g.stage.id,
            "stage_number": g.stage.number,  
            "stage_session": g.stage.session,  
            "stage_year": g.stage.year,  
        }
        for g in groups
    ]
    return Response(data)

@csrf_exempt
def delete_group(request, group_id):
      # Supprime un groupe
    if request.method == "DELETE":
        try:
            group = Group.objects.get(id=group_id)
            group.delete()
            return JsonResponse({"message": "Groupe supprimé avec succès"}, status=200)
        except Group.DoesNotExist:
            return JsonResponse({"error": "Groupe non trouvé"}, status=404)

    return JsonResponse({"error": "Méthode non autorisée"}, status=405)


@csrf_exempt
def get_stages(request):
    if request.method == "GET":
        stages = Stage.objects.all()
        data = []
        for stage in stages:
            groups = list(stage.groups.values("id", "name"))
            data.append({
                "id": stage.id,
                "number": stage.number,
                "session": stage.session,
                "year": stage.year,
                "groups": groups  
            })
        return JsonResponse(data, safe=False)

    return JsonResponse({"error": "Méthode non autorisée"}, status=405)



@api_view(['GET'])
def get_stage_groups(request, stage_id):
    """Retourne les groupes d'une étape, avec option de filtrer par programme."""
    stage = get_object_or_404(Stage, id=stage_id)
    program_id = request.GET.get('program_id')

    if program_id:
        groupes = Group.objects.filter(stage=stage, program_id=program_id)
    else:
        groupes = Group.objects.filter(stage=stage)

    data = [
        {
            "id": g.id,
            "name": g.name,
            "program": g.program.id  
        }
        for g in groupes
    ]
    return Response(data)


@csrf_exempt
def get_schedules(request):
    """ Récupère tous les cours planifiés avec filtrage par étape et programme """
    if request.method == "GET":
        stage_id = request.GET.get("stage_id")
        program_id = request.GET.get("program_id")

        schedules = Schedule.objects.all().select_related('course', 'professor', 'stage', 'group', 'group__program')

        if stage_id:
            schedules = schedules.filter(stage_id=stage_id)
        if program_id:
            schedules = schedules.filter(group__program_id=program_id)

        data = [
            {
                "id": schedule.id,
                "course": schedule.course.name,
                "professor": f"{schedule.professor.first_name} {schedule.professor.last_name}",
                "stage": schedule.stage.number,
                "group": schedule.group.name,
                "day": schedule.day if schedule.day else None,
                "start_time": schedule.start_time.isoformat() + "Z" if schedule.start_time else None,
                  # Heure de début formatée en ISO 8601 + "Z"
                  # Le "Z" signifie **Zulu time**, c’est-à-dire UTC (temps universel coordonné)
                  # Cela indique que la date/heure est en temps universel (standard international)

                "end_time": schedule.end_time.isoformat() + "Z" if schedule.end_time else None,
                "group_id": schedule.group.id,
                "professor_id": schedule.professor.id,
                "program_id": schedule.group.program.id,
                "program_name": schedule.group.program.name,
            }
            for schedule in schedules
        ]
        return JsonResponse(data, safe=False)


@csrf_exempt
def add_scheduleList(request):
    """ Ajoute un cours au planning """
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            course = get_object_or_404(Course, id=data["course_id"])
            professor = get_object_or_404(Professor, id=data["professor_id"])
            stage = get_object_or_404(Stage, id=data["stage_id"])
            group = get_object_or_404(Group, id=data["group_id"])

            #  Vérification des doublons : même cours + même groupe + même étape
            if Schedule.objects.filter(course=course, group=group, stage=stage).exists():
                return JsonResponse({"error": f"Le cours {course.name} est déjà assigné au groupe {group.name} pour cette étape."}, status=400)

            #  Vérifier si `start_time` et `end_time` sont envoyés, sinon les mettre à None
            start_time = datetime.fromisoformat(data["start_time"].replace("Z", "")) if "start_time" in data and data["start_time"] else None
            end_time = datetime.fromisoformat(data["end_time"].replace("Z", "")) if "end_time" in data and data["end_time"] else None
            day = data.get("day", None)  #  Accepter `day` comme NULL  
            
            #  Créer l'horaire sans forcer `day`, `start_time`, `end_time`
            schedule = Schedule.objects.create(
                course=course,
                professor=professor,
                stage=stage,
                group=group,
                start_time=start_time,
                end_time=end_time,
                day=day
            )

            return JsonResponse({"message": "Cours ajouté avec succès", "id": schedule.id}, status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def delete_schedule(request, schedule_id):
     # Récupère tous les horaires, avec option de filtre par étape et programme
    if request.method == "DELETE":
        try:
            schedule = Schedule.objects.get(id=schedule_id)
            schedule.delete()
            return JsonResponse({'message': 'Horaire supprimé avec succès'})
        except Schedule.DoesNotExist:
            return JsonResponse({'error': 'Horaire introuvable'}, status=404)


@csrf_exempt
def add_schedule(request, schedule_id):
    """Met à jour l'horaire d'un cours."""
    if request.method == "PUT":
        try:
            data = json.loads(request.body.decode("utf-8"))  # Convertir la requête en JSON
            schedule = Schedule.objects.get(id=schedule_id)

            if "start_time" in data and data["start_time"]:  #  Vérifie si `start_time` existe
                schedule.start_time = make_aware(datetime.fromisoformat(data["start_time"].replace("Z", "")))

            if "end_time" in data and data["end_time"]:  #  Vérifie si `end_time` existe
                schedule.end_time = make_aware(datetime.fromisoformat(data["end_time"].replace("Z", "")))

            if "day" in data:  #  Mise à jour de `day` si fourni
                schedule.day = data["day"]


            schedule.save()

            return JsonResponse({"message": "Horaire mis à jour avec succès"}, status=200)

        except Schedule.DoesNotExist:
            return JsonResponse({"error": "Cours non trouvé"}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Requête invalide"}, status=400)

    return JsonResponse({"error": "Méthode non autorisée"}, status=405)





def get_professor_schedule(request, professor_id):
      # Récupère tous les horaires planifiés d’un professeur donné
    if request.method == "GET":
        professor = get_object_or_404(Professor, id=professor_id)
        schedules = Schedule.objects.filter(professor=professor)

        data = [
            {
                "id": s.id,
                "course": s.course.name,
                "group": s.group.name,
                "stage": s.stage.number,
                "day": s.day,
                "start_time": s.start_time.isoformat() if s.start_time else None,
                "end_time": s.end_time.isoformat() if s.end_time else None
            }
            for s in schedules
        ]
        return JsonResponse(data, safe=False)


# ---------------------- API REST : Programmes ----------------------
@api_view(['GET'])
def get_all_programs(request):
     # Liste tous les programmes (GET)
    programs = Program.objects.all()
    serializer = ProgramSerializer(programs, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def create_program(request):
     # Crée un nouveau programme (POST)
    serializer = ProgramSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['PUT'])
def edit_program(request, program_id):
     # Met à jour les infos d’un programme (PUT)
    try:
        program = Program.objects.get(id=program_id)
    except Program.DoesNotExist:
        return Response({'error': 'Programme non trouvé'}, status=404)

    serializer = ProgramSerializer(program, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(['DELETE'])
def delete_program(request, program_id):
     # Supprime un programme (DELETE)
    try:
        program = Program.objects.get(id=program_id)
        program.delete()
        return Response({'message': 'Programme supprimé avec succès'}, status=204)
    except Program.DoesNotExist:
        return Response({'error': 'Programme non trouvé'}, status=404)

# ---------------------- Programme -> Cours ----------------------
@api_view(["GET"])
def get_courses_by_program(request, program_id):
    try:
        program = Program.objects.get(pk=program_id)
        courses = program.courses.all()
        data = [
            {
                "id": c.id,
                "course_code": c.course_code,
                "name": c.name,
                "description": c.description,
                "credits": c.credits
            } for c in courses
        ]
        return Response(data)
    except Program.DoesNotExist:
        return Response({"error": "Programme non trouvé."}, status=404)
