from django.db import models
import os

# Create your models here.
from django.contrib.auth.models import AbstractUser

def default_profile_picture():
    return "default-avatar.png"  # Nom du fichier de l'avatar par défaut

#  Personnalisation du modèle utilisateur
class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('directrice', 'Directrice'),
        ('secretaire', 'Secrétaire'),
    )
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='secretaire')
    profile_picture = models.ImageField(
        upload_to='profile_pics/', 
        default=default_profile_picture, 
        blank=True, 
        null=True
    )
    phone_number = models.CharField(max_length=20, blank=True, null=True)  # Nouveau champ

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.role}"


#  Modèle représentant un professeur
class Professor(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    department = models.CharField(
        max_length=255,
        default="Institut des technologies, des arts et de la communication"
    )
    profile_picture = models.ImageField(
        upload_to='professor_pics/',  # Stocké dans media/professor_pics/
        default="default-avatar.png",  # Doit être dans media/
        blank=True
    )

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
#  Modèle représentant une étape 
class Stage(models.Model):
    number = models.PositiveIntegerField()  # Ex: 1, 2, 3...
    session = models.CharField(max_length=22, choices=[('Automne', 'Automne'), ('Hiver', 'Hiver')])
    year = models.PositiveIntegerField(default=2025)  # Fixé pour 2025

    def __str__(self):
        return f"Étape {self.number} ({self.session} {self.year})"

 # Modèle représentant un programme 
class Program(models.Model):
    code = models.CharField(max_length=20)  # Exemple: 51046
    name = models.CharField(max_length=255)  # Exemple: Techniques de l'informatique

    def __str__(self):
        return f"{self.code} - {self.name}"

#  Modèle représentant un groupe d’étudiants lié à une étape et un programme
class Group(models.Model):
    name = models.CharField(max_length=50)  
    stage = models.ForeignKey(Stage, on_delete=models.CASCADE, related_name="groups")
    program = models.ForeignKey('Program', on_delete=models.CASCADE, related_name="groups")  

    def __str__(self):
        return f"{self.name} - {self.stage} - {self.program.name}"
    
#  Modèle représentant un cours
class Course(models.Model):
    id = models.AutoField(primary_key=True)  # ID généré automatiquement
    course_code = models.CharField(max_length=50, unique=True)  # Code personnalisé (ex: 025853 IFM)
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField()
    credits = models.IntegerField()  
    #  Lien vers plusieurs programmes
    programs = models.ManyToManyField('Program', related_name='courses')
    def __str__(self):
        return f"{self.course_code} - {self.name}"



from django.db import models
from django.utils.translation import gettext as _  # Pour gérer les jours en français
import locale

# Forcer la localisation française pour obtenir les jours en français
locale.setlocale(locale.LC_TIME, "fr_FR.UTF-8")  

from django.db import models
from datetime import datetime

#  Modèle représentant un horaire planifié
class Schedule(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    professor = models.ForeignKey(Professor, on_delete=models.CASCADE)
    stage = models.ForeignKey(Stage, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    start_time = models.DateTimeField(blank=True, null=True)  #  Autoriser NULL
    end_time = models.DateTimeField(blank=True, null=True)  #  Autoriser NULL
    day = models.CharField(max_length=15, blank=True, null=True)  #  Autoriser NULL

    def __str__(self):
        return f"{self.course.name} - {self.professor.last_name} ({self.start_time} - {self.end_time})"

