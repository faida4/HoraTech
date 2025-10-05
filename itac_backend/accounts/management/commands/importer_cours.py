from django.core.management.base import BaseCommand
from accounts.models import Course, Program  
from pathlib import Path
import sys

class Command(BaseCommand):
    help = "Importer tous les cours à partir du fichier cours_data_final.py"

    def handle(self, *args, **kwargs):
        #  Importer la variable cours_data depuis le fichier Python
        sys.path.append(str(Path('.')))  # Ajouter la racine du projet au path
        try:
            from cours_data_corrected import cours_data
        except ImportError:
            self.stdout.write(self.style.ERROR(" Erreur : cours_data_final.py introuvable ou mal formaté."))
            return

        #  Créer ou mettre à jour les cours
        for item in cours_data:
            course, created = Course.objects.get_or_create(
                course_code=item["code"],
                defaults={
                    "name": item["nom"],
                    "description": item["description"],
                    "credits": item["credits"]
                }
            )

            if not created:
                updated = False
                if course.name != item["nom"]:
                    course.name = item["nom"]
                    updated = True
                if course.description != item["description"]:
                    course.description = item["description"]
                    updated = True
                if course.credits != item["credits"]:
                    course.credits = item["credits"]
                    updated = True
                if updated:
                    course.save()

            # Associer aux programmes
            for prog_name in item["programmes"]:
                try:
                    program = Program.objects.get(name=prog_name.strip())
                    course.programs.add(program)
                except Program.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f" Programme non trouvé : {prog_name.strip()}"))

        self.stdout.write(self.style.SUCCESS(" Tous les cours ont été importés et associés aux programmes."))
