<h1 align="center">🗓️ HoraTech — Gestion d’Horaires</h1>
<p align="center">
  Application <b>full-stack</b> de gestion d’horaires avec <b>drag & drop</b>, <b>détection de conflits</b> et <b>rôles utilisateurs</b>.<br/>
  <i>React • Django REST • PostgreSQL</i>
</p>

<p align="center">
  <a href="#-démarrage-rapide">⚡ Démarrer</a> •
  <a href="#-fonctionnalités">✨ Fonctionnalités</a> •
  <a href="#-galerie">📸 Galerie</a> •
  <a href="#-stack-technique">🧰 Stack</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/Django-REST-092E20?logo=django&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/FullCalendar-Calendar-2C3E50"/>
</p>

---

## ✨ Fonctionnalités
- 🖱️ **Drag & drop** sur calendrier (jour/semaine/mois)  
- 🧠 **Détection de conflits** (enseignant, salle, chevauchement, capacité)  
- 🏷️ **Filtres dynamiques** (enseignant, programme, groupe, salle, statut)  
- 👥 **Rôles & permissions** (admin, coordonnateur, enseignant)  
- 🔔 **Avertissements** clairs en cas de conflit  
- 🔎 **Recherche** et vue condensée des semaines chargées  
- 🌐 **API REST** (Django REST Framework)

---

## 📸 Galerie
<p align="center">
  <img src="images/app1.png" alt="Dashboard" width="220"/>
  <img src="images/app2.png" alt="Vue Calendrier - Semaine" width="220"/>
  <img src="images/app3.png" alt="Drag & Drop d'un cours" width="220"/>
  <img src="images/app4.png" alt="Création d'un bloc horaire" width="220"/>
  <img src="images/app5.png" alt="Conflit détecté (enseignant)" width="220"/>
</p>
<p align="center">
  <img src="images/app6.png" alt="Filtres dynamiques" width="220"/>
  <img src="images/app7.png" alt="Détail d'un cours" width="220"/>
  <img src="images/app8.png" alt="Gestion des salles" width="220"/>
  <img src="images/app9.png" alt="Gestion des utilisateurs" width="220"/>
  <img src="images/app10.png" alt="Résumé hebdomadaire" width="220"/>
</p>

---

## 🧰 Stack technique
| Frontend | Backend | Base de données | Outils |
|:--:|:--:|:--:|:--|
| React | Django + DRF | PostgreSQL | Axios, FullCalendar, CORS, Git |

---

## 🗂️ Structure
```text
HoraTech/
├── itac_backend/
│   ├── backend/                  # settings.py, urls.py, wsgi.py, asgi.py
│   ├── accounts/                 # auth/roles (ex.)
│   ├── scheduling/               # modèles & endpoints horaires (ex.)
│   ├── manage.py
│   └── requirements.txt
├── itac_frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── images/                       # app1.png ... app10.png
└── README.md
