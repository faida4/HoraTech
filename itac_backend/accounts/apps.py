from django.apps import AppConfig

#  Configuration de l’application "accounts"
class AccountsConfig(AppConfig):
    #  Spécifie le type de champ par défaut pour les clés primaires
    default_auto_field = 'django.db.models.BigAutoField'
    
     #  Nom de l'application
    name = 'accounts'
