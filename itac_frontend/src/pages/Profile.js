import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import defaultAvatar from "../images/default-avatar.png";
import "../styles/Profile.css";


function Profile() {
  const [user, setUser] = useState(null); // Stocke les données du profil utilisateur
  const [formData, setFormData] = useState({ first_name: "", last_name: "", phone_number: "" }); // Données modifiables du formulaire
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);          // Affiche "Mise à jour..." pendant l'envoi
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  //  Récupère les informations du profil depuis l'API
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/accounts/profile/", { withCredentials: true })
      .then(response => {
        setUser(response.data);
        setFormData({
          first_name: response.data.first_name || "",
          last_name: response.data.last_name || "",
          phone_number: response.data.phone_number || "",
        });
      })
      .catch(() => navigate("/"));
  }, [navigate]);

  //  Met à jour les champs du formulaire
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //  Envoie les nouvelles informations au backend
  const handleUpdateProfile = async () => {
    setLoading(true);
    setSuccessMessage("");

    try {
      await axios.put("http://127.0.0.1:8000/accounts/profile/", formData, { withCredentials: true });
      setUser((prev) => ({ ...prev, ...formData }));
      setIsEditing(false);
      setSuccessMessage("Profil mis à jour avec succès !");
      
      // Effacer le message après 3 secondes
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Erreur de mise à jour :", error);
    } finally {
      setLoading(false);
    }
  };

  //  Changer la photo de profil
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(URL.createObjectURL(file));
      uploadProfilePicture(file);
    }
  };

  const uploadProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append("profile_picture", file);
    
    try {
      const response = await axios.post("http://127.0.0.1:8000/accounts/update-profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setUser((prev) => ({ ...prev, profile_picture: response.data.profile_picture }));
      setSuccessMessage("Photo de profil mise à jour !");
      
      // Effacer le message après 3 secondes
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Erreur lors du changement de photo :", error);
    }
  };

  //  Gère la déconnexion
  const handleLogout = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/accounts/logout/", {}, { withCredentials: true });
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  if (!user) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="profile-fullscreen">
      <div className="profile-container">
        
        {/*  Photo de Profil */}
        <div className="profile-card">
          <label htmlFor="profile-upload">
            <img
              src={selectedFile || user.profile_picture || defaultAvatar}
              alt="Profile"
              className="profile-image"
              title="Cliquez pour modifier la photo"
            />
          </label>
          <input
            type="file"
            id="profile-upload"
            style={{ display: "none" }}
            onChange={handleFileChange}
            accept="image/*"
          />
          <h3>{user.last_name} {user.first_name}</h3>
        </div>

        {/*  Informations du Profil */}
        <div className="profile-form">
           {/* Rôle en titre <h4 className="role-title">{user.role}</h4> */}

            {!isEditing && (
            <div className="form-group">
                <label>Rôle :</label>
                <span>{user.role}</span> 
            </div>
            )}


          <div className="form-group">
            <label>Nom :</label>
            {isEditing ? (
              <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} />
            ) : (
              <span>{user.last_name}</span>
            )}
          </div>

          <div className="form-group">
            <label>Prénom :</label>
            {isEditing ? (
              <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} />
            ) : (
              <span>{user.first_name}</span>
            )}
          </div>
          <div className="form-group">
            <label>Courriel :</label>
            <span>{user.email}</span> {/* Email non modifiable */}
          </div>
          <div className="form-group">
            <label>Numéro de Téléphone :</label>
            {isEditing ? (
              <input type="text" name="phone_number" value={formData.phone_number} onChange={handleInputChange} />
            ) : (
              <span>{user.phone_number || "Non renseigné"}</span>
            )}
          </div>

          {/*  Message de succès */}
          {successMessage && <p className="success-message">{successMessage}</p>}

          {/*  Boutons de modification et déconnexion */}
          <div className="profile-buttons">
            {isEditing ? (
              <button className="modify-btn" onClick={handleUpdateProfile} disabled={loading}>
                {loading ? "Mise à jour..." : "Enregistrer"}
              </button>
            ) : (
              <button className="modify-btn" onClick={() => setIsEditing(true)}>Modifier</button>
            )}
            <button className="logout-btn" onClick={handleLogout}>Déconnexion</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
