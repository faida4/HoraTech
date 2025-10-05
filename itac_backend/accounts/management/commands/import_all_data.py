from django.core.management.base import BaseCommand
from accounts.models import Program, Stage, Group, Professor, Course
from accounts.models import CustomUser
from django.contrib.auth.hashers import make_password

class Command(BaseCommand):
    help = "Importe les Programmes, Étapes, Groupes, Professeurs, Cours et crée un horaire vide associé."

    def handle(self, *args, **kwargs):
        # === 1. Programmes ===
        program_data = [
            {"code": "51046", "name": "Technologie du Génie informatique"},
            {"code": "51047", "name": "Programmation informatique"},
            {"code": "51048", "name": "Sciences des données appliquées"},
            {"code": "51049", "name": "Intelligence artificielle en informatique"},
        ]

        program_objs = {}
        for item in program_data:
            program, _ = Program.objects.get_or_create(code=item["code"], name=item["name"])
            program_objs[item["name"]] = program
            self.stdout.write(self.style.SUCCESS(f"✅ Programme : {program.name}"))

        # === 2. Étapes + Groupes ===
        group_data = [
            {"program": "Technologie du Génie informatique", "stage_number": 1, "stage_session": "Automne", "stage_year": 2025, "group_name": "0050"},
            {"program": "Technologie du Génie informatique", "stage_number": 3, "stage_session": "Automne", "stage_year": 2025, "group_name": "0010"},
            {"program": "Programmation informatique", "stage_number": 2, "stage_session": "Hiver", "stage_year": 2025, "group_name": "0010"},
            {"program": "Sciences des données appliquées", "stage_number": 1, "stage_session": "Automne", "stage_year": 2025, "group_name": "0020"},
            {"program": "Intelligence artificielle en informatique", "stage_number": 1, "stage_session": "Automne", "stage_year": 2025, "group_name": "0040"},
        ]

        group_objs = []
        for item in group_data:
            program = program_objs[item["program"]]
            stage, _ = Stage.objects.get_or_create(
                number=item["stage_number"],
                session=item["stage_session"],
                year=item["stage_year"]
            )
            group, _ = Group.objects.get_or_create(
                name=item["group_name"],
                program=program,
                stage=stage
            )
            group_objs.append((group, program, stage))
            self.stdout.write(self.style.SUCCESS(f"📘 Groupe : {group.name} / Étape {stage.number} - {program.name}"))

        # === 3. Professeurs ===
        professor_data = [
            {"first_name": "Alice", "last_name": "Dupont", "email": "alice.dupont@example.com"},
            {"first_name": "Jean", "last_name": "Moreau", "email": "jean.moreau@example.com"},
            {"first_name": "Sophie", "last_name": "Lemoine", "email": "sophie.lemoine@example.com"},
        ]

        professors = []
        for prof in professor_data:
            p, _ = Professor.objects.get_or_create(
                email=prof["email"],
                defaults={
                    "first_name": prof["first_name"],
                    "last_name": prof["last_name"],
                }
            )
            professors.append(p)
            self.stdout.write(self.style.SUCCESS(f"👩‍🏫 Professeur : {p.first_name} {p.last_name}"))

        # === 4. Cours ===
        course_data = [
            {"code": "25747", "nom": "Algèbre et trigonométrie", "description": "Section 10", "programmes": ["Programmation informatique"], "credits": 42},
            {"code": "45721", "nom": "Bases de données", "description": "Section 20", "programmes": ["Technologie du Génie informatique"], "credits": 60},
            {"code": "38944", "nom": "Apprentissage automatique", "description": "Section IA", "programmes": ["Intelligence artificielle en informatique"], "credits": 48},
        ]

        for course_item in course_data:
            course, _ = Course.objects.get_or_create(
                course_code=course_item["code"],
                name=course_item["nom"],
                defaults={
                    "description": course_item["description"],
                    "credits": course_item["credits"]
                }
            )
            linked_programs = [program_objs[name] for name in course_item["programmes"]]
            course.programs.set(linked_programs)
            course.save()

            self.stdout.write(self.style.SUCCESS(f"📚 Cours : {course.course_code} - {course.name}"))


# === 6. Utilisateurs (CustomUser) ===
user_data = [
    {
        "username": "secretaire1",
        "email": "sec1@example.com",
        "first_name": "Léa",
        "last_name": "Martin",
        "role": "secretaire",
        "phone_number": "613-111-2222",
        "password": "secret123"
    },
    {
        "username": "directrice",
        "email": "directrice@example.com",
        "first_name": "Samir",
        "last_name": "Elouasbi",
        "role": "directrice",
        "phone_number": "613-999-8888",
        "password": "admin456"
    }
]

for item in user_data:
    if not CustomUser.objects.filter(username=item["username"]).exists():
        user = CustomUser.objects.create(
            username=item["username"],
            email=item["email"],
            first_name=item["first_name"],
            last_name=item["last_name"],
            role=item["role"],
            phone_number=item["phone_number"],
            password=make_password(item["password"])
        )
        print(f"👤 Utilisateur créé : {user.username} ({user.role})")
    else:
        print(f"ℹ️ Utilisateur existant : {item['username']}")
