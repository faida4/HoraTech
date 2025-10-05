//  Importation des dépendances nécessaires
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/Professors.css';
import defaultAvatar from '../images/default-avatar.png';
import { toast } from 'react-hot-toast';


function AddProfessor() {
  //  Récupération de l'ID depuis l'URL (pour la modification)
  const { id } = useParams(); 
  const navigate = useNavigate();
  //  État pour afficher l’aperçu de la photo
  const [photo, setPhoto] = useState(defaultAvatar);
  //  Données du professeur (formulaire)
  const [professor, setProfessor] = useState({
    first_name: '',
    last_name: '',
    email: '',
    profile_picture: null,
    department: 'Institut des technologies, des arts et de la communication',
  });

  //  Chargement des données du professeur si on est en mode modification
  useEffect(() => {
    if (id) {
      axios.get(`http://127.0.0.1:8000/accounts/professors/${id}/`)
        .then((response) => {
          const profData = response.data;
          setProfessor({
            first_name: profData.first_name,
            last_name: profData.last_name,
            email: profData.email,
            profile_picture: null, 
            department: profData.department || 'Institut des technologies, des arts et de la communication',
          });
          setPhoto(profData.profile_picture || defaultAvatar); // Affichage de l’aperçu
        })
        .catch((error) => console.error('Erreur lors de la récupération du professeur:', error));
    }
  }, [id]);

  //  Gère les changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfessor({ ...professor, [name]: value });
  };

  //  Gère le changement de la photo de profil
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);  // Mise à jour de l'aperçu
        setProfessor({ ...professor, profile_picture: file });  // Mise à jour du fichier à envoyer
      };
      reader.readAsDataURL(file);
    }
  };

  //  Envoie les données au backend (création ou modification)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();  // Format requis pour inclure un fichier
    formData.append('first_name', professor.first_name);
    formData.append('last_name', professor.last_name);
    formData.append('email', professor.email);
    formData.append('department', professor.department);

    // Ajouter l’image seulement si c’est un fichier (et non une URL)
    if (professor.profile_picture && typeof professor.profile_picture !== 'string') {
      formData.append('profile_picture', professor.profile_picture);
    }

    try {
      if (id) {
        //  Modification
        await axios.put(`http://127.0.0.1:8000/accounts/professors/${id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        //  Création
        await axios.post('http://127.0.0.1:8000/accounts/professors/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      //  Redirection après succès
      navigate('/professors');
      toast.success(id ? "Professeur modifié avec succès !" : "Professeur ajouté avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du professeur:", error);
      if (error.response?.data) {
        toast.error("Erreur : " + JSON.stringify(error.response.data));

        
      }
    }
  };

  return (
    <div className="add-professor-container">
      <h2>{id ? 'Modifier' : 'Ajouter'} un professeur</h2>
      <form onSubmit={handleSubmit} className="professor-form">

        {/*  Image de profil */}
        <label>Photo de profil :</label>
        <div className="avatar-container">
          <label htmlFor="upload-photo">
            <img src={photo} alt="Profil" className="avatar-preview" />
          </label>
          <input
            type="file"
            id="upload-photo"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{ display: 'none' }}
          />
        </div>

        <label>Prénom :</label>
        <input
          type="text"
          name="first_name"
          value={professor.first_name}
          onChange={handleChange}
          placeholder="Prénom"
          required
        />

        <label>Nom :</label>
        <input
          type="text"
          name="last_name"
          value={professor.last_name}
          onChange={handleChange}
          placeholder="Nom"
          required
        />

        <label>Email :</label>
        <input
          type="email"
          name="email"
          value={professor.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />

        {/*  Boutons de soumission et annulation */}
        <div className="professor-form-actions">
          <button type="submit">{id ? 'Modifier' : 'Ajouter'}</button>
          <button type="button" className="cancel" onClick={() => navigate('/professors')}>Annuler</button>
        </div>
      </form>
    </div>
  );
}

export default AddProfessor;
