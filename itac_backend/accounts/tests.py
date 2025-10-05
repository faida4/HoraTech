

# Create your tests here.

from django.test import TestCase, Client
from django.urls import reverse
from accounts.models import Professor, Program, Stage, Group, Course, Schedule

# 🧪 TEST 1 — Création d’un professeur
class ProfessorModelTest(TestCase):
    def test_create_professor(self):
        prof = Professor.objects.create(
            first_name="Samir",
            last_name="Elouasbi",
            email="samir.elouasbi@itac.com"
        )
        self.assertEqual(prof.first_name, "Samir")
        self.assertEqual(prof.last_name, "Elouasbi")
        self.assertEqual(prof.email, "samir.elouasbi@itac.com")

# 🧪 TEST 2 — Création d’un programme
class ProgramModelTest(TestCase):
    def test_create_program(self):
        prog = Program.objects.create(name="Programmation informatique")
        self.assertEqual(prog.name, "Programmation informatique")

# 🧪 TEST 3 — Création d’une étape
class StageModelTest(TestCase):
    def test_create_stage(self):
        stage = Stage.objects.create(number=1, session="Automne", year=2025)
        self.assertEqual(stage.number, 1)
        self.assertEqual(stage.session, "Automne")
        self.assertEqual(stage.year, 2025)

# 🧪 TEST 4 — Création d’un groupe lié à une étape et un programme
class GroupModelTest(TestCase):
    def test_create_group(self):
        prog = Program.objects.create(name="Tech Génie info")
        stage = Stage.objects.create(number=1, session="Automne", year=2025)
        group = Group.objects.create(name="0010", program=prog, stage=stage)
        self.assertEqual(group.name, "0010")
        self.assertEqual(group.stage.number, 1)
        self.assertEqual(group.program.name, "Tech Génie info")

# 🧪 TEST 5 — Création d’un cours
class CourseModelTest(TestCase):
    def test_create_course(self):
        course = Course.objects.create(
            course_code="IFM101",
            name="Mathématiques",
            description="Base",
            credits=3
        )
        self.assertEqual(course.course_code, "IFM101")
        self.assertEqual(course.credits, 3)

# 🧪 TEST 6 — Vue GET sur /accounts/courses/
class CourseViewTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.program = Program.objects.create(name="IA Informatique")
        self.course = Course.objects.create(
            course_code="IA101",
            name="Introduction à l’IA",
            description="Base d'intelligence artificielle",
            credits=4
        )
        self.course.programs.add(self.program)

    def test_get_courses_list(self):
        response = self.client.get("/accounts/courses/")
        self.assertEqual(response.status_code, 200)

