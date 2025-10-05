#  Import du modèle Professor depuis l'app accounts
from accounts.models import Professor

#  Import de la base de commande pour créer une commande custom Django
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Importer tous les profs manuellement"

    def handle(self, *args, **kwargs):

        professeurs = [
            #Liste des professeurs à importer
            {'first_name': 'Louis-Philippe', 'last_name': 'Jolivette', 'email': 'jolivette@itac.com'},
            {'first_name': 'Madjid', 'last_name': 'Hamadi', 'email': 'hamadi@itac.com'},
            {'first_name': 'Robert-Nikola', 'last_name': 'Filiou', 'email': 'filiou@itac.com'},
            {'first_name': 'Rodrigue', 'last_name': 'Kemgang Teikeu', 'email': 'kemgangteikeu@itac.com'},
            {'first_name': 'Samir', 'last_name': 'Elouasbi', 'email': 'elouasbi@itac.com'},
            {'first_name': 'Sébastien', 'last_name': 'Bois', 'email': 'bois@itac.com'},
            {'first_name': 'Wadii', 'last_name': 'Hajji', 'email': 'hajji@itac.com'},
            {'first_name': 'Dany', 'last_name': 'Lapointe', 'email': 'lapointe@itac.com'},
            {'first_name': 'Gil', 'last_name': 'Audrey Nangue Tsotsop', 'email': 'audreynanguetsotsop@itac.com'},
            {'first_name': 'Haithem', 'last_name': 'Haggui', 'email': 'haggui@itac.com'},
            {'first_name': 'Manel', 'last_name': 'Sorba', 'email': 'sorba@itac.com'},
            {'first_name': 'Martin', 'last_name': 'Charbonneau', 'email': 'charbonneau@itac.com'},
            {'first_name': 'Mathieu', 'last_name': 'Robson', 'email': 'robson@itac.com'},
            {'first_name': 'Mohammed', 'last_name': 'Amellah', 'email': 'amellah@itac.com'},
            {'first_name': 'Pierre-Olivier', 'last_name': 'Bachand', 'email': 'bachand@itac.com'},
            {'first_name': 'Rabeb', 'last_name': 'Saad', 'email': 'saad@itac.com'},
            {'first_name': 'Souaad', 'last_name': 'Lahlah', 'email': 'lahlah@itac.com'},
            {'first_name': 'Dany', 'last_name': 'lapointe', 'email': 'lapointe@itac.com'},
            {'first_name': 'Joel', 'last_name': 'Muteba', 'email': 'muteba@itac.com'},
            {'first_name': 'Serge', 'last_name': 'Daigle', 'email': 'daigle@itac.com'},
            {'first_name': 'Afef', 'last_name': 'Ben Zine El Abidine', 'email': 'benzineelabidine@itac.com'},
            {'first_name': 'Fatma', 'last_name': 'Assida', 'email': 'assida@itac.com'},
            {'first_name': 'Faycel', 'last_name': 'Jaouadi', 'email': 'jaouadi@itac.com'},
            {'first_name': 'Jamil', 'last_name': 'Dimassi', 'email': 'dimassi@itac.com'},
            {'first_name': 'Mohamed', 'last_name': 'Salah Bouhlel', 'email': 'salahbouhlel@itac.com'},
            {'first_name': 'Romaissaa', 'last_name': 'Mazouni', 'email': 'mazouni@itac.com'},
            {'first_name': 'Yassine', 'last_name': 'Benfares', 'email': 'benfares@itac.com'},
            {'first_name': 'Abdelkader', 'last_name': 'Rais', 'email': 'rais@itac.com'},
            {'first_name': 'Abderrrahmane', 'last_name': 'Ben Mimoune', 'email': 'benmimoune@itac.com'},
            {'first_name': 'Alain', 'last_name': 'Loua', 'email': 'loua@itac.com'},
            {'first_name': 'Laudi', 'last_name': 'El Hajjar', 'email': 'elhajjar@itac.com'},
            {'first_name': 'Lorraine', 'last_name': 'Lapointe', 'email': 'lapointe@itac.com'},
            {'first_name': 'Luis', 'last_name': 'Carlos Saldarriaga', 'email': 'carlossaldarriaga@itac.com'},
            {'first_name': 'Marco', 'last_name': 'Lavoie', 'email': 'lavoie@itac.com'},
            {'first_name': 'Mohammed', 'last_name': 'Ramzi Naouali', 'email': 'ramzinaouali@itac.com'},
            {'first_name': 'Mounir', 'last_name': 'Katet', 'email': 'katet@itac.com'},
            {'first_name': 'Mountassir', 'last_name': 'Harriri', 'email': 'harriri@itac.com'},
            {'first_name': 'Anis', 'last_name': 'Ben Omrane', 'email': 'benomrane@itac.com'},
            {'first_name': 'Hamza', 'last_name': 'El Maadani', 'email': 'elmaadani@itac.com'},
            {'first_name': 'Jonathan', 'last_name': 'Wilkie', 'email': 'wilkie@itac.com'},
            {'first_name': 'Karim', 'last_name': 'Baratli', 'email': 'baratli@itac.com'},
            {'first_name': 'Mostapha', 'last_name': 'Zine El Adidine', 'email': 'zineeladidine@itac.com'},
            {'first_name': 'Boualem', 'last_name': 'Ait Ali Slimane', 'email': 'aitalislimane@itac.com'},
            {'first_name': 'Adil', 'last_name': 'Cherribi', 'email': 'cherribi@itac.com'},
            {'first_name': 'Ahmed', 'last_name': 'Khlifa', 'email': 'khlifa@itac.com'},
            {'first_name': 'Bakary', 'last_name': 'Diarra', 'email': 'diarra@itac.com'},
            {'first_name': 'Estelle', 'last_name': 'Marcella Bouoda', 'email': 'marcellabouoda@itac.com'},
            {'first_name': 'Harold', 'last_name': 'Mokem Tamo', 'email': 'mokemtamo@itac.com'},
            {'first_name': 'Hind', 'last_name': 'Latifi', 'email': 'latifi@itac.com'},
            {'first_name': 'Kodzo', 'last_name': 'Michel Aladi', 'email': 'michelaladi@itac.com'},
            {'first_name': 'Laila', 'last_name': 'Ait Ali', 'email': 'aitali@itac.com'},
            {'first_name': 'Larbi', 'last_name': 'Elhajjaoui', 'email': 'elhajjaoui@itac.com'},
            {'first_name': 'Mouna', 'last_name': 'Tebourski', 'email': 'tebourski@itac.com'},
            {'first_name': 'Samia', 'last_name': 'Djerroud', 'email': 'djerroud@itac.com'},
            {'first_name': 'Sedric', 'last_name': 'Ouambo Silatchom', 'email': 'ouambosilatchom@itac.com'},
            {'first_name': 'Wided', 'last_name': 'Oueslati', 'email': 'oueslati@itac.com'},
            {'first_name': 'Zahia', 'last_name': 'Ouadah', 'email': 'ouadah@itac.com'},
            {'first_name': 'Asmaa', 'last_name': 'Hailane', 'email': 'hailane@itac.com'},
            {'first_name': 'Jean-Gabriel', 'last_name': 'Gaudreault', 'email': 'gaudreault@itac.com'},
            {'first_name': 'Khaled', 'last_name': 'Saidani', 'email': 'saidani@itac.com'},
            {'first_name': 'Mohammed', 'last_name': 'Yafout', 'email': 'yafout@itac.com'},
        ]

        for prof in professeurs:
            #Crée le professeur si l’adresse courriel n’existe pas déjà
            professor, created = Professor.objects.get_or_create(
                email=prof["email"],
                defaults={
                    "first_name": prof["first_name"],
                    "last_name": prof["last_name"],
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f" Professeur créé : {professor}"))
            else:
                self.stdout.write(f"➡️ Professeur déjà existant : {professor}")
