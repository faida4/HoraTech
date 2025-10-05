import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Courses.css'; // Ajout du fichier CSS pour le style
import MiniConfirmModal from './MiniConfirmModal';  // Modale de confirmation personnalisée
import { toast } from 'react-hot-toast';  //  Pour les notifications


function Courses() {
  const [courses, setCourses] = useState([]); // Liste des cours
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(''); // Terme de recherche
  const [showConfirmModal, setShowConfirmModal] = useState(false);
const [selectedCourseId, setSelectedCourseId] = useState(null);  // ID du cours 

//  Chargement des cours au montage du composant 
useEffect(() => {
    axios.get('http://127.0.0.1:8000/accounts/courses/')
      .then(response => setCourses(response.data))
      .catch(error => console.error('Erreur:', error));
  }, []);


//  Prépare la suppression avec confirmation
  const handleDeleteClick = (id) => {
    setSelectedCourseId(id);
    setShowConfirmModal(true);
  };
  
  //  Supprime le cours sélectionné
  const confirmDelete = async () => {
    try {
      await axios.delete(`http://127.0.0.1:8000/accounts/courses/${selectedCourseId}/`);
      setCourses(courses.filter(course => course.id !== selectedCourseId));   // Mise à jour de la liste
      toast.success("Cours supprimé !");
    } catch (error) {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="course-container">
      <div className='course-header'>
      <h2>Liste des Cours</h2>
      <button className="add-course-button" onClick={() => navigate('/add-course')}>Ajouter un cours</button>
      </div>

       {/*  Barre de recherche */}
      <div className="search-bar-wrapper">
      <input
        type="text"
        placeholder="Rechercher un cours..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
    </div>

       {/*  Tableau des cours */}
      <table className="course-table">
        <thead>
          <tr>
            <th>Identifiant du Cours</th>
            <th>Nom et Description du Cours</th>
            <th>Crédits</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses
            .filter(course =>
              course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            .map(course => (

            <tr key={course.id}>
              <td><strong>{course.course_code}</strong></td>
              <td>
              <strong>{course.name}</strong>
                <p>{course.description}</p>
                {/*  Liste des programmes associés */}
                {course.programs && course.programs.length > 0 && (
                  <p className="course-programs">
                    <strong>Programmes : </strong>{course.programs.join(", ")}
                  </p>
                )}
              </td>
              <td><strong>{course.credits}</strong></td>
              <td >
              <div className="bouton">
                <button className="edit" onClick={() => navigate(`/edit-course/${course.id}`)}>Modifier</button>
                <button className="delete-button" onClick={() => handleDeleteClick(course.id)}>Supprimer</button>

                </div>
              </td>

              
             

            </tr>
          ))}
        </tbody>
      </table>

      {/*  Modale de confirmation */}
      <MiniConfirmModal
  visible={showConfirmModal}
  message="Voulez-vous vraiment supprimer ce cours ?"
  onConfirm={confirmDelete}
  onCancel={() => setShowConfirmModal(false)}
/>

      
    </div>
   
  );
  
}

export default Courses;
