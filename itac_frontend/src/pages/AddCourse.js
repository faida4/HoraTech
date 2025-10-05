import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { toast } from 'react-hot-toast';
import '../styles/AddCourse.css';

function AddCourse() {
  //  État pour le cours à ajouter
  const [course, setCourse] = useState({ course_code: '', name: '', description: '', credits: '' });
  const [programs, setPrograms] = useState([]);   //  Liste de tous les programmes disponibles (récupérés via API)
  const [selectedPrograms, setSelectedPrograms] = useState([]);    //  IDs des programmes sélectionnés
  const navigate = useNavigate();

  //  Charger les programmes une seule fois au montage
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/programs/")
      .then(response => setPrograms(response.data))
      .catch(err => console.error("Erreur chargement programmes", err));
  }, []);

  //  Envoie le formulaire au backend pour créer un nouveau cours
  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8000/accounts/courses/', {
      ...course,
      program_ids: selectedPrograms  // Envoyer les programmes liés
    })
      .then(() => {
        toast.success("Cours ajouté avec succès !");
        navigate('/courses');
      })
      .catch(error => {
        console.error('Erreur:', error);
        toast.error("Erreur lors de l'ajout du cours.");
      });
      
      
  };

  return (
    <div className="course-form">
      <h2>Ajouter un cours</h2>

      {/*  Formulaire d’ajout de cours */}
      <form onSubmit={handleSubmit}>
        <label>Identifiant du cours:</label>
        <input type="text" value={course.course_code}
          onChange={e => setCourse({ ...course, course_code: e.target.value })} required />

        <label>Titre du cours:</label>
        <input type="text" value={course.name}
          onChange={e => setCourse({ ...course, name: e.target.value })} required />

        <label>Section:</label>
        <input type="text" value={course.description}
          onChange={e => setCourse({ ...course, description: e.target.value })} required />

        <label>Crédits:</label>
        <input type="number" value={course.credits}
          onChange={e => setCourse({ ...course, credits: e.target.value })} required />

        {/* Liste multichoix des programmes associés au cours */}
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

        {/* Bouton de soumission */}    
        <div className="button-group">
          <button type="submit" className="save-button">Ajouter</button>
        </div>
      </form>
       {/* Bouton d’annulation */}
      <button className="cancel-button" onClick={() => navigate('/courses')}>Annuler</button>
    </div>
  );
}

export default AddCourse;
