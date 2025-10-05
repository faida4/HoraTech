import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import '../styles/AddCourse.css';
import { toast } from 'react-hot-toast';

function EditCourse() {
  const { id } = useParams();  //  Récupère l’ID du cours depuis l’URL 
  //  État contenant les informations du cours
  const [course, setCourse] = useState({ course_code: '', name: '', description: '', credits: '' });
  const [programs, setPrograms] = useState([]);   // Liste des programmes disponible
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const navigate = useNavigate();

  //  Récupération des données du cours + programmes à charger au premier rendu
  useEffect(() => {
    // Récupère les détails du cours depuis le backend
    axios.get(`http://127.0.0.1:8000/accounts/courses/${id}/`)
      .then(response => {
        setCourse({
          course_code: response.data.course_code,
          name: response.data.name,
          description: response.data.description,
          credits: response.data.credits,
        });
        setSelectedPrograms(response.data.programs.map(p => p.id)); // Associe les ID des programmes déjà liés à ce cours
      })
      .catch(error => console.error('Erreur:', error));

    //  Récupère la liste complète des programmes
      axios.get("http://127.0.0.1:8000/programs/")
      .then(res => setPrograms(res.data))
      .catch(err => console.error("Erreur programmes:", err));
  }, [id]);

  //  Soumission du formulaire de mise à jour
  const handleSubmit = (e) => {
    e.preventDefault();

    // Envoie les nouvelles données du cours au backend
    axios.put(`http://127.0.0.1:8000/accounts/courses/${id}/`, {
      ...course,
      program_ids: selectedPrograms   // liste d'IDs des programmes sélectionnés
    })
      .then(() => {
        toast.success("Cours mis à jour avec succès !");
        navigate('/courses');
      })
      .catch(error => console.error('Erreur:', error));
  };

  return (
    <div className="course-form">
      <h2>Modifier le cours</h2>
      <form onSubmit={handleSubmit}>
        <label>Identifiant du cours:</label>
        <input type="text" placeholder="Code du cours" value={course.course_code}
          onChange={e => setCourse({ ...course, course_code: e.target.value })} required />

        <label>Nom du cours:</label>
        <input type="text" placeholder="Nom du cours" value={course.name}
          onChange={e => setCourse({ ...course, name: e.target.value })} required />

        <label>Description:</label>
        <input type="text" placeholder="Description" value={course.description}
          onChange={e => setCourse({ ...course, description: e.target.value })} required />

        <label>Crédits:</label>
        <input type="number" placeholder="Crédits" value={course.credits}
          onChange={e => setCourse({ ...course, credits: e.target.value })} required />

        {/* Sélecteur multiple : Programmes associés */}
        <label>Programmes associés :</label>
        <Select
          isMulti
          options={programs.map(p => ({ value: p.id, label: p.name }))}
          value={programs
            .filter(p => selectedPrograms.includes(p.id))
            .map(p => ({ value: p.id, label: p.name }))}
          onChange={(selected) => setSelectedPrograms(selected.map(s => s.value))}
          className="react-select-container"
          classNamePrefix="react-select"
        />


        <button type="submit" className="save-button">Mettre à jour</button>
      </form>
      <button className="cancel-button" onClick={() => navigate('/courses')}>Annuler</button>
    </div>
  );
}

export default EditCourse;