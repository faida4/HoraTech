from accounts.models import Program, Stage, Group
#  Import de la base de commande Django
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Importer tous les groupes manuellement" # Description affichée via `python manage.py help`

    def handle(self, *args, **kwargs):

        group_data = [

            # Chaque dictionnaire représente un groupe avec programme, étape, session, année et nom
            {"program": "Technologie du Génie informatique", "stage_number": 1, "stage_session": "Automne", "stage_year": 2025, "group_name": "0050"},
            {"program": "Technologie du Génie informatique", "stage_number": 1, "stage_session": "Automne", "stage_year": 2025, "group_name": "0060"},
            {"program": "Technologie du Génie informatique", "stage_number": 1, "stage_session": "Automne", "stage_year": 2025, "group_name": "0070"},
            {"program": "Technologie du Génie informatique", "stage_number": 1, "stage_session": "Automne", "stage_year": 2025, "group_name": "0080"},
            {"program": "Technologie du Génie informatique", "stage_number": 3, "stage_session": "Automne", "stage_year": 2025, "group_name": "0010"},
            {"program": "Technologie du Génie informatique", "stage_number": 3, "stage_session": "Automne", "stage_year": 2025, "group_name": "0090"},
            {"program": "Technologie du Génie informatique", "stage_number": 3, "stage_session": "Automne", "stage_year": 2025, "group_name": "0020"},
            {"program": "Technologie du Génie informatique", "stage_number": 3, "stage_session": "Automne", "stage_year": 2025, "group_name": "0080"},
            {"program": "Technologie du Génie informatique", "stage_number": 5, "stage_session": "Automne", "stage_year": 2025, "group_name": "0010"},
            {"program": "Sciences des données appliquées", "stage_number": 1, "stage_session": "Automne", "stage_year": 2025, "group_name": "0010"},
            {"program": "Sciences des données appliquées", "stage_number": 1, "stage_session": "Automne", "stage_year": 2025, "group_name": "0030"},
            {"program": "Sciences des données appliquées", "stage_number": 1, "stage_session": "Automne", "stage_year": 2025, "group_name": "0020"},
            {"program": "Programmation informatique", "stage_number": 1, "stage_session": "Automne", "stage_year": 2025, "group_name": "0020"},
            {"program": "Programmation informatique", "stage_number": 1, "stage_session": "Automne", "stage_year": 2025, "group_name": "0010"},
            {"program": "Programmation informatique", "stage_number": 1, "stage_session": "Automne", "stage_year": 2025, "group_name": "0030"},
            {"program": "Programmation informatique", "stage_number": 1, "stage_session": "Automne", "stage_year": 2025, "group_name": "0040"},
            {"program": "Programmation informatique", "stage_number": 1, "stage_session": "Automne", "stage_year": 2025, "group_name": "0050"},
            {"program": "Programmation informatique", "stage_number": 2, "stage_session": "Hiver", "stage_year": 2025, "group_name": "0020"},
            {"program": "Programmation informatique", "stage_number": 2, "stage_session": "Hiver", "stage_year": 2025, "group_name": "0010"},
            {"program": "Programmation informatique", "stage_number": 3, "stage_session": "Automne", "stage_year": 2025, "group_name": "0020"},
            {"program": "Programmation informatique", "stage_number": 3, "stage_session": "Automne", "stage_year": 2025, "group_name": "0030"},
            {"program": "Programmation informatique", "stage_number": 3, "stage_session": "Automne", "stage_year": 2025, "group_name": "0040"},
            {"program": "Programmation informatique", "stage_number": 3, "stage_session": "Automne", "stage_year": 2025, "group_name": "0050"},
            {"program": "Programmation informatique", "stage_number": 3, "stage_session": "Automne", "stage_year": 2025, "group_name": "0060"},
            {"program": "Programmation informatique", "stage_number": 3, "stage_session": "Automne", "stage_year": 2025, "group_name": "0070"},
            {"program": "Programmation informatique", "stage_number": 3, "stage_session": "Automne", "stage_year": 2025, "group_name": "0010"},
            {"program": "Intelligence artificielle en informatique", "stage_number": 1, "stage_session": "Automne", "stage_year": 2025, "group_name": "0040"},
            {"program": "Intelligence artificielle en informatique", "stage_number": 1, "stage_session": "Automne", "stage_year": 2025, "group_name": "0020"},
            {"program": "Intelligence artificielle en informatique", "stage_number": 1, "stage_session": "Automne", "stage_year": 2025, "group_name": "0120"},
            {"program": "Intelligence artificielle en informatique", "stage_number": 1, "stage_session": "Automne", "stage_year": 2025, "group_name": "0110"},
            {"program": "Intelligence artificielle en informatique", "stage_number": 1, "stage_session": "Automne", "stage_year": 2025, "group_name": "0030"},
        ]

        for item in group_data:
            try:
                 #  Recherche du programme par nom
                program = Program.objects.get(name=item['program'])

                  #  Création ou récupération de l’étape associée
                stage, _ = Stage.objects.get_or_create(
                    number=item['stage_number'],
                    session=item['stage_session'],
                    year=item['stage_year']
                )
                #  Création ou récupération du groupe
                group, created = Group.objects.get_or_create(
                    name=item['group_name'],
                    program=program,
                    stage=stage
                )
                #  Affiche si le groupe a été créé ou existait déjà
                print(' Groupe créé :' if created else ' Groupe existant :', group)
            except Program.DoesNotExist:
                print(f' Programme introuvable : {item["program"]}')
