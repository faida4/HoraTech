from rest_framework import serializers
from .models import Professor
from .models import CustomUser
from rest_framework import serializers
from .models import CustomUser

#  Sérialiseur pour le modèle Professor
# Ce sérialiseur convertit les instances de Professor en JSON et inversement
class ProfessorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Professor
        fields = '__all__'  # Inclut tous les champs


#  Sérialiseur pour le modèle CustomUser
# Sert à exposer les informations utilisateur de manière sécurisée
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'first_name', 'last_name', 'email', 'role', 'profile_picture', 'phone_number']

from .models import Program

#  Sérialiseur pour le modèle Program
# Sert à gérer la création, lecture, et modification de programmes d’études
class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ['id', 'name', 'code']