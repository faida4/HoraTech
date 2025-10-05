//  Importations
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Professors.css'; 
import MiniConfirmModal from './MiniConfirmModal';
import { toast } from 'react-hot-toast';



function Professors() {
  //  États pour stocker les professeurs et gérer les interactions
  const [professors, setProfessors] = useState([]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedProfessorId, setSelectedProfessorId] = useState(null);

  //  Récupération des professeurs depuis l'API
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/accounts/professors/')
      .then(response => setProfessors(response.data))
      .catch(error => console.error('Erreur:', error));
  }, []);


  //  Lorsqu'on clique sur "Supprimer" : ouvrir la modale de confirmation
  const handleDeleteClick = (id) => {
    setSelectedProfessorId(id);
    setShowConfirmModal(true);
  };
  
  const confirmDelete = async () => {// Si l'utilisateur confirme : supprimer le professeur via l'API
    try {
      await axios.delete(`http://127.0.0.1:8000/accounts/professors/${selectedProfessorId}/`);
      setProfessors(prev => prev.filter(p => p.id !== selectedProfessorId));
      toast.success("Professeur supprimé !");
    } catch (error) {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setShowConfirmModal(false);
    }
  };
  

  // Filtrer les professeurs par nom, email ou département
  const filteredProfessors = professors.filter(professor =>
    `${professor.first_name} ${professor.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professor.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="main-content"> 
    <div className="professor-container">
      <h2>Liste des Professeurs</h2>

      
        {/* Barre de recherche */}
        <input
          type="text"
          placeholder="Rechercher un professeur..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

      <div className="add-button-container">
        <button className="add-professor-button" onClick={() => navigate('/add-professor')}>
          Ajouter un professeur
        </button>
      </div>
      
      <div className="professor-grid">
        {filteredProfessors.map(professor => (
          <div key={professor.id} className="professor-card">
            <img 
              src={professor.profile_picture || "http://127.0.0.1:8000/media/professor_pics/default-avatar.png"} 
              alt="Profile" 
              className="professor-image" 
            />
            <div className="professor-info">
              <h3>{professor.first_name} {professor.last_name}</h3>
              <p>{professor.department}</p>
              <p><a href={`mailto:${professor.email}`}>{professor.email}</a></p>
              <div className="professor-actions">
                <button className="edit green" onClick={() => navigate(`/edit-professor/${professor.id}`)}>Modifier</button>
                <button className="delete-button" onClick={() => handleDeleteClick(professor.id)}>Supprimer</button>

              </div>
            </div>
          </div>
        ))}
      </div>

     </div>

{/*  Mini modale de confirmation de suppression */}
     <MiniConfirmModal
  visible={showConfirmModal}
  message="Voulez-vous vraiment supprimer ce professeur ?"
  onConfirm={confirmDelete}
  onCancel={() => setShowConfirmModal(false)}
/>

    </div>
  );
}

export default Professors;
