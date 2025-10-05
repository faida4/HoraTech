// Importation de React, des icônes, de la navigation, d’Axios pour les requêtes HTTP, et du toast pour les notifications.
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import "../styles/form.css";
import { faBook, faChalkboardTeacher, faLayerGroup, faUserGraduate,  faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from 'react-hot-toast';


function AddCourseForm() {
  // États pour stocker les données récupérées depuis l’API
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [stages, setStages] = useState([]);
  const [groups, setGroups] = useState([]);

  // États pour les sélections de l’utilisateur
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Pour les erreurs d’envoi

  const navigate = useNavigate();

  // Charger toutes les données nécessaires au montage du composant
  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesRes = await axios.get("http://127.0.0.1:8000/accounts/courses/");
        setCourses(coursesRes.data);
        setFilteredCourses(coursesRes.data);

        const programsRes = await axios.get("http://127.0.0.1:8000/programs/");
        setPrograms(programsRes.data);

        const profsRes = await axios.get("http://127.0.0.1:8000/accounts/professors/");
        setProfessors(profsRes.data);

        const stagesRes = await axios.get("http://127.0.0.1:8000/stages/");
        setStages(stagesRes.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      }
    };

    fetchData();
  }, []);
 
//  Lorsqu’un programme est sélectionné → on filtre les cours et recharge les groupes
  const handleProgramChange = async (e) => {
    const programId = e.target.value;
    setSelectedProgram(programId);
    setSelectedGroup("");
  
    // Filtrage des cours
    if (programId === "") {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(c => c.program_ids.includes(parseInt(programId)));
      setFilteredCourses(filtered);
    }
  
    // Mise à jour des groupes si une étape est déjà sélectionnée
    if (selectedStage && programId) {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/stages/${selectedStage}/groups/?program_id=${programId}`);
        setGroups(response.data);
      } catch (error) {
        console.error("Erreur lors de la mise à jour des groupes:", error);
      }
    }
  };

  //  Lorsqu’une étape est sélectionnée → on recharge les groupes selon le programme
  const handleStageChange = async (e) => {
    const stageId = e.target.value;
    setSelectedStage(stageId);
    setSelectedGroup("");
  
    if (!selectedProgram) {
      setGroups([]);  
      return;
    }
  
    try {
      const response = await axios.get(`http://127.0.0.1:8000/stages/${stageId}/groups/?program_id=${selectedProgram}`);
      setGroups(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des groupes:", error);
    }
  };
  
//  Soumettre le formulaire
  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      course_id: selectedCourse,
      professor_id: selectedProfessor,
      stage_id: selectedStage,
      group_id: selectedGroup,
      day: null   // pas encore planifié
    };

    try {
      await axios.post("http://127.0.0.1:8000/schedules/add_scheduleList/", payload);
      toast.success("Cours ajouté au calendrier avec succès !")
      navigate("/home");
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      if (error.response?.data?.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  return (
    <div className="add-course-form">
      <h2>Ajouter un cours au calendrier</h2>
      <form onSubmit={handleSubmit}>
        
         {/* Sélection du programme */}
        <label>Programme:</label>
        <select value={selectedProgram} onChange={handleProgramChange}>
          <option value="">Tous les programmes</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

           {/* Sélection du cours */}
          <label>
          <FontAwesomeIcon icon={faBook} /> Cours:
        </label>
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} required>
          <option value="">Sélectionner</option>
          {filteredCourses.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.course_code})</option>
          ))}
        </select>

          {/* Sélection du professeur */}       
           <label>
            <FontAwesomeIcon icon={faChalkboardTeacher} /> Professeur:
          </label>
        <select value={selectedProfessor} onChange={(e) => setSelectedProfessor(e.target.value)} required>
          <option value="">Sélectionner</option>
          {professors.map((p) => (
            <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
          ))}
        </select>

         {/* Étape */}
        <label>
          <FontAwesomeIcon icon={faLayerGroup} /> Étape:
        </label>
        <select value={selectedStage} onChange={handleStageChange} required>
          <option value="">Sélectionner</option>
          {stages.map((s) => (
            <option key={s.id} value={s.id}>Étape {s.number} </option>
          ))}
        </select>

          {/* Groupe */}
        <label>
          <FontAwesomeIcon icon={faUserGraduate} /> Groupe:
        </label>
        <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} required>
          <option value="">Sélectionner</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name} </option>
          ))}
        </select>

        <div className="button-group">
          <button type="submit">Ajouter</button>
          <button type="button" onClick={() => navigate('/home')}>Annuler</button>
        </div>

           {/* Affichage du message d'erreur */}
         {errorMessage && (
          <div className="error-message">
            <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: "8px", color: "#ff4d4f" }} />
            {errorMessage}
          </div>
        )}
        
      </form>
    </div>
  );
}

export default AddCourseForm;
